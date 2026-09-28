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
    <span className="product-review-stars" aria-label={`${value} out of 5`}>
      {"★".repeat(value)}
      <span className="text-border">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function VerifiedPurchaseMark() {
  return (
    <div className="verified-purchase">
      <img
        src="/verified-purchase.png"
        className="verified-purchase-icon"
        alt=""
        aria-hidden="true"
      />
      <span>Verified purchase</span>
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#avis") return;
    window.history.replaceState(null, "", "#reviews");
    document.getElementById("reviews")?.scrollIntoView({ block: "start" });
  }, []);

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
      if (!res.ok) throw new Error(data.error || "Could not submit review");
      setMessage("Thanks — your review was sent. It will appear after moderation.");
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="reviews" className="section product-reviews border-t border-border">
      <div className="container-page">
      <div className="product-reviews-header">
        <h2 className="display text-3xl text-navy">Customer reviews</h2>
        {average !== null && (
          <p className="product-reviews-summary">
            <Stars value={Math.round(average)} />
            <span>
              {average.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5 ·{" "}
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">
          No reviews yet.
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
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
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
        <h3>Write a review</h3>
        {!session?.user ? (
          <div className="product-review-compose-copy">
            <p>Sign in to share your experience. The “Verified purchase” badge appears only after you buy this product.</p>
            <Link href="/login">Sign in →</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Display name</span>
              <input
                required
                minLength={2}
                maxLength={40}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                autoComplete="nickname"
                placeholder="First name or nickname"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Rating</span>
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
              <span className="mb-1 block text-muted">Title (optional)</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Your review</span>
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
              {loading ? "Sending…" : "Submit review"}
            </button>
          </form>
        )}
      </div>
      </div>
    </section>
  );
}
