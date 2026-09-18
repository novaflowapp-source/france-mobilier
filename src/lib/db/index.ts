import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";

function isNextProductionBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function ensureFileDatabaseDir(url: string) {
  const match = url.match(/^file:(?:\/\/)?(.+)$/);
  if (!match) return;
  const filePath = match[1].split("?")[0];
  if (!filePath || filePath === ":memory:") return;
  const dir = path.dirname(filePath);
  if (dir && dir !== "." && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resolveDatabaseUrl() {
  // Next prerenders many pages in parallel workers. A shared file DB deadlocks
  // (`SQLITE_BUSY`) during `next build`; an in-memory DB keeps workers isolated.
  if (isNextProductionBuild()) return ":memory:";
  const url = process.env.DATABASE_URL?.trim()
    ? process.env.DATABASE_URL.trim()
    : `file:${path.join(process.cwd(), "data", "maisonora.db")}`;
  ensureFileDatabaseDir(url);
  return url;
}

const globalForDb = globalThis as unknown as {
  libsql?: Client;
  libsqlUrl?: string;
};

function getClient() {
  if (!globalForDb.libsql) {
    const url = resolveDatabaseUrl();
    globalForDb.libsqlUrl = url;
    globalForDb.libsql = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return globalForDb.libsql;
}

export const db = drizzle(getClient(), { schema });

let migrated = false;
let migrating: Promise<void> | null = null;

function isDuplicateColumnError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /duplicate column name/i.test(message);
}

function isBusyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /SQLITE_BUSY|database is locked|SQLITE_CANTOPEN|Unable to open connection/i.test(message);
}

async function withBusyRetry<T>(fn: () => Promise<T>, attempts = 8): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isBusyError(error) || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 40 * 2 ** attempt));
    }
  }
  throw lastError;
}

