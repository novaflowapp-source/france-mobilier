import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  WELCOME_STARTED_COOKIE,
  parseWelcomeStartedAt,
  welcomeCookieOptions,
  welcomeOfferAt,
} from "@/lib/welcome-offer";

async function currentStartedAt() {
  const jar = await cookies();
  return parseWelcomeStartedAt(jar.get(WELCOME_STARTED_COOKIE)?.value);
}

function jsonOffer(startedAt: number | null, setCookie = false) {
  const offer = welcomeOfferAt(startedAt);
  const response = NextResponse.json(offer);
  if (setCookie && startedAt) {
    response.cookies.set(WELCOME_STARTED_COOKIE, String(startedAt), welcomeCookieOptions());
  }
  return response;
}

export async function GET() {
  return jsonOffer(await currentStartedAt());
}

export async function POST(request: Request) {
  const existing = await currentStartedAt();
  if (existing) return jsonOffer(existing);

  let clientStarted: number | null = null;
  try {
    const body = (await request.json()) as { startedAt?: unknown };
    clientStarted = parseWelcomeStartedAt(
      typeof body.startedAt === "number" || typeof body.startedAt === "string" ? body.startedAt : null,
    );
  } catch {
    /* empty body */
  }

  const now = Date.now();
  if (clientStarted && clientStarted <= now + 2000) {
    return jsonOffer(clientStarted, true);
  }
  return jsonOffer(now, true);
}
