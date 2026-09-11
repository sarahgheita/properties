"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/LocaleProvider";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function establishSession() {
      // Supabase's hosted verify link normally hands off a session via the URL hash, which the
      // client library auto-detects on load. Some project configurations instead send a
      // token_hash + type query pair, which requires an explicit verifyOtp() call — handle both
      // rather than assuming one.
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      if (tokenHash && type) {
        await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(!!user);
      setChecking(false);
    }

    establishSession();
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t.resetPassword.mismatch);
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  if (checking) return null;

  if (!hasSession) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t.resetPassword.title}</h1>
        <p className="mt-4 text-sm text-[var(--danger)]">{t.resetPassword.invalidLink}</p>
        <Link href="/sign-in" className="mt-6 inline-block rounded-md bg-[var(--brand)] px-5 py-2.5 font-medium text-white">
          {t.resetPassword.requestNewLink}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{t.resetPassword.title}</h1>
        <p className="mt-4 text-sm text-[var(--brand)]">{t.resetPassword.success}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">{t.resetPassword.title}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{t.resetPassword.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">{t.resetPassword.newPassword}</label>
          <input
            type="password"
            required
            minLength={6}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">{t.resetPassword.confirmPassword}</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-[var(--brand)] py-2 font-medium text-white disabled:opacity-60"
        >
          {submitting ? t.resetPassword.submitting : t.resetPassword.submit}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
