import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/products/repository";
import { indexableMetadata } from "@/lib/seo";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export const metadata: Metadata = indexableMetadata("/nouveautes", {
  title: "Nouveautés",
  description: "Nouveautés — mobilier et rangement.",
});

export default function NewArrivalsPage() {
  const products = listProducts()
    .filter((product) => product.availabilityStatus === "available")
    .slice(0, 8);
  return (
    <div className="container-page py-10 md:py-14">
      <p className="eyebrow">Catalogue</p>
      <h1 className="display mt-3 text-3xl text-navy md:text-4xl">Nouveautés</h1>
      <p className="mt-3 text-muted">
        Les derniers ajouts au catalogue. Prix TTC. {SHIPPING_OFFERED_SENTENCE}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Link href="/collections/meubles" className="btn btn-secondary mt-10 inline-flex w-full sm:w-auto">
        Voir toutes les collections
      </Link>
    </div>
  );
}
