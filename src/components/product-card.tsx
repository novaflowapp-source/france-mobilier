import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types/commerce";
import { ProductPrice, isOnSale } from "@/components/product-price";
import { productHeroImage } from "@/lib/products/presentation";
import { availabilityLabel } from "@/lib/products/repository";
import { cardDeliveryLines, isLowDepth, isSellable, productCardMeta } from "@/lib/products/merchandising";

export function ProductCard({ product }: { product: Product }) {
  const badges: string[] = [];
  if (isOnSale(product) && isSellable(product)) badges.push("Promo");
  if (isLowDepth(product)) badges.push("Faible profondeur");
  if (!isSellable(product) && badges.length < 2) {
    badges.push(availabilityLabel(product.availabilityStatus));
  }
  const meta = productCardMeta(product);
  const deliveryLines = cardDeliveryLines(product);

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-[var(--radius)] bg-white">
      <Link href={`/produits/${product.slug}`} className="flex h-full min-w-0 flex-col">
        <div className="relative aspect-square overflow-hidden rounded-t-[var(--radius)] bg-cream">
          <Image
            src={productHeroImage(product)}
            alt={product.name}
            fill
            className="object-cover transition duration-500 md:group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {badges.length > 0 ? (
            <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-col gap-1">
              {badges.slice(0, 2).map((badge) => (
                <p key={badge} className="badge w-fit">
                  {badge}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-8 py-5 md:py-6">
          <h3 className="text-pretty text-sm font-medium leading-snug break-words text-navy md:text-base">
            {product.name}
          </h3>
          {meta ? (
            <p className="text-pretty text-xs leading-relaxed break-words text-muted md:text-sm">{meta}</p>
          ) : null}
          <ProductPrice product={product} />
          <p className="text-xs leading-relaxed text-muted">Livraison offerte</p>
          {deliveryLines.length > 0 ? (
            <div className="space-y-0.5">
              {deliveryLines.map((line) => (
                <p key={line} className="text-pretty text-xs leading-relaxed break-words text-muted">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
