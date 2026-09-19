"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

function Stars({ value }: { value: number }) {
  return (
    <span className="product-review-stars" aria-label={`${value} sur 5`}>
      {"★".repeat(value)}
      <span className="text-border">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function VerifiedPurchaseMark() {
  return (
    <div className="verified-purchase">
      <img
        src="/achat-verifie.png"
        className="verified-purchase-icon"
        alt=""
        aria-hidden="true"
      />
      <span>Achat vérifié</span>
    </div>
  );
}

export function ProductReviews({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: ReviewItem[];
}) {
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [prefilledName, setPrefilledName] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefilledName) return;
    const sessionName = session?.user?.name?.trim() || "";
    if (!sessionName) return;
    setDisplayName(sessionName);
    setPrefilledName(true);
  }, [session, prefilledName]);

  const average = useMemo(() => {
    if (reviews.length === 0) return null;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body, displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Envoi impossible");
      setMessage("Merci — votre avis a bien été envoyé. Il sera publié après validation.");
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="avis" className="section product-reviews border-t border-border">
      <div className="container-page">
      <div className="product-reviews-header">
        <h2 className="display text-3xl text-navy">Avis clients</h2>
        {average !== null && (
          <p className="product-reviews-summary">
            <Stars value={Math.round(average)} />
            <span>
              {average.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5 ·{" "}
              {reviews.length} avis
            </span>
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">
          Aucun avis pour le moment.
        </p>
      ) : (
        <ul className="product-reviews-list">
          {reviews.map((item) => (
            <li key={item.id} className="product-review-card">
              <div className="product-review-body">
                <Stars value={item.rating} />
                {item.title ? <p className="product-review-title">{item.title}</p> : null}
                <p className="product-review-text">{item.body}</p>
                <p className="product-review-meta">
                  <span className="product-review-author">{item.authorName}</span>
                  {" · "}
                  {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {item.verifiedPurchase ? (
                <>
                  <span className="product-review-divider" aria-hidden="true" />
                  <VerifiedPurchaseMark />
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="product-review-compose">
        <h3>Laisser un avis</h3>
        {!session?.user ? (
          <div className="product-review-compose-copy">
            <p>Connectez-vous pour partager votre expérience. Le badge « Achat vérifié » n’apparaît qu’après une commande de ce produit.</p>
            <Link href="/connexion">Se connecter →</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Nom affiché</span>
              <input
                required
                minLength={2}
                maxLength={40}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                autoComplete="nickname"
                placeholder="Prénom ou pseudo"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Note</span>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="input max-w-32"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Titre (optionnel)</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Votre commentaire</span>
              <textarea
                required
                minLength={10}
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="input"
              />
            </label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            {message && <p className="text-sm text-accent">{message}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto">
              {loading ? "Envoi…" : "Envoyer mon avis"}
            </button>
          </form>
        )}
      </div>
      </div>
    </section>
  );
}
