import type { Product } from "@/lib/types/commerce";

export type DeliveryEstimate = {
  handlingMinBusinessDays: number | null;
  handlingMaxBusinessDays: number | null;
  transitMinBusinessDays: number | null;
  transitMaxBusinessDays: number | null;
  overallMinDays: number | null;
  overallMaxDays: number | null;
  madeToOrder: boolean;
  customizedForCustomer: boolean;
  returnEligible: boolean;
  structured: boolean;
};

function envInt(name: string) {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

/** Shop policy: 1 working week to prepare, then 7 business days in transit. */
export function getDefaultDeliveryProfile() {
  const handlingMin = envInt("HANDLING_MIN_BUSINESS_DAYS") ?? 5;
  const transitMin = envInt("TRANSIT_MIN_BUSINESS_DAYS") ?? 7;
  return {
    handlingMinBusinessDays: handlingMin,
    handlingMaxBusinessDays: envInt("HANDLING_MAX_BUSINESS_DAYS") ?? handlingMin,
    transitMinBusinessDays: transitMin,
    transitMaxBusinessDays: envInt("TRANSIT_MAX_BUSINESS_DAYS") ?? transitMin,
  };
}

function usesShopDeliveryProfile(product: Product) {
  return (
    product.availabilityStatus === "available" ||
    product.handlingMinBusinessDays != null ||
    product.transitMinBusinessDays != null
  );
}

export function getDeliveryEstimate(product: Product): DeliveryEstimate {
  const defaults = getDefaultDeliveryProfile();
  const applyDefaults = usesShopDeliveryProfile(product);
  const handlingMin = product.handlingMinBusinessDays ?? (applyDefaults ? defaults.handlingMinBusinessDays : null);
  const handlingMax = product.handlingMaxBusinessDays ?? handlingMin;
  const transitMin = product.transitMinBusinessDays ?? (applyDefaults ? defaults.transitMinBusinessDays : null);
  const transitMax = product.transitMaxBusinessDays ?? transitMin;
  const structured = handlingMin != null && transitMin != null;
  const overallMin = structured ? handlingMin + transitMin : product.shippingMinDays;
  const overallMax =
    structured && handlingMax != null && transitMax != null
      ? handlingMax + transitMax
      : product.shippingMaxDays;
  return {
    handlingMinBusinessDays: handlingMin,
    handlingMaxBusinessDays: handlingMax,
    transitMinBusinessDays: transitMin,
    transitMaxBusinessDays: transitMax,
    overallMinDays: overallMin,
    overallMaxDays: overallMax,
    madeToOrder: Boolean(product.madeToOrder),
    customizedForCustomer: Boolean(product.customizedForCustomer),
    returnEligible: product.customizedForCustomer ? false : product.returnEligible !== false,
    structured,
  };
}

function businessDaysPhrase(min: number, max: number | null) {
  if (max != null && max > min) return `${min}–${max} business days`;
  if (min === 5) return "1 week (5 business days)";
  return `${min} business days`;
}

export function deliveryCustomerLabel(product: Product): string | null {
  const estimate = getDeliveryEstimate(product);
  if (estimate.structured && estimate.handlingMinBusinessDays != null && estimate.transitMinBusinessDays != null) {
    const prep = businessDaysPhrase(estimate.handlingMinBusinessDays, estimate.handlingMaxBusinessDays);
    const transit = businessDaysPhrase(estimate.transitMinBusinessDays, estimate.transitMaxBusinessDays);
    return `preparation ${prep}, transit ${transit}`;
  }
  const min = estimate.overallMinDays;
  if (!min) return null;
  const max = estimate.overallMaxDays;
  if (max && max > min) return `${min}–${max} days after you order`;
  return `from ${min} days after you order`;
}

export function schemaAvailability(product: Product) {
  return product.availabilityStatus === "available"
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export function feedAvailability(product: Product) {
  return product.availabilityStatus === "available" ? "in_stock" : "out_of_stock";
}
