import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApprovedProperties, getCoverPhotos } from "@/lib/queries";
import PropertyCard from "@/components/PropertyCard";
import ListingsFilterBar from "@/components/ListingsFilterBar";
import { getServerLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { FinishingLevel, ListingType, PaymentMethod } from "@/lib/database.types";

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
  const finishing = (typeof params.finishing === "string" ? params.finishing : undefined) as
    | FinishingLevel
    | undefined;
  const paymentMethod = (typeof params.payment === "string" ? params.payment : undefined) as
    | PaymentMethod
    | undefined;

  const supabase = await createClient();
  const properties = await getApprovedProperties(supabase, {
    listingType,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    finishing,
    paymentMethod,
  });
  const covers = await getCoverPhotos(
    supabase,
    properties.map((p) => p.id),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{t.listings.title}</h1>

      <ListingsFilterBar
        t={t}
        locale={locale}
        listingType={listingType}
        city={city}
        minPrice={minPrice}
        maxPrice={maxPrice}
        bedrooms={bedrooms}
        finishing={finishing}
        paymentMethod={paymentMethod}
      />

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
