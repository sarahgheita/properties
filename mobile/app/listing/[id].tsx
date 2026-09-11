import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import { formatPrice, propertyPhotoUrl } from "../../lib/format";
import { cityLabel } from "../../lib/egyptCities";
import { useAuth } from "../../lib/auth-context";
import Button from "../../components/Button";
import type { Database } from "../../lib/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type PropertyImage = Database["public"]["Tables"]["property_images"]["Row"];

const FINISHING_LABELS: Record<string, string> = {
  super_lux: "Super Lux",
  finished: "Finished",
  semi_finished: "Semi-finished",
  core_shell: "Core & shell",
  not_finished: "Not finished",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  installments: "Installments",
};

const FURNISHING_LABELS: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-furnished",
  furnished: "Furnished",
};

const VIEW_LABELS: Record<string, string> = {
  garden: "Garden view",
  sea: "Sea view",
  pool: "Pool view",
  street: "Street view",
  landmark: "Landmark view",
  other: "Other view",
};

const AMENITY_LABELS: Record<string, string> = {
  pool: "Pool",
  gym: "Gym",
  security: "Security",
  parking: "Parking",
  elevator: "Elevator",
  central_ac: "Central A/C",
  maids_room: "Maid's room",
  garden: "Garden",
  roof: "Roof access",
  storage: "Storage room",
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      setProperty(p);
      const { data: imgs } = await supabase
        .from("property_images")
        .select("*")
        .eq("property_id", id)
        .order("position");
      setImages(imgs || []);
    })();
  }, [id]);

  async function sendInquiry() {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!message.trim()) {
      setError("Write a message first.");
      return;
    }
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from("property_inquiries").insert({
      property_id: id,
      requester_id: user.id,
      message: message.trim(),
    });
    setSending(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSent(true);
  }

  if (!property) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.muted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {images.map((img) => (
            <Image key={img.id} source={{ uri: propertyPhotoUrl(img.storage_path) }} style={styles.galleryImage} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.galleryImage, styles.noImage]}>
          <Text style={{ color: colors.muted }}>No photos yet</Text>
        </View>
      )}

      <Text style={styles.badge}>{property.listing_type === "sale" ? "For Sale" : "For Rent"}</Text>
      <Text style={styles.title}>{property.title}</Text>
      <Text style={styles.muted}>
        {property.area}, {cityLabel(property.city, "en")}
      </Text>
      <Text style={styles.price}>
        {formatPrice(property.price, property.currency, property.listing_type, property.rent_period)}
      </Text>

      <View style={styles.factsRow}>
        <Fact label="Bedrooms" value={property.bedrooms ?? "—"} />
        <Fact label="Bathrooms" value={property.bathrooms ?? "—"} />
        <Fact label="Area" value={property.area_sqm ? `${property.area_sqm} m²` : "—"} />
        {property.finishing && <Fact label="Finishing" value={FINISHING_LABELS[property.finishing] || property.finishing} />}
        {property.payment_method && property.listing_type === "sale" && (
          <Fact
            label="Payment"
            value={
              property.payment_method === "installments" && property.down_payment_percent != null
                ? `${PAYMENT_LABELS[property.payment_method]} (${property.down_payment_percent}% down, ${property.installment_years ?? "?"} yr)`
                : PAYMENT_LABELS[property.payment_method] || property.payment_method
            }
          />
        )}
        {property.furnishing && <Fact label="Furnishing" value={FURNISHING_LABELS[property.furnishing] || property.furnishing} />}
        {property.floor_number != null && <Fact label="Floor" value={property.floor_number} />}
        {property.view && <Fact label="View" value={VIEW_LABELS[property.view] || property.view} />}
        {property.compound_name && <Fact label="Compound" value={property.compound_name} />}
        {property.developer_name && <Fact label="Developer" value={property.developer_name} />}
        {property.delivery_date && <Fact label="Delivery" value={property.delivery_date} />}
      </View>

      {property.amenities && property.amenities.length > 0 && (
        <View style={styles.amenitiesRow}>
          {property.amenities.map((a) => (
            <Text key={a} style={styles.amenityChip}>
              {AMENITY_LABELS[a] || a}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.description}>{property.description}</Text>

      <View style={styles.inquiryBox}>
        {sent ? (
          <Text style={{ color: colors.brand }}>Thanks — your inquiry was sent.</Text>
        ) : (
          <>
            <Text style={styles.label}>Interested in this property?</Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Ask a question or request a viewing…"
              value={message}
              onChangeText={setMessage}
              style={styles.textarea}
              placeholderTextColor={colors.muted}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title={user ? "Send inquiry" : "Sign in to send inquiry"} onPress={sendInquiry} loading={sending} />
          </>
        )}
        <Text style={styles.disclaimer}>
          Contact details are never shown publicly. All communication goes through the agent.
        </Text>
      </View>
    </ScrollView>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gallery: { marginBottom: 12 },
  galleryImage: { width: 280, height: 200, borderRadius: 12, marginRight: 8, backgroundColor: colors.surface },
  noImage: { width: "100%", alignItems: "center", justifyContent: "center" },
  badge: { alignSelf: "flex-start", fontSize: 12, fontWeight: "600", color: colors.brand, backgroundColor: "#0f6b5c22", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  title: { fontSize: 20, fontWeight: "700", marginTop: 8, color: colors.foreground },
  muted: { color: colors.muted, fontSize: 13 },
  price: { fontSize: 20, fontWeight: "700", color: colors.brand, marginTop: 6 },
  factsRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 16, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  fact: { gap: 2 },
  factValue: { fontWeight: "600", color: colors.foreground },
  amenitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  amenityChip: {
    fontSize: 12,
    color: colors.foreground,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  description: { marginTop: 16, fontSize: 14, lineHeight: 20, color: colors.foreground },
  inquiryBox: { marginTop: 20, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, gap: 8 },
  label: { fontWeight: "600", color: colors.foreground },
  textarea: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, minHeight: 70, textAlignVertical: "top", color: colors.foreground },
  error: { color: colors.danger, fontSize: 13 },
  disclaimer: { fontSize: 11, color: colors.muted },
});
