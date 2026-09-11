"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { scanForContactLeak } from "@/lib/moderation";
import { useLocale } from "@/components/LocaleProvider";
import { EGYPT_CITIES } from "@/lib/egyptCities";
import type { FinishingLevel, ListingType, PaymentMethod, PropertyType } from "@/lib/database.types";

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

const FINISHING_LEVELS: FinishingLevel[] = ["super_lux", "finished", "semi_finished", "core_shell", "not_finished"];
const PAYMENT_METHODS: PaymentMethod[] = ["cash", "installments"];

const MAX_PHOTOS = 10;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-[var(--border)] pt-6 first:border-t-0 first:pt-0">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function PropertyForm() {
  const router = useRouter();
  const { t, interpolate, locale } = useLocale();

  // If the AI chat assistant already gathered listing details, it stashes them here before
  // sending the user to this page — pick them up once so the form arrives pre-filled.
  const [initial] = useState<Partial<Record<string, string>> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("chatListingDraft");
      if (!raw) return null;
      sessionStorage.removeItem("chatListingDraft");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const [listingType, setListingType] = useState<ListingType>((initial?.listing_type as ListingType) || "sale");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">((initial?.payment_method as PaymentMethod) || "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const price = Number(form.get("price"));
    const city = String(form.get("city") || "").trim();
    const area = String(form.get("area") || "").trim();
    const contactName = String(form.get("contact_name") || "").trim();
    const contactPhone = String(form.get("contact_phone") || "").trim();
    const contactEmail = String(form.get("contact_email") || "").trim();

    if (!title || !description || !price || !city || !area || !contactName || !contactPhone) {
      setError(t.propertyForm.requiredError);
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(t.propertyForm.signInFirst);
      setSubmitting(false);
      return;
    }

    const flagReasons = scanForContactLeak(title, description);
    const finishing = form.get("finishing") ? (String(form.get("finishing")) as FinishingLevel) : null;
    const selectedPaymentMethod = listingType === "sale" ? paymentMethod || null : null;

    const { data: property, error: insertError } = await supabase
      .from("properties")
      .insert({
        owner_id: user.id,
        listing_type: listingType,
        property_type: form.get("property_type") as PropertyType,
        title,
        description,
        price,
        currency: "EGP",
        rent_period: listingType === "rent" ? (String(form.get("rent_period") || "month")) : null,
        city,
        area,
        bedrooms: form.get("bedrooms") ? Number(form.get("bedrooms")) : null,
        bathrooms: form.get("bathrooms") ? Number(form.get("bathrooms")) : null,
        area_sqm: form.get("area_sqm") ? Number(form.get("area_sqm")) : null,
        finishing,
        payment_method: selectedPaymentMethod,
        down_payment_percent:
          selectedPaymentMethod === "installments" && form.get("down_payment_percent")
            ? Number(form.get("down_payment_percent"))
            : null,
        installment_years:
          selectedPaymentMethod === "installments" && form.get("installment_years")
            ? Number(form.get("installment_years"))
            : null,
        flagged: flagReasons.length > 0,
        flag_reasons: flagReasons,
      })
      .select()
      .single();

    if (insertError || !property) {
      setError(insertError?.message || "Something went wrong.");
      setSubmitting(false);
      return;
    }

    const { error: contactError } = await supabase.from("property_contacts").insert({
      property_id: property.id,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail || null,
    });

    if (contactError) {
      setError(contactError.message);
      setSubmitting(false);
      return;
    }

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const path = `${property.id}/${i}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(path, file);

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }

      await supabase.from("property_images").insert({
        property_id: property.id,
        storage_path: path,
        position: i,
      });
    }

    setSubmitting(false);
    router.push(`/listings/${property.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title={t.propertyForm.sectionBasics}>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            {t.propertyForm.listingType} *
            <select
              value={listingType}
              onChange={(e) => {
                const next = e.target.value as ListingType;
                setListingType(next);
                // Cash/installments only applies to a sale — clear it if switching to rent.
                if (next === "rent") setPaymentMethod("");
              }}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
            >
              <option value="sale">{t.listings.forSale}</option>
              <option value="rent">{t.listings.forRent}</option>
            </select>
          </label>
          <label className="block text-sm">
            {t.propertyForm.propertyType} *
            <select name="property_type" defaultValue={initial?.property_type || "apartment"} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {t.propertyTypes[pt]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          {t.propertyForm.title} *
          <input
            name="title"
            required
            defaultValue={initial?.title || ""}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
            placeholder={t.propertyForm.titlePlaceholder}
          />
        </label>

        <label className="block text-sm">
          {t.propertyForm.description} *
          <textarea
            name="description"
            required
            rows={5}
            defaultValue={initial?.description || ""}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
            placeholder={t.propertyForm.descriptionPlaceholder}
          />
        </label>
      </Section>

      <Section title={t.propertyForm.sectionLocation}>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            {t.propertyForm.city} *
            <select name="city" required defaultValue={initial?.city || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">
              <option value="" disabled>
                {t.propertyForm.citySelect}
              </option>
              {EGYPT_CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {locale === "ar" ? c.ar : c.en}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            {t.propertyForm.area} *
            <input name="area" required defaultValue={initial?.area || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
        </div>
      </Section>

      <Section title={t.propertyForm.sectionPrice}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            {t.propertyForm.priceEgp} *
            <input name="price" type="number" required min={0} defaultValue={initial?.price || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          {listingType === "rent" && (
            <label className="block text-sm">
              {t.propertyForm.per}
              <select name="rent_period" defaultValue="month" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">
                <option value="month">{t.propertyForm.month}</option>
                <option value="year">{t.propertyForm.year}</option>
                <option value="day">{t.propertyForm.day}</option>
              </select>
            </label>
          )}
          {listingType === "sale" && (
            <label className="block text-sm">
              {t.propertyForm.paymentMethod}
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | "")}
                className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
              >
                <option value="">{t.propertyForm.paymentMethodUnspecified}</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {t.paymentMethods[pm]}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {listingType === "sale" && paymentMethod === "installments" && (
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              {t.propertyForm.downPaymentPercent}
              <input name="down_payment_percent" type="number" min={0} max={100} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
            </label>
            <label className="block text-sm">
              {t.propertyForm.installmentYears}
              <input name="installment_years" type="number" min={0} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
            </label>
          </div>
        )}
      </Section>

      <Section title={t.propertyForm.sectionDetails}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className="block text-sm">
            {t.propertyForm.bedrooms}
            <input name="bedrooms" type="number" min={0} defaultValue={initial?.bedrooms || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            {t.propertyForm.bathrooms}
            <input name="bathrooms" type="number" min={0} defaultValue={initial?.bathrooms || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            {t.propertyForm.areaSqm}
            <input name="area_sqm" type="number" min={0} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            {t.propertyForm.finishing}
            <select name="finishing" defaultValue={initial?.finishing || ""} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">
              <option value="">{t.propertyForm.finishingUnspecified}</option>
              {FINISHING_LEVELS.map((f) => (
                <option key={f} value={f}>
                  {t.finishingLevels[f]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      <Section title={t.propertyForm.sectionPhotos}>
        <label className="block text-sm">
          {interpolate(t.propertyForm.photos, { max: MAX_PHOTOS })}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, MAX_PHOTOS))}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          />
          <span className="text-xs text-[var(--muted)]">{t.propertyForm.photosHint}</span>
        </label>
      </Section>

      <Section title={t.propertyForm.sectionContact}>
        <p className="text-xs text-[var(--muted)]">{t.propertyForm.contactLegend}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            {t.propertyForm.contactName} *
            <input name="contact_name" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            {t.propertyForm.contactPhone} *
            <input name="contact_phone" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            {t.propertyForm.contactEmail}
            <input name="contact_email" type="email" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
        </div>
      </Section>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--brand)] px-5 py-2.5 font-medium text-white disabled:opacity-60"
      >
        {submitting ? t.propertyForm.submitting : t.propertyForm.submit}
      </button>
      <p className="text-xs text-[var(--muted)]">{t.propertyForm.footnote}</p>
    </form>
  );
}
