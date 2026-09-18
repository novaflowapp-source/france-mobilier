import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const purchase = sqliteTable("purchase", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  orderId: text("order_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const review = sqliteTable("review", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  displayName: text("display_name"),
  verifiedPurchase: integer("verified_purchase", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const stockAlert = sqliteTable("stock_alert", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  productId: text("product_id").notNull(),
  productSlug: text("product_slug").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const contactMessage = sqliteTable("contact_message", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const proAccessRequest = sqliteTable("pro_access_request", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  siren: text("siren").notNull(),
  siret: text("siret"),
  companyName: text("company_name").notNull(),
  legalName: text("legal_name").notNull(),
  city: text("city"),
  activity: text("activity"),
  vatNumber: text("vat_number"),
  message: text("message"),
  status: text("status").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  website: text("website"),
  activityOther: text("activity_other"),
  expectedOrderVolume: text("expected_order_volume"),
  billingLine1: text("billing_line1"),
  billingLine2: text("billing_line2"),
  postalCode: text("postal_code"),
  country: text("country"),
  discountType: text("discount_type"),
  discountValue: integer("discount_value"),
  approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const proQuote = sqliteTable("pro_quote", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  source: text("source").notNull(),
  companyName: text("company_name"),
  siren: text("siren"),
  contactName: text("contact_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  desiredDate: text("desired_date"),
  message: text("message"),
  amountCents: integer("amount_cents").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const proQuoteItem = sqliteTable("pro_quote_item", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id")
    .notNull()
    .references(() => proQuote.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export const proAuditLog = sqliteTable("pro_audit_log", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const shopOrder = sqliteTable("shop_order", {
  id: text("id").primaryKey(),
  stripeSessionId: text("stripe_session_id").unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  line1: text("line1").notNull(),
  postalCode: text("postal_code").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull().default("FR"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("eur"),
  status: text("status").notNull(),
  reference: text("reference"),
  viewToken: text("view_token"),
  confirmationSentAt: integer("confirmation_sent_at", { mode: "timestamp_ms" }),
  accountInviteEnc: text("account_invite_enc"),
  companyName: text("company_name"),
  siren: text("siren"),
  accountType: text("account_type"),
  handlingDays: integer("handling_days"),
  transitDays: integer("transit_days"),
  preparedAt: integer("prepared_at", { mode: "timestamp_ms" }),
  shippedAt: integer("shipped_at", { mode: "timestamp_ms" }),
  prepEmailSentAt: integer("prep_email_sent_at", { mode: "timestamp_ms" }),
  shipEmailSentAt: integer("ship_email_sent_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  paidAt: integer("paid_at", { mode: "timestamp_ms" }),
});

export const shopOrderItem = sqliteTable("shop_order_item", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => shopOrder.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export const proInvoiceSeq = sqliteTable("pro_invoice_seq", {
  year: integer("year").primaryKey(),
  lastNumber: integer("last_number").notNull(),
});

export const proInvoice = sqliteTable("pro_invoice", {
  id: text("id").primaryKey(),
  number: text("number").notNull().unique(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => shopOrder.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  companyName: text("company_name").notNull(),
  siren: text("siren"),
  vatNumber: text("vat_number"),
  billingLine1: text("billing_line1"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("eur"),
  issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const shopActivity = sqliteTable("shop_activity", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  productId: text("product_id"),
  productName: text("product_name"),
  quantity: integer("quantity"),
  amountCents: integer("amount_cents"),
  currency: text("currency").notNull().default("eur"),
  email: text("email"),
  orderId: text("order_id"),
  orderReference: text("order_reference"),
  variantId: text("variant_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
