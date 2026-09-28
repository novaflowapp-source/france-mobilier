import { headers } from "next/headers";
import { store } from "@/config/store";
import { auth, prepareAuth } from "@/lib/auth";

export function listAdminEmails() {
  const fromEnv = (process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const always = ["hugo.rusu@gmail.com"];
  const merged = [...new Set([...always, ...fromEnv])];
  if (merged.length > 0) return merged;
  return [store.supportEmail.toLowerCase()];
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return listAdminEmails().includes(email.trim().toLowerCase());
}

/** Funnel stats (carts, views, payments) — reserved to the store owner. */
export function isActivityAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === "hugo.rusu@gmail.com";
}

export async function getAdminSession() {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdminEmail(session.user.email)) return null;
  return session;
}

export async function getActivityAdminSession() {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isActivityAdminEmail(session.user.email)) return null;
  return session;
}
