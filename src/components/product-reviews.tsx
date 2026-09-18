"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
    <span className="tracking-tight text-accent" aria-label={`${value} sur 5`}>
      {"★".repeat(value)}
      <span className="text-border">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function VerifiedPurchaseMark() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-[#22a45a]">
      <Image
        src="/achat-verifie.png"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7"
        aria-hidden
      />
      Achat vérifié
    </span>
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
    <section className="section border-t border-border">
      <div className="container-page">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="display text-3xl text-navy">Avis clients vérifiés</h2>
        </div>
        {average !== null && (
          <p className="text-sm text-muted">
            <Stars value={Math.round(average)} />{" "}
            <span className="ml-1">
              {average.toFixed(1)} / 5 · {reviews.length} avis
            </span>
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">
          Aucun avis pour le moment.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-4 sm:items-center">
                <div className="min-w-0 flex-1">
                  <Stars value={item.rating} />
                  {item.title && <p className="mt-2 font-medium">{item.title}</p>}
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                  <p className="mt-3 text-xs text-muted">
                    {item.authorName} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {item.verifiedPurchase ? <VerifiedPurchaseMark /> : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-white p-5">
        <h3 className="font-medium">Laisser un avis</h3>
        {!session?.user ? (
          <p className="mt-2 text-sm text-muted">
            <Link
              href="/connexion"
              className="font-semibold text-navy underline underline-offset-4 decoration-navy/40 hover:decoration-navy"
            >
              Connectez-vous
            </Link>{" "}
            après un achat vérifié pour commenter ce produit.
          </p>
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
