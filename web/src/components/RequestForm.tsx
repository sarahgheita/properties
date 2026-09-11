"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { scanForContactLeak } from "@/lib/moderation";
import { useLocale } from "@/components/LocaleProvider";
import type { ListingType, PropertyType } from "@/lib/database.types";

const PROPERTY_TYPES: PropertyType[] = [
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

export default function RequestForm() {
  const router = useRouter();
  const { t } = useLocale();

  // If the AI chat assistant already gathered details, it stashes them here before sending the
  // user to this page — pick them up once so the form arrives pre-filled.
  const [initial] = useState<Partial<Record<string, string>> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("chatRequestDraft");
      if (!raw) return null;
      sessionStorage.removeItem("chatRequestDraft");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const [listingType, setListingType] = useState<ListingType>((initial?.listing_type as ListingType) || "rent");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const description = String(form.get("description") || "").trim();
    const contactName = String(form.get("contact_name") || "").trim();
    const contactPhone = String(form.get("contact_phone") || "").trim();
    const contactEmail = String(form.get("contact_email") || "").trim();

    if (!description || !contactName || !contactPhone) {
      setError(t.requestForm.requiredError);
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(t.requestForm.signInFirst);
      setSubmitting(false);
      return;
    }

    const flagReasons = scanForContactLeak(description);

    const { data: request, error: insertError } = await supabase
      .from("property_requests")
      .insert({
        requester_id: user.id,
        listing_type: listingType,
        property_type: (form.get("property_type") as PropertyType) || null,
        description,
        budget_min: form.get("budget_min") ? Number(form.get("budget_min")) : null,
        budget_max: form.get("budget_max") ? Number(form.get("budget_max")) : null,
        city: String(form.get("city") || "").trim() || null,
        area: String(form.get("area") || "").trim() || null,
        bedrooms_min: form.get("bedrooms_min") ? Number(form.get("bedrooms_min")) : null,
        flagged: flagReasons.length > 0,
        flag_reasons: flagReasons,
        source: initial ? "ai_chat" : "form",
      })
      .select()
      .single();

    if (insertError || !request) {
      setError(insertError?.message || "Something went wrong.");
      setSubmitting(false);
      return;
    }

    const { error: contactError } = await supabase.from("property_request_contacts").insert({
      request_id: request.id,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail || null,
    });

    if (contactError) {
      setError(contactError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    router.push("/requests?submitted=1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          {t.requestForm.lookingTo}
          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value as ListingType)}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          >
            <option value="rent">{t.requestForm.rent}</option>
            <option value="sale">{t.requestForm.buy}</option>
          </select>
        </label>
        <label className="block text-sm">
          {t.requestForm.propertyType}
          <select name="property_type" defaultValue={initial?.property_type || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">
            <option value="">{t.requestForm.any}</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {t.propertyTypes[pt]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        {t.requestForm.describe} *
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={initial?.description || ""}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          placeholder={t.requestForm.describePlaceholder}
        />
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="block text-sm">
          {t.requestForm.minBudget}
          <input name="budget_min" type="number" min={0} defaultValue={initial?.budget_min || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          {t.requestForm.maxBudget}
          <input name="budget_max" type="number" min={0} defaultValue={initial?.budget_max || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          {t.requestForm.city}
          <input name="city" defaultValue={initial?.city || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          {t.requestForm.minBedrooms}
          <input name="bedrooms_min" type="number" min={0} defaultValue={initial?.bedrooms_min || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
      </div>

      <label className="block text-sm">
        {t.requestForm.preferredArea}
        <input name="area" defaultValue={initial?.area || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
      </label>

      <fieldset className="rounded-lg border border-[var(--border)] p-4">
        <legend className="px-1 text-sm font-medium">{t.requestForm.contactLegend}</legend>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            {t.requestForm.contactName} *
            <input name="contact_name" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            {t.requestForm.contactPhone} *
            <input name="contact_phone" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            {t.requestForm.contactEmail}
            <input name="contact_email" type="email" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
        </div>
      </fieldset>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--brand)] px-5 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {submitting ? t.requestForm.submitting : t.requestForm.submit}
      </button>
    </form>
  );
}
