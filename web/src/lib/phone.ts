// Normalizes common ways Egyptian users type their mobile number into E.164 (+20...)
// for Supabase phone auth and SMS delivery. Egyptian mobiles: 01[0125]XXXXXXXX (11 digits).
export function normalizeEgyptPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("20") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `+20${digits.slice(1)}`;
  }
  if (digits.length === 10 && /^1[0125]/.test(digits)) {
    return `+20${digits}`;
  }
  return null;
}
