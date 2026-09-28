import { and, count, desc, eq, gte, inArray, min, sum } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import { shopActivity } from "@/lib/db/schema";
import { eurosToCents } from "@/lib/payments/stripe";

export type ActivityType = "product_view" | "add_to_cart" | "begin_checkout" | "purchase";

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  productId: string | null;
  productName: string | null;
  quantity: number | null;
  amountCents: number | null;
  currency: string;
  email: string | null;
  orderId: string | null;
  orderReference: string | null;
  variantId: string | null;
  createdAt: Date;
};

export type ActivityCounts = {
  productViews: number;
  addToCart: number;
  beginCheckout: number;
  purchases: number;
  revenueCents: number;
};

export type ActivitySummary = ActivityCounts & {
  last24h: ActivityCounts;
  trackedSince: Date | null;
  topViewed: { productId: string | null; productName: string; views: number }[];
};

const FEED_TYPES: ActivityType[] = ["add_to_cart", "begin_checkout", "purchase"];

function parseType(value: string): ActivityType {
  if (value === "purchase") return "purchase";
  if (value === "begin_checkout") return "begin_checkout";
  if (value === "product_view") return "product_view";
  return "add_to_cart";
}

function toEvent(row: typeof shopActivity.$inferSelect): ActivityEvent {
  return {
    id: row.id,
    type: parseType(row.type),
    productId: row.productId,
    productName: row.productName,
    quantity: row.quantity,
    amountCents: row.amountCents,
    currency: row.currency,
    email: row.email,
    orderId: row.orderId,
    orderReference: row.orderReference,
    variantId: row.variantId,
    createdAt: row.createdAt,
  };
}

function emptyCounts(): ActivityCounts {
  return { productViews: 0, addToCart: 0, beginCheckout: 0, purchases: 0, revenueCents: 0 };
}

function foldCounts(
  rows: { type: string; n: number }[],
  revenueCents: number,
): ActivityCounts {
  const counts = emptyCounts();
  counts.revenueCents = revenueCents;
  for (const row of rows) {
    const n = Number(row.n) || 0;
    if (row.type === "product_view") counts.productViews += n;
    else if (row.type === "add_to_cart") counts.addToCart += n;
    else if (row.type === "begin_checkout") counts.beginCheckout += n;
    else if (row.type === "purchase") counts.purchases += n;
  }
  return counts;
}

async function countByType(since?: Date) {
  const rows = since
    ? await db
        .select({ type: shopActivity.type, n: count() })
        .from(shopActivity)
        .where(gte(shopActivity.createdAt, since))
        .groupBy(shopActivity.type)
    : await db.select({ type: shopActivity.type, n: count() }).from(shopActivity).groupBy(shopActivity.type);
  return rows.map((row) => ({ type: row.type, n: Number(row.n) || 0 }));
}

async function revenueSince(since?: Date) {
  const rows = since
    ? await db
        .select({ total: sum(shopActivity.amountCents) })
        .from(shopActivity)
        .where(and(eq(shopActivity.type, "purchase"), gte(shopActivity.createdAt, since)))
    : await db
        .select({ total: sum(shopActivity.amountCents) })
        .from(shopActivity)
        .where(eq(shopActivity.type, "purchase"));
  return Number(rows[0]?.total ?? 0) || 0;
}

export async function recordAddToCart(input: {
  productId: string;
  productName: string;
  quantity: number;
  priceEur: number;
  variantId?: string | null;
  email?: string | null;
}) {
  await ensureDatabase();
  const quantity = Math.max(1, Math.min(20, Math.floor(input.quantity) || 1));
  await db.insert(shopActivity).values({
    id: crypto.randomUUID(),
    type: "add_to_cart",
    productId: input.productId.slice(0, 80),
    productName: input.productName.trim().slice(0, 180) || "Product",
    quantity,
    amountCents: eurosToCents(input.priceEur) * quantity,
    currency: "usd",
    email: input.email?.trim().toLowerCase() || null,
    orderId: null,
    orderReference: null,
    variantId: input.variantId?.trim() || null,
    createdAt: new Date(),
  });
}

