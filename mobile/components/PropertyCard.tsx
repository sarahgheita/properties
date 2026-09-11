import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { formatPrice, propertyPhotoUrl } from "../lib/format";
import { colors } from "../lib/theme";
import type { Database } from "../lib/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export default function PropertyCard({ property, photoPath }: { property: Property; photoPath?: string | null }) {
  const router = useRouter();

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/listing/${property.id}`)}>
      {photoPath ? (
        <Image source={{ uri: propertyPhotoUrl(photoPath) }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={{ color: colors.muted }}>No photo</Text>
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.row}>
          <Text
            style={[
              styles.badge,
              property.listing_type === "sale" ? styles.badgeSale : styles.badgeRent,
            ]}
          >
            {property.listing_type === "sale" ? "For Sale" : "For Rent"}
          </Text>
          <Text style={styles.muted} numberOfLines={1}>
            {property.area}, {property.city}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={styles.price}>
          {formatPrice(property.price, property.currency, property.listing_type, property.rent_period)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: { width: "100%", aspectRatio: 4 / 3 },
  noImage: { alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  body: { padding: 12, gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { fontSize: 11, fontWeight: "600", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: "hidden" },
  badgeSale: { backgroundColor: "#0f6b5c22", color: colors.brand },
  badgeRent: { backgroundColor: "#b4530922", color: colors.accent },
  muted: { color: colors.muted, fontSize: 12, flexShrink: 1 },
  title: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  price: { fontSize: 15, fontWeight: "700", color: colors.brand },
});
