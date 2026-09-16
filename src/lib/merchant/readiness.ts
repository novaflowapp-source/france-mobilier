import { formatPublicAddress, getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy, getShippingPolicy, merchantFeedEnabled, merchantLaunchMode } from "@/lib/business/policies";
import {
  feedAvailability,
  getDefaultDeliveryProfile,
  getDeliveryEstimate,
  schemaAvailability,
} from "@/lib/merchant/delivery";
import { merchantOffers, offerHasStructuredShipping, offerIdentifiers, offerPurchasable } from "@/lib/merchant/offers";
import { getPublicPrice, isMerchantSaleEligible } from "@/lib/merchant/price";
import { isCheckoutEnabled, stripeMode } from "@/lib/payments/stripe";
import { productHeroImage } from "@/lib/products/presentation";
import { listProducts } from "@/lib/products/repository";
import type { Product } from "@/lib/types/commerce";

export type CheckLevel = "PASS" | "WARNING" | "BLOCKER";

export type MerchantCheck = {
  id: string;
  level: CheckLevel;
  label: string;
  detail: string;
};

function check(id: string, level: CheckLevel, label: string, detail: string): MerchantCheck {
  return { id, level, label, detail };
}

export function businessChecks(): MerchantCheck[] {
  const identity = getBusinessIdentity();
  const checks: MerchantCheck[] = [
    check("BUSINESS_NAME", "PASS", "Enseigne", identity.storeName),
    check("BUSINESS_LEGAL_NAME", "PASS", "Raison sociale", `${identity.legalName} (${identity.legalForm})`),
    check("BUSINESS_RELATIONSHIP", "PASS", "Lien enseigne / société", identity.relationship),
    check("BUSINESS_SIRET", "PASS", "Immatriculation", identity.registration),
    check("BUSINESS_EMAIL", "PASS", "E-mail", identity.email),
    identity.streetAddress
      ? check("BUSINESS_STREET_ADDRESS", "PASS", "Adresse", formatPublicAddress(identity))
      : check(
          "BUSINESS_STREET_ADDRESS_MISSING",
          "BLOCKER",
          "Adresse",
          "Rue manquante. Renseigner BUSINESS_STREET_ADDRESS (adresse légale exacte).",
        ),
    identity.phone
      ? check("BUSINESS_PHONE", "PASS", "Téléphone", identity.phone)
      : check(
          "BUSINESS_PHONE_MISSING",
          "BLOCKER",
          "Téléphone",
          "Numéro manquant. Renseigner BUSINESS_PHONE.",
        ),
    identity.vatNumber
      ? check("BUSINESS_VAT", "PASS", "TVA", identity.vatNumber)
      : check("BUSINESS_VAT", "WARNING", "TVA", "Numéro de TVA non renseigné — normal si non assujetti, à confirmer."),
  ];
  return checks;
}

export function returnChecks(): MerchantCheck[] {
  const policy = getReturnPolicy();
  return [
    check("RETURN_WINDOW", "PASS", "Délai de rétractation", `${policy.returnWindowDays} jours après réception`),
    check("RETURN_METHOD", "PASS", "Méthode", "Demande par e-mail, puis instructions de renvoi"),
    check(
      "REFUND_PROCESSING",
      "PASS",
      "Remboursement",
      `${policy.refundProcessingMinDays}–${policy.refundProcessingMaxDays} jours après réception du retour ou preuve d’expédition (délai légal)`,
    ),
    policy.returnShippingCostResponsibility
      ? check(
          "RETURN_COST",
          "PASS",
          "Frais de retour",
          policy.returnShippingCostResponsibility === "seller"
            ? "À la charge de France Mobilier"
            : "À la charge du client, sauf produit défectueux ou erreur de livraison",
        )
      : check(
          "RETURN_COST_POLICY_MISSING",
          "BLOCKER",
          "Frais de retour",
          "Renseigner RETURN_SHIPPING_PAID_BY=customer ou seller.",
        ),
    policy.returnAddress
      ? check("RETURN_ADDRESS", "PASS", "Adresse de retour", policy.returnAddress)
      : check(
          "RETURN_ADDRESS_MISSING",
          "WARNING",
          "Adresse de retour",
          "Les retours sont organisés après contact. Ajouter RETURN_ADDRESS si une adresse fixe existe.",
        ),
  ];
}

export function shippingChecks(): MerchantCheck[] {
  const shipping = getShippingPolicy();
  const profile = getDefaultDeliveryProfile();
  return [
    check("SHIPPING_ZONE", "PASS", "Zones site", shipping.zoneLabel),
    check("SHIPPING_FR_COST", "PASS", "Frais France", `${shipping.shippingCostEur.toFixed(2)} EUR`),
    check(
      "MERCHANT_COUNTRIES",
      "PASS",
      "Cible Merchant",
      `Frais 0 € et délais pour ${shipping.merchantTargetCountries.join(", ")}`,
    ),
    check(
      "HANDLING_TRANSIT_SPLIT",
      "PASS",
      "Délais structurés",
      `Préparation ${profile.handlingMinBusinessDays} j ouvrés (1 semaine), acheminement ${profile.transitMinBusinessDays} j ouvrés`,
    ),
  ];
}

