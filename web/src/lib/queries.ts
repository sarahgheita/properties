import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, FinishingLevel, ListingType, PaymentMethod } from "@/lib/database.types";

export interface PropertyFilters {
  listingType?: ListingType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  finishing?: FinishingLevel;
  paymentMethod?: PaymentMethod;
}

export async function getApprovedProperties(
  supabase: SupabaseClient<Database>,
  filters: PropertyFilters = {},
  limit = 24,
) {
  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.listingType) query = query.eq("listing_type", filters.listingType);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.finishing) query = query.eq("finishing", filters.finishing);
  if (filters.paymentMethod) query = query.eq("payment_method", filters.paymentMethod);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Returns a map of property_id -> first photo storage_path (or undefined if none).
export async function getCoverPhotos(supabase: SupabaseClient<Database>, propertyIds: string[]) {
  if (propertyIds.length === 0) return {};

  const { data, error } = await supabase
    .from("property_images")
    .select("property_id, storage_path, position")
    .in("property_id", propertyIds)
    .order("position", { ascending: true });

  if (error) throw error;

  const map: Record<string, string> = {};
  for (const row of data) {
    if (!(row.property_id in map)) {
      map[row.property_id] = row.storage_path;
    }
  }
  return map;
}
