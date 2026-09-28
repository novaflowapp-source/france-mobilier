import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth, prepareAuth } from "@/lib/auth";
import { clearAccountInviteSecrets } from "@/lib/orders";

const schema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

function messageFor(error: unknown) {
  const raw = [
    error instanceof APIError ? String(error.body?.code || "") : "",
    error instanceof Error ? error.message : "",
  ]
    .join(" ")
    .toLowerCase();
  if (raw.includes("invalid_password") || raw.includes("invalid password")) {
    return "Mot de passe actuel incorrect.";
  }
  if (raw.includes("password_too_short") || raw.includes("too short")) {
    return "The new password must be at least 8 characters.";
  }
  if (raw.includes("password_too_long") || raw.includes("too long")) {
    return "Le nouveau mot de passe est trop long.";
  }
  if (raw.includes("unauthorized") || raw.includes("forbidden")) {
    return "Reconnectez-vous pour changer le mot de passe.";
  }
  return "Could not change the password.";
}

export async function POST(request: Request) {
  await prepareAuth();
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "The new password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { error: "The new password must be different from the current one." },
      { status: 400 },
    );
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: false,
      },
      headers: requestHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: messageFor(error) }, { status: 400 });
  }

  try {
    await clearAccountInviteSecrets(session.user.id);
  } catch (error) {
    console.error("[account] clear invite secrets failed", error);
  }

  return NextResponse.json({ ok: true });
}
