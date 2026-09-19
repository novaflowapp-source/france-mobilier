import Stripe from "stripe";
import { store } from "@/config/store";

let stripeClient: Stripe | null = null;

export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";
}

export function stripeMode(): "test" | "live" | "none" {
  const secret = getStripeSecretKey();
  if (secret.startsWith("sk_test_")) return "test";
  if (secret.startsWith("sk_live_")) return "live";
  return "none";
}

export function isStripeConfigured() {
  const secret = getStripeSecretKey();
  const publishable = getStripePublishableKey();
  if (!secret || !publishable) return false;
  if (secret.startsWith("sk_test_")) return publishable.startsWith("pk_test_");
  if (secret.startsWith("sk_live_")) return publishable.startsWith("pk_live_");
  return false;
}

/** Test keys enable checkout. Live keys stay off until STORE_CHECKOUT_ENABLED=true. */
export function isCheckoutEnabled() {
  if (!isStripeConfigured()) return false;
  if (stripeMode() === "test") return true;
  return process.env.STORE_CHECKOUT_ENABLED === "true";
}

export function getStripe() {
  const key = getStripeSecretKey();
  if (!key) throw new Error("Stripe is not configured.");
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

export function getSiteUrl() {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "").replace(
    /\/$/,
    "",
  );
  if (fromEnv) return fromEnv;
  return store.domain.replace(/\/$/, "");
}

export function eurosToCents(amount: number) {
  return Math.round(amount * 100);
}

export function getStripePublicStatus() {
  if (!isStripeConfigured()) return "NOT_CONFIGURED" as const;
  if (!isCheckoutEnabled()) return "PRE_LAUNCH" as const;
  return stripeMode() === "test" ? ("TEST" as const) : ("READY" as const);
}

export async function ensureStripeCustomer(input: {
  email: string;
  name: string;
  phone: string;
  line1: string;
  postalCode: string;
  city: string;
  country: string;
  orderId: string;
}) {
  const stripe = getStripe();
  const email = input.email.trim().toLowerCase();
  const shipping = {
    name: input.name.trim(),
    phone: input.phone,
    address: {
      line1: input.line1.trim(),
      postal_code: input.postalCode.trim(),
      city: input.city.trim(),
      country: input.country,
    },
  };
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data[0]) {
    await stripe.customers.update(existing.data[0].id, {
      name: input.name.trim(),
      phone: input.phone,
      shipping,
      metadata: { lastOrderId: input.orderId },
    });
    return existing.data[0].id;
  }
  const created = await stripe.customers.create({
    email,
    name: input.name.trim(),
    phone: input.phone,
    shipping,
    metadata: { lastOrderId: input.orderId },
  });
  return created.id;
}
