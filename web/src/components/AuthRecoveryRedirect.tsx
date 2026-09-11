"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Supabase's password-recovery email link is supposed to land on /reset-password, but if that
// exact URL isn't in the project's Redirect URLs allow list, Supabase silently falls back to the
// Site URL (the homepage) instead — while still attaching the session tokens. The Supabase client
// auto-detects those tokens and signs the user in wherever the browser happens to land, which
// looks like "the reset link just signed me in" instead of showing the reset form. Catch that
// here, on every page, and send the user to /reset-password regardless of where they landed.
//
// Confirmed in production: this project's recovery link redirects to `/?code=<uuid>` — a bare
// PKCE `code` param with no `type=recovery` marker at all (that marker only appears on the
// implicit/hash-based flow and the token_hash+type flow, neither of which this project uses).
// This app has no other feature that produces a `code` query param on page load, so treat any
// bare `code` landing outside /reset-password as a misdirected recovery link too.
export default function AuthRecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/reset-password" || pathname === "/auth/confirm") return;

    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const isRecoveryHash = hash.includes("type=recovery");
    const isRecoveryQuery = params.get("type") === "recovery";
    const isBareCode = params.has("code");

    if (isRecoveryHash || isRecoveryQuery || isBareCode) {
      router.replace(`/reset-password${window.location.search}${hash}`);
    }
  }, [pathname, router]);

  return null;
}
