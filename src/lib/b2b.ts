import { store } from "@/config/store";

export const PRO_ACTIVITY_TYPES = [
  { value: "architecture", label: "Architecture" },
  { value: "decoration", label: "Interior design" },
  { value: "hotellerie", label: "Hospitality" },
  { value: "restauration", label: "Food & beverage" },
  { value: "immobilier", label: "Real estate" },
  { value: "commerce", label: "Retail" },
  { value: "bureaux", label: "Office / corporate" },
  { value: "collectivite", label: "Public / institutional" },
  { value: "artisan", label: "Trade / craft" },
  { value: "autre", label: "Other" },
] as const;

export const PRO_VOLUME_OPTIONS = [
  { value: "under_1000", label: "Under $1,000" },
  { value: "1000_5000", label: "$1,000 to $5,000" },
  { value: "5000_20000", label: "$5,000 to $20,000" },
  { value: "over_20000", label: "Over $20,000" },
  { value: "one_off", label: "One-off project" },
  { value: "unknown", label: "Not sure yet" },
] as const;

export type ProActivityValue = (typeof PRO_ACTIVITY_TYPES)[number]["value"];
export type ProVolumeValue = (typeof PRO_VOLUME_OPTIONS)[number]["value"];

export const DEFAULT_QUOTE_THRESHOLD_EUROS = 1000;

export function b2bConfig() {
  const thresholdRaw = Number(process.env.B2B_QUOTE_THRESHOLD || DEFAULT_QUOTE_THRESHOLD_EUROS);
  const quoteThresholdEuros = Number.isFinite(thresholdRaw) && thresholdRaw > 0 ? thresholdRaw : DEFAULT_QUOTE_THRESHOLD_EUROS;
  return {
    enabled: true,
    quotesEnabled: true,
    discountsEnabled: true,
    manualApprovalForForeign: true,
    quoteThresholdEuros,
    quoteThresholdCents: Math.round(quoteThresholdEuros * 100),
    salesEmail: process.env.PRO_SALES_EMAIL?.trim() || store.supportEmail,
  } as const;
}

export function activityLabel(value: string | null | undefined) {
  if (!value) return null;
  return PRO_ACTIVITY_TYPES.find((item) => item.value === value)?.label ?? value;
}

export function volumeLabel(value: string | null | undefined) {
  if (!value) return null;
  return PRO_VOLUME_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function isQuoteEligible(product?: { quoteEligible?: boolean }) {
  return product?.quoteEligible !== false;
}

export function isProfessionalEligible(product?: { professionalEligible?: boolean }) {
  return product?.professionalEligible !== false;
}

/** Apply an admin-set discount to unit prices. Never trust a client-sent rate. */
export function applyServerDiscount<T extends { unitPriceCents: number; quantity: number }>(
  lines: T[],
  discount: { type: "percentage" | "fixed" | null; value: number | null } | null | undefined,
): { lines: T[]; amountCents: number; discountCents: number } {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  if (!discount?.type || !discount.value || discount.value <= 0 || subtotal <= 0) {
    return { lines, amountCents: subtotal, discountCents: 0 };
  }
  let discountCents = 0;
  if (discount.type === "percentage") {
    const pct = Math.min(90, Math.max(0, discount.value));
    discountCents = Math.round(subtotal * (pct / 100));
  } else {
    discountCents = Math.min(subtotal - lines.length, Math.max(0, Math.round(discount.value)));
  }
  if (discountCents <= 0) return { lines, amountCents: subtotal, discountCents: 0 };
  const factor = (subtotal - discountCents) / subtotal;
  const discounted = lines.map((line, index) => {
    if (index < lines.length - 1) {
      return { ...line, unitPriceCents: Math.max(1, Math.round(line.unitPriceCents * factor)) };
    }
    const previous = lines.slice(0, -1).reduce((sum, item) => {
      const cents = Math.max(1, Math.round(item.unitPriceCents * factor));
      return sum + cents * item.quantity;
    }, 0);
    const remaining = subtotal - discountCents - previous;
    return {
      ...line,
      unitPriceCents: Math.max(1, Math.round(remaining / line.quantity)),
    };
  });
  const amountCents = discounted.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  return {
    lines: discounted,
    amountCents,
    discountCents: Math.max(0, subtotal - amountCents),
  };
}
