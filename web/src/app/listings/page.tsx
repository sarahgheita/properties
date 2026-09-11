import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApprovedProperties, getCoverPhotos } from "@/lib/queries";
import PropertyCard from "@/components/PropertyCard";
import type { ListingType } from "@/lib/database.types";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
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
      <h1 className="text-2xl font-semibold">Browse Properties</h1>

      <form method="get" className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-3 lg:grid-cols-6">
        <select name="type" defaultValue={listingType || ""} className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm">
          <option value="">Any type</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <input
          type="text"
          name="city"
          placeholder="City"
          defaultValue={city || ""}
          className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          name="min"
          placeholder="Min price"
          defaultValue={minPrice ?? ""}
          className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          name="max"
          placeholder="Max price"
          defaultValue={maxPrice ?? ""}
          className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          name="beds"
          placeholder="Min bedrooms"
          defaultValue={bedrooms ?? ""}
          className="rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
        />
        <button type="submit" className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      <div className="mt-8">
        {properties.length === 0 ? (
          <p className="text-[var(--muted)]">No properties match your filters yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} photoPath={covers[property.id]} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-10 text-center text-sm text-[var(--muted)]">
        Don&apos;t see what you want?{" "}
        <Link href="/requests/new" className="text-[var(--brand)] underline">
          Post what you&apos;re looking for
        </Link>{" "}
        and we&apos;ll help match you.
      </p>
    </div>
  );
}
