"use client";

import { useState } from "react";
import { EGYPT_CITIES } from "@/lib/egyptCities";
import type { FinishingLevel, ListingType, PaymentMethod } from "@/lib/database.types";
import type { getDictionary } from "@/lib/i18n/dictionaries";

const FINISHING_LEVELS: FinishingLevel[] = ["super_lux", "finished", "semi_finished", "core_shell", "not_finished"];
const PAYMENT_METHODS: PaymentMethod[] = ["cash", "installments"];

export default function ListingsFilterBar({
  t,
  locale,
  listingType,
  city,
  minPrice,
  maxPrice,
  bedrooms,
  finishing,
  paymentMethod,
}: {
  t: ReturnType<typeof getDictionary>;
  locale: string;
  listingType?: ListingType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  finishing?: FinishingLevel;
  paymentMethod?: PaymentMethod;
}) {
  // Local state just for the type select, so the payment-method field (which only applies to a
  // sale) disappears the instant "For Rent" is picked, rather than only after the form is
  // submitted and the page re-renders server-side.
  const [type, setType] = useState<string>(listingType || "");

  return (
    <form method="get" className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-3 lg:grid-cols-4">
      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
      >
        <option value="">{t.listings.anyType}</option>
        <option value="sale">{t.listings.forSale}</option>
        <option value="rent">{t.listings.forRent}</option>
      </select>
      <select name="city" defaultValue={city || ""} className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm">
        <option value="">{t.listings.anyCity}</option>
        {EGYPT_CITIES.map((c) => (
          <option key={c.value} value={c.value}>
            {locale === "ar" ? c.ar : c.en}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="min"
        placeholder={t.listings.minPrice}
        defaultValue={minPrice ?? ""}
        className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
      />
      <input
        type="number"
        name="max"
        placeholder={t.listings.maxPrice}
        defaultValue={maxPrice ?? ""}
        className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
      />
      <input
        type="number"
        name="beds"
        placeholder={t.listings.minBedrooms}
        defaultValue={bedrooms ?? ""}
        className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
      />
      <select name="finishing" defaultValue={finishing || ""} className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm">
        <option value="">{t.listings.anyFinishing}</option>
        {FINISHING_LEVELS.map((f) => (
          <option key={f} value={f}>
            {t.finishingLevels[f]}
          </option>
        ))}
      </select>
      {type !== "rent" && (
        <select name="payment" defaultValue={paymentMethod || ""} className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm">
          <option value="">{t.listings.anyPayment}</option>
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm} value={pm}>
              {t.paymentMethods[pm]}
            </option>
          ))}
        </select>
      )}
      <button type="submit" className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white">
        {t.listings.filter}
      </button>
    </form>
  );
}
