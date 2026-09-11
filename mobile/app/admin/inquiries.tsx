import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import type { Database } from "../../lib/database.types";

type Inquiry = Database["public"]["Tables"]["property_inquiries"]["Row"];

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<Record<string, { title: string }>>({});
  const [requesters, setRequesters] = useState<Record<string, { email: string | null; full_name: string | null }>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("property_inquiries").select("*").order("created_at", { ascending: false }).limit(100);
      setInquiries(data || []);

      const propertyIds = [...new Set((data || []).map((i) => i.property_id))];
      const requesterIds = [...new Set((data || []).map((i) => i.requester_id))];

      if (propertyIds.length) {
        const { data: props } = await supabase.from("properties").select("id, title").in("id", propertyIds);
        setProperties(Object.fromEntries((props || []).map((p) => [p.id, p])));
      }
      if (requesterIds.length) {
        const { data: reqs } = await supabase.from("profiles").select("id, email, full_name").in("id", requesterIds);
        setRequesters(Object.fromEntries((reqs || []).map((r) => [r.id, r])));
      }
    })();
  }, []);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      data={inquiries}
      keyExtractor={(i) => i.id}
      ListEmptyComponent={<Text style={styles.empty}>No inquiries yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{properties[item.property_id]?.title || "Property"}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.muted}>
            From: {requesters[item.requester_id]?.full_name || "Unnamed"} ·{" "}
            {requesters[item.requester_id]?.email || "no email on file"}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, padding: 12, gap: 4 },
  title: { fontWeight: "600" },
  message: { fontSize: 14, color: colors.foreground },
  muted: { fontSize: 12, color: colors.muted },
});
