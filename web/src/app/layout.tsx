import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ChatWidget from "@/components/chat/ChatWidget";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getServerLocale } from "@/lib/i18n/locale";
import { dir, getDictionary } from "@/lib/i18n/dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const t = getDictionary(locale);
  return {
    title: t.common.siteName,
    description: t.common.tagline,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dir[locale]}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale}>
          <NavBar locale={locale} />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted)]">
            {t.common.siteName} — {t.footer.note}
          </footer>
          <ChatWidget />
        </LocaleProvider>
      </body>
    </html>
  );
}
