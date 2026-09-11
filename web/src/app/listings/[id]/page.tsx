import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, propertyPhotoUrl } from "@/lib/format";
import InquiryForm from "@/components/InquiryForm";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {property.status !== "approved" && (
        <div className="mb-6 rounded-md border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 text-sm text-[var(--accent)]">
          This listing is {property.status === "pending_review" ? "awaiting review" : property.status} and
          is only visible to you.
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
              No photos yet
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
              {property.listing_type === "sale" ? "For Sale" : "For Rent"}
            </span>
            <h1 className="mt-2 text-2xl font-semibold">{property.title}</h1>
            <p className="text-[var(--muted)]">
              {property.area}, {property.city}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--brand)]">
              {formatPrice(property.price, property.currency, property.listing_type, property.rent_period)}
            </p>

            <dl className="mt-4 grid grid-cols-3 gap-4 rounded-lg border border-[var(--border)] p-4 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Bedrooms</dt>
                <dd className="font-medium">{property.bedrooms ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Bathrooms</dt>
                <dd className="font-medium">{property.bathrooms ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Area</dt>
                <dd className="font-medium">{property.area_sqm ? `${property.area_sqm} m²` : "—"}</dd>
              </div>
            </dl>

            <div className="mt-6 whitespace-pre-line text-sm leading-relaxed">{property.description}</div>
          </div>
        </div>

        <div className="space-y-4">
          <InquiryForm propertyId={property.id} signedIn={!!user} />
          <p className="text-xs text-[var(--muted)]">
            For your safety, contact details are never shown publicly. All communication about this
            listing goes through the agent.
          </p>
        </div>
      </div>
    </div>
  );
}
