import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  lookupPaidOrders,
  mergeOrderAccessCookie,
  ORDER_ACCESS_COOKIE,
  orderAccessCookieOptions,
  getOrderAccessSecrets,
} from "@/lib/orders";

const schema = z.object({
  email: z.string().trim().email().max(180),
  postalCode: z.string().trim().min(4).max(12),
});

const hits = new Map<string, { count: number; ts: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.ts > 60_000) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }
  if (row.count >= 8) return false;
  row.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the order email and ZIP code." }, { status: 400 });
  }

  const { orders, guestAccount } = await lookupPaidOrders(parsed.data.email, parsed.data.postalCode);
  const response = NextResponse.json({ orders, guestAccount: guestAccount ?? null });
  if (orders.length > 0) {
    const jar = await cookies();
    let value = jar.get(ORDER_ACCESS_COOKIE)?.value;
    for (const order of orders) {
      const secrets = await getOrderAccessSecrets(order.id);
      if (!secrets?.viewToken) continue;
      value = mergeOrderAccessCookie(value, secrets);
    }
    if (value) {
      response.cookies.set(ORDER_ACCESS_COOKIE, value, orderAccessCookieOptions());
    }
  }
  return response;
}
