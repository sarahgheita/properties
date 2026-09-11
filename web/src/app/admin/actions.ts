"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function approveProperty(id: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath(`/listings/${id}`);
  return { success: true };
}

export async function rejectProperty(id: string, reason: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), rejection_reason: reason })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath(`/listings/${id}`);
  return { success: true };
}

export async function archiveProperty(id: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ status: "archived", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function approveRequest(id: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_requests")
    .update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), rejection_reason: null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/requests");
  return { success: true };
}

export async function rejectRequest(id: string, reason: string) {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_requests")
    .update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), rejection_reason: reason })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}

export async function updateInquiryStatus(id: string, status: "new" | "contacted" | "closed") {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("property_inquiries").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/inquiries");
  return { success: true };
}
