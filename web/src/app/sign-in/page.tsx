"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/LocaleProvider";

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
  const confirmationFailed = searchParams.get("error") === "confirmation_failed";
  const { t } = useLocale();

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signIn") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Email confirmation is disabled on this project — session is active immediately.
      router.push(next);
      router.refresh();
      return;
    }

    setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t.signIn.titleSignUp}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{t.signIn.confirmationSent}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">{mode === "signIn" ? t.signIn.titleSignIn : t.signIn.titleSignUp}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {mode === "signIn" ? t.signIn.subtitleSignIn : t.signIn.subtitleSignUp}
      </p>

      {confirmationFailed && (
        <p className="mt-4 rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {t.signIn.confirmationFailed}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">{t.signIn.email}</label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">{t.signIn.password}</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--brand)] py-2 font-medium text-white disabled:opacity-60"
        >
          {loading
            ? mode === "signIn"
              ? t.signIn.signingIn
              : t.signIn.signingUp
            : mode === "signIn"
              ? t.signIn.signInButton
              : t.signIn.signUpButton}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {mode === "signIn" ? t.signIn.noAccount : t.signIn.haveAccount}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          className="font-medium text-[var(--brand)] underline"
        >
          {mode === "signIn" ? t.signIn.switchToSignUp : t.signIn.switchToSignIn}
        </button>
      </p>
    </div>
  );
}
