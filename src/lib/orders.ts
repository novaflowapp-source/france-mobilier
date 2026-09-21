import { and, desc, eq, inArray } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import { purchase, shopOrder, shopOrderItem, user } from "@/lib/db/schema";
import { isMailConfigured, sendOrderPaidEmail } from "@/lib/mail";
import { applyServerDiscount } from "@/lib/b2b";
import { productHeroImage } from "@/lib/products/presentation";
import { findProductById, findProductVariant, variantLineName } from "@/lib/products/repository";
import { decryptSecret, encryptSecret, provisionCustomerAccount } from "@/lib/provision-account";
import {
  buildOrderFulfillment,
  fulfillmentCustomerLabel,
  shopDeliveryDays,
  type OrderFulfillment,
} from "@/lib/orders/fulfillment";
import {
  eurosToCents,
  getSiteUrl,
  getStripe,
  isCheckoutEnabled,
  stripeMode,
} from "@/lib/payments/stripe";

export const ORDER_ACCESS_COOKIE = "fm_order_access";

export type CheckoutLine = { productId: string; quantity: number; variantId?: string };

export type CheckoutCustomer = {
  name: string;
  email: string;
  line1: string;
  country: string;
  postalCode: string;
  city: string;
  phone: string;
  userId?: string | null;
  companyName?: string | null;
  siren?: string | null;
  accountType?: "pro" | "personal" | null;
};

export type PricedLine = {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  quantity: number;
  unitPriceCents: number;
};

type OrderRow = typeof shopOrder.$inferSelect;
type ItemRow = typeof shopOrderItem.$inferSelect;

export type PublicOrder = {
  id: string;
  reference: string;
  status: string;
  email: string;
  name: string;
  phone: string | null;
  line1: string;
  postalCode: string;
  city: string;
  country: string;
  amountCents: number;
  currency: string;
  paidAt: Date | null;
  createdAt: Date;
  confirmationSent: boolean;
  companyName: string | null;
  siren: string | null;
  accountType: string | null;
  promoCode: string | null;
  promoDiscountCents: number;
  fulfillment: OrderFulfillment;
  fulfillmentLabel: string;
  items: { name: string; quantity: number; unitPriceCents: number }[];
};

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomReference() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `FM-${Array.from(bytes, (byte) => REF_ALPHABET[byte % REF_ALPHABET.length]).join("")}`;
}

function randomToken() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("hex");
}

export function normalizePostal(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function parseOrderAccessCookie(value?: string | null) {
  if (!value) return [] as { id: string; token: string }[];
  return value.split(",").flatMap((part) => {
    const i = part.indexOf(".");
    if (i < 1) return [];
    const id = part.slice(0, i);
    const token = part.slice(i + 1);
    if (!id || !token) return [];
    return [{ id, token }];
  });
}

export function mergeOrderAccessCookie(
  current: string | undefined,
  order: { id: string; viewToken: string },
) {
  const rest = parseOrderAccessCookie(current).filter((row) => row.id !== order.id);
  return [`${order.id}.${order.viewToken}`, ...rest.map((row) => `${row.id}.${row.token}`)]
    .slice(0, 20)
    .join(",");
}

export function orderAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  };
}

function toPublic(order: OrderRow, items: ItemRow[]): PublicOrder {
  const fulfillment = buildOrderFulfillment(order);
  return {
    id: order.id,
    reference: order.reference || order.id.slice(0, 8).toUpperCase(),
    status: order.status,
    email: order.email,
    name: order.name,
    phone: order.phone,
    line1: order.line1,
    postalCode: order.postalCode,
    city: order.city,
    country: order.country,
    amountCents: order.amountCents,
    currency: order.currency,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    confirmationSent: Boolean(order.confirmationSentAt),
    companyName: order.companyName,
    siren: order.siren,
    accountType: order.accountType,
    promoCode: order.promoCode || null,
    promoDiscountCents: order.promoDiscountCents ?? 0,
    fulfillment,
    fulfillmentLabel: fulfillmentCustomerLabel(fulfillment),
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    })),
  };
}

