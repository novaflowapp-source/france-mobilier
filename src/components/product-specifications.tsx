import { specificationRows } from "@/lib/products/presentation";
import type { Product } from "@/lib/types/commerce";

export function ProductSpecifications({ product }: { product: Product }) {
  const rows = specificationRows(product);
  if (rows.length === 0) return null;

  return (
    <section className="section section-cream">
      <div className="container-page">
        <h2 className="display text-3xl text-navy">Specifications</h2>
        <div className="mt-8 max-w-3xl overflow-x-auto rounded-[var(--radius)] bg-cream/60">
          <table className="w-full min-w-[280px] text-left text-sm">
            <tbody>
              {rows.map(([key, value]) => (
                <tr key={key} className="border-b border-border last:border-0">
                  <th className="w-2/5 px-4 py-3.5 font-medium text-navy">{key}</th>
                  <td className="px-4 py-3.5 text-muted">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
