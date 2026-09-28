export const SHIPPING_COUNTRIES = [{ code: "US", name: "United States" }] as const;

export type ShippingCountryCode = (typeof SHIPPING_COUNTRIES)[number]["code"];

export const SHIPPING_COUNTRY_CODES = SHIPPING_COUNTRIES.map((country) => country.code) as [
  ShippingCountryCode,
  ...ShippingCountryCode[],
];

/** 48 contiguous states and the District of Columbia. */
export const SHIPPING_ZONE_LABEL = "the contiguous United States";

export const SHIPPING_OFFERED_SENTENCE = `Free shipping to ${SHIPPING_ZONE_LABEL}.`;

export function isShippingCountry(value: string): value is ShippingCountryCode {
  return SHIPPING_COUNTRIES.some((country) => country.code === value);
}

export function shippingCountryName(code: string) {
  return SHIPPING_COUNTRIES.find((country) => country.code === code)?.name ?? code;
}

/** Reject U.S. territories, Alaska, Hawaii, and military ZIPs — furniture is not shipped there. */
function isContiguousUsZip(five: string) {
  const n3 = Number(five.slice(0, 3));
  if (!Number.isInteger(n3)) return false;
  if (n3 >= 6 && n3 <= 9) return false;
  if (n3 >= 90 && n3 <= 99) return false;
  if (n3 === 340) return false;
  if (n3 >= 962 && n3 <= 969) return false;
  if (n3 >= 995 && n3 <= 999) return false;
  return true;
}

export function normalizeShippingPostal(country: ShippingCountryCode, raw: string): string | null {
  if (country !== "US") return null;
  const compact = raw.replace(/\s+/g, "").toUpperCase();
  const match = compact.match(/^(\d{5})(?:-?\d{4})?$/);
  if (!match) return null;
  const five = match[1];
  if (!isContiguousUsZip(five)) return null;
  return five;
}

export function shippingFieldHints(_country: ShippingCountryCode) {
  return { postal: "10001", phone: "(212) 555-0100" };
}
