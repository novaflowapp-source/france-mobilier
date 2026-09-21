import type { ShippingCountryCode } from "@/lib/shipping-zone";

function compactPhone(raw: string) {
  return raw.trim().replace(/[.\s\-()/]/g, "");
}

/** Stable key so 06 12 34 56 78 and +33 6 12 34 56 78 count as the same person. */
export function phoneIdentityKey(raw: string): string {
  const digits = compactPhone(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0033")) return `33-${stripLeadingZero(digits.slice(4)).slice(-9)}`;
  if (digits.startsWith("33") && digits.length >= 11) return `33-${digits.slice(-9)}`;
  if (digits.startsWith("0032")) return `32-${stripLeadingZero(digits.slice(4)).slice(-8)}`;
  if (digits.startsWith("32") && digits.length >= 10) return `32-${digits.slice(-9)}`;
  if (digits.startsWith("0041")) return `41-${stripLeadingZero(digits.slice(4)).slice(-9)}`;
  if (digits.startsWith("41") && digits.length >= 11) return `41-${digits.slice(-9)}`;
  if (digits.startsWith("00352")) return `352-${digits.slice(-8)}`;
  if (digits.startsWith("352") && digits.length >= 11) return `352-${digits.slice(-8)}`;
  if (digits.startsWith("00377")) return `377-${digits.slice(-8)}`;
  if (digits.startsWith("377") && digits.length >= 11) return `377-${digits.slice(-8)}`;
  if (digits.length === 10 && digits.startsWith("0")) return `33-${digits.slice(-9)}`;
  if (digits.length === 9) return `33-${digits}`;
  return digits;
}

function stripLeadingZero(rest: string) {
  return rest.startsWith("0") ? rest.slice(1) : rest;
}

function spacedPhone(raw: string) {
  return raw.trim().replace(/[.\-()/]/g, " ").replace(/\s+/g, " ");
}

const CH_NATIONAL =
  /^(?:2[12467]|3[1-4]|4[134]|5[1268]|6[12]|71|81|91|7[4-9])\d{7}$/;
const LU_MOBILE = /^(?:621|628|661|668|691)\d{6}$/;
const BE_MOBILE = /^4[5-9]\d{7}$/;
const FR_NATIONAL = /^[1-9]\d{8}$/;

function parseNational(country: ShippingCountryCode, rest: string): string | null {
  const national = stripLeadingZero(rest);
  if (country === "FR") {
    return FR_NATIONAL.test(national) ? `+33${national}` : null;
  }
  if (country === "BE") {
    if (BE_MOBILE.test(national) || /^[1-9]\d{7}$/.test(national)) return `+32${national}`;
    return null;
  }
  if (country === "CH") {
    return CH_NATIONAL.test(national) ? `+41${national}` : null;
  }
  if (country === "LU") {
    if (LU_MOBILE.test(national) || /^[2-5]\d{7}$/.test(national)) return `+352${national}`;
    return null;
  }
  if (/^[1-9]\d{7}$/.test(national)) return `+377${national}`;
  if (FR_NATIONAL.test(national)) return `+33${national}`;
  return null;
}

type PrefixRule = { country: ShippingCountryCode; prefixes: string[] };

const PREFIX_RULES: PrefixRule[] = [
  { country: "LU", prefixes: ["+352", "00352", "352"] },
  { country: "MC", prefixes: ["+377", "00377", "377"] },
  { country: "BE", prefixes: ["+32", "0032"] },
  { country: "CH", prefixes: ["+41", "0041"] },
  { country: "FR", prefixes: ["+33", "0033"] },
];

function detectPrefix(compact: string): { country: ShippingCountryCode; rest: string } | null {
  for (const rule of PREFIX_RULES) {
    for (const prefix of rule.prefixes) {
      if (!compact.startsWith(prefix)) continue;
      const rest = compact.slice(prefix.length);
      if (rest.length < 8) continue;
      return { country: rule.country, rest };
    }
  }
  if (compact.startsWith("32") && compact.length >= 10) {
    return { country: "BE", rest: compact.slice(2) };
  }
  if (compact.startsWith("41") && compact.length >= 11) {
    return { country: "CH", rest: compact.slice(2) };
  }
  if (compact.startsWith("33") && compact.length >= 11) {
    return { country: "FR", rest: compact.slice(2) };
  }
  return null;
}

/**
 * Digit grouping often tells FR / BE / CH apart when the number has no +indicative.
 * 06 12 34 56 78 → France even if the parcel goes to Geneva.
 */
function hintFromFormat(raw: string, preferred: ShippingCountryCode): ShippingCountryCode | null {
  const spaced = spacedPhone(raw);
  const compact = compactPhone(raw);
  const national = stripLeadingZero(compact);

  if (/^0[1-9](?: \d{2}){4}$/.test(spaced)) {
    if (preferred === "BE" && BE_MOBILE.test(national)) return "BE";
    if (preferred === "CH" && CH_NATIONAL.test(national) && /^7[4-9]/.test(national)) return "CH";
    return "FR";
  }
  if (/^0\d{3}(?: \d{2}){3}$/.test(spaced) && BE_MOBILE.test(national)) return "BE";
  if (/^0\d{2} \d{3}(?: \d{2}){2}$/.test(spaced) && CH_NATIONAL.test(national)) return "CH";
  if (/^\d{3} \d{3} \d{3}$/.test(spaced) && LU_MOBILE.test(national)) return "LU";
  return null;
}

const FALLBACK_ORDER: ShippingCountryCode[] = ["BE", "LU", "MC", "CH", "FR"];

export function normalizeFrenchPhone(raw: string): string | null {
  return parseNational("FR", compactPhone(raw));
}

/** Destination country first, then other numbers from the shipping zone (not France-only). */
export function normalizeZonePhone(raw: string, preferred: ShippingCountryCode): string | null {
  const compact = compactPhone(raw);
  if (!compact) return null;

  const prefixed = detectPrefix(compact);
  if (prefixed) return parseNational(prefixed.country, prefixed.rest);

  const hinted = hintFromFormat(raw, preferred);
  if (hinted) {
    const parsed = parseNational(hinted, compact);
    if (parsed) return parsed;
  }

  const national = stripLeadingZero(compact);
  const swissMobile = /^7[4-9]\d{7}$/.test(national);
  if (
    preferred !== "FR" &&
    !swissMobile &&
    /^[67]\d{8}$/.test(national) &&
    !LU_MOBILE.test(national)
  ) {
    const frenchMobile = parseNational("FR", compact);
    if (frenchMobile) return frenchMobile;
  }

  const parsedPreferred = parseNational(preferred, compact);
  if (parsedPreferred) return parsedPreferred;

  for (const country of FALLBACK_ORDER) {
    if (country === preferred) continue;
    const parsed = parseNational(country, compact);
    if (parsed) return parsed;
  }
  return null;
}
