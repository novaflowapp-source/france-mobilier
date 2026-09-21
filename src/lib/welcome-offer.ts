import { WELCOME_PROMO } from "@/lib/promo";

export const WELCOME_STARTED_COOKIE = "fm_welcome_started";
export const WELCOME_STORAGE_KEY = "francemobilier-welcome-v1";
export const WELCOME_WINDOW_MS = WELCOME_PROMO.windowMinutes * 60 * 1000;

export type WelcomeOfferView = {
  status: "idle" | "active" | "expired";
  startedAt: number | null;
  remainingMs: number;
  expiresAt: number | null;
};

export function parseWelcomeStartedAt(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 1_000_000_000_000) return null;
  return Math.floor(n);
}

export function welcomeOfferAt(
  startedAt: number | null | undefined,
  now = Date.now(),
): WelcomeOfferView {
  if (!startedAt) {
    return { status: "idle", startedAt: null, remainingMs: 0, expiresAt: null };
  }
  const expiresAt = startedAt + WELCOME_WINDOW_MS;
  const remainingMs = expiresAt - now;
  if (remainingMs <= 0) {
    return { status: "expired", startedAt, remainingMs: 0, expiresAt };
  }
  return { status: "active", startedAt, remainingMs, expiresAt };
}

export function formatWelcomeCountdown(remainingMs: number) {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function readWelcomeStartedFromStorage(): number | null {
  try {
    const raw = localStorage.getItem(WELCOME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { startedAt?: unknown };
    return parseWelcomeStartedAt(
      typeof parsed.startedAt === "number" || typeof parsed.startedAt === "string"
        ? parsed.startedAt
        : null,
    );
  } catch {
    return null;
  }
}

export function writeWelcomeStartedToStorage(startedAt: number) {
  try {
    localStorage.setItem(WELCOME_STORAGE_KEY, JSON.stringify({ startedAt }));
  } catch {
    /* private mode */
  }
}

export function welcomeCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
