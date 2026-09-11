"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "model";
  text: string;
}

interface Proposal {
  listing_type?: "rent" | "sale";
  property_type?: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  city?: string;
  area?: string;
  bedrooms_min?: number;
}

const GREETING: Message = {
  role: "model",
  text: "Hi! I can answer questions about how this site works, or help you describe a property you're looking for. What can I help with?",
};

export default function ChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, proposal, loading]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      }
      if (data.proposal) {
        setProposal(data.proposal);
      }
    } catch {
      setError("Couldn't reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function submitProposal() {
    if (!proposal) return;
    const draft: Record<string, string> = {};
    if (proposal.listing_type) draft.listing_type = proposal.listing_type;
    if (proposal.property_type) draft.property_type = proposal.property_type;
    if (proposal.description) draft.description = proposal.description;
    if (proposal.budget_min != null) draft.budget_min = String(proposal.budget_min);
    if (proposal.budget_max != null) draft.budget_max = String(proposal.budget_max);
    if (proposal.city) draft.city = proposal.city;
    if (proposal.area) draft.area = proposal.area;
    if (proposal.bedrooms_min != null) draft.bedrooms_min = String(proposal.bedrooms_min);

    sessionStorage.setItem("chatRequestDraft", JSON.stringify(draft));
    setOpen(false);
    router.push("/requests/new");
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <p className="font-medium">Ask us anything</p>
            <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]" aria-label="Close chat">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  m.role === "user" ? "ml-auto bg-[var(--brand)] text-white" : "bg-[var(--background)]"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="max-w-[85%] rounded-lg bg-[var(--background)] px-3 py-2 text-[var(--muted)]">…</div>}
            {error && <p className="text-[var(--danger)]">{error}</p>}

            {proposal && (
              <div className="rounded-lg border border-[var(--brand)] bg-[var(--brand)]/5 p-3">
                <p className="font-medium">Here&apos;s what I&apos;ve got:</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[var(--foreground)]">
                  {proposal.listing_type && <li>Looking to {proposal.listing_type === "sale" ? "buy" : "rent"}</li>}
                  {proposal.property_type && <li>Type: {proposal.property_type}</li>}
                  {(proposal.city || proposal.area) && <li>Area: {[proposal.area, proposal.city].filter(Boolean).join(", ")}</li>}
                  {(proposal.budget_min || proposal.budget_max) && (
                    <li>
                      Budget: {proposal.budget_min ?? "?"} – {proposal.budget_max ?? "?"} EGP
                    </li>
                  )}
                  {proposal.bedrooms_min && <li>{proposal.bedrooms_min}+ bedrooms</li>}
                </ul>
                <button
                  onClick={submitProposal}
                  className="mt-2 rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Review & submit request
                </button>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-[var(--border)] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-2xl text-white shadow-lg hover:opacity-90"
        aria-label="Open chat"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
