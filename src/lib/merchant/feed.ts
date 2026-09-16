import { getBusinessIdentity } from "@/lib/business/identity";
import { getShippingPolicy, merchantFeedEnabled } from "@/lib/business/policies";
import { feedAvailability, getDeliveryEstimate } from "@/lib/merchant/delivery";
import {
  merchantOffers,
  offerIdentifiers,
  offerPublicPrice,
  type MerchantOffer,
} from "@/lib/merchant/offers";
import { formatFeedPrice } from "@/lib/merchant/price";
import { globalMerchantReady, productMerchantReady } from "@/lib/merchant/readiness";
import { googleProductCategory, merchantProductType } from "@/lib/merchant/taxonomy";
import { listProducts } from "@/lib/products/repository";
import { canonicalUrl } from "@/lib/seo";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function offerXml(offer: MerchantOffer) {
  const { product, variant } = offer;
  const price = offerPublicPrice(offer);
  const identifiers = offerIdentifiers(product);
  const delivery = getDeliveryEstimate(product);
  const shipping = getShippingPolicy();
  const titleSource = product.merchantTitleSource ?? "ai";
  const descriptionSource = product.merchantDescriptionSource ?? "ai";
  const lines = [
    `<item>`,
    `<g:id>${escapeXml(offer.id)}</g:id>`,
    `<g:item_group_id>${escapeXml(offer.itemGroupId)}</g:item_group_id>`,
    `<g:title>${escapeXml(offer.title)}</g:title>`,
    `<g:description>${escapeXml(offer.description)}</g:description>`,
    titleSource === "ai"
      ? `<g:structured_title><g:digital_source_type>trained_algorithmic_media</g:digital_source_type><g:content>${escapeXml(offer.title)}</g:content></g:structured_title>`
      : "",
    descriptionSource === "ai"
      ? `<g:structured_description><g:digital_source_type>trained_algorithmic_media</g:digital_source_type><g:content>${escapeXml(offer.description)}</g:content></g:structured_description>`
      : "",
    `<g:link>${escapeXml(offer.link)}</g:link>`,
    `<g:image_link>${escapeXml(offer.image)}</g:image_link>`,
    ...offer.additionalImages.map((src) => `<g:additional_image_link>${escapeXml(src)}</g:additional_image_link>`),
    `<g:condition>new</g:condition>`,
    `<g:availability>${feedAvailability(product)}</g:availability>`,
    `<g:price>${formatFeedPrice(price.amount)}</g:price>`,
    price.saleEligible && price.compareAt
      ? `<g:sale_price>${formatFeedPrice(price.amount)}</g:sale_price>`
      : "",
    identifiers.brand ? `<g:brand>${escapeXml(identifiers.brand)}</g:brand>` : "",
    identifiers.gtin ? `<g:gtin>${escapeXml(identifiers.gtin)}</g:gtin>` : "",
    identifiers.mpn ? `<g:mpn>${escapeXml(identifiers.mpn)}</g:mpn>` : "",
    `<g:identifier_exists>${identifiers.identifierExists ? "true" : "false"}</g:identifier_exists>`,
    `<g:product_type>${escapeXml(merchantProductType(product))}</g:product_type>`,
    `<g:google_product_category>${escapeXml(googleProductCategory(product))}</g:google_product_category>`,
    offer.color ? `<g:color>${escapeXml(offer.color)}</g:color>` : "",
    offer.size ? `<g:size>${escapeXml(offer.size)}</g:size>` : "",
    variant ? `<g:canonical_link>${escapeXml(canonicalUrl(`/produits/${product.slug}`))}</g:canonical_link>` : "",
    product.weight != null ? `<g:shipping_weight>${product.weight} kg</g:shipping_weight>` : "",
    ...shipping.merchantTargetCountries.map((country) => {
      const handling =
        delivery.structured && delivery.handlingMinBusinessDays != null
          ? `<g:min_handling_time>${delivery.handlingMinBusinessDays}</g:min_handling_time><g:max_handling_time>${delivery.handlingMaxBusinessDays}</g:max_handling_time>`
          : "";
      const transit =
        delivery.structured && delivery.transitMinBusinessDays != null
          ? `<g:min_transit_time>${delivery.transitMinBusinessDays}</g:min_transit_time><g:max_transit_time>${delivery.transitMaxBusinessDays}</g:max_transit_time>`
          : "";
      return `<g:shipping><g:country>${country}</g:country><g:price>${shipping.shippingCostEur.toFixed(2)} EUR</g:price>${handling}${transit}</g:shipping>`;
    }),
    `</item>`,
  ];
  return lines.filter(Boolean).join("");
}

export function listMerchantFeedOffers() {
  return listProducts()
    .filter((product) => product.availabilityStatus === "available")
    .filter(productMerchantReady)
    .flatMap(merchantOffers);
}

export function buildGoogleMerchantFeedXml() {
  const identity = getBusinessIdentity();
  const items = listMerchantFeedOffers();
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">`,
    `<channel>`,
    `<title>${escapeXml(identity.storeName)}</title>`,
    `<link>${escapeXml(identity.url)}</link>`,
    `<description>${escapeXml("Catalogue — produits achetables et merchant-ready")}</description>`,
    ...items.map(offerXml),
    `</channel>`,
    `</rss>`,
  ].join("");
}

export function merchantFeedStatus() {
  const ready = globalMerchantReady();
  const offers = listMerchantFeedOffers();
  return {
    enabled: merchantFeedEnabled(),
    businessReady: ready,
    offerCount: offers.length,
    blocked: !merchantFeedEnabled() || !ready || offers.length === 0,
  };
}
