import type { KeywordMetric } from "@/lib/keywords/types";

export type { KeywordMetric, KeywordSearchMode } from "@/lib/keywords/types";
export { KEYWORD_PLANNER_PRESETS } from "@/lib/keywords/types";

const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

export type KeywordPlannerConfig = {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId: string | null;
  apiVersion: string;
};

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getKeywordPlannerConfig(): KeywordPlannerConfig | null {
  const developerToken = readEnv("GOOGLE_ADS_DEVELOPER_TOKEN");
  const clientId = readEnv("GOOGLE_ADS_CLIENT_ID");
  const clientSecret = readEnv("GOOGLE_ADS_CLIENT_SECRET");
  const refreshToken = readEnv("GOOGLE_ADS_REFRESH_TOKEN");
  const customerId = normalizeCustomerId(readEnv("GOOGLE_ADS_CUSTOMER_ID"));
  if (!developerToken || !clientId || !clientSecret || !refreshToken || !customerId) {
    return null;
  }
  return {
    developerToken,
    clientId,
    clientSecret,
    refreshToken,
    customerId,
    loginCustomerId: normalizeCustomerId(readEnv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")) || null,
    apiVersion: readEnv("GOOGLE_ADS_API_VERSION") || "v23",
  };
}

export function listMissingKeywordPlannerEnv() {
  const required = [
    "GOOGLE_ADS_DEVELOPER_TOKEN",
    "GOOGLE_ADS_CLIENT_ID",
    "GOOGLE_ADS_CLIENT_SECRET",
    "GOOGLE_ADS_REFRESH_TOKEN",
    "GOOGLE_ADS_CUSTOMER_ID",
  ] as const;
  return required.filter((name) => !readEnv(name));
}

export function isKeywordPlannerConfigured() {
  return getKeywordPlannerConfig() !== null;
}

export function normalizeCustomerId(value: string) {
  return value.replace(/\D/g, "");
}

export function parseKeywordList(raw: string) {
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const line of raw.split(/[\n,;]+/)) {
    const keyword = line.trim().replace(/\s+/g, " ").slice(0, 80);
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) continue;
    seen.add(key);
    keywords.push(keyword);
  }
  return keywords;
}

function microsToEur(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return null;
  const micros = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(micros)) return null;
  return Math.round(micros) / 1_000_000;
}

function toInt(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function monthIndex(month: string | number | undefined) {
  if (typeof month === "number") return month - 1;
  if (!month) return -1;
  return MONTHS.indexOf(month.toUpperCase() as (typeof MONTHS)[number]);
}

function yearMonthKey(year: number, month: number) {
  return year * 12 + month;
}

function pctChange(current: number, previous: number) {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function sumRange(
  points: Array<{ year: number; month: number; searches: number }>,
  startKey: number,
  endKey: number,
) {
  return points
    .filter((point) => {
      const key = yearMonthKey(point.year, point.month);
      return key >= startKey && key <= endKey;
    })
    .reduce((total, point) => total + point.searches, 0);
}

function computeChanges(points: Array<{ year: number; month: number; searches: number }>) {
  if (points.length < 4) {
    return { threeMonthChangePct: null, yoyChangePct: null };
  }
  const sorted = [...points].sort(
    (a, b) => yearMonthKey(a.year, a.month) - yearMonthKey(b.year, b.month),
  );
  const last = sorted[sorted.length - 1];
  const lastKey = yearMonthKey(last.year, last.month);
  const recent = sumRange(sorted, lastKey - 2, lastKey);
  const previous = sumRange(sorted, lastKey - 5, lastKey - 3);
  const yoy = sumRange(sorted, lastKey - 14, lastKey - 12);
  return {
    threeMonthChangePct: previous > 0 ? pctChange(recent, previous) : null,
    yoyChangePct: yoy > 0 ? pctChange(recent, yoy) : null,
  };
}

function mapCompetition(value?: string | null): KeywordMetric["competition"] {
  if (value === "HIGH" || value === "MEDIUM" || value === "LOW") return value;
  return "UNSPECIFIED";
}

function lastCompleteMonthRange() {
  const end = new Date();
  end.setDate(1);
  end.setMonth(end.getMonth() - 1);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 11);
  return {
    start: { year: start.getFullYear(), month: MONTHS[start.getMonth()] },
    end: { year: end.getFullYear(), month: MONTHS[end.getMonth()] },
  };
}

type AdsKeywordMetrics = {
  avgMonthlySearches?: string | number;
  competition?: string;
  competitionIndex?: string | number;
  lowTopOfPageBidMicros?: string | number;
  highTopOfPageBidMicros?: string | number;
  monthlySearchVolumes?: Array<{
    year?: number | string;
    month?: string | number;
    monthlySearches?: string | number;
  }>;
};

function mapMetrics(text: string, closeVariants: string[], raw?: AdsKeywordMetrics | null): KeywordMetric {
  const monthlySearches = (raw?.monthlySearchVolumes || [])
    .map((row) => {
      const year = toInt(row.year);
      const month = monthIndex(row.month);
      const searches = toInt(row.monthlySearches);
      if (year === null || month < 0 || searches === null) return null;
      return { year, month, searches };
    })
    .filter((row): row is { year: number; month: number; searches: number } => row !== null);
  const changes = computeChanges(monthlySearches);
  return {
    keyword: text,
    closeVariants,
    avgMonthlySearches: toInt(raw?.avgMonthlySearches),
    threeMonthChangePct: changes.threeMonthChangePct,
    yoyChangePct: changes.yoyChangePct,
    competition: mapCompetition(raw?.competition),
    competitionIndex: toInt(raw?.competitionIndex),
    lowTopOfPageBidEur: microsToEur(raw?.lowTopOfPageBidMicros),
    highTopOfPageBidEur: microsToEur(raw?.highTopOfPageBidMicros),
    monthlySearches,
  };
}

async function getAccessToken(config: KeywordPlannerConfig) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
  });
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description || payload.error || "Could not refresh the Google Ads token.",
    );
  }
  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in || 3600) * 1000,
  };
  return payload.access_token;
}

function adsErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: { message?: string; status?: string; details?: unknown[] } }).error;
  if (!error) return fallback;
  const detail = Array.isArray(error.details)
    ? error.details
        .map((item) => {
          if (!item || typeof item !== "object") return "";
          const message = (item as { message?: string }).message;
          return typeof message === "string" ? message : "";
        })
        .filter(Boolean)
        .join(" ")
    : "";
  return [error.message, detail].filter(Boolean).join(" — ") || fallback;
}

async function adsPost<T>(config: KeywordPlannerConfig, method: string, body: Record<string, unknown>) {
  const token = await getAccessToken(config);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "developer-token": config.developerToken,
    "Content-Type": "application/json",
  };
  if (config.loginCustomerId) {
    headers["login-customer-id"] = config.loginCustomerId;
  }
  const response = await fetch(
    `https://googleads.googleapis.com/${config.apiVersion}/customers/${config.customerId}:${method}`,
    { method: "POST", headers, body: JSON.stringify(body) },
  );
  const payload = (await response.json()) as T & { error?: unknown };
  if (!response.ok) {
    throw new Error(adsErrorMessage(payload, `Google Ads rejected ${method}.`));
  }
  return payload;
}

const targeting = {
  language: "languageConstants/1002",
  geoTargetConstants: ["geoTargetConstants/2250"],
  keywordPlanNetwork: "GOOGLE_SEARCH",
};

export async function fetchKeywordHistoricalMetrics(keywords: string[]) {
  const config = getKeywordPlannerConfig();
  if (!config) {
    throw new Error("Keyword Planner is not configured.");
  }
  const payload = await adsPost<{
    results?: Array<{
      text?: string;
      closeVariants?: string[];
      keywordMetrics?: AdsKeywordMetrics;
    }>;
  }>(config, "generateKeywordHistoricalMetrics", {
    keywords,
    ...targeting,
    historicalMetricsOptions: {
      yearMonthRange: lastCompleteMonthRange(),
      includeAverageCpc: true,
    },
  });

  return (payload.results || [])
    .filter((row) => row.text)
    .map((row) => mapMetrics(row.text as string, row.closeVariants || [], row.keywordMetrics))
    .sort((a, b) => (b.avgMonthlySearches || 0) - (a.avgMonthlySearches || 0));
}

export async function fetchKeywordIdeas(keywords: string[]) {
  const config = getKeywordPlannerConfig();
  if (!config) {
    throw new Error("Keyword Planner is not configured.");
  }
  const payload = await adsPost<{
    results?: Array<{
      text?: string;
      keywordIdeaMetrics?: AdsKeywordMetrics;
    }>;
  }>(config, "generateKeywordIdeas", {
    ...targeting,
    keywordSeed: { keywords },
  });

  return (payload.results || [])
    .filter((row) => row.text)
    .map((row) => mapMetrics(row.text as string, [], row.keywordIdeaMetrics))
    .sort((a, b) => (b.avgMonthlySearches || 0) - (a.avgMonthlySearches || 0));
}
