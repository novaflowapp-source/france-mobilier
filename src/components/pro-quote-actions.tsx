"use client";

import { useEffect, useState } from "react";
import { QuoteRequestForm } from "@/components/quote-request-form";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_QUOTE_THRESHOLD_EUROS } from "@/lib/b2b";
import { formatPrice, variantLineName } from "@/lib/products/repository";
import type { Product, ProductVariant } from "@/lib/types/commerce";

export function ProQuoteActions({
  product,
  variant,
  quantity,
  cartItems,
  cartTotalEuros,
}: {
  product?: Product;
  variant?: ProductVariant;
  quantity?: number;
  cartItems?: { productId: string; quantity: number; variantId?: string }[];
  cartTotalEuros?: number;
}) {
  const { data: session } = authClient.useSession();
  const [approved, setApproved] = useState(false);
  const threshold = DEFAULT_QUOTE_THRESHOLD_EUROS;

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/pro-access")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setApproved(data?.request?.status === "approved"))
      .catch(() => {});
  }, [session?.user]);

  if (!approved) return null;

  const items = product
    ? [{ productId: product.id, variantId: variant?.id, quantity: quantity || 1 }]
    : cartItems || [];
  if (!items.length) return null;
  const catalogPrice = variant?.price ?? product?.price;

  return (
    <div className="space-y-3">
      {cartTotalEuros && cartTotalEuros >= threshold ? (
        <p className="text-sm text-navy">
          Placing a large order? Request a custom quote from France Mobilier Pro.
        </p>
      ) : (
        <p className="text-sm text-muted">Need several units? Request a quote.</p>
      )}
      <QuoteRequestForm
        source={product ? "product" : "cart"}
        items={items}
        productLabel={product ? (variant ? variantLineName(product, variant) : product.name) : undefined}
        catalogPriceLabel={catalogPrice != null ? formatPrice(catalogPrice) : undefined}
      />
    </div>
  );
}
