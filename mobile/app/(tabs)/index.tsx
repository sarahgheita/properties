import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import { SITE_NAME, SITE_TAGLINE } from "../../lib/site";
import PropertyCard from "../../components/PropertyCard";
import type { Database } from "../../lib/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function BrowseScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: props } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    setProperties(props || []);

    const ids = (props || []).map((p) => p.id);
    if (ids.length > 0) {
      const { data: images } = await supabase
        .from("property_images")
        .select("property_id, storage_path, position")
        .in("property_id", ids)
        .order("position", { ascending: true });

      const map: Record<string, string> = {};
      for (const img of images || []) {
        if (!(img.property_id in map)) map[img.property_id] = img.storage_path;
      }
      setCovers(map);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{SITE_NAME}</Text>
            <Text style={styles.subtitle}>{SITE_TAGLINE}</Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No approved listings yet.</Text> : null
        }
        renderItem={({ item }) => <PropertyCard property={item} photoPath={covers[item.id]} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
