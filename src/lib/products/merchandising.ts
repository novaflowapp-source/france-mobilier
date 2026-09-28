import { catalogFlags } from "@/lib/catalog/flags";
import { deliveryCustomerLabel, getDeliveryEstimate } from "@/lib/merchant/delivery";
import { getProductMeasures } from "@/lib/products/presentation";
import type { Product, ProductRoom, ProductTypeSlug } from "@/lib/types/commerce";

export const ROOM_LABELS: Record<ProductRoom, string> = {
  "living-room": "Living room",
  bedroom: "Bedroom",
  entry: "Entry & storage",
  office: "Office",
  accessories: "Accessories",
};

export const PRODUCT_TYPE_LABELS: Record<ProductTypeSlug, string> = {
  "coffee-table": "Coffee tables",
  "tv-stand": "TV stands",
  "side-table": "Side tables",
  "dining-table": "Dining tables",
  nightstand: "Nightstands",
  vanity: "Vanities",
  "shoe-storage": "Shoe storage",
  cubbies: "Cubbies",
  shelf: "Shelves",
  desk: "Desks",
  stand: "Stands",
  organizer: "Organizers",
  cart: "Carts",
  storage: "Storage",
  "pet-furniture": "Pet furniture",
  sideboard: "Sideboards",
  console: "Consoles",
  dresser: "Dressers",
  wardrobe: "Wardrobes",
  pedestal: "Pedestals",
  bench: "Benches",
};

/** Old French filter query values → English productType. */
export const LEGACY_PRODUCT_TYPE_QUERY: Record<string, ProductTypeSlug> = {
  "table-basse": "coffee-table",
  "meuble-tv": "tv-stand",
  "table-appoint": "side-table",
  "table-a-manger": "dining-table",
  "table-de-chevet": "nightstand",
  coiffeuse: "vanity",
  "meuble-chaussures": "shoe-storage",
  casiers: "cubbies",
  etagere: "shelf",
  bureau: "desk",
  support: "stand",
  organiseur: "organizer",
  chariot: "cart",
  rangement: "storage",
  "meuble-litiere": "pet-furniture",
  buffet: "sideboard",
  console: "console",
  commode: "dresser",
  armoire: "wardrobe",
  caisson: "pedestal",
  banc: "bench",
};

export function normalizeProductTypeQuery(value?: string): string | undefined {
  if (!value) return undefined;
  return LEGACY_PRODUCT_TYPE_QUERY[value] ?? value;
}

/** Old French category query values → English. */
export const LEGACY_CATEGORY_QUERY: Record<string, string> = {
  maison: "home",
  rangement: "storage",
  bureau: "office",
  cuisine: "kitchen",
  "salle-de-bain": "bathroom",
  animaux: "pets",
};

export function normalizeCategoryQuery(value?: string): string | undefined {
  if (!value) return undefined;
  return LEGACY_CATEGORY_QUERY[value] ?? value;
}

export function isSellable(product: Product) {
  return product.availabilityStatus === "available";
}

export function isLowDepth(product: Product) {
  const depth = getProductMeasures(product).depthCm;
  return depth != null && depth <= catalogFlags.lowDepthMaxCm;
}

export function isNarrow(product: Product) {
  const width = getProductMeasures(product).widthCm;
  return width != null && width <= catalogFlags.narrowWidthMaxCm;
}

export function isWallMounted(product: Product) {
  const mount =
    product.specifications?.Fixation ||
    product.specifications?.Mounting ||
    product.specifications?.["Wall mount"];
  if (typeof mount === "string" && /mural|wall/i.test(mount)) return true;
  const text = [product.slug, product.name, ...(product.features ?? [])].join(" ");
  return /mural|wall[- ]mount/i.test(text);
}

export function isSmallSpaceProduct(product: Product) {
  return Boolean(
    product.smallSpaceFriendly ||
      product.extensible ||
      product.modular ||
      isLowDepth(product) ||
      isWallMounted(product),
  );
}

export function smallSpaceReasons(product: Product): string[] {
  const reasons: string[] = [];
  if (isLowDepth(product)) reasons.push("low-depth");
  if (isNarrow(product)) reasons.push("narrow");
  if (product.extensible) reasons.push("extensible");
  if (product.modular) reasons.push("modular");
  if (product.smallSpaceFriendly && reasons.length === 0) reasons.push("studio");
  return reasons;
}

export function formatLph(product: Product): string | null {
  const { widthCm, depthCm, heightCm } = getProductMeasures(product);
  if (widthCm != null && depthCm != null && heightCm != null) {
    return `${widthCm} × ${depthCm} × ${heightCm} cm`;
  }
  return null;
}

export function productCardMeta(product: Product): string | null {
  const measures = getProductMeasures(product);
  const parts: string[] = [];
  if (product.material) parts.push(product.material);
  if (isLowDepth(product) && measures.depthCm != null) {
    parts.push(`${measures.depthCm} cm deep`);
  } else if (measures.widthCm != null) {
    parts.push(`${measures.widthCm} cm`);
  } else if (product.extensible) {
    parts.push("Extendable");
  }
  return parts.length ? parts.join(" · ") : null;
}

export function cardDeliveryLines(product: Product): string[] {
  if (!isSellable(product)) return [];
  const estimate = getDeliveryEstimate(product);
  const lines: string[] = [];
  if (product.madeToOrder) lines.push("Made to order");
  if (estimate.structured && estimate.handlingMinBusinessDays != null && estimate.transitMinBusinessDays != null) {
    lines.push(`${estimate.handlingMinBusinessDays} business days to prepare`);
    lines.push(`${estimate.transitMinBusinessDays} business days in transit`);
    return lines;
  }
  const delay = deliveryCustomerLabel(product);
  if (delay) lines.push(delay);
  return lines;
}

export function sortSellableFirst(products: Product[]) {
  return [...products].sort((a, b) => {
    const aOk = isSellable(a) ? 0 : 1;
    const bOk = isSellable(b) ? 0 : 1;
    return aOk - bOk;
  });
}

export function applyAvailabilityVisibility(products: Product[]) {
  const available = products.filter(isSellable);
  const rest = products.filter((product) => !isSellable(product));
  if (!catalogFlags.hideUnavailableProducts) return [...available, ...rest];
  if (available.length > 0) return available;
  return rest;
}

export function primaryRoom(product: Product): ProductRoom {
  return product.rooms?.[0] ?? roomFromLegacyCategory(product.category);
}

function roomFromLegacyCategory(category: Product["category"]): ProductRoom {
  switch (category) {
    case "office":
      return "office";
    case "storage":
      return "entry";
    case "pets":
      return "accessories";
    case "kitchen":
      return "living-room";
    case "bathroom":
      return "accessories";
    default:
      return "living-room";
  }
}

export function collectionSlugForProduct(product: Product): string {
  switch (primaryRoom(product)) {
    case "living-room":
      return "living-room";
    case "bedroom":
      return "bedroom";
    case "entry":
      return "entry-storage";
    case "office":
      return "office";
    case "accessories":
      return product.category === "pets" ? "pets" : "accessories";
  }
}
