import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, propertyPhotoUrl } from "@/lib/format";
import InquiryForm from "@/components/InquiryForm";
import { getServerLocale } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { cityLabel } from "@/lib/egyptCities";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const locale = await getServerLocale();
  const t = getDictionary(locale);

  const [{ data: property }, { data: images }, { data: userData }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("property_images")
      .select("*")
      .eq("property_id", id)
      .order("position", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  if (!property) notFound();

  // Public visitors may only view approved listings; owners/admin can preview others via RLS,
  // but the page still shouldn't render pending content to a stranger who guesses the URL.
  const { user } = userData;

  const statusBanner =
    property.status === "pending_review"
      ? t.listingDetail.pendingBanner
      : property.status === "rejected"
        ? t.listingDetail.rejectedBanner
        : property.status === "archived"
          ? t.listingDetail.archivedBanner
          : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {statusBanner && (
        <div className="mb-6 rounded-md border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)]">
          {statusBanner}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {images && images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={propertyPhotoUrl(img.storage_path)}
                  alt={`${property.title} photo ${i + 1}`}
                  className={`h-full w-full rounded-lg object-cover ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--muted)]">
              {t.listingDetail.noPhotos}
            </div>
          )}

          <div className="mt-6">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                property.listing_type === "sale"
                  ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                  : "bg-[var(--accent)]/10 text-[var(--accent)]"
              }`}
            >
              {property.listing_type === "sale" ? t.listings.forSale : t.listings.forRent}
            </span>
            <h1 className="mt-2 text-2xl font-semibold">{property.title}</h1>
            <p className="text-[var(--muted)]">
              {property.area}, {cityLabel(property.city, locale)}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--brand)]">
              {formatPrice(property.price, property.currency, property.listing_type, property.rent_period)}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-[var(--border)] p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[var(--muted)]">{t.listingDetail.bedrooms}</dt>
                <dd className="font-medium">{property.bedrooms ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">{t.listingDetail.bathrooms}</dt>
                <dd className="font-medium">{property.bathrooms ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">{t.listingDetail.area}</dt>
                <dd className="font-medium">{property.area_sqm ? `${property.area_sqm} m²` : "—"}</dd>
              </div>
              {property.finishing && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.finishing}</dt>
                  <dd className="font-medium">{t.finishingLevels[property.finishing]}</dd>
                </div>
              )}
              {property.payment_method && property.listing_type === "sale" && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.paymentMethod}</dt>
                  <dd className="font-medium">
                    {t.paymentMethods[property.payment_method]}
                    {property.payment_method === "installments" &&
                      property.down_payment_percent != null &&
                      property.installment_years != null && (
                        <span className="block text-xs text-[var(--muted)]">
                          {interpolate(t.listingDetail.downPaymentAndYears, {
                            percent: property.down_payment_percent,
                            years: property.installment_years,
                          })}
                        </span>
                      )}
                  </dd>
                </div>
              )}
              {property.furnishing && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.furnishing}</dt>
                  <dd className="font-medium">{t.furnishingStatuses[property.furnishing]}</dd>
                </div>
              )}
              {property.floor_number != null && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.floorNumber}</dt>
                  <dd className="font-medium">{property.floor_number}</dd>
                </div>
              )}
              {property.view && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.view}</dt>
                  <dd className="font-medium">{t.propertyViews[property.view]}</dd>
                </div>
              )}
              {property.compound_name && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.compoundName}</dt>
                  <dd className="font-medium">{property.compound_name}</dd>
                </div>
              )}
              {property.developer_name && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.developerName}</dt>
                  <dd className="font-medium">{property.developer_name}</dd>
                </div>
              )}
              {property.delivery_date && (
                <div>
                  <dt className="text-[var(--muted)]">{t.listingDetail.deliveryDate}</dt>
                  <dd className="font-medium">{property.delivery_date}</dd>
                </div>
              )}
            </dl>

            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[var(--muted)]">{t.listingDetail.amenities}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs">
                      {t.amenityOptions[a as keyof typeof t.amenityOptions] || a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 whitespace-pre-line text-sm leading-relaxed">{property.description}</div>
          </div>
        </div>

        <div className="space-y-4">
          <InquiryForm propertyId={property.id} signedIn={!!user} locale={locale} />
          <p className="text-xs text-[var(--muted)]">{t.listingDetail.privacyNote}</p>
        </div>
      </div>
    </div>
  );
}
