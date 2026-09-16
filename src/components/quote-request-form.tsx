"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function QuoteRequestForm({
  source,
  items,
  productLabel,
  catalogPriceLabel,
}: {
  source: "product" | "cart" | "account";
  items: { productId: string; quantity: number; variantId?: string }[];
  productLabel?: string;
  catalogPriceLabel?: string;
}) {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(items[0]?.quantity || 1);
  const [desiredDate, setDesiredDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payloadItems =
        source === "product" && items[0]
          ? [{ productId: items[0].productId, variantId: items[0].variantId, quantity }]
          : items;
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, items: payloadItems, desiredDate, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demande impossible");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demande impossible");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) return null;

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary w-full" onClick={() => setOpen(true)}>
        {source === "cart" ? "Demander un devis pour ce panier" : "Demander un devis professionnel"}
      </button>
    );
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-muted">
        <Link href="/connexion?next=/professionnels" className="underline">
          Connectez-vous
        </Link>{" "}
        avec un compte professionnel activé pour demander un devis.
      </p>
    );
  }

  if (done) {
    return (
      <p className="text-sm text-navy">
        Demande envoyée. Vous la retrouvez dans{" "}
        <Link href="/compte/devis" className="underline">
          Mes devis
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border bg-white p-4">
      {productLabel ? <p className="text-sm font-medium text-navy">{productLabel}</p> : null}
      {catalogPriceLabel ? <p className="text-sm text-muted">Prix catalogue actuel : {catalogPriceLabel}</p> : null}
      {source === "product" ? (
        <label className="flex items-center gap-3 text-sm">
          Quantité souhaitée
          <input
            type="number"
            min={1}
            className="input max-w-24"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      ) : null}
      <label className="block text-sm">
        Date souhaitée <span className="text-muted">(optionnel)</span>
        <input className="input mt-1" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
      </label>
      <label className="block text-sm">
        Commentaire
        <textarea className="input mt-1" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}
