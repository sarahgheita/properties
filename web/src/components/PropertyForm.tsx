"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { scanForContactLeak } from "@/lib/moderation";
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

const MAX_PHOTOS = 10;

export default function PropertyForm() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("sale");
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
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in first.");
      setSubmitting(false);
      return;
    }

    const flagReasons = scanForContactLeak(title, description);

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
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          Listing type *
          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value as ListingType)}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          >
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </label>
        <label className="block text-sm">
          Property type *
          <select name="property_type" defaultValue="apartment" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        Title *
        <input name="title" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" placeholder="e.g. Modern 3BR apartment in New Cairo" />
      </label>

      <label className="block text-sm">
        Description *
        <textarea
          name="description"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          placeholder="Describe the property. Please don't include phone numbers or social media — we'll add your listing details for you and handle buyer contact."
        />
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="block text-sm">
          Price (EGP) *
          <input name="price" type="number" required min={0} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        {listingType === "rent" && (
          <label className="block text-sm">
            Per
            <select name="rent_period" defaultValue="month" className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2">
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="day">Day</option>
            </select>
          </label>
        )}
        <label className="block text-sm">
          Bedrooms
          <input name="bedrooms" type="number" min={0} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Bathrooms
          <input name="bathrooms" type="number" min={0} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Area (m²)
          <input name="area_sqm" type="number" min={0} className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          City *
          <input name="city" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
        <label className="block text-sm">
          Area / Neighborhood *
          <input name="area" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
        </label>
      </div>

      <label className="block text-sm">
        Photos (up to {MAX_PHOTOS})
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files || []).slice(0, MAX_PHOTOS))}
          className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
        />
        <span className="text-xs text-[var(--muted)]">
          Make sure photos don&apos;t contain visible phone numbers, watermarks, or social handles —
          we review every photo before publishing.
        </span>
      </label>

      <fieldset className="rounded-lg border border-[var(--border)] p-4">
        <legend className="px-1 text-sm font-medium">Your contact info (private — never shown publicly)</legend>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            Name *
            <input name="contact_name" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Phone *
            <input name="contact_phone" required className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Email
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
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-xs text-[var(--muted)]">
        Your listing goes live only after we review it. This usually takes less than a day.
      </p>
    </form>
  );
}
