export function ProductHighlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section">
      <div className="container-page">
        <h2 className="display text-3xl text-navy">Why you’ll love it</h2>
        <ul className="prose-narrow mt-8 grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="border-l-2 border-navy pl-4 text-[0.95rem] leading-relaxed text-navy">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
