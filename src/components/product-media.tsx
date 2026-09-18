"use client";

import { useCallback, useMemo, useState } from "react";
import { ProductGallery } from "@/components/product-gallery";
import { ProductInfo } from "@/components/product-info";
import { findProductVariant, uniqueVariantColors } from "@/lib/products/repository";
import type { Product } from "@/lib/types/commerce";

export function ProductMedia({
  product,
  images,
  initialVariantId,
  ratingAverage,
  ratingCount,
}: {
  product: Product;
  images: string[];
  initialVariantId?: string;
  ratingAverage?: number;
  ratingCount?: number;
}) {
  const variants = product.variants ?? [];
  const initial =
    (initialVariantId && variants.some((variant) => variant.id === initialVariantId)
      ? initialVariantId
      : undefined) ??
    product.defaultVariantId ??
    variants[0]?.id;
  const [variantId, setVariantId] = useState(initial);
  const [index, setIndex] = useState(0);
  const variant = findProductVariant(product, variantId);

  const autoplayIndexes = useMemo(() => {
    const otherColorImages = new Set(
      uniqueVariantColors(product)
        .filter((option) => option.color !== variant?.color)
        .flatMap((option) => (option.image ? [option.image] : [])),
    );
    const related = images
      .map((src, imageIndex) => (otherColorImages.has(src) ? -1 : imageIndex))
      .filter((imageIndex) => imageIndex >= 0);
    return related.length > 0 ? related : images.map((_, imageIndex) => imageIndex);
  }, [images, product, variant?.color]);

  const handleVariantIdChange = useCallback(
    (nextId: string) => {
      setVariantId(nextId);
      const url = new URL(window.location.href);
      url.searchParams.set("variant", nextId);
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
      const next = findProductVariant(product, nextId);
      if (!next?.image) return;
      const imageIndex = images.indexOf(next.image);
      if (imageIndex >= 0) setIndex(imageIndex);
    },
    [images, product],
  );

  const handleIndexChange = useCallback(
    (nextIndex: number) => {
      setIndex(nextIndex);
      const src = images[nextIndex];
      if (!src) return;
      const colorMatch = uniqueVariantColors(product).find((option) => option.image === src);
      if (!colorMatch || colorMatch.color === variant?.color) return;
      const next =
        variants.find((row) => row.color === colorMatch.color && row.sizeCm === variant?.sizeCm) ??
        variants.find((row) => row.color === colorMatch.color);
      if (next) setVariantId(next.id);
    },
    [images, product, variant?.color, variant?.sizeCm, variants],
  );

  return (
    <div className="grid min-w-0 gap-10 md:grid-cols-2 md:gap-14">
      <div className="min-w-0 max-w-full">
        <ProductGallery
          images={images}
          name={product.name}
          index={index}
          onIndexChange={handleIndexChange}
          autoplayIndexes={autoplayIndexes}
        />
      </div>
      <div className="min-w-0">
        <ProductInfo
          product={product}
          variantId={variantId}
          onVariantIdChange={handleVariantIdChange}
          ratingAverage={ratingAverage}
          ratingCount={ratingCount}
        />
      </div>
    </div>
  );
}
