import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, propertyPhotoUrl } from "@/lib/format";
import { approveProperty, rejectProperty } from "@/app/admin/actions";
import ReviewActions from "@/components/admin/ReviewActions";

export default async function AdminPropertyReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: property }, { data: images }, { data: contact }, { data: owner }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase.from("property_images").select("*").eq("property_id", id).order("position"),
    supabase.from("property_contacts").select("*").eq("property_id", id).maybeSingle(),
    supabase.from("properties").select("owner_id").eq("id", id).maybeSingle(),
  ]);

  if (!property) notFound();

  let ownerProfile = null;
  if (owner) {
    const { data } = await supabase.from("profiles").select("*").eq("id", owner.owner_id).maybeSingle();
    ownerProfile = data;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-[var(--muted)]/20 px-2 py-0.5 font-medium">{property.status}</span>
          {property.flagged && (
            <span className="rounded-full bg-[var(--danger)]/10 px-2 py-0.5 font-medium text-[var(--danger)]">
              ⚑ Flagged: {property.flag_reasons.join(", ")}
            </span>
          )}
        </div>
        <h1 className="mt-2 text-xl font-semibold">{property.title}</h1>
        <p className="text-[var(--muted)]">
          {property.area}, {property.city} · {formatPrice(property.price, property.currency, property.listing_type, property.rent_period)}
        </p>
        <p className="mt-4 whitespace-pre-line text-sm">{property.description}</p>

        {images && images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.id} src={propertyPhotoUrl(img.storage_path)} alt="" className="aspect-square rounded-md object-cover" />
            ))}
          </div>
        )}

        {property.rejection_reason && (
          <p className="mt-4 text-sm text-[var(--danger)]">Previous rejection reason: {property.rejection_reason}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
          <h2 className="font-medium">Contact info (admin only)</h2>
          {contact ? (
            <dl className="mt-2 space-y-1">
              <div>
                <dt className="text-[var(--muted)]">Name</dt>
                <dd className="font-medium">{contact.contact_name}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Phone</dt>
                <dd className="font-medium">{contact.contact_phone}</dd>
              </div>
              {contact.contact_email && (
                <div>
                  <dt className="text-[var(--muted)]">Email</dt>
                  <dd className="font-medium">{contact.contact_email}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-2 text-[var(--muted)]">No contact info on file.</p>
          )}
          {ownerProfile && (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Posted by account: {ownerProfile.phone || ownerProfile.id}
            </p>
          )}
        </div>

        <ReviewActions onApprove={approveProperty.bind(null, id)} onReject={rejectProperty.bind(null, id)} />
      </div>
    </div>
  );
}
