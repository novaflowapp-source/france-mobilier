export const WELCOME_PROMO = {
  code: "WELCOME",
  percent: 10,
  headline: "Code WELCOME −10%",
  shortLabel: "WELCOME −10% off your first order",
  barLabel: "Code WELCOME −10%",
  cartHint: "Code WELCOME: 10% off your entire first order, once per phone number.",
  checkoutLine: "Code WELCOME: 10% off your first order",
  checkoutHref: "/checkout?code=WELCOME",
  windowMinutes: 30,
} as const;

export function parsePromoCode(raw: string | null | undefined) {
  const code = raw?.trim().toUpperCase().replace(/\s+/g, "") || "";
  if (!code) return null;
  if (!/^[A-Z0-9]{4,20}$/.test(code)) return null;
  return code;
}

export function isWelcomePromo(code: string | null | undefined) {
  const parsed = parsePromoCode(code);
  return parsed === WELCOME_PROMO.code || parsed === "BIENVENUE";
}

export function welcomeDiscount() {
  return { type: "percentage" as const, value: WELCOME_PROMO.percent };
}
