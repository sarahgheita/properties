"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeEgyptPhone } from "@/lib/phone";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const phone = normalizeEgyptPhone(phoneInput);
    if (!phone) {
      setError("Enter a valid Egyptian mobile number, e.g. 010 1234 5678");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setNormalizedPhone(phone);
    setStep("otp");
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
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

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {step === "phone"
          ? "We'll text you a one-time code."
          : `Enter the code sent to ${normalizedPhone}`}
      </p>

      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Mobile number</label>
            <input
              type="tel"
              inputMode="tel"
              autoFocus
              placeholder="01X XXXX XXXX"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--brand)] py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2 tracking-widest"
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--brand)] py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Use a different number
          </button>
        </form>
      )}
    </div>
  );
}
