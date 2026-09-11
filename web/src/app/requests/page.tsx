import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const submitted = params.submitted === "1";

  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("property_requests")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">People Looking For Properties</h1>
        <Link href="/requests/new" className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white">
          Post a request
        </Link>
      </div>

      {submitted && (
        <div className="mt-4 rounded-md border border-[var(--brand)] bg-[var(--brand)]/10 px-4 py-2 text-sm text-[var(--brand)]">
          Thanks! Your request was submitted and will appear here once reviewed.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {!requests || requests.length === 0 ? (
          <p className="text-[var(--muted)]">No open requests right now.</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    r.listing_type === "sale"
                      ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                      : "bg-[var(--accent)]/10 text-[var(--accent)]"
                  }`}
                >
                  Wants to {r.listing_type === "sale" ? "Buy" : "Rent"}
                </span>
                {r.property_type && <span className="text-[var(--muted)]">{r.property_type}</span>}
                {(r.city || r.area) && (
                  <span className="text-[var(--muted)]">
                    · {[r.area, r.city].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm">{r.description}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                {(r.budget_min || r.budget_max) && (
                  <span>
                    Budget:{" "}
                    {r.budget_min && r.budget_max
                      ? `${formatPrice(r.budget_min, r.currency, r.listing_type)} – ${formatPrice(r.budget_max, r.currency, r.listing_type)}`
                      : formatPrice(r.budget_min || r.budget_max || 0, r.currency, r.listing_type)}
                  </span>
                )}
                {r.bedrooms_min && <span>{r.bedrooms_min}+ bedrooms</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
