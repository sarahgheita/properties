import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import { formatPrice } from "../../lib/format";
import Button from "../../components/Button";
import type { Database } from "../../lib/database.types";

type Request = Database["public"]["Tables"]["property_requests"]["Row"];

export default function RequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("property_requests")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    setRequests(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Looking For</Text>
            <Button title="Post a request" onPress={() => router.push("/post-request")} />
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No open requests right now.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.badge}>
              Wants to {item.listing_type === "sale" ? "Buy" : "Rent"}
              {item.property_type ? ` · ${item.property_type}` : ""}
            </Text>
            <Text style={styles.desc}>{item.description}</Text>
            {(item.budget_min || item.budget_max) && (
              <Text style={styles.muted}>
                Budget:{" "}
                {item.budget_min && item.budget_max
                  ? `${formatPrice(item.budget_min, item.currency, item.listing_type)} - ${formatPrice(item.budget_max, item.currency, item.listing_type)}`
                  : formatPrice(item.budget_min || item.budget_max || 0, item.currency, item.listing_type)}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  header: { marginBottom: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
  badge: { fontSize: 12, fontWeight: "600", color: colors.brand },
  desc: { fontSize: 14, color: colors.foreground },
  muted: { fontSize: 12, color: colors.muted },
});
