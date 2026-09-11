import { createClient } from "@/lib/supabase/server";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("property_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const propertyIds = [...new Set((inquiries || []).map((i) => i.property_id))];
  const requesterIds = [...new Set((inquiries || []).map((i) => i.requester_id))];

  const [{ data: properties }, { data: requesters }] = await Promise.all([
    propertyIds.length
      ? supabase.from("properties").select("id, title, city, area").in("id", propertyIds)
      : Promise.resolve({ data: [] }),
    requesterIds.length
      ? supabase.from("profiles").select("id, email, full_name").in("id", requesterIds)
      : Promise.resolve({ data: [] }),
  ]);

  const propertyMap = new Map((properties || []).map((p) => [p.id, p]));
  const requesterMap = new Map((requesters || []).map((r) => [r.id, r]));

  return (
    <div>
      <h2 className="text-lg font-semibold">Inquiries</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Seekers never see owner contact info — connect the two parties manually from here.
      </p>

      <div className="mt-4 space-y-3">
        {!inquiries || inquiries.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No inquiries yet.</p>
        ) : (
          inquiries.map((inq) => {
            const property = propertyMap.get(inq.property_id);
            const requester = requesterMap.get(inq.requester_id);
            return (
              <div key={inq.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{property?.title || "Property"}</p>
                  <InquiryStatusSelect id={inq.id} status={inq.status} />
                </div>
                <p className="text-[var(--muted)]">{[property?.area, property?.city].filter(Boolean).join(", ")}</p>
                <p className="mt-2">{inq.message}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  From: {requester?.full_name || "Unnamed"} · {requester?.email || "no email on file"}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
