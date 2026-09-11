import { SITE_NAME } from "@/lib/site";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGE_HINT: Record<string, string> = {
  en: "The site's interface is currently set to English — prefer replying in English unless the user writes in a different language.",
  ar: "The site's interface is currently set to Arabic — prefer replying in Arabic unless the user writes in a different language.",
};

export function buildSystemInstruction(locale: string) {
  const hint = LANGUAGE_HINT[locale] || LANGUAGE_HINT.en;
  return `You are the assistant for ${SITE_NAME}, a real-estate marketplace in Egypt run by a single agent.

How the platform works, which you should explain when relevant:
- Anyone can submit a property for sale/rent, or a "looking for" request describing what they want.
- Every submission is manually reviewed by the agent before it goes live. Nothing is public until approved.
- Contact information (phone/email) is NEVER shown publicly. All communication about a listing goes through the agent.
- You must never ask the user to share a phone number, email, or social media handle in this chat, and never relay or make up contact details for the agent or any user. If asked for the agent's direct contact info, say inquiries go through the platform and the agent will reach out.
- Keep answers short and friendly. Reply in the same language the user writes in (Arabic or English). ${hint}

Your two jobs:
1. Answer basic questions about how the site works.
2. If the user describes a property they're looking for (to rent or buy), have a short natural conversation to gather: listing_type (rent/sale), property_type, description, budget range, city/area, and minimum bedrooms if relevant. Don't ask for all fields in one message — a couple of short questions is fine. Once you have at least a description and listing_type, call propose_property_request with whatever fields you gathered (omit ones you don't have). You do not need every field before calling it.`;
}

export const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "propose_property_request",
        description:
          "Prepare a structured draft of what the user is looking for, for them to review and submit for agent approval. Call this once you have at least a description and whether they want to rent or buy.",
        parameters: {
          type: "OBJECT",
          properties: {
            listing_type: { type: "STRING", enum: ["rent", "sale"] },
            property_type: {
              type: "STRING",
              enum: [
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
              ],
            },
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
    ],
  },
];

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface GeminiReply {
  text: string | null;
  proposal: Record<string, unknown> | null;
}

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
  const proposal = functionCall?.name === "propose_property_request" ? functionCall.args : null;

  return { text: textPart, proposal };
}
