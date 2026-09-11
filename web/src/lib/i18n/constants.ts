// Split out from locale.ts so client components can import the cookie name without pulling in
// next/headers (server-only).
export const LOCALE_COOKIE = "locale";
