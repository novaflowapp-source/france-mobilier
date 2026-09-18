export const PAYMENT_METHODS_PATH = "/cgv/moyens-de-paiement";

export type PaymentMethodSlug = "visa" | "mastercard" | "cartes-bancaires" | "apple-pay" | "google-pay";

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
    title: "Paiement Visa",
    description:
      "Comment payer une commande France Mobilier avec une carte Visa, via Stripe.",
    summary:
      "Les cartes Visa éligibles au paiement en ligne permettent de régler une commande sur France Mobilier, en euros TTC.",
    how: "Au paiement, vous êtes redirigé vers la page sécurisée de Stripe. Vous saisissez les informations de la carte Visa ou sélectionnez une carte déjà enregistrée dans un portefeuille compatible. Une authentification forte (3-D Secure) peut être demandée par votre banque.",
    availability:
      "Une carte Visa de débit ou de crédit peut être utilisée si l’émetteur autorise le paiement à distance. Le moyen apparaît sur la page de paiement lorsque Stripe le propose pour votre commande.",
    extraTerms: null,
  },
  {
    slug: "mastercard",
    name: "Mastercard",
    title: "Paiement Mastercard",
    description:
      "Comment payer une commande France Mobilier avec une carte Mastercard, via Stripe.",
    summary:
      "Les cartes Mastercard éligibles au paiement en ligne permettent de régler une commande sur France Mobilier, en euros TTC.",
    how: "Au paiement, vous êtes redirigé vers la page sécurisée de Stripe. Vous saisissez les informations de la carte Mastercard ou sélectionnez une carte déjà enregistrée dans un portefeuille compatible. Une authentification forte (3-D Secure) peut être demandée par votre banque.",
    availability:
      "Une carte Mastercard de débit ou de crédit peut être utilisée si l’émetteur autorise le paiement à distance. Le moyen apparaît sur la page de paiement lorsque Stripe le propose pour votre commande.",
    extraTerms: null,
  },
  {
    slug: "cartes-bancaires",
    name: "Cartes Bancaires",
    title: "Paiement Cartes Bancaires (CB)",
    description:
      "Comment payer une commande France Mobilier avec une carte Bancaire (CB), via Stripe.",
    summary:
      "Le schéma Cartes Bancaires (CB) est le réseau interbancaire français. Beaucoup de cartes émises en France sont co-badgées CB et Visa ou Mastercard.",
    how: "Au paiement, vous êtes redirigé vers la page sécurisée de Stripe. Une carte CB éligible au paiement en ligne se règle comme une carte bancaire habituelle. Une authentification forte (3-D Secure) peut être demandée par votre banque.",
    availability:
      "Le paiement CB est proposé lorsque Stripe le rend disponible pour votre carte et votre appareil. Une carte uniquement utilisable en magasin, ou dont l’émetteur refuse le paiement à distance, ne pourra pas aboutir.",
    extraTerms: null,
  },
  {
    slug: "apple-pay",
    name: "Apple Pay",
    title: "Paiement Apple Pay",
    description:
      "Comment payer une commande France Mobilier avec Apple Pay, via Stripe.",
    summary:
      "Apple Pay est un portefeuille de paiement d’Apple. Il permet de régler sans resaisir le numéro de carte, à partir d’un appareil Apple compatible.",
    how: "Au paiement, si Apple Pay est disponible, le bouton correspondant s’affiche sur la page Stripe. Vous confirmez avec Face ID, Touch ID ou le code de l’appareil. Le paiement utilise un numéro de carte tokenisé, et non le numéro imprimé sur la carte.",
    availability:
      "Apple Pay n’apparaît que sur un appareil et un navigateur compatibles, avec une carte enregistrée dans Wallet. Sur un autre appareil, un autre moyen (carte Visa, Mastercard ou CB, ou Google Pay) reste proposé lorsqu’il est disponible.",
    extraTerms: "Apple Pay est un service fourni par Apple. Les conditions d’Apple s’appliquent en plus des présentes CGV.",
  },
  {
    slug: "google-pay",
    name: "Google Pay",
    title: "Paiement Google Pay",
    description:
      "Comment payer une commande France Mobilier avec Google Pay, via Stripe.",
    summary:
      "Google Pay est un portefeuille de paiement de Google. Il permet de régler sans resaisir le numéro de carte, à partir d’un compte Google et d’un appareil compatible.",
    how: "Au paiement, si Google Pay est disponible, le bouton correspondant s’affiche sur la page Stripe. Vous confirmez le paiement dans Google Pay. Le paiement utilise un numéro de carte tokenisé, et non le numéro imprimé sur la carte.",
    availability:
      "Google Pay n’apparaît que lorsqu’un compte Google, un appareil et un navigateur compatibles sont détectés, avec un moyen de paiement enregistré. Sinon, un autre moyen (carte Visa, Mastercard ou CB, ou Apple Pay) reste proposé lorsqu’il est disponible.",
    extraTerms: "Google Pay est un service fourni par Google. Les conditions de Google s’appliquent en plus des présentes CGV.",
  },
];

export function paymentMethodHref(slug: PaymentMethodSlug) {
  return `${PAYMENT_METHODS_PATH}/${slug}`;
}

export function getPaymentMethod(slug: string) {
  return paymentMethods.find((method) => method.slug === slug);
}
