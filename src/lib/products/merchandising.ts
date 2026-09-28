import { catalogFlags } from "@/lib/catalog/flags";
import { deliveryCustomerLabel, getDeliveryEstimate } from "@/lib/merchant/delivery";
import { getProductMeasures } from "@/lib/products/presentation";
import type { Product, ProductRoom, ProductTypeSlug } from "@/lib/types/commerce";

export const ROOM_LABELS: Record<ProductRoom, string> = {
  salon: "Living room",
  chambre: "Bedroom",
  entree: "Entry & storage",
  bureau: "Office",
  accessoires: "Accessories",
};

export const PRODUCT_TYPE_LABELS: Record<ProductTypeSlug, string> = {
  "table-basse": "Coffee tables",
  "meuble-tv": "TV stands",
  "table-appoint": "Side tables",
  "table-a-manger": "Dining tables",
  "table-de-chevet": "Nightstands",
  coiffeuse: "Vanities",
  "meuble-chaussures": "Shoe storage",
  casiers: "Cubbies",
  etagere: "Shelves",
  bureau: "Desks",
  support: "Stands",
  organiseur: "Organizers",
  chariot: "Carts",
  rangement: "Storage",
  "meuble-litiere": "Pet furniture",
  buffet: "Sideboards",
  console: "Consoles",
  commode: "Dressers",
  armoire: "Wardrobes",
  caisson: "Pedestals",
  banc: "Benches",
};

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
    case "bureau":
      return "bureau";
    case "rangement":
      return "entree";
    case "animaux":
      return "accessoires";
    case "cuisine":
      return "salon";
    case "salle-de-bain":
      return "accessoires";
    default:
      return "salon";
  }
}

export function collectionSlugForProduct(product: Product): string {
  switch (primaryRoom(product)) {
    case "salon":
      return "salon";
    case "chambre":
      return "chambre";
    case "entree":
      return "entree-rangement";
    case "bureau":
      return "bureau";
    case "accessoires":
      return product.category === "animaux" ? "animaux" : "accessoires";
  }
}
