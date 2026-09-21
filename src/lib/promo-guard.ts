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
      throw new PromoError("Les codes promo particuliers ne s’appliquent pas aux commandes professionnelles.");
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
    throw new PromoError("Ce code n’est pas reconnu.");
  }
  const offer = welcomeOfferAt(parseWelcomeStartedAt(input.welcomeStartedAt));
  if (offer.status !== "active") {
    throw new PromoError("Le délai du code BIENVENUE est écoulé.");
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
    throw new PromoError("Indiquez un numéro de téléphone valide pour utiliser un code.");
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
      throw new PromoError("BIENVENUE s’applique uniquement à la première commande.");
    }
    if (row.phone && phoneIdentityKey(row.phone) === phoneKey) {
      throw new PromoError(
        "Ce numéro est déjà associé à une commande ou à un compte. Un code promo ne peut servir qu’une fois par personne.",
      );
    }
  }
}
