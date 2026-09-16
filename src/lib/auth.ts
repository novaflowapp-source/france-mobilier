import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, ensureDatabase } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/mail";

const baseURL = (
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

function extraOrigins() {
  const fromEnv = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const railwayHost = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  return [
    ...fromEnv,
    railwayHost
      ? railwayHost.startsWith("http")
        ? railwayHost.replace(/\/$/, "")
        : `https://${railwayHost}`
      : "",
  ].filter(Boolean);
}

let ready: Promise<void> | null = null;

export async function prepareAuth() {
  if (!ready) ready = ensureDatabase();
  await ready;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const sent = await sendPasswordResetEmail({ email: user.email, url });
      if (!sent) {
        console.error("[auth] password reset email was not sent");
        throw new Error("PASSWORD_RESET_EMAIL_FAILED");
      }
    },
  },
  user: {
    additionalFields: {},
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    ...new Set([
      baseURL,
      "https://francemobilier.org",
      "https://www.francemobilier.org",
      "https://francemobilier.com",
      "https://www.francemobilier.com",
      "http://localhost:3000",
      "http://localhost:3001",
      ...extraOrigins(),
    ]),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (created) => {
          const { attachOrdersToUser } = await import("@/lib/orders");
          await attachOrdersToUser(created.id, created.email);
        },
      },
    },
    session: {
      create: {
        after: async (created) => {
          const { db } = await import("@/lib/db");
          const { user } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");
          const { attachOrdersToUser } = await import("@/lib/orders");
          const rows = await db
            .select({ id: user.id, email: user.email })
            .from(user)
            .where(eq(user.id, created.userId))
            .limit(1);
          if (rows[0]) await attachOrdersToUser(rows[0].id, rows[0].email);
        },
      },
    },
  },
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};
