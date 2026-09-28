import { eq } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import { shopOrder } from "@/lib/db/schema";
import { phoneIdentityKey } from "@/lib/phone";
import { isWelcomePromo, parsePromoCode, welcomeDiscount } from "@/lib/promo";
import { parseWelcomeStartedAt, welcomeOfferAt } from "@/lib/welcome-offer";

export class PromoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoError";
  }
}

export async function resolveCheckoutDiscount(input: {
  promoCode?: string | null;
  phone: string;
  email: string;
  userId?: string | null;
  proDiscount?: { type: "percentage" | "fixed" | null; value: number | null } | null;
  welcomeStartedAt?: string | number | null;
}) {
  if (input.proDiscount?.type && input.proDiscount.value) {
    if (parsePromoCode(input.promoCode)) {
      throw new PromoError("Personal promo codes do not apply to trade orders.");
    }
    return {
      discount: input.proDiscount,
      promoCode: null as string | null,
    };
  }

  const code = parsePromoCode(input.promoCode);
  if (!code) {
    return { discount: null, promoCode: null as string | null };
  }
  if (!isWelcomePromo(code)) {
    throw new PromoError("This code is not recognized.");
  }
  const offer = welcomeOfferAt(parseWelcomeStartedAt(input.welcomeStartedAt));
  if (offer.status !== "active") {
    throw new PromoError("The WELCOME code window has expired.");
  }
  await assertWelcomePromoAllowed(input);
  return { discount: welcomeDiscount(), promoCode: code };
}

export async function assertWelcomePromoAllowed(input: {
  phone: string;
  email: string;
  userId?: string | null;
}) {
  await ensureDatabase();
  const email = input.email.trim().toLowerCase();
  const phoneKey = phoneIdentityKey(input.phone);
  if (!phoneKey) {
    throw new PromoError("Enter a valid phone number to use a promo code.");
  }

  const paid = await db
    .select({
      email: shopOrder.email,
      phone: shopOrder.phone,
      userId: shopOrder.userId,
    })
    .from(shopOrder)
    .where(eq(shopOrder.status, "paid"));

  for (const row of paid) {
    if (row.email === email || (input.userId && row.userId === input.userId)) {
      throw new PromoError("WELCOME applies only to your first order.");
    }
    if (row.phone && phoneIdentityKey(row.phone) === phoneKey) {
      throw new PromoError(
        "This phone number is already linked to an order or account. A promo code can only be used once per person.",
      );
    }
  }
}
