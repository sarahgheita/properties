import { NextResponse } from "next/server";
import { callGemini, type ChatTurn } from "@/lib/gemini";

export async function POST(request: Request) {
  let body: { messages?: ChatTurn[]; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  try {
    const reply = await callGemini(messages, body.locale);
    return NextResponse.json(reply);
  } catch (err) {
    console.error("Gemini chat error", err);
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try the forms directly." },
      { status: 502 },
    );
  }
}
