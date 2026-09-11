import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import RequestForm from "@/components/RequestForm";

export default async function NewRequestPage() {
  const { user } = await getCurrentProfile();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in to post a request</h1>
        <p className="mt-2 text-[var(--muted)]">We&apos;ll notify you when we find a match.</p>
        <Link
          href="/sign-in?next=/requests/new"
          className="mt-6 inline-block rounded-md bg-[var(--brand)] px-5 py-2.5 font-medium text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">What are you looking for?</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Tell us what you need and we&apos;ll help match you with a property, or reach out when one
        becomes available.
      </p>
      <div className="mt-6">
        <RequestForm />
      </div>
    </div>
  );
}
