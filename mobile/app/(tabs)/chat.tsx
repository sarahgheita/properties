import { useState, useRef } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../lib/theme";
import { API_BASE_URL } from "../../lib/site";
import Button from "../../components/Button";

interface Message {
  role: "user" | "model";
  text: string;
}

interface Proposal {
  listing_type?: "rent" | "sale";
  property_type?: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  city?: string;
  area?: string;
  bedrooms_min?: number;
}

const GREETING: Message = {
  role: "model",
  text: "Hi! I can answer questions about how this app works, or help you describe a property you're looking for.",
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  if (!API_BASE_URL) {
    return (
      <View style={styles.container}>
        <Text style={styles.notConfigured}>
          The assistant isn't configured yet. Set EXPO_PUBLIC_API_BASE_URL to your deployed website
          URL so this screen can reach the chat API.
        </Text>
      </View>
    );
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      if (data.text) setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      if (data.proposal) setProposal(data.proposal);
    } catch {
      setError("Couldn't reach the assistant.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  function submitProposal() {
    if (!proposal) return;
    router.push({
      pathname: "/post-request",
      params: {
        listing_type: proposal.listing_type || "",
        description: proposal.description || "",
        city: proposal.city || "",
        area: proposal.area || "",
        budget_min: proposal.budget_min?.toString() || "",
        budget_max: proposal.budget_max?.toString() || "",
        bedrooms_min: proposal.bedrooms_min?.toString() || "",
      },
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.modelBubble]}>
            <Text style={item.role === "user" ? styles.userText : styles.modelText}>{item.text}</Text>
          </View>
        )}
        ListFooterComponent={
          proposal ? (
            <View style={styles.proposal}>
              <Text style={styles.proposalTitle}>Here's what I've got:</Text>
              {proposal.listing_type && <Text style={styles.proposalLine}>Looking to {proposal.listing_type === "sale" ? "buy" : "rent"}</Text>}
              {(proposal.city || proposal.area) && (
                <Text style={styles.proposalLine}>{[proposal.area, proposal.city].filter(Boolean).join(", ")}</Text>
              )}
              <Button title="Review & submit request" onPress={submitProposal} />
            </View>
          ) : null
        }
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          onSubmitEditing={sendMessage}
        />
        <Button title="Send" onPress={sendMessage} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notConfigured: { padding: 20, color: colors.muted, fontSize: 13 },
  bubble: { maxWidth: "85%", padding: 10, borderRadius: 10 },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.brand },
  modelBubble: { alignSelf: "flex-start", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  userText: { color: "#fff" },
  modelText: { color: colors.foreground },
  proposal: { margin: 4, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.brand, backgroundColor: "#0f6b5c11", gap: 4 },
  proposalTitle: { fontWeight: "600" },
  proposalLine: { fontSize: 12, color: colors.foreground },
  error: { color: colors.danger, fontSize: 12, paddingHorizontal: 16 },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, color: colors.foreground },
});
