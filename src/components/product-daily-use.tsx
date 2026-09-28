import type { ProductDailyUse } from "@/lib/types/commerce";

export function ProductDailyUse({ items }: { items: ProductDailyUse[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section section-cream">
      <div className="container-page">
        <h2 className="display text-3xl text-navy">Built for everyday life</h2>
        <div className="prose-narrow mt-8 grid gap-8">
          {items.map((item) => (
            <div key={item.title}>
              <h3 className="font-medium text-navy">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
