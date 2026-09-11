import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApprovedProperties, getCoverPhotos } from "@/lib/queries";
import PropertyCard from "@/components/PropertyCard";
import { getServerLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { ListingType } from "@/lib/database.types";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const locale = await getServerLocale();
  const t = getDictionary(locale);
  const listingType = (typeof params.type === "string" ? params.type : undefined) as
    | ListingType
    | undefined;
  const city = typeof params.city === "string" ? params.city : undefined;
  const minPrice = typeof params.min === "string" && params.min ? Number(params.min) : undefined;
  const maxPrice = typeof params.max === "string" && params.max ? Number(params.max) : undefined;
  const bedrooms = typeof params.beds === "string" && params.beds ? Number(params.beds) : undefined;

  const supabase = await createClient();
  const properties = await getApprovedProperties(supabase, {
    listingType,
    city,
    minPrice,
    maxPrice,
    bedrooms,
  });
  const covers = await getCoverPhotos(
    supabase,
    properties.map((p) => p.id),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{t.listings.title}</h1>

      <form method="get" className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-3 lg:grid-cols-6">
        <select name="type" defaultValue={listingType || ""} className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm">
          <option value="">{t.listings.anyType}</option>
          <option value="sale">{t.listings.forSale}</option>
          <option value="rent">{t.listings.forRent}</option>
        </select>
        <input
          type="text"
          name="city"
          placeholder={t.listings.city}
          defaultValue={city || ""}
          className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
        />
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
        <button type="submit" className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white">
          {t.listings.filter}
        </button>
      </form>

      <div className="mt-8">
        {properties.length === 0 ? (
          <p className="text-[var(--muted)]">{t.listings.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} photoPath={covers[property.id]} locale={locale} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-10 text-center text-sm text-[var(--muted)]">
        {t.listings.noSee}{" "}
        <Link href="/requests/new" className="text-[var(--brand)] underline">
          {t.listings.postWhatYouWant}
        </Link>{" "}
        {t.listings.andWeWillHelp}
      </p>
    </div>
  );
}
