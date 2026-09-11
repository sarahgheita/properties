import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { scanForContactLeak } from "../lib/moderation";
import { colors } from "../lib/theme";
import TextField from "../components/TextField";
import Button from "../components/Button";
import CityPicker from "../components/CityPicker";
import type {
  FinishingLevel,
  FurnishingStatus,
  ListingType,
  PaymentMethod,
  PropertyType,
  PropertyView,
} from "../lib/database.types";

const PROPERTY_TYPES: PropertyType[] = [
  "apartment", "villa", "townhouse", "duplex", "studio", "chalet", "office", "shop", "land", "other",
];

const FINISHING_LEVELS: { label: string; value: FinishingLevel }[] = [
  { label: "Super Lux", value: "super_lux" },
  { label: "Finished", value: "finished" },
  { label: "Semi-finished", value: "semi_finished" },
  { label: "Core & shell", value: "core_shell" },
  { label: "Not finished", value: "not_finished" },
];

const FURNISHING_STATUSES: { label: string; value: FurnishingStatus }[] = [
  { label: "Unfurnished", value: "unfurnished" },
  { label: "Semi-furnished", value: "semi_furnished" },
  { label: "Furnished", value: "furnished" },
];

const PROPERTY_VIEWS: { label: string; value: PropertyView }[] = [
  { label: "Garden", value: "garden" },
  { label: "Sea", value: "sea" },
  { label: "Pool", value: "pool" },
  { label: "Street", value: "street" },
  { label: "Landmark", value: "landmark" },
  { label: "Other", value: "other" },
];

const AMENITY_OPTIONS: { label: string; value: string }[] = [
  { label: "Pool", value: "pool" },
  { label: "Gym", value: "gym" },
  { label: "Security", value: "security" },
  { label: "Parking", value: "parking" },
  { label: "Elevator", value: "elevator" },
  { label: "Central A/C", value: "central_ac" },
  { label: "Maid's room", value: "maids_room" },
  { label: "Garden", value: "garden" },
  { label: "Roof access", value: "roof" },
  { label: "Storage room", value: "storage" },
];

