import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { auth, prepareAuth } from "@/lib/auth";
import { store } from "@/config/store";
import { isMailConfigured } from "@/lib/mail";
import {
  attachStripeSession,
  createPendingOrder,
  getAccountInvitePassword,
  getLastDeliveryForEmail,
  getOrderAccessSecrets,
  getOrderById,
  isFirstPaidOrderForEmail,
  markOrderPaid,
  mergeOrderAccessCookie,
  ORDER_ACCESS_COOKIE,
  orderAccessCookieOptions,
  priceCheckoutLines,
} from "@/lib/orders";
import { recordBeginCheckout } from "@/lib/activity";
import {
  ensureStripeCustomer,
  getSiteUrl,
  getStripe,
  isCheckoutEnabled,
  stripeMode,
} from "@/lib/payments/stripe";
import { buildOrderFulfillment, fulfillmentCustomerLabel } from "@/lib/orders/fulfillment";
import { normalizeZonePhone } from "@/lib/phone";
import { getProAccessByUserId, isProApproved } from "@/lib/pro-access";
import { b2bConfig } from "@/lib/b2b";
import { PromoError, resolveCheckoutDiscount } from "@/lib/promo-guard";
import { SHIPPING_COUNTRY_CODES, normalizeShippingPostal } from "@/lib/shipping-zone";
import { WELCOME_STARTED_COOKIE, parseWelcomeStartedAt } from "@/lib/welcome-offer";

const schema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          variantId: z.string().min(1).optional(),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .min(1)
      .max(30),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(180),
    line1: z.string().trim().min(3).max(200),
    country: z.enum(SHIPPING_COUNTRY_CODES),
    postalCode: z.string().trim().min(2).max(12),
    city: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(6).max(30),
    promoCode: z.string().trim().max(20).optional(),
  })
  .transform((data, ctx) => {
    const postalCode = normalizeShippingPostal(data.country, data.postalCode);
    const phone = normalizeZonePhone(data.phone, data.country);
    if (!postalCode) {
      ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Code postal invalide" });
      return z.NEVER;
    }
    if (!phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Téléphone invalide" });
      return z.NEVER;
    }
    return { ...data, postalCode, phone };
  });

export async function GET(request: Request) {
  if (!isCheckoutEnabled()) {
    return NextResponse.json({ enabled: false, mode: stripeMode() });
  }
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    await prepareAuth();
    const sessionAuth = await auth.api.getSession({ headers: await headers() });
    const lastDelivery = sessionAuth?.user?.email
      ? await getLastDeliveryForEmail(sessionAuth.user.email)
      : null;
    return NextResponse.json({ enabled: true, mode: stripeMode(), lastDelivery });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;
    const paid = session.payment_status === "paid";
    if (paid && orderId) {
      await markOrderPaid(orderId, session.id);
    }
    const order = orderId ? await getOrderById(orderId) : null;
    const secrets = orderId ? await getOrderAccessSecrets(orderId) : null;
    const accountPassword = orderId && paid ? await getAccountInvitePassword(orderId) : null;
    const newCustomer =
      paid && order?.email ? await isFirstPaidOrderForEmail(order.email) : false;
    const response = NextResponse.json({
      enabled: true,
      mode: stripeMode(),
      paid,
      newCustomer,
      email: session.customer_details?.email || session.customer_email,
      amountCents: session.amount_total,
      mailEnabled: isMailConfigured(),
      accountPassword,
      order:
        paid && order
          ? {
              id: order.id,
              reference: order.reference,
              name: order.name,
              email: order.email,
              phone: order.phone,
              line1: order.line1,
              postalCode: order.postalCode,
              city: order.city,
              country: order.country,
              amountCents: order.amountCents,
              confirmationSent: Boolean(order.confirmationSentAt),
              companyName: order.companyName,
              siren: order.siren,
              promoCode: order.promoCode || null,
              promoDiscountCents: order.promoDiscountCents ?? 0,
              fulfillment: buildOrderFulfillment(order),
              fulfillmentLabel: fulfillmentCustomerLabel(buildOrderFulfillment(order)),
              items: order.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unitPriceCents: item.unitPriceCents,
              })),
            }
          : null,
    });
    if (paid && secrets?.viewToken) {
      const jar = await cookies();
      response.cookies.set(
        ORDER_ACCESS_COOKIE,
        mergeOrderAccessCookie(jar.get(ORDER_ACCESS_COOKIE)?.value, {
          id: secrets.id,
          viewToken: secrets.viewToken,
        }),
        orderAccessCookieOptions(),
      );
    }
    return response;
  } catch {
    return NextResponse.json({ enabled: true, mode: stripeMode(), paid: false }, { status: 404 });
  }
}

