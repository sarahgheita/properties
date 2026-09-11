import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import PropertyForm from "@/components/PropertyForm";

export default async function NewPropertyPage() {
  const { user } = await getCurrentProfile();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in to post a property</h1>
        <p className="mt-2 text-[var(--muted)]">We use your phone number to verify listings before they go live.</p>
        <Link
          href="/sign-in?next=/listings/new"
          className="mt-6 inline-block rounded-md bg-[var(--brand)] px-5 py-2.5 font-medium text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Post a Property</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Fill in the details below. An agent reviews every submission before it&apos;s published.
      </p>
      <div className="mt-6">
        <PropertyForm />
      </div>
    </div>
  );
}
