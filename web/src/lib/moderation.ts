// Lightweight, deterministic first pass that flags likely attempts to leak contact info or
// route around the agent inside listing/request text. This never blocks a submission — it only
// surfaces a flag so the admin reviews it first. Final judgment always stays with the admin.

const PATTERNS: { reason: string; pattern: RegExp }[] = [
  { reason: "possible phone number", pattern: /(\+?\d[\d\-\s()]{7,}\d)/ },
  { reason: "possible phone number", pattern: /\b01[0125]\d{8}\b/ },
  { reason: "email address", pattern: /[\w.+-]+@[\w-]+\.[a-z]{2,}/i },
  { reason: "WhatsApp link/mention", pattern: /wa\.me\/|whats\s*app/i },
  { reason: "Telegram mention", pattern: /\bt\.me\/|telegram/i },
  { reason: "social media handle/link", pattern: /\b(facebook\.com|instagram\.com|fb\.com|@[a-z0-9_]{4,})\b/i },
  { reason: "explicit request to bypass agent", pattern: /\bno\s+agents?\b|\bdirect(ly)?\s+(call|contact)\b|\bskip\s+the\s+agent\b/i },
  { reason: "asks buyer to contact directly", pattern: /\bcall\s+me\b|\btext\s+me\b|\bcontact\s+me\s+(on|at)\b/i },
];

export function scanForContactLeak(...texts: (string | null | undefined)[]): string[] {
  const combined = texts.filter(Boolean).join("\n");
  const reasons = new Set<string>();

  for (const { reason, pattern } of PATTERNS) {
    if (pattern.test(combined)) {
      reasons.add(reason);
    }
  }

  return Array.from(reasons);
}
