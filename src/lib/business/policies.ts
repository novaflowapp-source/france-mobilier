import { formatStreetPostalCity, getBusinessIdentity } from "@/lib/business/identity";
import { SHIPPING_COUNTRIES, SHIPPING_COUNTRY_CODES, SHIPPING_ZONE_LABEL } from "@/lib/shipping-zone";

export type ReturnShippingPayer = "customer" | "seller";

function envValue(name: string) {
  return process.env[name]?.trim() || "";
}

function returnShippingPayer(): ReturnShippingPayer | null {
  const raw = envValue("RETURN_SHIPPING_PAID_BY").toLowerCase();
  if (raw === "customer" || raw === "buyer") return "customer";
  if (raw === "seller" || raw === "merchant") return "seller";
  return null;
}

/** Legal and already-published commercial rules only. Missing fields stay null. */
export function getReturnPolicy() {
  const identity = getBusinessIdentity();
  const address = envValue("RETURN_ADDRESS") || formatStreetPostalCity(identity);
  return {
    returnWindowDays: 14,
    buyerRemorseAccepted: true,
    defectiveProductsAccepted: true,
    legalConformityYears: null as number | null,
    returnMethod: "after_contact" as const,
    returnShippingCostResponsibility: returnShippingPayer(),
    restockingFee: null as number | null,
    refundProcessingMinDays: 1,
    refundProcessingMaxDays: 14,
    refundAfter: "return_received_or_proof" as const,
    returnAddress: address || null,
    contactEmail: identity.email,
  };
}

export function getShippingPolicy() {
  return {
    countries: SHIPPING_COUNTRIES,
    zoneLabel: SHIPPING_ZONE_LABEL,
    freeShipping: true,
    shippingCostUsd: 0,
    trackingAfterShipment: true,
    merchantTargetCountries: SHIPPING_COUNTRY_CODES,
    excludesOverseasFrance: false,
    excludesAlaskaHawaiiTerritories: true,
  };
}

export function merchantLaunchMode() {
  return process.env.MERCHANT_LAUNCH_MODE !== "false";
}

export function merchantFeedEnabled() {
  return process.env.GOOGLE_MERCHANT_FEED_ENABLED === "true";
}
