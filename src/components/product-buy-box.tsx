"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductTrustBar } from "@/components/product-trust-bar";
import { ProQuoteActions } from "@/components/pro-quote-actions";
import { store } from "@/config/store";
import { productHeroImage } from "@/lib/products/presentation";
import { variantLineName } from "@/lib/products/repository";
import type { Product, ProductVariant } from "@/lib/types/commerce";

function GoToCartButton() {
  return (
    <Link href="/panier" className="product-go-to-cart btn btn-secondary min-h-12 w-full text-base">
      Aller au panier
    </Link>
  );
}

function GoToCartSlot({
  visible,
  emerging,
  gapClassName,
}: {
  visible: boolean;
  emerging: boolean;
  gapClassName: string;
}) {
  if (!visible) return null;
  return (
    <div className={`product-go-to-cart-emerge${emerging ? " is-emerging" : ""}`}>
      <div className={`product-go-to-cart-emerge-inner ${gapClassName}`}>
        <GoToCartButton />
      </div>
    </div>
  );
}

export function ProductBuyBox({
  product,
  variant,
}: {
  product: Product;
  variant?: ProductVariant;
}) {
  const { addItem, itemCount, ready } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartLinkEmerging, setCartLinkEmerging] = useState(false);
  const price = variant?.price ?? product.price;
  const image = variant?.image ?? productHeroImage(product);
  const name = variant ? variantLineName(product, variant) : product.name;
  const cartLinkVisible = ready && itemCount > 0;

  function add() {
    if (itemCount === 0) setCartLinkEmerging(true);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name,
        price,
        image,
        variantId: variant?.id,
      },
      quantity,
    );
    setAdded(true);
  }

  return (
    <>
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-sm text-muted">
          Quantité
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="input max-w-24"
          />
        </label>
        <div className="product-add-to-cart-stack">
          <button type="button" className="btn btn-primary min-h-12 w-full text-base" onClick={add}>
            {added ? "Ajouté au panier" : "Ajouter au panier"}
          </button>
          <GoToCartSlot visible={cartLinkVisible} emerging={cartLinkEmerging} gapClassName="pt-4" />
        </div>
        <ProQuoteActions product={product} variant={variant} quantity={quantity} />
        <ProductTrustBar />
        <p className="text-xs text-muted">
          Une question ? {store.supportEmail} — {store.supportHoursShort}.
        </p>
      </div>
      <div className="product-add-to-cart-stack fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-3 pt-3 backdrop-blur md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" className="btn btn-primary min-h-12 w-full" onClick={add}>
          {added ? "Ajouté au panier" : "Ajouter au panier"}
        </button>
        <GoToCartSlot visible={cartLinkVisible} emerging={cartLinkEmerging} gapClassName="pt-2" />
      </div>
    </>
  );
}