export async function recordProductView(input: {
  productId: string;
  productName: string;
  priceEur?: number;
}) {
  await ensureDatabase();
  await db.insert(shopActivity).values({
    id: crypto.randomUUID(),
    type: "product_view",
    productId: input.productId.slice(0, 80),
    productName: input.productName.trim().slice(0, 180) || "Product",
    quantity: 1,
    amountCents: input.priceEur != null ? eurosToCents(input.priceEur) : null,
    currency: "usd",
    email: null,
    orderId: null,
    orderReference: null,
    variantId: null,
    createdAt: new Date(),
  });
}

export async function recordBeginCheckout(input: {
  productName: string;
  quantity: number;
  priceEur: number;
  email?: string | null;
}) {
  await ensureDatabase();
  const quantity = Math.max(1, Math.min(200, Math.floor(input.quantity) || 1));
  await db.insert(shopActivity).values({
    id: crypto.randomUUID(),
    type: "begin_checkout",
    productId: null,
    productName: input.productName.trim().slice(0, 240) || "Cart",
    quantity,
    amountCents: eurosToCents(input.priceEur),
    currency: "usd",
    email: input.email?.trim().toLowerCase() || null,
    orderId: null,
    orderReference: null,
    variantId: null,
    createdAt: new Date(),
  });
}

export async function recordPurchase(input: {
  orderId: string;
  orderReference: string;
  email: string;
  amountCents: number;
  productName: string;
}) {
  await ensureDatabase();
  const existing = await db
    .select({ id: shopActivity.id })
    .from(shopActivity)
    .where(and(eq(shopActivity.type, "purchase"), eq(shopActivity.orderId, input.orderId)))
    .limit(1);
  if (existing.length > 0) return;
  await db.insert(shopActivity).values({
    id: crypto.randomUUID(),
    type: "purchase",
    productId: null,
    productName: input.productName.slice(0, 240),
    quantity: null,
    amountCents: input.amountCents,
    currency: "usd",
    email: input.email.trim().toLowerCase(),
    orderId: input.orderId,
    orderReference: input.orderReference,
    variantId: null,
    createdAt: new Date(),
  });
}

export async function listRecentActivity(limit = 80): Promise<ActivityEvent[]> {
  await ensureDatabase();
  const rows = await db
    .select()
    .from(shopActivity)
    .where(inArray(shopActivity.type, FEED_TYPES))
    .orderBy(desc(shopActivity.createdAt))
    .limit(Math.min(200, Math.max(1, limit)));
  return rows.map(toEvent);
}

export async function activitySummary(): Promise<ActivitySummary> {
  await ensureDatabase();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [allRows, dayRows, allRevenue, dayRevenue, firstRows, topRows] = await Promise.all([
    countByType(),
    countByType(dayAgo),
    revenueSince(),
    revenueSince(dayAgo),
    db.select({ first: min(shopActivity.createdAt) }).from(shopActivity),
    db
      .select({
        productId: shopActivity.productId,
        productName: shopActivity.productName,
        views: count(),
      })
      .from(shopActivity)
      .where(eq(shopActivity.type, "product_view"))
      .groupBy(shopActivity.productId, shopActivity.productName)
      .orderBy(desc(count()))
      .limit(8),
  ]);

  const first = firstRows[0]?.first ?? null;
  return {
    ...foldCounts(allRows, allRevenue),
    last24h: foldCounts(dayRows, dayRevenue),
    trackedSince: first instanceof Date ? first : first ? new Date(first) : null,
    topViewed: topRows.map((row) => ({
      productId: row.productId,
      productName: row.productName || "Product",
      views: Number(row.views) || 0,
    })),
  };
}
