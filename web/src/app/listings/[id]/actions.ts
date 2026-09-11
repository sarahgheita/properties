"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitInquiry(propertyId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to send an inquiry." };
  }

  const message = String(formData.get("message") || "").trim();
  if (!message) {
    return { error: "Enter a message first." };
  }

  const { error } = await supabase.from("property_inquiries").insert({
    property_id: propertyId,
    requester_id: user.id,
    message,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/listings/${propertyId}`);
  return { success: true };
}
