"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitInquiry } from "@/app/listings/[id]/actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export default function InquiryForm({
  propertyId,
  signedIn,
  locale,
}: {
  propertyId: string;
  signedIn: boolean;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  if (!signedIn) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <Link href={`/sign-in?next=/listings/${propertyId}`} className="text-[var(--brand)] underline">
          {t.inquiry.signInPrompt}
        </Link>{" "}
        {t.inquiry.signInSuffix}
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        {t.inquiry.success}
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
      <label className="block text-sm font-medium">{t.inquiry.label}</label>
      <textarea
        name="message"
        rows={3}
        placeholder={t.inquiry.placeholder}
        className="mt-2 w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
      />
      {result?.error && <p className="mt-2 text-sm text-[var(--danger)]">{result.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? t.inquiry.sending : t.inquiry.send}
      </button>
    </form>
  );
}
