import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: the proxy already blocks non-admins from /admin, but Server Functions
  // aren't guaranteed to run through the proxy, so every admin entry point checks again here.
  const { user, profile } = await getCurrentProfile();
  if (!user || profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/admin" className="hover:text-[var(--brand)]">
            Pending Queue
          </Link>
          <Link href="/admin/inquiries" className="hover:text-[var(--brand)]">
            Inquiries
          </Link>
        </nav>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
