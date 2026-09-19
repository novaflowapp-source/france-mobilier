"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { cartLineKey, formatPrice } from "@/lib/products/repository";
import { ProQuoteActions } from "@/components/pro-quote-actions";
import { SHIPPING_OFFERED_SENTENCE } from "@/lib/shipping-zone";

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal, itemCount, ready } = useCart();

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="display text-3xl text-navy md:text-4xl">Panier</h1>
      <p className="mt-2 text-muted">
        {!ready
          ? " "
          : itemCount === 0
            ? "Votre panier est vide."
            : `${itemCount} article${itemCount > 1 ? "s" : ""}.`}
      </p>

      {!ready ? (
        <div className="mt-10 min-h-48" />
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius)] bg-cream px-6 py-10">
          <h2 className="display text-2xl text-navy">Votre panier est vide</h2>
          <p className="mt-2 max-w-md text-muted">
            Découvrez nos meubles et solutions pour la maison.
          </p>
          <Link href="/collections/maison" className="btn btn-primary mt-6 inline-flex">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={cartLineKey(item.productId, item.variantId)}
                className="flex gap-3 rounded-2xl border border-border bg-card p-3 sm:gap-4 sm:p-4"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3efe8]">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Link href={`/produits/${item.slug}`} className="block font-medium break-words hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted">{formatPrice(item.price)}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <span>Qté</span>
                      <div className="flex items-center overflow-hidden rounded-lg border border-border">
                        <button
                          type="button"
                          className="flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40"
                          aria-label="Diminuer la quantité"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          aria-label="Quantité"
                          value={item.quantity}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            if (!digits) return;
                            setQuantity(item.productId, Number(digits), item.variantId);
                          }}
                          className="h-11 w-12 border-x border-border bg-transparent text-center text-foreground outline-none"
                        />
                        <button
                          type="button"
                          className="flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40"
                          aria-label="Augmenter la quantité"
                          disabled={item.quantity >= 20}
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="min-h-11 px-1 text-sm text-muted underline"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Sous-total TTC</p>
            <p className="mt-1 text-2xl font-semibold">{formatPrice(subtotal)}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {SHIPPING_OFFERED_SENTENCE}
            </p>
            <Link href="/paiement" className="btn btn-primary mt-6 w-full">
              Commander
            </Link>
            <p className="mt-3 text-center text-xs text-muted">
              Livraison offerte · Paiement sécurisé · Pas de compte obligatoire
            </p>
            <div className="mt-4">
              <ProQuoteActions
                cartItems={items.map((item) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                }))}
                cartTotalEuros={subtotal}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
