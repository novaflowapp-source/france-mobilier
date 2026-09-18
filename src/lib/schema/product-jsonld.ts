import { store } from "@/config/store";
import { getBusinessIdentity } from "@/lib/business/identity";
import { getReturnPolicy, getShippingPolicy } from "@/lib/business/policies";
import { getDeliveryEstimate, schemaAvailability } from "@/lib/merchant/delivery";
import { getPublicPrice } from "@/lib/merchant/price";
import { canonicalUrl, publicOrigin } from "@/lib/seo";
import type { PublicReview } from "@/lib/reviews";
import type { Product } from "@/lib/types/commerce";

function imageUrl(src: string) {
  return src.startsWith("http") ? src : `${publicOrigin()}${src}`;
}

function merchantReturnPolicy() {
  const policy = getReturnPolicy();
  const shipping = getShippingPolicy();
  const returnFees =
    policy.returnShippingCostResponsibility === "seller"
      ? "https://schema.org/FreeReturn"
      : policy.returnShippingCostResponsibility === "customer"
        ? "https://schema.org/ReturnFeesCustomerResponsibility"
        : undefined;
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: [...shipping.merchantTargetCountries],
    returnPolicyCountry: "FR",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: policy.returnWindowDays,
    returnMethod: "https://schema.org/ReturnByMail",
    ...(returnFees ? { returnFees } : {}),
    url: canonicalUrl("/retours"),
    merchantReturnLink: canonicalUrl("/retours"),
  };
}

function shippingDetails(product: Product) {
  const shipping = getShippingPolicy();
  const delivery = getDeliveryEstimate(product);
  const handlingMin = delivery.handlingMinBusinessDays;
  const handlingMax = delivery.handlingMaxBusinessDays ?? handlingMin;
  const transitMin = delivery.transitMinBusinessDays;
  const transitMax = delivery.transitMaxBusinessDays ?? transitMin;
  const deliveryTime =
    handlingMin != null && transitMin != null
      ? {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: handlingMin,
            maxValue: handlingMax,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: transitMin,
            maxValue: transitMax,
            unitCode: "DAY",
          },
        }
      : undefined;
  return shipping.merchantTargetCountries.map((country) => ({
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: shipping.shippingCostEur.toFixed(2),
      currency: store.currency,
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: country,
    },
    ...(deliveryTime ? { deliveryTime } : {}),
  }));
}

function offerShared(product: Product) {
  const identity = getBusinessIdentity();
  return {
    url: canonicalUrl(`/produits/${product.slug}`),
    priceCurrency: store.currency,
    availability: schemaAvailability(product),
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: identity.storeName,
      url: publicOrigin(),
    },
    hasMerchantReturnPolicy: merchantReturnPolicy(),
    shippingDetails: shippingDetails(product),
  };
}

function reviewJsonLd(reviews: PublicReview[]) {
  if (reviews.length === 0) return {};
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: average.toFixed(1),
      reviewCount: reviews.length,
      ratingCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.map((item) => ({
      "@type": "Review",
      author: { "@type": "Person", name: item.authorName },
      datePublished: item.createdAt,
      ...(item.title ? { name: item.title } : {}),
      reviewBody: item.body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: item.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

export function productJsonLd(
  product: Product,
  images: string[],
  reviews: PublicReview[],
) {
  const variants = product.variants ?? [];
  const prices = (variants.length ? variants : [null]).map((variant) => getPublicPrice(product, variant));
  const lowPrice = Math.min(...prices.map((row) => row.amount));
  const highPrice = Math.max(...prices.map((row) => row.amount));
  const brandName = product.brand?.trim() || store.storeName;
  const shared = offerShared(product);
  const offers =
    variants.length > 1
      ? {
          "@type": "AggregateOffer",
          ...shared,
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          offerCount: variants.length,
        }
      : {
          "@type": "Offer",
          ...shared,
          price: getPublicPrice(product).amount.toFixed(2),
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.alternateNames?.length ? { alternateName: product.alternateNames } : {}),
    description: product.description,
    sku: product.id,
    url: canonicalUrl(`/produits/${product.slug}`),
    image: images.map(imageUrl),
    brand: { "@type": "Brand", name: brandName },
    ...(product.gtin ? { gtin: product.gtin } : {}),
    ...(product.mpn ? { mpn: product.mpn } : {}),
    offers,
    ...reviewJsonLd(reviews),
  };
}
