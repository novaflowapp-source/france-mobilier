import { store } from "@/config/store";
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
    check("BUSINESS_NAME", "PASS", "Store name", identity.storeName),
    check("BUSINESS_LEGAL_NAME", "PASS", "Legal name", `${identity.legalName} (${identity.legalForm})`),
    check("BUSINESS_RELATIONSHIP", "PASS", "Store / company link", identity.relationship),
    check("BUSINESS_SIRET", "PASS", "Registration", identity.registration),
    check("BUSINESS_EMAIL", "PASS", "Email", identity.email),
    identity.streetAddress
      ? check("BUSINESS_STREET_ADDRESS", "PASS", "Address", formatPublicAddress(identity))
      : check(
          "BUSINESS_STREET_ADDRESS_MISSING",
          "BLOCKER",
          "Address",
          "Street missing. Set BUSINESS_STREET_ADDRESS (exact legal address).",
        ),
    identity.phone
      ? check("BUSINESS_PHONE", "PASS", "Phone", identity.phone)
      : check(
          "BUSINESS_PHONE_MISSING",
          "BLOCKER",
          "Phone",
          "Number missing. Set BUSINESS_PHONE.",
        ),
    identity.vatNumber
      ? check("BUSINESS_VAT", "PASS", "VAT", identity.vatNumber)
      : check("BUSINESS_VAT", "WARNING", "VAT", "VAT number not set — OK if not registered; confirm."),
  ];
  return checks;
}

export function returnChecks(): MerchantCheck[] {
  const policy = getReturnPolicy();
  return [
    check("RETURN_WINDOW", "PASS", "Return window", `${policy.returnWindowDays} days after delivery`),
    check("RETURN_METHOD", "PASS", "Method", "Request by email, then return instructions"),
    check(
      "REFUND_PROCESSING",
      "PASS",
      "Refunds",
      `${policy.refundProcessingMinDays}–${policy.refundProcessingMaxDays} days after we receive the return or proof of shipment`,
    ),
    policy.returnShippingCostResponsibility
      ? check(
          "RETURN_COST",
          "PASS",
          "Return shipping",
          policy.returnShippingCostResponsibility === "seller"
            ? "Paid by France Mobilier"
            : "Paid by customer except defective items or delivery errors",
        )
      : check(
          "RETURN_COST_POLICY_MISSING",
          "BLOCKER",
          "Return shipping",
          "Set RETURN_SHIPPING_PAID_BY=customer or seller.",
        ),
    policy.returnAddress
      ? check("RETURN_ADDRESS", "PASS", "Return address", policy.returnAddress)
      : check(
          "RETURN_ADDRESS_MISSING",
          "WARNING",
          "Return address",
          "Returns are arranged after contact. Add RETURN_ADDRESS if a fixed address exists.",
        ),
  ];
}

export function shippingChecks(): MerchantCheck[] {
  const shipping = getShippingPolicy();
  const profile = getDefaultDeliveryProfile();
  return [
    check("SHIPPING_ZONE", "PASS", "Site zones", shipping.zoneLabel),
    check("SHIPPING_FR_COST", "PASS", "Shipping cost", `${shipping.shippingCostUsd.toFixed(2)} ${store.currency}`),
    check(
      "MERCHANT_COUNTRIES",
      "PASS",
      "Merchant target",
      `$0 shipping and lead times for ${shipping.merchantTargetCountries.join(", ")}`,
    ),
    check(
      "HANDLING_TRANSIT_SPLIT",
      "PASS",
      "Structured lead times",
      `Handling ${profile.handlingMinBusinessDays} business days (~1 week), transit ${profile.transitMinBusinessDays} business days`,
    ),
  ];
}

export function checkoutChecks(): MerchantCheck[] {
  return [
    isCheckoutEnabled()
      ? check("CHECKOUT", "PASS", "Checkout", stripeMode() === "live" ? "Stripe live enabled" : "Stripe test enabled")
      : merchantLaunchMode()
        ? check(
            "CHECKOUT_DISABLED",
            "WARNING",
            "Checkout",
            "Checkout closed — Merchant feed may still publish in pre-launch mode.",
          )
        : check("CHECKOUT_DISABLED", "BLOCKER", "Checkout", "Checkout is not open."),
    check("GUEST_CHECKOUT", "PASS", "Account", "No account required before payment"),
    check("CHECKOUT_CURRENCY", "PASS", "Pricing", `${store.currency}, free shipping in zone`),
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
      ? check("PURCHASABLE", "PASS", "Purchase", "Available to order")
      : check("NOT_PURCHASABLE", "BLOCKER", "Purchase", "Not purchasable — excluded from feed"),
    price.amount > 0
      ? check("PRICE", "PASS", "Price", `${price.amount.toFixed(2)} ${store.currency}`)
      : check("PRICE_MISSING", "BLOCKER", "Price", "Public price missing"),
    !isMerchantSaleEligible(product)
      ? check("SALE", "PASS", "Promotion", "No strikethrough price (no 30-day history)")
      : check("SALE_HISTORY", "WARNING", "Promotion", "Sale shown — verify price history"),
    image
      ? check("IMAGE", "PASS", "Image", image)
      : check("IMAGE_MISSING", "BLOCKER", "Image", "Primary image missing"),
    flagged
      ? check("IMAGE_ISSUES", "WARNING", "Image quality", "At least one image has a supplier flag (watermark, text, etc.)")
      : check("IMAGE_CLEAN", "PASS", "Image quality", "No flagged image issues"),
    identifiers.identifierExists
      ? check(
          "IDENTIFIERS",
          identifiers.gtin || identifiers.mpn ? "PASS" : "WARNING",
          "Identifiers",
          [identifiers.brand, identifiers.gtin, identifiers.mpn].filter(Boolean).join(" · ") || "Brand only",
        )
      : check(
          "IDENTIFIER_EXISTS_NO",
          "WARNING",
          "Identifiers",
          "identifier_exists=no — no known GTIN/MPN/manufacturer brand. Do not invent.",
        ),
    delivery.structured
      ? check("SHIPPING_PROFILE", "PASS", "Lead times", "Handling and transit set")
      : check(
          "HANDLING_MAX_MISSING",
          "BLOCKER",
          "Merchant lead times",
          delivery.overallMinDays
            ? `Overall lead time known (${delivery.overallMinDays} d) but handling/transit not split.`
            : "No structured lead times.",
        ),
    delivery.madeToOrder && !delivery.customizedForCustomer
      ? check("MADE_TO_ORDER", "PASS", "Production", "Made to order, standard model, returnable")
      : check("CUSTOM", delivery.customizedForCustomer ? "WARNING" : "PASS", "Customization", "Not customized"),
    schemaAvailability(product) === "https://schema.org/InStock" ||
    product.availabilityStatus !== "available"
      ? check("AVAILABILITY", "PASS", "Schema availability", feedAvailability(product))
      : check("AVAILABILITY_MISMATCH", "BLOCKER", "Availability", "Schema / stock mismatch"),
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
