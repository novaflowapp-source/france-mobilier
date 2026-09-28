import type { Product, ProductVariant } from "@/lib/types/commerce";

export type PublicPrice = {
  amount: number;
  currency: "USD";
  compareAt: number | null;
  saleEligible: boolean;
};

/** No 30-day price history exists yet — never annotate a sale. */
export function isMerchantSaleEligible(
  _product: Product,
  _variant?: ProductVariant | null,
): boolean {
  return false;
}

export function getPublicPrice(product: Product, variant?: ProductVariant | null): PublicPrice {
  const amount = variant?.price ?? product.price;
  const compare = variant?.compareAtPrice ?? product.compareAtPrice ?? null;
  const saleEligible = isMerchantSaleEligible(product, variant) && compare != null && compare > amount;
  return {
    amount,
    currency: "USD",
    compareAt: saleEligible ? compare : null,
    saleEligible,
  };
}

export function formatFeedPrice(amount: number) {
  return `${amount.toFixed(2)} USD`;
}