export function checkoutChecks(): MerchantCheck[] {
  return [
    isCheckoutEnabled()
      ? check("CHECKOUT", "PASS", "Checkout", stripeMode() === "live" ? "Stripe live ouvert" : "Stripe test ouvert")
      : merchantLaunchMode()
        ? check(
            "CHECKOUT_DISABLED",
            "WARNING",
            "Checkout",
            "Paiement non ouvert — le flux Merchant reste publié en pré-lancement.",
          )
        : check("CHECKOUT_DISABLED", "BLOCKER", "Checkout", "Le paiement n’est pas ouvert."),
    check("GUEST_CHECKOUT", "PASS", "Compte", "Aucun compte obligatoire avant le paiement"),
    check("CHECKOUT_CURRENCY", "PASS", "Prix", "EUR TTC, livraison offerte dans la zone"),
  ];
}

export function productChecks(product: Product): MerchantCheck[] {
  const price = getPublicPrice(product);
  const delivery = getDeliveryEstimate(product);
  const identifiers = offerIdentifiers(product);
  const image = productHeroImage(product);
  const flagged = product.imageAssets?.some((asset) => asset.issues?.length);
  const checks: MerchantCheck[] = [
    product.availabilityStatus === "available"
      ? check("PURCHASABLE", "PASS", "Achat", "Disponible à la commande")
      : check("NOT_PURCHASABLE", "BLOCKER", "Achat", "Non achetable — exclu du feed"),
    price.amount > 0
      ? check("PRICE", "PASS", "Prix", `${price.amount.toFixed(2)} EUR TTC`)
      : check("PRICE_MISSING", "BLOCKER", "Prix", "Prix public manquant"),
    !isMerchantSaleEligible(product)
      ? check("SALE", "PASS", "Promotion", "Aucun prix barré publié (pas d’historique 30 jours)")
      : check("SALE_HISTORY", "WARNING", "Promotion", "Promo affichée — vérifier l’historique"),
    image
      ? check("IMAGE", "PASS", "Image", image)
      : check("IMAGE_MISSING", "BLOCKER", "Image", "Image principale manquante"),
    flagged
      ? check("IMAGE_ISSUES", "WARNING", "Qualité image", "Au moins une image a un signal fournisseur (filigrane, texte, etc.)")
      : check("IMAGE_CLEAN", "PASS", "Qualité image", "Pas de signal d’image marqué"),
    identifiers.identifierExists
      ? check(
          "IDENTIFIERS",
          identifiers.gtin || identifiers.mpn ? "PASS" : "WARNING",
          "Identifiants",
          [identifiers.brand, identifiers.gtin, identifiers.mpn].filter(Boolean).join(" · ") || "Marque seule",
        )
      : check(
          "IDENTIFIER_EXISTS_NO",
          "WARNING",
          "Identifiants",
          "identifier_exists=no — aucun GTIN/MPN/marque fabricant connu. Ne pas inventer.",
        ),
    delivery.structured
      ? check("SHIPPING_PROFILE", "PASS", "Délais", "Préparation et acheminement renseignés")
      : check(
          "HANDLING_MAX_MISSING",
          "BLOCKER",
          "Délais Merchant",
          delivery.overallMinDays
            ? `Délai global connu (${delivery.overallMinDays} j) mais handling/transit non séparés.`
            : "Aucun délai structuré.",
        ),
    delivery.madeToOrder && !delivery.customizedForCustomer
      ? check("MADE_TO_ORDER", "PASS", "Fabrication", "Fabriqué à la commande, modèle standard, retour possible")
      : check("CUSTOM", delivery.customizedForCustomer ? "WARNING" : "PASS", "Personnalisation", "Non personnalisé"),
    schemaAvailability(product) === "https://schema.org/InStock" ||
    product.availabilityStatus !== "available"
      ? check("AVAILABILITY", "PASS", "Disponibilité schema", feedAvailability(product))
      : check("AVAILABILITY_MISMATCH", "BLOCKER", "Disponibilité", "Incohérence schema / stock"),
  ];
  return checks;
}

export function productMerchantReady(product: Product) {
  return (
    offerPurchasable(merchantOffers(product)[0]) &&
    productChecks(product).every((item) => item.level !== "BLOCKER")
  );
}

export function globalMerchantReady() {
  return [...businessChecks(), ...returnChecks(), ...shippingChecks(), ...checkoutChecks()].every(
    (item) => item.level !== "BLOCKER",
  );
}

export function summarizeChecks(checks: MerchantCheck[]) {
  return {
    blockers: checks.filter((item) => item.level === "BLOCKER"),
    warnings: checks.filter((item) => item.level === "WARNING"),
    passes: checks.filter((item) => item.level === "PASS"),
    ready: checks.every((item) => item.level !== "BLOCKER"),
  };
}

export function buildMerchantReadinessReport() {
  const products = listProducts();
  const global = [...businessChecks(), ...returnChecks(), ...shippingChecks(), ...checkoutChecks()];
  const productRows = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    purchasable: product.availabilityStatus === "available",
    checks: productChecks(product),
    ready: productMerchantReady(product),
    offers: merchantOffers(product).length,
  }));
  return {
    generatedAt: new Date().toISOString(),
    launchMode: merchantLaunchMode(),
    feedEnabled: merchantFeedEnabled(),
    global,
    globalReady: globalMerchantReady(),
    products: productRows,
    merchantReadyCount: productRows.filter((row) => row.ready).length,
    sellableCount: productRows.filter((row) => row.purchasable).length,
  };
}
