import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { normalizeEgyptPhone } from "../lib/phone";
import { colors } from "../lib/theme";
import TextField from "../components/TextField";
import Button from "../components/Button";

export default function SignInScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setError(null);
    const phone = normalizeEgyptPhone(phoneInput);
    if (!phone) {
      setError("Enter a valid Egyptian mobile number, e.g. 010 1234 5678");
      return;
    }
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setNormalizedPhone(phone);
    setStep("otp");
  }

  async function verifyCode() {
    setError(null);
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token: code,
      type: "sms",
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        {step === "phone" ? "We'll text you a one-time code." : `Enter the code sent to ${normalizedPhone}`}
      </Text>

      {step === "phone" ? (
        <View style={styles.form}>
          <TextField
            label="Mobile number"
            keyboardType="phone-pad"
            placeholder="01X XXXX XXXX"
            value={phoneInput}
            onChangeText={setPhoneInput}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Send code" onPress={sendCode} loading={loading} />
        </View>
      ) : (
        <View style={styles.form}>
          <TextField
            label="Verification code"
            keyboardType="number-pad"
            placeholder="123456"
            value={code}
            onChangeText={setCode}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Verify & sign in" onPress={verifyCode} loading={loading} />
          <Button title="Use a different number" variant="outline" onPress={() => setStep("phone")} />
        </View>
      )}
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
