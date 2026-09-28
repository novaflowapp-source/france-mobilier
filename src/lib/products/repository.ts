import { products as catalog } from "@/data/products";
import { collections, store } from "@/config/store";
import {
  applyAvailabilityVisibility,
  collectionSlugForProduct,
  isSellable,
  isSmallSpaceProduct,
  primaryRoom,
  PRODUCT_TYPE_LABELS,
  ROOM_LABELS,
  sortSellableFirst,
} from "@/lib/products/merchandising";
import { getProductMeasures } from "@/lib/products/presentation";
import type { Product, ProductRoom, ProductVariant } from "@/lib/types/commerce";

function foldSearch(value: string) {
  return value.toLowerCase().replace(/['’ʻʼ`]/g, "'");
}

export function listProducts(): Product[] {
  return catalog;
}

export const getAllProducts = listProducts;

export function findProductBySlug(slug: string): Product | null {
  return catalog.find((p) => p.slug === slug) ?? null;
}

export function findProductById(id: string): Product | null {
  return catalog.find((p) => p.id === id) ?? null;
}

export function cartLineKey(productId: string, variantId?: string | null) {
  return variantId ? `${productId}::${variantId}` : productId;
}

export function findProductVariant(
  product: Product,
  variantId?: string | null,
): ProductVariant | undefined {
  const variants = product.variants;
  if (!variants?.length) return undefined;
  if (variantId) return variants.find((variant) => variant.id === variantId);
  return variants.find((variant) => variant.id === product.defaultVariantId) ?? variants[0];
}

export function variantLineName(product: Product, variant: ProductVariant) {
  return `${product.name} — ${variant.colorLabel}, ${variant.sizeLabel}`;
}

export function uniqueVariantSizes(product: Product): ProductVariant[] {
  const seen = new Map<number, ProductVariant>();
  for (const variant of product.variants ?? []) {
    if (!seen.has(variant.sizeCm)) seen.set(variant.sizeCm, variant);
  }
  return [...seen.values()].sort((a, b) => a.sizeCm - b.sizeCm);
}

export function uniqueVariantColors(product: Product): ProductVariant[] {
  const seen = new Map<string, ProductVariant>();
  for (const variant of product.variants ?? []) {
    if (!seen.has(variant.color)) seen.set(variant.color, variant);
  }
  return [...seen.values()];
}

export const getProductBySlug = findProductBySlug;

const COMPLEMENTARY_ROOMS: Record<ProductRoom, ProductRoom[]> = {
  salon: ["entree", "chambre"],
  chambre: ["entree", "salon"],
  entree: ["salon", "chambre"],
  bureau: ["salon"],
  accessoires: [],
};

function relatedScore(base: Product, other: Product): number {
  if (other.id === base.id) return -1;
  if (!isSellable(other)) return -1;
  if (primaryRoom(base) !== "accessoires" && primaryRoom(other) === "accessoires") return -1;

  let score = 0;
  if (base.collectionId && other.collectionId === base.collectionId) score += 160;
  if (base.productType && other.productType === base.productType) score += 50;
  const baseRoom = primaryRoom(base);
  const otherRooms = other.rooms ?? [primaryRoom(other)];
  if (otherRooms.includes(baseRoom)) score += 100;
  else if (otherRooms.some((room) => COMPLEMENTARY_ROOMS[baseRoom].includes(room))) score += 40;
  else return score > 0 ? score : -1;

  const gap = Math.abs(other.price - base.price) / base.price;
  if (gap <= 0.35) score += 25;
  else if (gap <= 0.6) score += 10;
  else score -= 5;
  return score;
}

export function findRelatedProducts(product: Product, limit = 4): Product[] {
  return catalog
    .map((candidate) => ({ candidate, score: relatedScore(product, candidate) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.candidate);
}

export function findCollectionProducts(product: Product, limit = 4): Product[] {
  if (!product.collectionId) return [];
  return catalog
    .filter((candidate) => candidate.collectionId === product.collectionId && candidate.id !== product.id)
    .filter(isSellable)
    .slice(0, limit);
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug) ?? null;
}

export const getCollectionBySlug = getCollection;

type CollectionRecord = (typeof collections)[number];

export function productMatchesCollection(product: Product, collection: CollectionRecord): boolean {
  if ("smallSpace" in collection && collection.smallSpace) return isSmallSpaceProduct(product);

  const productTypes = "productTypes" in collection ? collection.productTypes : undefined;
  if (productTypes?.length) {
    return Boolean(product.productType && productTypes.includes(product.productType as never));
  }

  const rooms = "rooms" in collection ? collection.rooms : undefined;
  const categories = "categories" in collection ? collection.categories : undefined;
  const productRooms = product.rooms?.length ? product.rooms : [primaryRoom(product)];
  const matchesRoom = rooms?.length ? productRooms.some((room) => (rooms as readonly string[]).includes(room)) : true;
  const matchesCategory = categories?.length
    ? (categories as readonly string[]).includes(product.category)
    : true;
  if (rooms?.length || categories?.length) return matchesRoom && matchesCategory;
  return false;
}

export function listCollectionProducts(slug: string): Product[] {
  const collection = getCollection(slug);
  if (!collection) return [];
  return applyAvailabilityVisibility(catalog.filter((product) => productMatchesCollection(product, collection)));
}

export function collectionSlugForCategory(category: Product["category"]) {
  if (category === "cuisine") return "salon";
  if (category === "salle-de-bain") return "accessoires";
  if (category === "rangement") return "entree-rangement";
  if (category === "maison") return "salon";
  return category;
}

export function collectionSlugForProductPage(product: Product) {
  return collectionSlugForProduct(product);
}

export const listCollectionProductsAlias = listCollectionProducts;

export type ProductFilterOptions = {
  q?: string;
  sort?: string;
  category?: string;
  productType?: string;
  material?: string;
  color?: string;
  maxDepth?: string;
  maxWidth?: string;
  maxHeight?: string;
  maxPrice?: string;
  availability?: string;
};

function parseCmFilter(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function filterAndSortProducts(items: Product[], options: ProductFilterOptions) {
  let result = [...items];
  if (options.category) {
    result = result.filter((p) => p.category === options.category);
  }
  if (options.productType) {
    result = result.filter((p) => p.productType === options.productType);
  }
  if (options.material) {
    result = result.filter((p) => p.material === options.material);
  }
  if (options.color) {
    result = result.filter((p) =>
      (p.variants ?? []).some((variant) => variant.color === options.color),
    );
  }
  const maxDepth = parseCmFilter(options.maxDepth);
  if (maxDepth != null) {
    result = result.filter((p) => {
      const depth = getProductMeasures(p).depthCm;
      return depth != null && depth <= maxDepth;
    });
  }
  const maxWidth = parseCmFilter(options.maxWidth);
  if (maxWidth != null) {
    result = result.filter((p) => {
      const width = getProductMeasures(p).widthCm;
      return width != null && width <= maxWidth;
    });
  }
  const maxHeight = parseCmFilter(options.maxHeight);
  if (maxHeight != null) {
    result = result.filter((p) => {
      const height = getProductMeasures(p).heightCm;
      return height != null && height <= maxHeight;
    });
  }
  const maxPrice = parseCmFilter(options.maxPrice);
  if (maxPrice != null) {
    result = result.filter((p) => p.price <= maxPrice);
  }
  if (options.availability === "available") {
    result = result.filter(isSellable);
  }
  if (options.q) {
    const q = foldSearch(options.q);
    result = result.filter((p) => {
      const measures = getProductMeasures(p);
      const haystack = [
        p.name,
        p.shortDescription,
        p.description,
        p.material ?? "",
        p.dimensions ?? "",
        p.productType ? PRODUCT_TYPE_LABELS[p.productType] : "",
        ...(p.rooms ?? []).map((room) => ROOM_LABELS[room]),
        ...(p.alternateNames ?? []),
        ...p.features,
        ...Object.values(p.specifications),
        measures.widthCm != null ? `${measures.widthCm} cm` : "",
        measures.depthCm != null ? `${measures.depthCm} cm` : "",
        measures.heightCm != null ? `${measures.heightCm} cm` : "",
      ]
        .map(foldSearch)
        .join(" ");
      return haystack.includes(q);
    });
  }
  switch (options.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name, "en"));
      break;
    case "newest":
      result = sortSellableFirst(result);
      break;
    default:
      result = sortSellableFirst(result);
      break;
  }
  return result;
}

export function listFeaturedProducts(limit = 8): Product[] {
  return catalog.filter((product) => product.featured && isSellable(product)).slice(0, limit);
}

export function listSellableProducts(): Product[] {
  return catalog.filter(isSellable);
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat(store.locale, {
    style: "currency",
    currency: store.currency,
  }).format(amount);
}

export function availabilityLabel(status: Product["availabilityStatus"]) {
  switch (status) {
    case "coming_soon":
      return "Coming soon";
    case "available":
      return "Available";
    case "out_of_stock":
      return "Temporarily out of stock";
  }
}
