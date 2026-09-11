import Link from "next/link";
import { formatPrice, propertyPhotoUrl } from "@/lib/format";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { cityLabel } from "@/lib/egyptCities";
import type { Database } from "@/lib/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function PropertyCard({
  property,
  photoPath,
  locale,
}: {
  property: Property;
  photoPath?: string | null;
  locale: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <Link
      href={`/listings/${property.id}`}
      className="group overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--background)]">
        {photoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={propertyPhotoUrl(photoPath)}
            alt={property.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted)]">
            {t.listings.noPhoto}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              property.listing_type === "sale"
                ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                : "bg-[var(--accent)]/10 text-[var(--accent)]"
            }`}
          >
            {property.listing_type === "sale" ? t.listings.forSale : t.listings.forRent}
          </span>
          <span className="text-[var(--muted)]">
            {property.area}, {cityLabel(property.city, locale)}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-1 font-medium">{property.title}</h3>
        <p className="mt-1 font-semibold text-[var(--brand)]">
          {formatPrice(property.price, property.currency, property.listing_type, property.rent_period)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {[
            property.bedrooms ? `${property.bedrooms} ${t.listings.bed}` : null,
            property.bathrooms ? `${property.bathrooms} ${t.listings.bath}` : null,
            property.area_sqm ? `${property.area_sqm} m²` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
