"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { cityLabel } from "@/lib/egyptCities";

interface Message {
  role: "user" | "model";
  text: string;
}

interface RequestProposal {
  listing_type?: "rent" | "sale";
  property_type?: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  city?: string;
  area?: string;
  bedrooms_min?: number;
}

interface ListingProposal {
  listing_type?: "sale" | "rent";
  property_type?: string;
  title?: string;
  description?: string;
  price?: number;
  city?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  finishing?: string;
  payment_method?: string;
}

type Proposal =
  | { type: "request"; data: RequestProposal }
  | { type: "listing"; data: ListingProposal };

export default function ChatWidget() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The greeting is derived from the current language rather than stored in state, so switching
  // language before sending anything updates it automatically without an extra render pass.
  const displayMessages = messages.length === 0 ? [{ role: "model" as const, text: t.chat.greeting }] : messages;

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
        body: JSON.stringify({ messages: nextMessages, locale }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.chat.unavailable);
        setLoading(false);
        return;
      }

      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      }
      if (data.proposalType && data.proposal) {
        setProposal({ type: data.proposalType, data: data.proposal });
      }
    } catch {
      setError(t.chat.unreachable);
    } finally {
      setLoading(false);
    }
  }

  function submitProposal() {
    if (!proposal) return;

    if (proposal.type === "request") {
      const p = proposal.data;
      const draft: Record<string, string> = {};
      if (p.listing_type) draft.listing_type = p.listing_type;
      if (p.property_type) draft.property_type = p.property_type;
      if (p.description) draft.description = p.description;
      if (p.budget_min != null) draft.budget_min = String(p.budget_min);
      if (p.budget_max != null) draft.budget_max = String(p.budget_max);
      if (p.city) draft.city = p.city;
      if (p.area) draft.area = p.area;
      if (p.bedrooms_min != null) draft.bedrooms_min = String(p.bedrooms_min);

      sessionStorage.setItem("chatRequestDraft", JSON.stringify(draft));
      setOpen(false);
      router.push("/requests/new");
      return;
    }

    const p = proposal.data;
    const draft: Record<string, string> = {};
    if (p.listing_type) draft.listing_type = p.listing_type;
    if (p.property_type) draft.property_type = p.property_type;
    if (p.title) draft.title = p.title;
    if (p.description) draft.description = p.description;
    if (p.price != null) draft.price = String(p.price);
    if (p.city) draft.city = p.city;
    if (p.area) draft.area = p.area;
    if (p.bedrooms != null) draft.bedrooms = String(p.bedrooms);
    if (p.bathrooms != null) draft.bathrooms = String(p.bathrooms);
    if (p.finishing) draft.finishing = p.finishing;
    if (p.payment_method) draft.payment_method = p.payment_method;

    sessionStorage.setItem("chatListingDraft", JSON.stringify(draft));
    setOpen(false);
    router.push("/listings/new");
  }

  return (
    <div className="fixed bottom-4 end-4 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <p className="font-medium">{t.chat.header}</p>
            <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]" aria-label={t.chat.close}>
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {displayMessages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  m.role === "user" ? "ms-auto bg-[var(--brand)] text-white" : "bg-[var(--background)]"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="max-w-[85%] rounded-lg bg-[var(--background)] px-3 py-2 text-[var(--muted)]">…</div>}
            {error && <p className="text-[var(--danger)]">{error}</p>}

            {proposal?.type === "request" && (
              <div className="rounded-lg border border-[var(--brand)] bg-[var(--brand)]/5 p-3">
                <p className="font-medium">{t.chat.proposalTitle}</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[var(--foreground)]">
                  {proposal.data.listing_type && (
                    <li>{proposal.data.listing_type === "sale" ? t.chat.wantsToBuy : t.chat.wantsToRent}</li>
                  )}
                  {proposal.data.property_type && (
                    <li>
                      {t.chat.type} {t.propertyTypes[proposal.data.property_type as keyof typeof t.propertyTypes] || proposal.data.property_type}
                    </li>
                  )}
                  {(proposal.data.city || proposal.data.area) && (
                    <li>
                      {t.chat.areaLabel} {[proposal.data.area, cityLabel(proposal.data.city, locale)].filter(Boolean).join(", ")}
                    </li>
                  )}
                  {(proposal.data.budget_min || proposal.data.budget_max) && (
                    <li>
                      {t.chat.budgetLabel} {proposal.data.budget_min ?? "?"} – {proposal.data.budget_max ?? "?"} EGP
                    </li>
                  )}
                  {proposal.data.bedrooms_min && (
                    <li>
                      {proposal.data.bedrooms_min}
                      {t.chat.plusBedrooms}
                    </li>
                  )}
                </ul>
                <button
                  onClick={submitProposal}
                  className="mt-2 rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white"
                >
                  {t.chat.reviewAndSubmit}
                </button>
              </div>
            )}

            {proposal?.type === "listing" && (
              <div className="rounded-lg border border-[var(--brand)] bg-[var(--brand)]/5 p-3">
                <p className="font-medium">{t.chat.proposalTitle}</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[var(--foreground)]">
                  {proposal.data.listing_type && (
                    <li>{proposal.data.listing_type === "sale" ? t.chat.listingForSale : t.chat.listingForRent}</li>
                  )}
                  {proposal.data.title && (
                    <li>
                      {t.chat.titleLabel} {proposal.data.title}
                    </li>
                  )}
                  {proposal.data.property_type && (
                    <li>
                      {t.chat.type} {t.propertyTypes[proposal.data.property_type as keyof typeof t.propertyTypes] || proposal.data.property_type}
                    </li>
                  )}
                  {(proposal.data.city || proposal.data.area) && (
                    <li>
                      {t.chat.areaLabel} {[proposal.data.area, cityLabel(proposal.data.city, locale)].filter(Boolean).join(", ")}
                    </li>
                  )}
                  {proposal.data.price != null && (
                    <li>
                      {t.chat.priceLabel} {proposal.data.price} EGP
                    </li>
                  )}
                  {proposal.data.finishing && (
                    <li>{t.finishingLevels[proposal.data.finishing as keyof typeof t.finishingLevels] || proposal.data.finishing}</li>
                  )}
                  {proposal.data.payment_method && (
                    <li>{t.paymentMethods[proposal.data.payment_method as keyof typeof t.paymentMethods] || proposal.data.payment_method}</li>
                  )}
                </ul>
                <button
                  onClick={submitProposal}
                  className="mt-2 rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white"
                >
                  {t.chat.reviewAndSubmitListing}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-[var(--border)] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              className="flex-1 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {t.chat.send}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-2xl text-white shadow-lg hover:opacity-90"
        aria-label={open ? t.chat.close : t.chat.open}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
