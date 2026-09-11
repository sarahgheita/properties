import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ data: pendingProperties }, { data: pendingRequests }, { count: newInquiries }] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .eq("status", "pending_review")
      .order("flagged", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("property_requests")
      .select("*")
      .eq("status", "pending_review")
      .order("flagged", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase.from("property_inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending properties" value={pendingProperties?.length || 0} />
        <StatCard label="Pending requests" value={pendingRequests?.length || 0} />
        <StatCard label="New inquiries" value={newInquiries || 0} href="/admin/inquiries" />
      </div>

      <section>
        <h2 className="text-lg font-semibold">Properties awaiting review</h2>
        {!pendingProperties || pendingProperties.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Nothing pending — all caught up.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {pendingProperties.map((p) => (
              <Link
                key={p.id}
                href={`/admin/properties/${p.id}`}
                className={`flex items-center justify-between rounded-lg border p-3 text-sm hover:shadow-sm ${
                  p.flagged ? "border-[var(--danger)] bg-[var(--danger)]/5" : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div>
                  <p className="font-medium">
                    {p.flagged && <span className="me-2 text-[var(--danger)]">⚑ Flagged</span>}
                    {p.title}
                  </p>
                  <p className="text-[var(--muted)]">
                    {p.area}, {p.city} · {formatPrice(p.price, p.currency, p.listing_type, p.rent_period)}
                  </p>
                </div>
                <span className="text-[var(--brand)]">Review →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Requests awaiting review</h2>
        {!pendingRequests || pendingRequests.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Nothing pending.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {pendingRequests.map((r) => (
              <Link
                key={r.id}
                href={`/admin/requests/${r.id}`}
                className={`flex items-center justify-between rounded-lg border p-3 text-sm hover:shadow-sm ${
                  r.flagged ? "border-[var(--danger)] bg-[var(--danger)]/5" : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div>
                  <p className="font-medium">
                    {r.flagged && <span className="me-2 text-[var(--danger)]">⚑ Flagged</span>}
                    Wants to {r.listing_type === "sale" ? "buy" : "rent"} · {r.description.slice(0, 60)}
                    {r.description.length > 60 ? "…" : ""}
                  </p>
                  {r.source === "ai_chat" && <p className="text-[var(--muted)]">Submitted via AI assistant</p>}
                </div>
                <span className="text-[var(--brand)]">Review →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
