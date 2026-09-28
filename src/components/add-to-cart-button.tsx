"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { productHeroImage } from "@/lib/products/presentation";
import { findProductVariant, variantLineName } from "@/lib/products/repository";
import type { Product } from "@/lib/types/commerce";

export function AddToCartButton({
  product,
  className = "btn btn-primary",
}: {
  product: Product;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const variant = findProductVariant(product, product.defaultVariantId);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: variant ? variantLineName(product, variant) : product.name,
          price: variant?.price ?? product.price,
          image: variant?.image ?? productHeroImage(product),
          variantId: variant?.id,
        });
        setAdded(true);
      }}
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