export async function POST(request: Request) {
  if (!isCheckoutEnabled()) {
    return NextResponse.json(
      { error: "Le paiement n’est pas encore ouvert." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    const paths = new Set(parsed.error.issues.flatMap((issue) => issue.path.map(String)));
    let error = "Vérifiez les informations de livraison.";
    if (paths.has("phone")) {
      error =
        "Indiquez un numéro valide de la zone de livraison (France, Belgique, Luxembourg, Monaco ou Suisse).";
    } else if (paths.has("postalCode")) {
      error = "Code postal invalide pour le pays choisi.";
    } else if (paths.has("country")) {
      error =
        "Livraison uniquement en France métropolitaine, Belgique, Luxembourg, Monaco et Suisse.";
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await prepareAuth();
    const sessionAuth = await auth.api.getSession({ headers: await headers() });
    const pro =
      sessionAuth?.user?.id ? await getProAccessByUserId(sessionAuth.user.id) : null;
    const proActive = isProApproved(pro);
    const proDiscount =
      proActive && b2bConfig().discountsEnabled
        ? { type: pro?.discountType ?? null, value: pro?.discountValue ?? null }
        : null;
    let promo;
    try {
      promo = await resolveCheckoutDiscount({
        promoCode: parsed.data.promoCode,
        phone: parsed.data.phone,
        email: parsed.data.email,
        userId: sessionAuth?.user?.id ?? null,
        proDiscount,
        welcomeStartedAt: parseWelcomeStartedAt(
          (await cookies()).get(WELCOME_STARTED_COOKIE)?.value,
        ),
      });
    } catch (error) {
      if (error instanceof PromoError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
    const { lines, amountCents, discountCents } = priceCheckoutLines(parsed.data.items, promo.discount);
    const companyName = proActive ? pro?.companyName || pro?.legalName || null : null;
    const siren = proActive ? pro?.siren || null : null;
    const orderId = await createPendingOrder({
      customer: {
        name: parsed.data.name,
        email: parsed.data.email,
        line1: parsed.data.line1,
        country: parsed.data.country,
        postalCode: parsed.data.postalCode,
        city: parsed.data.city,
        phone: parsed.data.phone,
        userId: sessionAuth?.user?.id ?? null,
        companyName,
        siren,
        accountType: proActive ? "pro" : "personal",
      },
      lines,
      amountCents,
      promoCode: promo.promoCode,
      promoDiscountCents: discountCents,
    });

    const siteUrl = getSiteUrl();
    const stripe = getStripe();
    const email = parsed.data.email.trim().toLowerCase();
    let customerId: string | undefined;
    try {
      customerId = await ensureStripeCustomer({
        email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        line1: parsed.data.line1,
        postalCode: parsed.data.postalCode,
        city: parsed.data.city,
        country: parsed.data.country,
        orderId,
      });
    } catch (error) {
      console.error("[checkout] stripe customer prefills skipped", error);
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      billing_address_collection: "auto",
      ...(customerId ? { customer: customerId } : { customer_email: email }),
      client_reference_id: orderId,
      metadata: {
        orderId,
        accountType: proActive ? "pro" : "personal",
        ...(companyName ? { companyName } : {}),
        ...(siren ? { siren } : {}),
        ...(promo.promoCode ? { promoCode: promo.promoCode } : {}),
      },
      success_url: `${siteUrl}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/paiement`,
      after_expiration: {
        recovery: { enabled: true },
      },
      custom_text: {
        submit: {
          message:
            proActive && companyName && siren
              ? `Commande professionnelle — ${companyName} (SIREN ${siren}). Les prix restent TTC.`
              : promo.promoCode
                ? `Code ${promo.promoCode} appliqué sur toute la commande. Paiement sécurisé. Livraison offerte.`
                : "Paiement sécurisé. Livraison offerte. Si vous quittez cette page, un lien de reprise vous sera envoyé.",
        },
      },
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "eur",
          unit_amount: line.unitPriceCents,
          product_data: {
            name: line.name,
            images: line.image ? [`${store.domain}${line.image}`] : undefined,
          },
        },
      })),
      payment_intent_data: {
        metadata: {
          orderId,
          accountType: proActive ? "pro" : "personal",
          ...(companyName ? { companyName } : {}),
          ...(siren ? { siren } : {}),
          ...(promo.promoCode ? { promoCode: promo.promoCode } : {}),
        },
        receipt_email: email,
        shipping: {
          name: parsed.data.name.trim(),
          phone: parsed.data.phone,
          address: {
            line1: parsed.data.line1.trim(),
            postal_code: parsed.data.postalCode.trim(),
            city: parsed.data.city.trim(),
            country: parsed.data.country,
          },
        },
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Impossible d’ouvrir Stripe." }, { status: 502 });
    }
    await attachStripeSession(orderId, checkoutSession.id);
    try {
      await recordBeginCheckout({
        productName: lines.map((line) => `${line.name} × ${line.quantity}`).join(", ").slice(0, 240),
        quantity: lines.reduce((sum, line) => sum + line.quantity, 0),
        priceEur: amountCents / 100,
        email,
      });
    } catch (error) {
      console.error("[checkout] begin_checkout activity failed", error);
    }
    return NextResponse.json({ url: checkoutSession.url, mode: stripeMode() });
  } catch (error) {
    if (error instanceof PromoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Erreur";
    const map: Record<string, string> = {
      PANIER_VIDE: "Votre panier est vide.",
      QUANTITE_INVALIDE: "Quantité invalide.",
      PRODUIT_INTROUVABLE: "Un article du panier n’est plus disponible.",
      PRODUIT_INDISPONIBLE: "Un article du panier n’est plus en vente.",
      VARIANTE_INTROUVABLE: "Une variante du panier n’est plus disponible.",
      MONTANT_INVALIDE: "Le montant de la commande est invalide.",
    };
    return NextResponse.json(
      { error: map[message] || "Impossible de préparer le paiement." },
      { status: 400 },
    );
  }
}
