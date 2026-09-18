import { and, desc, eq, sql } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import { purchase, review, user } from "@/lib/db/schema";
import { findProductById } from "@/lib/products/repository";

export type ReviewStatus = "pending" | "approved" | "archived";

export type PublicReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

export async function listApprovedReviews(productId: string): Promise<PublicReview[]> {
  await ensureDatabase();
  const rows = await db
    .select({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      authorName: user.name,
      createdAt: review.createdAt,
      verifiedPurchase: review.verifiedPurchase,
    })
    .from(review)
    .innerJoin(user, eq(review.userId, user.id))
    .where(and(eq(review.productId, productId), eq(review.status, "approved")))
    .orderBy(desc(review.createdAt));

  return rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    authorName: row.authorName,
    createdAt: new Date(row.createdAt as Date).toISOString(),
    verifiedPurchase: Boolean(row.verifiedPurchase),
  }));
}

export async function userHasVerifiedPurchase(userId: string, productId: string) {
  await ensureDatabase();
  const rows = await db
    .select({ id: purchase.id })
    .from(purchase)
    .where(and(eq(purchase.userId, userId), eq(purchase.productId, productId)))
    .limit(1);
  return rows.length > 0;
}

export async function createReview(input: {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  body: string;
}) {
  await ensureDatabase();
  const verified = await userHasVerifiedPurchase(input.userId, input.productId);
  // Temporary: unverified reviews are accepted, still pending until Hugo approves them.
  if (!verified && process.env.ALLOW_UNVERIFIED_REVIEWS === "false") {
    throw new Error("AVIS_ACHAT_REQUIS");
  }

  const existing = await db
    .select({ id: review.id, status: review.status })
    .from(review)
    .where(and(eq(review.userId, input.userId), eq(review.productId, input.productId)));
  if (existing.some((row) => row.status === "pending")) {
    throw new Error("AVIS_EN_ATTENTE");
  }
  if (existing.some((row) => row.status === "approved")) {
    throw new Error("AVIS_DEJA_PUBLIE");
  }

  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(review).values({
    id,
    productId: input.productId,
    userId: input.userId,
    rating: input.rating,
    title: input.title?.trim() || null,
    body: input.body.trim(),
    verifiedPurchase: verified,
    status: "pending",
    createdAt: now,
  });
  return id;
}

export type ModerationReview = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string | null;
  authorName: string;
  authorEmail: string;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  createdAt: string;
};

export async function listModerationReviews(): Promise<ModerationReview[]> {
  await ensureDatabase();
  const rows = await db
    .select({
      id: review.id,
      productId: review.productId,
      rating: review.rating,
      title: review.title,
      body: review.body,
      status: review.status,
      verifiedPurchase: review.verifiedPurchase,
      createdAt: review.createdAt,
      authorName: user.name,
      authorEmail: user.email,
    })
    .from(review)
    .innerJoin(user, eq(review.userId, user.id))
    .orderBy(desc(review.createdAt));

  return rows.map((row) => {
    const product = findProductById(row.productId);
    return {
      id: row.id,
      productId: row.productId,
      productName: product?.name ?? row.productId,
      productSlug: product?.slug ?? null,
      authorName: row.authorName,
      authorEmail: row.authorEmail,
      rating: row.rating,
      title: row.title,
      body: row.body,
      status: row.status as ReviewStatus,
      verifiedPurchase: Boolean(row.verifiedPurchase),
      createdAt: new Date(row.createdAt as Date).toISOString(),
    };
  });
}

export async function countPendingReviews() {
  await ensureDatabase();
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(review)
    .where(eq(review.status, "pending"));
  return Number(rows[0]?.count ?? 0);
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
  await ensureDatabase();
  await db
    .update(review)
    .set(status === "approved" ? { status, verifiedPurchase: true } : { status })
    .where(eq(review.id, id));
}
