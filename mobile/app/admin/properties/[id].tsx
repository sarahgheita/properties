import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { colors } from "../../../lib/theme";
import { formatPrice, propertyPhotoUrl } from "../../../lib/format";
import { cityLabel } from "../../../lib/egyptCities";
import Button from "../../../components/Button";
import type { Database } from "../../../lib/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type Contact = Database["public"]["Tables"]["property_contacts"]["Row"];
type Image_ = Database["public"]["Tables"]["property_images"]["Row"];

export default function AdminPropertyReview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [images, setImages] = useState<Image_[]>([]);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ data: p }, { data: c }, { data: imgs }] = await Promise.all([
      supabase.from("properties").select("*").eq("id", id).maybeSingle(),
      supabase.from("property_contacts").select("*").eq("property_id", id).maybeSingle(),
      supabase.from("property_images").select("*").eq("property_id", id).order("position"),
    ]);
    setProperty(p);
    setContact(c);
    setImages(imgs || []);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function approve() {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("properties")
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
      .from("properties")
      .update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString(), rejection_reason: reason })
      .eq("id", id);
    setBusy(false);
    router.back();
  }

  if (!property) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 10 }}>
      {property.flagged && <Text style={styles.flag}>⚑ Flagged: {property.flag_reasons.join(", ")}</Text>}
      <Text style={styles.title}>{property.title}</Text>
      <Text style={styles.muted}>
        {property.area}, {cityLabel(property.city, "en")} · {formatPrice(property.price, property.currency, property.listing_type, property.rent_period)}
      </Text>
      <Text style={styles.muted}>
        {[
          property.bedrooms ? `${property.bedrooms} bed` : null,
          property.bathrooms ? `${property.bathrooms} bath` : null,
          property.finishing ? `Finishing: ${property.finishing.replace("_", " ")}` : null,
          property.payment_method && property.listing_type === "sale" ? `Payment: ${property.payment_method}` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </Text>
      <Text style={styles.desc}>{property.description}</Text>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((img) => (
            <Image key={img.id} source={{ uri: propertyPhotoUrl(img.storage_path) }} style={styles.photo} />
          ))}
        </ScrollView>
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
  title: { fontSize: 18, fontWeight: "700", color: colors.foreground },
  muted: { color: colors.muted, fontSize: 13 },
  desc: { fontSize: 14, color: colors.foreground },
  photo: { width: 160, height: 120, borderRadius: 8, marginRight: 8 },
  contactBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, gap: 4, backgroundColor: colors.surface },
  contactTitle: { fontWeight: "600" },
  row: { flexDirection: "row", gap: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 },
});
