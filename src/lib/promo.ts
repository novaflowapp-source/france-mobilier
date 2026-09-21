export const WELCOME_PROMO = {
  code: "BIENVENUE",
  percent: 10,
  headline: "Code BIENVENUE −10 %",
  shortLabel: "BIENVENUE −10 % sur la 1re commande",
  barLabel: "Code BIENVENUE −10 %",
  cartHint: "Code BIENVENUE : −10 % sur toute la première commande, une fois par numéro de téléphone.",
  checkoutLine: "Code BIENVENUE : -10% sur votre première commande",
  checkoutHref: "/paiement?code=BIENVENUE",
  windowMinutes: 30,
} as const;

export function parsePromoCode(raw: string | null | undefined) {
  const code = raw?.trim().toUpperCase().replace(/\s+/g, "") || "";
  if (!code) return null;
  if (!/^[A-Z0-9]{4,20}$/.test(code)) return null;
  return code;
}

export function isWelcomePromo(code: string | null | undefined) {
  return parsePromoCode(code) === WELCOME_PROMO.code;
}

export function welcomeDiscount() {
  return { type: "percentage" as const, value: WELCOME_PROMO.percent };
}
