import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApprovedProperties, getCoverPhotos } from "@/lib/queries";
import PropertyCard from "@/components/PropertyCard";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export default async function HomePage() {
  const supabase = await createClient();
  const properties = await getApprovedProperties(supabase, {}, 6);
  const covers = await getCoverPhotos(
    supabase,
    properties.map((p) => p.id),
  );

  return (
    <div>
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">{SITE_NAME}</h1>
          <p className="mt-3 text-lg text-[var(--muted)]">{SITE_TAGLINE}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/listings"
              className="rounded-md bg-[var(--brand)] px-5 py-2.5 font-medium text-white hover:opacity-90"
            >
              Browse Properties
            </Link>
            <Link
              href="/requests/new"
              className="rounded-md border border-[var(--border)] px-5 py-2.5 font-medium hover:bg-[var(--background)]"
            >
              Tell us what you&apos;re looking for
            </Link>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-sm text-[var(--muted)]">
            Every listing is personally reviewed before it goes live, and your contact details are
            never shown publicly — inquiries are always routed through us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recently added</h2>
          <Link href="/listings" className="text-sm font-medium text-[var(--brand)]">
            View all →
          </Link>
        </div>

        {properties.length === 0 ? (
          <p className="text-[var(--muted)]">
            No approved listings yet. Be the first to{" "}
            <Link href="/listings/new" className="text-[var(--brand)] underline">
              post a property
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} photoPath={covers[property.id]} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
