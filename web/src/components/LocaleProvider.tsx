"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { dir, getDictionary, interpolate, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

interface LocaleState {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  interpolate: typeof interpolate;
}

const LocaleContext = createContext<LocaleState | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleState>(
    () => ({ locale, dir: dir[locale], t: getDictionary(locale), interpolate }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
