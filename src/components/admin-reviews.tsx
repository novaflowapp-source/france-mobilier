"use client";

import { useState } from "react";
import Link from "next/link";
import type { ModerationReview, ReviewStatus } from "@/lib/reviews";

const labels: Record<ReviewStatus, string> = {
  pending: "À valider",
  approved: "En ligne",
  archived: "Archivé",
};

function ReviewCard({
  item,
  busy,
  onAction,
}: {
  item: ModerationReview;
  busy: boolean;
  onAction: (id: string, action: "approve" | "archive") => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{labels[item.status]}</p>
        <p className="text-sm text-navy">
          {"★".repeat(item.rating)}
          <span className="text-border">{"★".repeat(5 - item.rating)}</span>
        </p>
      </div>
      <p className="mt-3 text-sm leading-relaxed">
        Avis laissé par <span className="font-medium text-navy">{item.authorName}</span>
      </p>
      <blockquote className="mt-2 text-sm leading-relaxed text-muted">
        « {item.body} »
      </blockquote>
      {item.title ? <p className="mt-2 text-sm font-medium text-navy">{item.title}</p> : null}
      <p className="mt-3 text-xs text-muted">
        {item.productSlug ? (
          <Link href={`/produits/${item.productSlug}`} className="underline-offset-2 hover:underline">
            {item.productName}
          </Link>
        ) : (
          item.productName
        )}
        {" · "}
        {new Date(item.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        {item.verifiedPurchase ? " · Achat vérifié" : ""}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.status !== "approved" ? (
          <button
            type="button"
            disabled={busy}
            className="btn btn-primary"
            onClick={() => onAction(item.id, "approve")}
          >
            Mettre en ligne
          </button>
        ) : null}
        {item.status !== "archived" ? (
          <button
            type="button"
            disabled={busy}
            className="btn btn-secondary"
            onClick={() => onAction(item.id, "archive")}
          >
            Archiver
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function AdminReviews({ initialReviews }: { initialReviews: ModerationReview[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = reviews.filter((item) => item.status === "pending");
  const approved = reviews.filter((item) => item.status === "approved");
  const archived = reviews.filter((item) => item.status === "archived");

  async function onAction(id: string, action: "approve" | "archive") {
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action impossible");
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">Avis clients</h2>
      <p className="mt-1 text-sm text-muted">
        Chaque avis vérifié reste hors ligne jusqu’à validation. Mettez-le en ligne ou archivez-le.
      </p>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <h3 className="mt-6 text-sm font-medium text-navy">À valider ({pending.length})</h3>
      {pending.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Aucun avis en attente.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {pending.map((item) => (
            <ReviewCard key={item.id} item={item} busy={busyId === item.id} onAction={onAction} />
          ))}
        </div>
      )}

      {approved.length > 0 ? (
        <>
          <h3 className="mt-8 text-sm font-medium text-navy">En ligne ({approved.length})</h3>
          <div className="mt-3 space-y-3">
            {approved.map((item) => (
              <ReviewCard key={item.id} item={item} busy={busyId === item.id} onAction={onAction} />
            ))}
          </div>
        </>
      ) : null}

      {archived.length > 0 ? (
        <>
          <h3 className="mt-8 text-sm font-medium text-navy">Archives ({archived.length})</h3>
          <div className="mt-3 space-y-3">
            {archived.map((item) => (
              <ReviewCard key={item.id} item={item} busy={busyId === item.id} onAction={onAction} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