export default function PostPropertyScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [listingType, setListingType] = useState<ListingType>("sale");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [finishing, setFinishing] = useState<FinishingLevel | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [downPaymentPercent, setDownPaymentPercent] = useState("");
  const [installmentYears, setInstallmentYears] = useState("");
  const [furnishing, setFurnishing] = useState<FurnishingStatus | "">("");
  const [compoundName, setCompoundName] = useState("");
  const [developerName, setDeveloperName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [view, setView] = useState<PropertyView | "">("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });
    if (!result.canceled) setPhotos(result.assets);
  }

  function toggleAmenity(value: string) {
    setAmenities((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]));
  }

  async function handleSubmit() {
    setError(null);
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!title || !description || !price || !city || !area || !contactName || !contactPhone) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const flagReasons = scanForContactLeak(title, description);

    const { data: property, error: insertError } = await supabase
      .from("properties")
      .insert({
        owner_id: user.id,
        listing_type: listingType,
        property_type: propertyType,
        title,
        description,
        price: Number(price),
        currency: "EGP",
        rent_period: listingType === "rent" ? "month" : null,
        city,
        area,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        area_sqm: areaSqm ? Number(areaSqm) : null,
        finishing: finishing || null,
        payment_method: listingType === "sale" ? paymentMethod || null : null,
        down_payment_percent:
          listingType === "sale" && paymentMethod === "installments" && downPaymentPercent
            ? Number(downPaymentPercent)
            : null,
        installment_years:
          listingType === "sale" && paymentMethod === "installments" && installmentYears
            ? Number(installmentYears)
            : null,
        furnishing: furnishing || null,
        compound_name: compoundName.trim() || null,
        developer_name: developerName.trim() || null,
        delivery_date: deliveryDate.trim() || null,
        floor_number: floorNumber ? Number(floorNumber) : null,
        view: view || null,
        amenities,
        flagged: flagReasons.length > 0,
        flag_reasons: flagReasons,
      })
      .select()
      .single();

    if (insertError || !property) {
      setError(insertError?.message || "Something went wrong.");
      setSubmitting(false);
      return;
    }

    const { error: contactError } = await supabase.from("property_contacts").insert({
      property_id: property.id,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail || null,
    });

    if (contactError) {
      setError(contactError.message);
      setSubmitting(false);
      return;
    }

    for (let i = 0; i < photos.length; i++) {
      const asset = photos[i];
      const ext = asset.uri.split(".").pop() || "jpg";
      const path = `${property.id}/${i}.${ext}`;
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(path, arrayBuffer, { contentType: asset.mimeType || "image/jpeg" });

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }

      await supabase.from("property_images").insert({ property_id: property.id, storage_path: path, position: i });
    }

    setSubmitting(false);
    router.replace(`/listing/${property.id}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Text style={styles.hint}>An agent reviews every submission before it's published.</Text>

      <ToggleRow
        label="Listing type"
        options={[{ label: "For Sale", value: "sale" }, { label: "For Rent", value: "rent" }]}
        value={listingType}
        onChange={(v) => {
          setListingType(v as ListingType);
          // Cash/installments only applies to a sale — clear it if switching to rent.
          if (v === "rent") setPaymentMethod("");
        }}
      />

      <TextField label="Title *" value={title} onChangeText={setTitle} placeholder="e.g. Modern 3BR apartment" />
      <TextField
        label="Description *"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the property. Don't include phone numbers or social handles."
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" }}
      />
      <TextField label="Price (EGP) *" value={price} onChangeText={setPrice} keyboardType="numeric" />

      {listingType === "sale" && (
        <ToggleRow
          label="Payment method"
          options={[{ label: "Cash", value: "cash" }, { label: "Installments", value: "installments" }]}
          value={paymentMethod}
          onChange={(v) => setPaymentMethod(v as PaymentMethod)}
        />
      )}
      {listingType === "sale" && paymentMethod === "installments" && (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField label="Down payment %" value={downPaymentPercent} onChangeText={setDownPaymentPercent} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Installment years" value={installmentYears} onChangeText={setInstallmentYears} keyboardType="numeric" />
          </View>
        </View>
      )}

      <ToggleRow
        label="Finishing"
        options={FINISHING_LEVELS}
        value={finishing}
        onChange={(v) => setFinishing(v as FinishingLevel)}
      />

      <ToggleRow
        label="Furnishing"
        options={FURNISHING_STATUSES}
        value={furnishing}
        onChange={(v) => setFurnishing(v as FurnishingStatus)}
      />

      <ToggleRow label="View" options={PROPERTY_VIEWS} value={view} onChange={(v) => setView(v as PropertyView)} />

      <View>
        <Text style={styles.contactTitle}>Amenities</Text>
        <View style={styles.row}>
          {AMENITY_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              title={opt.label}
              variant={amenities.includes(opt.value) ? "primary" : "outline"}
              onPress={() => toggleAmenity(opt.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField label="Compound / project name" value={compoundName} onChangeText={setCompoundName} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Developer" value={developerName} onChangeText={setDeveloperName} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Delivery date"
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            placeholder='e.g. Q4 2029, or "Ready to move"'
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Floor number" value={floorNumber} onChangeText={setFloorNumber} keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Bathrooms" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Area m²" value={areaSqm} onChangeText={setAreaSqm} keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <CityPicker label="City *" value={city} onChange={setCity} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Area *" value={area} onChangeText={setArea} />
        </View>
      </View>

      <Button title={`Photos (${photos.length} selected)`} variant="outline" onPress={pickPhotos} />

      <View style={styles.contactBox}>
        <Text style={styles.contactTitle}>Your contact info (private)</Text>
        <TextField label="Name *" value={contactName} onChangeText={setContactName} />
        <TextField label="Phone *" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
        <TextField label="Email" value={contactEmail} onChangeText={setContactEmail} keyboardType="email-address" />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Submit for review" onPress={handleSubmit} loading={submitting} />
    </ScrollView>
  );
}

function ToggleRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.contactTitle}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => (
          <Button
            key={opt.value}
            title={opt.label}
            variant={value === opt.value ? "primary" : "outline"}
            onPress={() => onChange(opt.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hint: { fontSize: 12, color: colors.muted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  contactBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, gap: 10 },
  contactTitle: { fontWeight: "600", fontSize: 13, color: colors.foreground, marginBottom: 4 },
  error: { color: colors.danger, fontSize: 13 },
});
