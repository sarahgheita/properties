import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import SignOutButton from "@/components/SignOutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function NavBar({ locale }: { locale: Locale }) {
  const { user, profile } = await getCurrentProfile();
  const t = getDictionary(locale);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
          {t.common.siteName}
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/listings" className="hover:text-[var(--brand)]">
            {t.nav.browse}
          </Link>
          <Link href="/requests" className="hover:text-[var(--brand)]">
            {t.nav.lookingFor}
          </Link>
          <Link href="/listings/new" className="hover:text-[var(--brand)]">
            {t.nav.postProperty}
          </Link>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 font-medium text-white hover:opacity-90"
            >
              {t.nav.admin}
            </Link>
          )}

          {user ? (
            <SignOutButton label={t.nav.signOut} />
          ) : (
            <Link
              href="/sign-in"
              className="rounded-md bg-[var(--brand)] px-3 py-1.5 font-medium text-white hover:opacity-90"
            >
              {t.nav.signIn}
            </Link>
          )}

          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