export function priceCheckoutLines(
  items: CheckoutLine[],
  discount?: { type: "percentage" | "fixed" | null; value: number | null } | null,
) {
  if (items.length === 0) {
    throw new Error("PANIER_VIDE");
  }
  const priced: PricedLine[] = [];
  for (const item of items) {
    const quantity = Math.floor(item.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("QUANTITE_INVALIDE");
    }
    const product = findProductById(item.productId);
    if (!product) throw new Error("PRODUIT_INTROUVABLE");
    if (product.availabilityStatus !== "available") {
      throw new Error("PRODUIT_INDISPONIBLE");
    }
    const hasVariants = Boolean(product.variants?.length);
    const variant = hasVariants ? findProductVariant(product, item.variantId) : undefined;
    if (hasVariants && (!item.variantId || !variant)) {
      throw new Error("VARIANTE_INTROUVABLE");
    }
    priced.push({
      productId: product.id,
      name: variant ? variantLineName(product, variant) : product.name,
      slug: product.slug,
      image: variant?.image ?? productHeroImage(product) ?? null,
      quantity,
      unitPriceCents: eurosToCents(variant?.price ?? product.price),
    });
  }
  const applied = applyServerDiscount(priced, discount);
  if (applied.amountCents < 50) throw new Error("MONTANT_INVALIDE");
  return { lines: applied.lines, amountCents: applied.amountCents, discountCents: applied.discountCents };
}

