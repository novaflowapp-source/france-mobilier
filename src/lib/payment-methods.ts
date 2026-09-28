export const PAYMENT_METHODS_PATH = "/terms/payment-methods";

export type PaymentMethodSlug = "visa" | "mastercard" | "cb" | "apple-pay" | "google-pay";

export type PaymentMethod = {
  slug: PaymentMethodSlug;
  name: string;
  title: string;
  description: string;
  summary: string;
  how: string;
  availability: string;
  extraTerms: string | null;
};

export const paymentMethods: PaymentMethod[] = [
  {
    slug: "visa",
    name: "Visa",
    title: "Pay with Visa",
    description: "How to pay for a France Mobilier order with a Visa card through Stripe.",
    summary:
      "Eligible Visa cards can be used to pay for France Mobilier orders in USD; the total is confirmed at checkout.",
    how: "At checkout you are redirected to Stripe’s secure payment page. Enter your Visa details or choose a saved card in a compatible wallet. Your bank may require strong authentication (3-D Secure).",
    availability:
      "Debit or credit Visa cards work when the issuer allows online payments. The option appears on Stripe checkout when it is available for your order and device.",
    extraTerms: null,
  },
  {
    slug: "mastercard",
    name: "Mastercard",
    title: "Pay with Mastercard",
    description: "How to pay for a France Mobilier order with a Mastercard through Stripe.",
    summary:
      "Eligible Mastercard cards can be used to pay for France Mobilier orders in USD; the total is confirmed at checkout.",
    how: "At checkout you are redirected to Stripe’s secure payment page. Enter your Mastercard details or choose a saved card in a compatible wallet. Your bank may require strong authentication (3-D Secure).",
    availability:
      "Debit or credit Mastercard cards work when the issuer allows online payments. The option appears on Stripe checkout when it is available for your order and device.",
    extraTerms: null,
  },
  {
    slug: "cb",
    name: "Cartes Bancaires",
    title: "Pay with Cartes Bancaires (CB)",
    description: "How French Cartes Bancaires (CB) cards work on France Mobilier checkout via Stripe.",
    summary:
      "Cartes Bancaires (CB) is France’s interbank card network. Many cards issued in France are co-badged CB with Visa or Mastercard and may appear at checkout when Stripe supports them.",
    how: "At checkout you are redirected to Stripe’s secure payment page. An eligible CB card is charged like any other card. Your bank may require strong authentication (3-D Secure).",
    availability:
      "CB is shown only when Stripe makes it available for your card and device. Cards that cannot be used online, or issuers that block remote payment, will not succeed.",
    extraTerms: null,
  },
  {
    slug: "apple-pay",
    name: "Apple Pay",
    title: "Pay with Apple Pay",
    description: "How to pay for a France Mobilier order with Apple Pay through Stripe.",
    summary:
      "Apple Pay lets you pay without re-entering your card number on a compatible Apple device.",
    how: "If Apple Pay is available, the button appears on Stripe checkout. Confirm with Face ID, Touch ID, or your device passcode. Payment uses a tokenized card number, not the number printed on the card.",
    availability:
      "Apple Pay appears only on supported Apple devices and browsers with a card in Wallet. Otherwise Visa, Mastercard, CB (when offered), or Google Pay may be available.",
    extraTerms:
      "Apple Pay is provided by Apple. Apple’s terms apply in addition to our store terms.",
  },
  {
    slug: "google-pay",
    name: "Google Pay",
    title: "Pay with Google Pay",
    description: "How to pay for a France Mobilier order with Google Pay through Stripe.",
    summary:
      "Google Pay lets you pay without re-entering your card number on a compatible device and Google account.",
    how: "If Google Pay is available, the button appears on Stripe checkout. Confirm the payment in Google Pay. Payment uses a tokenized card number, not the number printed on the card.",
    availability:
      "Google Pay appears when a compatible Google account, device, and browser are detected with a saved payment method. Otherwise other card or wallet options may be offered.",
    extraTerms:
      "Google Pay is provided by Google. Google’s terms apply in addition to our store terms.",
  },
];

export function paymentMethodHref(slug: PaymentMethodSlug) {
  return `${PAYMENT_METHODS_PATH}/${slug}`;
}

export function getPaymentMethod(slug: string) {
  return paymentMethods.find((method) => method.slug === slug);
}
