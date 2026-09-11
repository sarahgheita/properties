import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { approveRequest, rejectRequest } from "@/app/admin/actions";
import ReviewActions from "@/components/admin/ReviewActions";

export default async function AdminRequestReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: request }, { data: contact }] = await Promise.all([
    supabase.from("property_requests").select("*").eq("id", id).maybeSingle(),
    supabase.from("property_request_contacts").select("*").eq("request_id", id).maybeSingle(),
  ]);

  if (!request) notFound();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-[var(--muted)]/20 px-2 py-0.5 font-medium">{request.status}</span>
          {request.flagged && (
            <span className="rounded-full bg-[var(--danger)]/10 px-2 py-0.5 font-medium text-[var(--danger)]">
              ⚑ Flagged: {request.flag_reasons.join(", ")}
            </span>
          )}
          {request.source === "ai_chat" && (
            <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 font-medium text-[var(--brand)]">
              via AI assistant
            </span>
          )}
        </div>
        <h1 className="mt-2 text-xl font-semibold">
          Wants to {request.listing_type === "sale" ? "buy" : "rent"} {request.property_type || "a property"}
        </h1>
        <p className="text-[var(--muted)]">{[request.area, request.city].filter(Boolean).join(", ")}</p>
        <p className="mt-4 whitespace-pre-line text-sm">{request.description}</p>

        {(request.budget_min || request.budget_max) && (
          <p className="mt-2 text-sm">
            Budget:{" "}
            {request.budget_min && request.budget_max
              ? `${formatPrice(request.budget_min, request.currency, request.listing_type)} – ${formatPrice(request.budget_max, request.currency, request.listing_type)}`
              : formatPrice(request.budget_min || request.budget_max || 0, request.currency, request.listing_type)}
          </p>
        )}
        {request.bedrooms_min && <p className="text-sm">{request.bedrooms_min}+ bedrooms</p>}

        {request.rejection_reason && (
          <p className="mt-4 text-sm text-[var(--danger)]">Previous rejection reason: {request.rejection_reason}</p>
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
        </div>

        <ReviewActions onApprove={approveRequest.bind(null, id)} onReject={rejectRequest.bind(null, id)} />
      </div>
    </div>
  );
}
