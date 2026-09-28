import type { Product, ProductTypeSlug } from "@/lib/types/commerce";

const PRODUCT_TYPE_PATH: Partial<Record<ProductTypeSlug, string>> = {
  "coffee-table": "Home > Living Room > Coffee Tables",
  "tv-stand": "Home > Living Room > TV Stands",
  "side-table": "Home > Living Room > Side Tables",
  "dining-table": "Home > Living Room > Dining Tables",
  sideboard: "Home > Living Room > Sideboards",
  console: "Home > Living Room > Consoles",
  nightstand: "Home > Bedroom > Nightstands",
  vanity: "Home > Bedroom > Vanities",
  dresser: "Home > Bedroom > Dressers",
  wardrobe: "Home > Bedroom > Wardrobes",
  bench: "Home > Bedroom > Benches",
  "shoe-storage": "Home > Entryway > Shoe Storage",
  cubbies: "Home > Entryway > Cubbies",
  desk: "Home > Office > Desks",
  pedestal: "Home > Office > Pedestals",
  shelf: "Home > Storage > Shelving",
};

const GOOGLE_CATEGORY: Partial<Record<ProductTypeSlug, string>> = {
  "coffee-table": "Furniture > Living Room Furniture > Coffee Tables",
  "tv-stand": "Furniture > Living Room Furniture > Entertainment Centers & TV Stands",
  "side-table": "Furniture > Living Room Furniture > End Tables",
  "dining-table": "Furniture > Kitchen & Dining Furniture > Dining Tables",
  sideboard: "Furniture > Living Room Furniture > Sideboards & Buffets",
  console: "Furniture > Living Room Furniture > Console Tables",
  nightstand: "Furniture > Bedroom Furniture > Nightstands",
  vanity: "Furniture > Bedroom Furniture > Dressers",
  dresser: "Furniture > Bedroom Furniture > Dressers",
  wardrobe: "Furniture > Bedroom Furniture > Armoires & Wardrobes",
  bench: "Furniture > Living Room Furniture",
  "shoe-storage": "Furniture > Storage Furniture",
  cubbies: "Furniture > Storage Furniture",
  desk: "Furniture > Office Furniture > Desks",
  pedestal: "Furniture > Office Furniture",
  shelf: "Furniture > Storage Furniture > Bookcases",
};

export function merchantProductType(product: Product) {
  const path = product.productType ? PRODUCT_TYPE_PATH[product.productType] : undefined;
  return path ?? "Home > Furniture";
}

export function googleProductCategory(product: Product) {
  const path = product.productType ? GOOGLE_CATEGORY[product.productType] : undefined;
  return path ?? "Furniture";
}
