import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { scanForContactLeak } from "../lib/moderation";
import { colors } from "../lib/theme";
import TextField from "../components/TextField";
import Button from "../components/Button";
import CityPicker from "../components/CityPicker";
import type { ListingType } from "../lib/database.types";

// Fields arrive here as string params when the AI assistant (app/(tabs)/chat.tsx) hands off
// a proposal for the user to review before submitting.
export default function PostRequestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    listing_type?: string;
    description?: string;
    city?: string;
    area?: string;
    budget_min?: string;
    budget_max?: string;
    bedrooms_min?: string;
  }>();

  const [listingType, setListingType] = useState<ListingType>(
    params.listing_type === "sale" ? "sale" : "rent",
  );
  const [description, setDescription] = useState(params.description || "");
  const [budgetMin, setBudgetMin] = useState(params.budget_min || "");
  const [budgetMax, setBudgetMax] = useState(params.budget_max || "");
  const [city, setCity] = useState(params.city || "");
  const [area, setArea] = useState(params.area || "");
  const [bedroomsMin, setBedroomsMin] = useState(params.bedrooms_min || "");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!description || !contactName || !contactPhone) {
      setError("Describe what you're looking for and how to reach you.");
      return;
    }

    setSubmitting(true);
    const flagReasons = scanForContactLeak(description);

    const { data: request, error: insertError } = await supabase
      .from("property_requests")
      .insert({
        requester_id: user.id,
        listing_type: listingType,
        description,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        city: city || null,
        area: area || null,
        bedrooms_min: bedroomsMin ? Number(bedroomsMin) : null,
        flagged: flagReasons.length > 0,
        flag_reasons: flagReasons,
        source: params.description ? "ai_chat" : "form",
      })
      .select()
      .single();

    if (insertError || !request) {
      setError(insertError?.message || "Something went wrong.");
      setSubmitting(false);
      return;
    }

    const { error: contactError } = await supabase.from("property_request_contacts").insert({
      request_id: request.id,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail || null,
    });

    setSubmitting(false);
    if (contactError) {
      setError(contactError.message);
      return;
    }

    router.replace("/(tabs)/requests");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={styles.row}>
        <Button title="Rent" variant={listingType === "rent" ? "primary" : "outline"} onPress={() => setListingType("rent")} />
        <Button title="Buy" variant={listingType === "sale" ? "primary" : "outline"} onPress={() => setListingType("sale")} />
      </View>

      <TextField
        label="Describe what you're looking for *"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" }}
        placeholder="e.g. 2-bedroom apartment near Maadi metro"
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField label="Min budget" value={budgetMin} onChangeText={setBudgetMin} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Max budget" value={budgetMax} onChangeText={setBudgetMax} keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <CityPicker label="City" value={city} onChange={setCity} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Area" value={area} onChangeText={setArea} />
        </View>
      </View>

      <TextField label="Min bedrooms" value={bedroomsMin} onChangeText={setBedroomsMin} keyboardType="numeric" />

      <View style={styles.contactBox}>
        <Text style={styles.contactTitle}>Your contact info (private)</Text>
        <TextField label="Name *" value={contactName} onChangeText={setContactName} />
        <TextField label="Phone *" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
        <TextField label="Email" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Submit request" onPress={handleSubmit} loading={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: "row", gap: 8 },
  contactBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, gap: 10 },
  contactTitle: { fontWeight: "600", fontSize: 13, color: colors.foreground, marginBottom: 4 },
  error: { color: colors.danger, fontSize: 13 },
});
