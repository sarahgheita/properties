import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import Button from "../../components/Button";

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>Sign in to post a property or a request.</Text>
        <Button title="Sign In" onPress={() => router.push("/sign-in")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>{profile?.email}</Text>

      <View style={styles.actions}>
        <Button title="Post a Property" onPress={() => router.push("/post-property")} />
        <Button title="Post a Request" variant="outline" onPress={() => router.push("/post-request")} />
        {isAdmin && <Button title="Admin Dashboard" variant="outline" onPress={() => router.push("/admin")} />}
        <Button title="Sign Out" variant="danger" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background, gap: 8 },
  title: { fontSize: 24, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 12 },
  actions: { gap: 10, marginTop: 8 },
});
