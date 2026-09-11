import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { SITE_NAME } from "@/lib/site";
import SignOutButton from "@/components/SignOutButton";

export default async function NavBar() {
  const { user, profile } = await getCurrentProfile();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
          {SITE_NAME}
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/listings" className="hover:text-[var(--brand)]">
            Browse Properties
          </Link>
          <Link href="/requests" className="hover:text-[var(--brand)]">
            Looking For
          </Link>
          <Link href="/listings/new" className="hover:text-[var(--brand)]">
            Post a Property
          </Link>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 font-medium text-white hover:opacity-90"
            >
              Admin
            </Link>
          )}

          {user ? (
            <SignOutButton />
          ) : (
            <Link
              href="/sign-in"
              className="rounded-md bg-[var(--brand)] px-3 py-1.5 font-medium text-white hover:opacity-90"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
