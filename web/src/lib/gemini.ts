import { SITE_NAME } from "@/lib/site";

// A stable alias rather than a dated version — Google periodically retires versioned model
// names (this broke once already), but "-latest" aliases keep resolving to a current model.
// The "lite" variant skips the newer models' extra reasoning pass, which cut chat response
// time from ~5-6s to under 1s in testing with no loss of function-calling accuracy — a better
// fit for a simple FAQ/intake assistant than the fuller "flash" model's deeper reasoning.
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGE_HINT: Record<string, string> = {
  en: "The site's interface is currently set to English — prefer replying in English unless the user writes in a different language.",
  ar: "The site's interface is currently set to Arabic — prefer replying in Arabic unless the user writes in a different language.",
};

const PROPERTY_TYPE_ENUM = [
  "apartment",
  "villa",
  "townhouse",
  "duplex",
  "studio",
  "chalet",
  "office",
  "shop",
  "land",
  "other",
];

export function buildSystemInstruction(locale: string) {
  const hint = LANGUAGE_HINT[locale] || LANGUAGE_HINT.en;
  return `You are the assistant for ${SITE_NAME}, a real-estate marketplace in Egypt run by a single agent.

How the platform works, which you should explain when relevant:
- Anyone can submit a property for sale/rent, or a "looking for" request describing what they want.
- Every submission is manually reviewed by the agent before it goes live. Nothing is public until approved.
- Contact information (phone/email) is NEVER shown publicly. All communication about a listing goes through the agent.
- You must never ask the user to share a phone number, email, or social media handle in this chat, and never relay or make up contact details for the agent or any user. If asked for the agent's direct contact info, say inquiries go through the platform and the agent will reach out.
- Keep answers short and friendly. Reply in the same language the user writes in (Arabic or English). ${hint}

Your three jobs:
1. Answer basic questions about how the site works.
2. If the user is LOOKING FOR a property (to rent or buy, as a seeker), have a short natural conversation to gather: listing_type (rent/sale), property_type, description, budget range, city/area, and minimum bedrooms if relevant. Once you have at least a description and listing_type, call propose_property_request with whatever fields you gathered (omit ones you don't have).
3. If the user wants to LIST/POST/SELL/RENT OUT their own property (as an owner), gather: listing_type (sale/rent), property_type, a short title, a description, price, city, area, bedrooms/bathrooms, finishing level, and payment method if mentioned. Once you have at least a title, description, price, and listing_type, call propose_property_listing. Do NOT ask for photos or contact info in chat — tell the user they'll add photos and their contact details on the next screen, since those aren't collected here.

Don't ask for all fields in one message — a couple of short questions is fine. You do not need every field before calling a tool.`;
}

export const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "propose_property_request",
        description:
          "Prepare a structured draft of what a seeker is looking for, for them to review and submit for agent approval. Call this once you have at least a description and whether they want to rent or buy.",
        parameters: {
          type: "OBJECT",
          properties: {
            listing_type: { type: "STRING", enum: ["rent", "sale"] },
            property_type: { type: "STRING", enum: PROPERTY_TYPE_ENUM },
            description: { type: "STRING", description: "A natural-language summary of what they want" },
            budget_min: { type: "NUMBER" },
            budget_max: { type: "NUMBER" },
            city: { type: "STRING" },
            area: { type: "STRING" },
            bedrooms_min: { type: "NUMBER" },
          },
          required: ["listing_type", "description"],
        },
      },
      {
        name: "propose_property_listing",
        description:
          "Prepare a structured draft of a property an owner wants to list for sale/rent, for them to review, add photos and contact info to, and submit for agent approval. Call this once you have at least a title, description, price, and listing_type.",
        parameters: {
          type: "OBJECT",
          properties: {
            listing_type: { type: "STRING", enum: ["sale", "rent"] },
            property_type: { type: "STRING", enum: PROPERTY_TYPE_ENUM },
            title: { type: "STRING", description: "A short listing title" },
            description: { type: "STRING", description: "A natural-language description of the property" },
            price: { type: "NUMBER" },
            city: { type: "STRING" },
            area: { type: "STRING" },
            bedrooms: { type: "NUMBER" },
            bathrooms: { type: "NUMBER" },
            finishing: {
              type: "STRING",
              enum: ["super_lux", "finished", "semi_finished", "core_shell", "not_finished"],
              description: "Finishing level, if mentioned (Egyptian listings commonly specify this)",
            },
            payment_method: {
              type: "STRING",
              enum: ["cash", "installments"],
              description: "Whether payment is cash or installments, if mentioned",
            },
          },
          required: ["listing_type", "title", "description", "price"],
        },
      },
    ],
  },
];

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export type ProposalType = "request" | "listing";

export interface GeminiReply {
  text: string | null;
  proposalType: ProposalType | null;
  proposal: Record<string, unknown> | null;
}

const TOOL_TO_PROPOSAL_TYPE: Record<string, ProposalType> = {
  propose_property_request: "request",
  propose_property_listing: "listing",
};

export async function callGemini(history: ChatTurn[], locale = "en"): Promise<GeminiReply> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: buildSystemInstruction(locale) }] },
      tools: TOOLS,
      contents: history.map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const parts: Array<{ text?: string; functionCall?: { name: string; args: Record<string, unknown> } }> =
    data?.candidates?.[0]?.content?.parts || [];

  const textPart = parts.find((p) => p.text)?.text || null;
  const functionCall = parts.find((p) => p.functionCall)?.functionCall;
  const proposalType = functionCall ? TOOL_TO_PROPOSAL_TYPE[functionCall.name] || null : null;
  const proposal = proposalType ? functionCall!.args : null;

  return { text: textPart, proposalType, proposal };
}
