import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import { API_BASE_URL } from "../lib/site";
import TextField from "../components/TextField";
import Button from "../components/Button";

export default function SignInScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp" | "forgotPassword">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    if (mode === "forgotPassword") {
      // The reset link opens in a browser and lands on the web app (no deep-link setup needed
      // here) — the user sets their new password there, then comes back and signs in here.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        API_BASE_URL ? { redirectTo: `${API_BASE_URL}/reset-password` } : undefined,
      );
      setLoading(false);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setResetSent(true);
      return;
    }

    if (mode === "signIn") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.back();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      // Confirmation links open in a browser and land on the web app, so no deep-link setup
      // is needed here. Falls back gracefully if the web app isn't deployed yet.
      options: API_BASE_URL ? { emailRedirectTo: `${API_BASE_URL}/auth/confirm` } : undefined,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.back();
      return;
    }

    setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Check your email for a confirmation link, then come back to sign in.</Text>
      </View>
    );
  }

  if (resetSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>Check your email for a password reset link. Open it, set a new password, then come back here to sign in.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "signIn" ? "Sign in" : mode === "signUp" ? "Create account" : "Reset your password"}
      </Text>
      <Text style={styles.subtitle}>
        {mode === "signIn"
          ? "Sign in with your email and password."
          : mode === "signUp"
            ? "Create an account to post a property or a request."
            : "Enter your email and we'll send you a link to reset it."}
      </Text>

      <View style={styles.form}>
        <TextField label="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        {mode !== "forgotPassword" && (
          <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        )}
        {mode === "signIn" && (
          <Button title="Forgot password?" variant="outline" onPress={() => setMode("forgotPassword")} />
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title={mode === "signIn" ? "Sign in" : mode === "signUp" ? "Create account" : "Send reset link"}
          onPress={handleSubmit}
          loading={loading}
        />
        {mode === "forgotPassword" ? (
          <Button title="Back to sign in" variant="outline" onPress={() => setMode("signIn")} />
        ) : (
          <Button
            title={mode === "signIn" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            variant="outline"
            onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: "700", color: colors.foreground },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 20 },
  form: { gap: 14 },
  error: { color: colors.danger, fontSize: 13 },
});
