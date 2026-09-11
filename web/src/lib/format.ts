export function formatPrice(price: number, currency: string, listingType: "sale" | "rent", rentPeriod?: string | null) {
  const amount = new Intl.NumberFormat("en-US").format(price);
  const suffix = listingType === "rent" ? ` / ${rentPeriod || "month"}` : "";
  return `${currency} ${amount}${suffix}`;
}

export function propertyPhotoUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/property-photos/${storagePath}`;
}