async function uniqueReference() {
  for (let i = 0; i < 8; i += 1) {
    const reference = randomReference();
    const existing = await db
      .select({ id: shopOrder.id })
      .from(shopOrder)
      .where(eq(shopOrder.reference, reference))
      .limit(1);
    if (existing.length === 0) return reference;
  }
  return `FM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function ensureOrderAccess(order: OrderRow) {
  if (order.reference && order.viewToken) return order;
  const reference = order.reference || (await uniqueReference());
  const viewToken = order.viewToken || randomToken();
  await db.update(shopOrder).set({ reference, viewToken }).where(eq(shopOrder.id, order.id));
  return { ...order, reference, viewToken };
}

export async function createPendingOrder(input: {
  customer: CheckoutCustomer;
  lines: PricedLine[];
  amountCents: number;
  promoCode?: string | null;
  promoDiscountCents?: number;
}) {
  await ensureDatabase();
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(shopOrder).values({
    id,
    stripeSessionId: null,
    userId: input.customer.userId || null,
    email: input.customer.email.trim().toLowerCase(),
    name: input.customer.name.trim(),
    phone: input.customer.phone.trim(),
    line1: input.customer.line1.trim(),
    postalCode: input.customer.postalCode.trim(),
    city: input.customer.city.trim(),
    country: input.customer.country,
    amountCents: input.amountCents,
    currency: "eur",
    status: "pending",
    reference: await uniqueReference(),
    viewToken: randomToken(),
    confirmationSentAt: null,
    companyName: input.customer.companyName?.trim() || null,
    siren: input.customer.siren?.trim() || null,
    accountType: input.customer.accountType || null,
    promoCode: input.promoCode || null,
    promoDiscountCents: input.promoDiscountCents ?? 0,
    createdAt: now,
    paidAt: null,
  });
  await db.insert(shopOrderItem).values(
    input.lines.map((line) => ({
      id: crypto.randomUUID(),
      orderId: id,
      productId: line.productId,
      name: line.name,
      quantity: line.quantity,
      unitPriceCents: line.unitPriceCents,
    })),
  );
  return id;
}

export async function attachStripeSession(orderId: string, stripeSessionId: string) {
  await ensureDatabase();
  await db.update(shopOrder).set({ stripeSessionId }).where(eq(shopOrder.id, orderId));
}

async function linkPurchases(orderId: string) {
  const rows = await db.select().from(shopOrder).where(eq(shopOrder.id, orderId)).limit(1);
  const order = rows[0];
  if (!order || order.status !== "paid") return;
  let userId = order.userId;
  if (!userId) {
    const matched = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, order.email))
      .limit(1);
    userId = matched[0]?.id ?? null;
    if (userId) {
      await db.update(shopOrder).set({ userId }).where(eq(shopOrder.id, orderId));
    }
  }
  if (!userId) return;
  const items = await db.select().from(shopOrderItem).where(eq(shopOrderItem.orderId, orderId));
  const now = new Date();
  for (const item of items) {
    const already = await db
      .select({ id: purchase.id })
      .from(purchase)
      .where(
        and(
          eq(purchase.userId, userId),
          eq(purchase.productId, item.productId),
          eq(purchase.orderId, orderId),
        ),
      )
      .limit(1);
    if (already.length > 0) continue;
    await db.insert(purchase).values({
      id: crypto.randomUUID(),
      userId,
      productId: item.productId,
      orderId,
      createdAt: now,
    });
  }
}

async function sendOrderConfirmationIfNeeded(orderId: string, temporaryPassword?: string | null) {
  const full = await getOrderById(orderId);
  if (!full || full.status !== "paid") return;
  if (full.confirmationSentAt) return;
  if (!isMailConfigured()) return;
  const withAccess = await ensureOrderAccess(full);
  const password = temporaryPassword || decryptSecret(withAccess.accountInviteEnc);
  try {
    const sent = await sendOrderPaidEmail({
      email: withAccess.email,
      name: withAccess.name,
      reference: withAccess.reference || withAccess.id.slice(0, 8).toUpperCase(),
      amountCents: withAccess.amountCents,
      phone: withAccess.phone,
      line1: withAccess.line1,
      postalCode: withAccess.postalCode,
      city: withAccess.city,
      country: withAccess.country,
      items: full.items,
      viewUrl: `${getSiteUrl()}/commande/${withAccess.id}?t=${withAccess.viewToken}`,
      loginUrl: `${getSiteUrl()}/connexion?next=${encodeURIComponent("/compte#mot-de-passe")}`,
      testMode: stripeMode() === "test",
      temporaryPassword: password,
      companyName: withAccess.companyName,
      siren: withAccess.siren,
      invoicesUrl:
        withAccess.accountType === "pro"
          ? `${getSiteUrl()}/compte/factures`
          : null,
    });
    if (sent) {
      await db
        .update(shopOrder)
        .set({ confirmationSentAt: new Date() })
        .where(eq(shopOrder.id, orderId));
    }
  } catch (error) {
    console.error("[mail] order confirmation failed", error);
  }
}

export async function markOrderPaid(orderId: string, stripeSessionId: string) {
  await ensureDatabase();
  const rows = await db.select().from(shopOrder).where(eq(shopOrder.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) throw new Error("COMMANDE_INTROUVABLE");

  if (order.status !== "paid") {
    const now = new Date();
    const days = shopDeliveryDays();
    await db
      .update(shopOrder)
      .set({
        status: "paid",
        stripeSessionId,
        paidAt: now,
        handlingDays: order.handlingDays ?? days.handlingBusinessDays,
        transitDays: order.transitDays ?? days.transitBusinessDays,
      })
      .where(eq(shopOrder.id, orderId));
  } else if (stripeSessionId && !order.stripeSessionId) {
    await db.update(shopOrder).set({ stripeSessionId }).where(eq(shopOrder.id, orderId));
  }

  const paid = (await db.select().from(shopOrder).where(eq(shopOrder.id, orderId)).limit(1))[0] ?? order;
  let temporaryPassword: string | null = decryptSecret(paid.accountInviteEnc);
  try {
    const provisioned = await provisionCustomerAccount({ email: paid.email, name: paid.name });
    const patch: { userId: string; accountInviteEnc?: string } = { userId: provisioned.userId };
    if (provisioned.created && provisioned.password) {
      temporaryPassword = provisioned.password;
      patch.accountInviteEnc = encryptSecret(provisioned.password);
    }
    await db.update(shopOrder).set(patch).where(eq(shopOrder.id, orderId));
    await attachOrdersToUser(provisioned.userId, paid.email);
  } catch (error) {
    console.error("[orders] account provision failed", error);
  }

  await linkPurchases(orderId);
  try {
    const { ensureProInvoiceForOrder } = await import("@/lib/invoices");
    await ensureProInvoiceForOrder(orderId);
  } catch (error) {
    console.error("[orders] invoice generation failed", error);
  }
  await sendOrderConfirmationIfNeeded(orderId, temporaryPassword);
  try {
    const { recordPurchase } = await import("@/lib/activity");
    const items = await db.select().from(shopOrderItem).where(eq(shopOrderItem.orderId, orderId));
    await recordPurchase({
      orderId,
      orderReference: paid.reference || paid.id.slice(0, 8).toUpperCase(),
      email: paid.email,
      amountCents: paid.amountCents,
      productName: items.map((item) => `${item.name} × ${item.quantity}`).join(", ") || "Commande",
    });
  } catch (error) {
    console.error("[orders] activity purchase failed", error);
  }
  const updated = await db.select().from(shopOrder).where(eq(shopOrder.id, orderId)).limit(1);
  return updated[0] ?? order;
}

export async function getOrderByStripeSession(stripeSessionId: string) {
  await ensureDatabase();
  const rows = await db
    .select()
    .from(shopOrder)
    .where(eq(shopOrder.stripeSessionId, stripeSessionId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLastDeliveryForEmail(email: string) {
  await ensureDatabase();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const rows = await db
    .select({
      name: shopOrder.name,
      email: shopOrder.email,
      phone: shopOrder.phone,
      line1: shopOrder.line1,
      postalCode: shopOrder.postalCode,
      city: shopOrder.city,
      country: shopOrder.country,
    })
    .from(shopOrder)
    .where(eq(shopOrder.email, normalized))
    .orderBy(desc(shopOrder.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getOrderById(orderId: string) {
  await ensureDatabase();
  const rows = await db.select().from(shopOrder).where(eq(shopOrder.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select().from(shopOrderItem).where(eq(shopOrderItem.orderId, orderId));
  return { ...order, items };
}

export async function attachOrdersToUser(userId: string, email: string) {
  await ensureDatabase();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  await db.update(shopOrder).set({ userId }).where(eq(shopOrder.email, normalized));
  const paid = await db
    .select({ id: shopOrder.id })
    .from(shopOrder)
    .where(and(eq(shopOrder.email, normalized), eq(shopOrder.status, "paid")));
  for (const row of paid) {
    await linkPurchases(row.id);
  }
}

export async function reconcilePendingOrders(input: { email?: string | null; orderIds?: string[] }) {
  if (!isCheckoutEnabled()) return;
  await ensureDatabase();
  const pending: OrderRow[] = [];
  if (input.email) {
    const rows = await db
      .select()
      .from(shopOrder)
      .where(and(eq(shopOrder.email, input.email.trim().toLowerCase()), eq(shopOrder.status, "pending")));
    pending.push(...rows);
  }
  if (input.orderIds && input.orderIds.length > 0) {
    const rows = await db
      .select()
      .from(shopOrder)
      .where(and(inArray(shopOrder.id, input.orderIds), eq(shopOrder.status, "pending")));
    pending.push(...rows);
  }
  const seen = new Set<string>();
  const stripe = getStripe();
  for (const order of pending) {
    if (seen.has(order.id) || !order.stripeSessionId) continue;
    seen.add(order.id);
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === "paid") {
        await markOrderPaid(order.id, session.id);
      }
    } catch (error) {
      console.error("[orders] reconcile failed", order.id, error);
    }
  }
}

function canAccessOrder(
  order: OrderRow,
  access: { token?: string | null; cookie?: string | null; userId?: string | null; email?: string | null },
) {
  if (access.token && order.viewToken && access.token === order.viewToken) return true;
  if (access.userId && order.userId === access.userId) return true;
  if (access.email && order.email === access.email.trim().toLowerCase()) return true;
  const cookieRows = parseOrderAccessCookie(access.cookie);
  return cookieRows.some((row) => row.id === order.id && row.token === order.viewToken);
}

export async function getPublicPaidOrder(orderId: string) {
  const full = await getOrderById(orderId);
  if (!full) return null;
  if (full.status !== "paid") {
    await reconcilePendingOrders({ orderIds: [full.id] });
    const again = await getOrderById(orderId);
    if (!again || again.status !== "paid") return null;
    const withAccess = await ensureOrderAccess(again);
    return toPublic(withAccess, again.items);
  }
  const withAccess = await ensureOrderAccess(full);
  return toPublic(withAccess, full.items);
}

export async function getAuthorizedOrder(
  orderId: string,
  access: { token?: string | null; cookie?: string | null; userId?: string | null; email?: string | null },
) {
  const full = await getOrderById(orderId);
  if (!full) return null;
  const withAccess = await ensureOrderAccess(full);
  if (!canAccessOrder(withAccess, access)) return null;
  if (withAccess.status !== "paid") {
    await reconcilePendingOrders({ orderIds: [withAccess.id] });
    const again = await getOrderById(orderId);
    if (!again || again.status !== "paid") return null;
    return toPublic(again, again.items);
  }
  return toPublic(withAccess, full.items);
}

export async function listOrdersForAccount(input: {
  userId?: string | null;
  email?: string | null;
  cookie?: string | null;
}) {
  await ensureDatabase();
  const cookieRows = parseOrderAccessCookie(input.cookie);
  await reconcilePendingOrders({
    email: input.email,
    orderIds: cookieRows.map((row) => row.id),
  });

  const collected = new Map<string, OrderRow>();
  if (input.userId) {
    const rows = await db.select().from(shopOrder).where(eq(shopOrder.userId, input.userId));
    for (const row of rows) collected.set(row.id, row);
  }
  if (input.email) {
    const rows = await db
      .select()
      .from(shopOrder)
      .where(eq(shopOrder.email, input.email.trim().toLowerCase()));
    for (const row of rows) collected.set(row.id, row);
  }
  if (cookieRows.length > 0) {
    const rows = await db
      .select()
      .from(shopOrder)
      .where(
        inArray(
          shopOrder.id,
          cookieRows.map((row) => row.id),
        ),
      );
    for (const row of rows) {
      const match = cookieRows.find((entry) => entry.id === row.id && entry.token === row.viewToken);
      if (match) collected.set(row.id, row);
    }
  }

  const paid = [...collected.values()]
    .filter((row) => row.status === "paid")
    .sort((a, b) => (b.paidAt?.getTime() || b.createdAt.getTime()) - (a.paidAt?.getTime() || a.createdAt.getTime()));

  const result: PublicOrder[] = [];
  for (const order of paid) {
    const withAccess = await ensureOrderAccess(order);
    const items = await db.select().from(shopOrderItem).where(eq(shopOrderItem.orderId, order.id));
    result.push(toPublic(withAccess, items));
  }
  return result;
}

export async function lookupPaidOrders(email: string, postalCode: string) {
  await ensureDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const postal = normalizePostal(postalCode);
  await reconcilePendingOrders({ email: normalizedEmail });
  const rows = await db
    .select()
    .from(shopOrder)
    .where(and(eq(shopOrder.email, normalizedEmail), eq(shopOrder.status, "paid")))
    .orderBy(desc(shopOrder.paidAt));
  const matched = rows.filter((row) => normalizePostal(row.postalCode) === postal);
  let guestAccount: { email: string; password: string } | undefined;
  const result: PublicOrder[] = [];
  for (const order of matched) {
    try {
      const provisioned = await provisionCustomerAccount({ email: order.email, name: order.name });
      const patch: { userId: string; accountInviteEnc?: string } = { userId: provisioned.userId };
      if (provisioned.created && provisioned.password) {
        patch.accountInviteEnc = encryptSecret(provisioned.password);
        guestAccount = { email: order.email, password: provisioned.password };
      }
      if (provisioned.userId !== order.userId || patch.accountInviteEnc) {
        await db.update(shopOrder).set(patch).where(eq(shopOrder.id, order.id));
        await attachOrdersToUser(provisioned.userId, order.email);
        await linkPurchases(order.id);
      }
      if (!guestAccount) {
        const existing = decryptSecret(order.accountInviteEnc);
        if (existing) guestAccount = { email: order.email, password: existing };
      }
    } catch (error) {
      console.error("[orders] lookup account provision failed", error);
    }
    const withAccess = await ensureOrderAccess(order);
    const items = await db.select().from(shopOrderItem).where(eq(shopOrderItem.orderId, order.id));
    result.push(toPublic(withAccess, items));
  }
  return { orders: result, guestAccount };
}

export async function getAccountInvitePassword(orderId: string) {
  const order = await getOrderById(orderId);
  return decryptSecret(order?.accountInviteEnc);
}

export async function clearAccountInviteSecrets(userId: string) {
  await ensureDatabase();
  if (!userId) return;
  await db.update(shopOrder).set({ accountInviteEnc: null }).where(eq(shopOrder.userId, userId));
}

export async function getOrderAccessSecrets(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const withAccess = await ensureOrderAccess(order);
  return { id: withAccess.id, viewToken: withAccess.viewToken || "" };
}

export async function isFirstPaidOrderForEmail(email: string) {
  await ensureDatabase();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const rows = await db
    .select({ id: shopOrder.id })
    .from(shopOrder)
    .where(and(eq(shopOrder.email, normalized), eq(shopOrder.status, "paid")));
  return rows.length <= 1;
}

export async function listRecentPaidOrders(limit = 40) {
  await ensureDatabase();
  const rows = await db
    .select()
    .from(shopOrder)
    .where(eq(shopOrder.status, "paid"))
    .orderBy(desc(shopOrder.paidAt))
    .limit(limit);
  const result: PublicOrder[] = [];
  for (const order of rows) {
    const items = await db.select().from(shopOrderItem).where(eq(shopOrderItem.orderId, order.id));
    result.push(toPublic(order, items));
  }
  return result;
}
