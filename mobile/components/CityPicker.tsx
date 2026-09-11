import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../lib/theme";
import { EGYPT_CITIES, cityLabel } from "../lib/egyptCities";

export default function CityPicker({
  label,
  value,
  onChange,
  placeholder = "Select a city",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EGYPT_CITIES;
    return EGYPT_CITIES.filter((c) => c.en.toLowerCase().includes(q) || c.ar.includes(q));
  }, [query]);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={value ? styles.value : styles.placeholder}>{value ? cityLabel(value, "en") : placeholder}</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <TextInput
            autoFocus
            placeholder="Search cities…"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.value}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Text style={styles.rowText}>{item.en}</Text>
              </Pressable>
            )}
          />
          <Pressable style={styles.cancel} onPress={() => setOpen(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface },
  value: { fontSize: 14, color: colors.foreground },
  placeholder: { fontSize: 14, color: colors.muted },
  modal: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: 16 },
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, color: colors.foreground, backgroundColor: colors.surface },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { fontSize: 15, color: colors.foreground },
  cancel: { paddingVertical: 16, alignItems: "center" },
  cancelText: { color: colors.brand, fontWeight: "600" },
});
