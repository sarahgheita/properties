import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { colors } from "../../../lib/theme";
import { formatPrice } from "../../../lib/format";
import Button from "../../../components/Button";
import type { Database } from "../../../lib/database.types";

type Request = Database["public"]["Tables"]["property_requests"]["Row"];
type Contact = Database["public"]["Tables"]["property_request_contacts"]["Row"];

export default function AdminRequestReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from("property_requests").select("*").eq("id", id).maybeSingle(),
      supabase.from("property_request_contacts").select("*").eq("request_id", id).maybeSingle(),
    ]);
    setRequest(r);
    setContact(c);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function approve() {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("property_requests")
      .update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), rejection_reason: null })
      .eq("id", id);
    setBusy(false);
    router.back();
  }

  async function reject() {
    if (!reason.trim()) return;
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("property_requests")
      .update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), rejection_reason: reason })
      .eq("id", id);
    setBusy(false);
    router.back();
  }

  if (!request) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 10 }}>
      {request.flagged && <Text style={styles.flag}>⚑ Flagged: {request.flag_reasons.join(", ")}</Text>}
      {request.source === "ai_chat" && <Text style={styles.source}>via AI assistant</Text>}
      <Text style={styles.title}>Wants to {request.listing_type === "sale" ? "buy" : "rent"}</Text>
      <Text style={styles.muted}>{[request.area, request.city].filter(Boolean).join(", ")}</Text>
      <Text style={styles.desc}>{request.description}</Text>
      {(request.budget_min || request.budget_max) && (
        <Text style={styles.muted}>
          Budget:{" "}
          {request.budget_min && request.budget_max
            ? `${formatPrice(request.budget_min, request.currency, request.listing_type)} - ${formatPrice(request.budget_max, request.currency, request.listing_type)}`
            : formatPrice(request.budget_min || request.budget_max || 0, request.currency, request.listing_type)}
        </Text>
      )}

      <View style={styles.contactBox}>
        <Text style={styles.contactTitle}>Contact info (admin only)</Text>
        {contact ? (
          <>
            <Text>Name: {contact.contact_name}</Text>
            <Text>Phone: {contact.contact_phone}</Text>
            {contact.contact_email && <Text>Email: {contact.contact_email}</Text>}
          </>
        ) : (
          <Text style={styles.muted}>No contact info on file.</Text>
        )}
      </View>

      {!showReject ? (
        <View style={styles.row}>
          <Button title="Approve & publish" onPress={approve} loading={busy} />
          <Button title="Reject" variant="danger" onPress={() => setShowReject(true)} />
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <TextInput
            placeholder="Reason for rejection"
            value={reason}
            onChangeText={setReason}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          <View style={styles.row}>
            <Button title="Confirm reject" variant="danger" onPress={reject} loading={busy} />
            <Button title="Cancel" variant="outline" onPress={() => setShowReject(false)} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flag: { color: colors.danger, fontWeight: "600" },
  source: { color: colors.brand, fontWeight: "600", fontSize: 12 },
  title: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  muted: { color: colors.muted, fontSize: 13 },
  desc: { fontSize: 14, color: colors.foreground },
  contactBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, gap: 4, backgroundColor: colors.surface },
  contactTitle: { fontWeight: "600" },
  row: { flexDirection: "row", gap: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 },
});
