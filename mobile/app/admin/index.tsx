import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth-context";
import { colors } from "../../lib/theme";
import { formatPrice } from "../../lib/format";
import { cityLabel } from "../../lib/egyptCities";
import Button from "../../components/Button";
import type { Database } from "../../lib/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type Request = Database["public"]["Tables"]["property_requests"]["Row"];

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, loading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  const load = useCallback(async () => {
    const [{ data: props }, { data: reqs }] = await Promise.all([
      supabase.from("properties").select("*").eq("status", "pending_review").order("flagged", { ascending: false }),
      supabase.from("property_requests").select("*").eq("status", "pending_review").order("flagged", { ascending: false }),
    ]);
    setProperties(props || []);
    setRequests(reqs || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) return null;

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.muted }}>Admins only.</Text>
      </View>
    );
  }

  const items = [
    ...properties.map((p) => ({ kind: "property" as const, item: p })),
    ...requests.map((r) => ({ kind: "request" as const, item: r })),
  ];

  return (
    <View style={styles.container}>
      <Button title="View Inquiries" variant="outline" onPress={() => router.push("/admin/inquiries")} />
      <FlatList
        data={items}
        keyExtractor={(row) => row.item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={<Text style={styles.empty}>Nothing pending — all caught up.</Text>}
        renderItem={({ item: row }) => (
          <Pressable
            style={[styles.card, row.item.flagged && styles.flagged]}
            onPress={() =>
              router.push(
                row.kind === "property" ? `/admin/properties/${row.item.id}` : `/admin/requests/${row.item.id}`,
              )
            }
          >
            {row.item.flagged && <Text style={styles.flag}>⚑ Flagged</Text>}
            {row.kind === "property" ? (
              <>
                <Text style={styles.title}>{(row.item as Property).title}</Text>
                <Text style={styles.muted}>
                  {(row.item as Property).area}, {cityLabel((row.item as Property).city, "en")} ·{" "}
                  {formatPrice(
                    (row.item as Property).price,
                    (row.item as Property).currency,
                    (row.item as Property).listing_type,
                    (row.item as Property).rent_period,
                  )}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  Wants to {(row.item as Request).listing_type === "sale" ? "buy" : "rent"}
                </Text>
                <Text style={styles.muted} numberOfLines={2}>
                  {(row.item as Request).description}
                </Text>
              </>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 12 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, padding: 12, gap: 4 },
  flagged: { borderColor: colors.danger, backgroundColor: "#b91c1c0a" },
  flag: { color: colors.danger, fontWeight: "600", fontSize: 12 },
  title: { fontWeight: "600", color: colors.foreground },
  muted: { color: colors.muted, fontSize: 12 },
});
