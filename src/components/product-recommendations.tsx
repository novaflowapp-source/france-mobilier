import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types/commerce";

export function ProductRecommendations({
  products,
  title = "You may also like",
}: {
  products: Product[];
  title?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="section">
      <div className="container-page">
        <h2 className="display text-3xl text-navy">{title}</h2>
        <div className="-mx-4 mt-8 flex gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
          {products.map((item) => (
            <div key={item.id} className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
