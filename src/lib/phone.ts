import type { ShippingCountryCode } from "@/lib/shipping-zone";

function compactPhone(raw: string) {
  return raw.trim().replace(/[.\s\-()/]/g, "");
}

function nanpDigits(raw: string) {
  let digits = compactPhone(raw).replace(/\D/g, "");
  if (digits.startsWith("001")) digits = digits.slice(3);
  if (digits.startsWith("1") && digits.length === 11) digits = digits.slice(1);
  return digits;
}

/** Stable key so (212) 555-0100 and +1 212 555 0100 count as the same person. */
export function phoneIdentityKey(raw: string): string {
  const digits = nanpDigits(raw);
  if (digits.length === 10) return `1-${digits}`;
  return digits;
}

const NANP = /^[2-9]\d{2}[2-9]\d{6}$/;

export function normalizeFrenchPhone(raw: string): string | null {
  return normalizeZonePhone(raw, "US");
}

/** U.S. numbers in NANP format (+1). */
export function normalizeZonePhone(raw: string, _preferred: ShippingCountryCode): string | null {
  const digits = nanpDigits(raw);
  if (digits.length === 10 && NANP.test(digits)) return `+1${digits}`;
  return null;
}
