import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import RequestForm from "@/components/RequestForm";
import { getServerLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NewRequestPage() {
  const { user } = await getCurrentProfile();
  const locale = await getServerLocale();
  const t = getDictionary(locale);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">{t.newRequestPage.signInTitle}</h1>
        <p className="mt-2 text-[var(--muted)]">{t.newRequestPage.signInSubtitle}</p>
        <Link
          href="/sign-in?next=/requests/new"
          className="mt-6 inline-block rounded-md bg-[var(--brand)] px-5 py-2.5 font-medium text-white"
        >
          {t.nav.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{t.newRequestPage.title}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{t.newRequestPage.subtitle}</p>
      <div className="mt-6">
        <RequestForm />
      </div>
    </div>
  );
}