async function migrateDatabase() {
  const client = getClient();
  await withBusyRetry(() => client.execute("PRAGMA busy_timeout = 15000"));
  if (!globalForDb.libsqlUrl?.includes(":memory:")) {
    await withBusyRetry(() => client.execute("PRAGMA journal_mode = WAL"));
  }
  await withBusyRetry(() => client.batch(
    [
      `CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY NOT NULL,
        expires_at INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY NOT NULL,
        account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at INTEGER,
        refresh_token_expires_at INTEGER,
        scope TEXT,
        password TEXT,
        issuer TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY NOT NULL,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS purchase (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        order_id TEXT,
        created_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS review (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        title TEXT,
        body TEXT NOT NULL,
        display_name TEXT,
        verified_purchase INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_review_product ON review(product_id, status)`,
      `CREATE INDEX IF NOT EXISTS idx_purchase_user_product ON purchase(user_id, product_id)`,
      `CREATE TABLE IF NOT EXISTS stock_alert (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_slug TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_alert_email_product ON stock_alert(email, product_id)`,
      `CREATE TABLE IF NOT EXISTS contact_message (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS pro_access_request (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
        siren TEXT NOT NULL,
        siret TEXT,
        company_name TEXT NOT NULL,
        legal_name TEXT NOT NULL,
        city TEXT,
        activity TEXT,
        vat_number TEXT,
        message TEXT,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS shop_order (
        id TEXT PRIMARY KEY NOT NULL,
        stripe_session_id TEXT UNIQUE,
        user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        line1 TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'FR',
        amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'eur',
        status TEXT NOT NULL,
        reference TEXT,
        view_token TEXT,
        confirmation_sent_at INTEGER,
        account_invite_enc TEXT,
        created_at INTEGER NOT NULL,
        paid_at INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS shop_order_item (
        id TEXT PRIMARY KEY NOT NULL,
        order_id TEXT NOT NULL REFERENCES shop_order(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_cents INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_shop_order_email ON shop_order(email)`,
      `CREATE TABLE IF NOT EXISTS pro_quote (
        id TEXT PRIMARY KEY NOT NULL,
        reference TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        source TEXT NOT NULL,
        company_name TEXT,
        siren TEXT,
        contact_name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        desired_date TEXT,
        message TEXT,
        amount_cents INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS pro_quote_item (
        id TEXT PRIMARY KEY NOT NULL,
        quote_id TEXT NOT NULL REFERENCES pro_quote(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price_cents INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS pro_invoice_seq (
        year INTEGER PRIMARY KEY NOT NULL,
        last_number INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS pro_invoice (
        id TEXT PRIMARY KEY NOT NULL,
        number TEXT NOT NULL UNIQUE,
        order_id TEXT NOT NULL UNIQUE REFERENCES shop_order(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
        company_name TEXT NOT NULL,
        siren TEXT,
        vat_number TEXT,
        billing_line1 TEXT,
        postal_code TEXT,
        city TEXT,
        country TEXT,
        amount_cents INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'eur',
        issued_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS pro_audit_log (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT,
        actor_email TEXT,
        action TEXT NOT NULL,
        detail TEXT,
        created_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS shop_activity (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        product_id TEXT,
        product_name TEXT,
        quantity INTEGER,
        amount_cents INTEGER,
        currency TEXT NOT NULL DEFAULT 'eur',
        email TEXT,
        order_id TEXT,
        order_reference TEXT,
        variant_id TEXT,
        created_at INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_shop_activity_created ON shop_activity(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_shop_activity_type ON shop_activity(type)`,
    ],
    "write",
  ));
  const shopOrderInfo = await client.execute("PRAGMA table_info(shop_order)");
  const shopOrderCols = new Set(shopOrderInfo.rows.map((row) => String(row.name)));
  const extras = [
    !shopOrderCols.has("reference") ? "ALTER TABLE shop_order ADD COLUMN reference TEXT" : null,
    !shopOrderCols.has("view_token") ? "ALTER TABLE shop_order ADD COLUMN view_token TEXT" : null,
    !shopOrderCols.has("confirmation_sent_at")
      ? "ALTER TABLE shop_order ADD COLUMN confirmation_sent_at INTEGER"
      : null,
    !shopOrderCols.has("account_invite_enc")
      ? "ALTER TABLE shop_order ADD COLUMN account_invite_enc TEXT"
      : null,
    !shopOrderCols.has("company_name") ? "ALTER TABLE shop_order ADD COLUMN company_name TEXT" : null,
    !shopOrderCols.has("siren") ? "ALTER TABLE shop_order ADD COLUMN siren TEXT" : null,
    !shopOrderCols.has("account_type") ? "ALTER TABLE shop_order ADD COLUMN account_type TEXT" : null,
    !shopOrderCols.has("handling_days") ? "ALTER TABLE shop_order ADD COLUMN handling_days INTEGER" : null,
    !shopOrderCols.has("transit_days") ? "ALTER TABLE shop_order ADD COLUMN transit_days INTEGER" : null,
    !shopOrderCols.has("prepared_at") ? "ALTER TABLE shop_order ADD COLUMN prepared_at INTEGER" : null,
    !shopOrderCols.has("shipped_at") ? "ALTER TABLE shop_order ADD COLUMN shipped_at INTEGER" : null,
    !shopOrderCols.has("prep_email_sent_at")
      ? "ALTER TABLE shop_order ADD COLUMN prep_email_sent_at INTEGER"
      : null,
    !shopOrderCols.has("ship_email_sent_at")
      ? "ALTER TABLE shop_order ADD COLUMN ship_email_sent_at INTEGER"
      : null,
  ].filter((sql): sql is string => Boolean(sql));
  const proInfo = await client.execute("PRAGMA table_info(pro_access_request)");
  const proCols = new Set(proInfo.rows.map((row) => String(row.name)));
  const proExtras = [
    !proCols.has("first_name") ? "ALTER TABLE pro_access_request ADD COLUMN first_name TEXT" : null,
    !proCols.has("last_name") ? "ALTER TABLE pro_access_request ADD COLUMN last_name TEXT" : null,
    !proCols.has("phone") ? "ALTER TABLE pro_access_request ADD COLUMN phone TEXT" : null,
    !proCols.has("website") ? "ALTER TABLE pro_access_request ADD COLUMN website TEXT" : null,
    !proCols.has("activity_other") ? "ALTER TABLE pro_access_request ADD COLUMN activity_other TEXT" : null,
    !proCols.has("expected_order_volume")
      ? "ALTER TABLE pro_access_request ADD COLUMN expected_order_volume TEXT"
      : null,
    !proCols.has("billing_line1") ? "ALTER TABLE pro_access_request ADD COLUMN billing_line1 TEXT" : null,
    !proCols.has("billing_line2") ? "ALTER TABLE pro_access_request ADD COLUMN billing_line2 TEXT" : null,
    !proCols.has("postal_code") ? "ALTER TABLE pro_access_request ADD COLUMN postal_code TEXT" : null,
    !proCols.has("country") ? "ALTER TABLE pro_access_request ADD COLUMN country TEXT" : null,
    !proCols.has("discount_type") ? "ALTER TABLE pro_access_request ADD COLUMN discount_type TEXT" : null,
    !proCols.has("discount_value") ? "ALTER TABLE pro_access_request ADD COLUMN discount_value INTEGER" : null,
    !proCols.has("approved_at") ? "ALTER TABLE pro_access_request ADD COLUMN approved_at INTEGER" : null,
  ].filter((sql): sql is string => Boolean(sql));
  extras.push(...proExtras);
  const accountInfo = await client.execute("PRAGMA table_info(account)");
  const accountCols = new Set(accountInfo.rows.map((row) => String(row.name)));
  if (!accountCols.has("issuer")) {
    extras.push("ALTER TABLE account ADD COLUMN issuer TEXT");
  }
  const reviewInfo = await client.execute("PRAGMA table_info(review)");
  const reviewCols = new Set(reviewInfo.rows.map((row) => String(row.name)));
  if (!reviewCols.has("display_name")) {
    extras.push("ALTER TABLE review ADD COLUMN display_name TEXT");
  }
  for (const sql of extras) {
    try {
      await withBusyRetry(() => client.execute(sql));
    } catch (error) {
      if (!isDuplicateColumnError(error)) throw error;
    }
  }
  await client.execute(
    "UPDATE account SET issuer = 'local:credential' WHERE provider_id = 'credential' AND (issuer IS NULL OR issuer = '')",
  );
  await client.execute(
    "UPDATE account SET account_id = user_id WHERE provider_id = 'credential' AND account_id != user_id",
  );
  await client.execute(`
    DELETE FROM account
    WHERE provider_id = 'credential'
      AND rowid NOT IN (
        SELECT MIN(rowid) FROM account WHERE provider_id = 'credential' GROUP BY user_id
      )
  `);
  try {
    await client.execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS account_issuer_accountId_uidx ON account (issuer, account_id)",
    );
  } catch (error) {
    console.error("[db] account unique index skipped", error);
  }
  await client.execute(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_order_reference ON shop_order(reference)",
  );
  await client.execute(
    "UPDATE pro_access_request SET status = 'approved', approved_at = COALESCE(approved_at, created_at) WHERE status = 'eligible'",
  );
  try {
    await client.execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_activity_purchase_order ON shop_activity(order_id) WHERE type = 'purchase' AND order_id IS NOT NULL",
    );
  } catch (error) {
    console.error("[db] shop_activity unique index skipped", error);
  }
  migrated = true;
}

export async function ensureDatabase() {
  if (migrated) return;
  if (!migrating) {
    migrating = migrateDatabase().catch((error) => {
      migrating = null;
      throw error;
    });
  }
  await migrating;
}

