"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitInquiry } from "@/app/listings/[id]/actions";

export default function InquiryForm({ propertyId, signedIn }: { propertyId: string; signedIn: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  if (!signedIn) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <Link href={`/sign-in?next=/listings/${propertyId}`} className="text-[var(--brand)] underline">
          Sign in
        </Link>{" "}
        to ask about this property. We&apos;ll pass your message to the agent — contact details stay
        private.
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        Thanks — your inquiry was sent. We&apos;ll be in touch.
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const res = await submitInquiry(propertyId, formData);
          setResult(res);
        });
      }}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <label className="block text-sm font-medium">Interested in this property?</label>
      <textarea
        name="message"
        rows={3}
        placeholder="Ask a question or request a viewing…"
        className="mt-2 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
      />
      {result?.error && <p className="mt-2 text-sm text-[var(--danger)]">{result.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
