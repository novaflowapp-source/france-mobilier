import type { Metadata } from "next";
import { store } from "@/config/store";

const FALLBACK_ORIGIN = "https://francemobilier.org";

export function publicOrigin() {
  const origin = store.domain.replace(/\/$/, "");
  if (/localhost|127\.0\.0\.1|0\.0\.0\.0|\.local$/i.test(origin)) {
    return FALLBACK_ORIGIN;
  }
  return origin || FALLBACK_ORIGIN;
}

export function canonicalUrl(path = "/") {
  const origin = publicOrigin();
  if (!path || path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function indexableMetadata(
  path: string,
  metadata: Metadata = {},
): Metadata {
  const url = canonicalUrl(path);
  const { openGraph, robots, ...rest } = metadata;
  return {
    ...rest,
    alternates: { canonical: url },
    robots: robots ?? { index: true, follow: true },
    openGraph: {
      url,
      ...openGraph,
    },
  };
}

/** Account and checkout surfaces: never index, even if Google ignores robots.txt. */
export function privateMetadata(path: string, metadata: Metadata = {}): Metadata {
  return {
    ...metadata,
    alternates: { canonical: canonicalUrl(path) },
    robots: { index: false, follow: false },
  };
}
