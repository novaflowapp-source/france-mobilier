"use client";

import { useId, useState } from "react";
import { productFaqItems } from "@/lib/products/presentation";
import type { Product } from "@/lib/types/commerce";

function ProductFaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="py-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 text-left font-medium text-navy"
      >
        {question}
        <span
          className={`text-lg leading-none text-muted transition-transform duration-300 ease-out ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p
            className={`mt-2 max-w-[46rem] text-sm leading-relaxed text-muted transition-opacity duration-300 ease-out ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductFAQ({ product }: { product: Product }) {
  const items = productFaqItems(product);
  if (items.length === 0) return null;

  return (
    <section className="section section-cream">
      <div className="container-page">
        <h2 className="display text-3xl text-navy">FAQ</h2>
        <div className="prose-narrow mt-8 divide-y divide-border border-y border-border">
          {items.map((item) => (
            <ProductFaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
