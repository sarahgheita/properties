"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_COOKIE } from "@/lib/i18n/constants";
import type { Locale } from "@/lib/i18n/dictionaries";

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLocale();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center overflow-hidden rounded-md border border-[var(--border)] text-xs font-medium">
      <button
        onClick={() => switchTo("en")}
        className={`px-2 py-1 ${locale === "en" ? "bg-[var(--brand)] text-white" : "hover:bg-[var(--background)]"}`}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("ar")}
        className={`px-2 py-1 ${locale === "ar" ? "bg-[var(--brand)] text-white" : "hover:bg-[var(--background)]"}`}
      >
        عربي
      </button>
    </div>
  );
}
