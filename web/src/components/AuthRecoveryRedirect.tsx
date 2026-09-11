"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Supabase's password-recovery email link is supposed to land on /reset-password, but if that
// exact URL isn't in the project's Redirect URLs allow list, Supabase silently falls back to the
// Site URL (the homepage) instead — while still attaching the session tokens. The Supabase client
// auto-detects those tokens and signs the user in wherever the browser happens to land, which
// looks like "the reset link just signed me in" instead of showing the reset form. Catch that
// here, on every page, and send the user to /reset-password regardless of where they landed.
export default function AuthRecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/reset-password") return;

    const hash = window.location.hash;
    const isRecoveryHash = hash.includes("type=recovery");
    const isRecoveryQuery = new URLSearchParams(window.location.search).get("type") === "recovery";

    if (isRecoveryHash || isRecoveryQuery) {
      router.replace(`/reset-password${window.location.search}${hash}`);
    }
  }, [pathname, router]);

  return null;
}
