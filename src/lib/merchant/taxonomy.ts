import type { Product, ProductTypeSlug } from "@/lib/types/commerce";

const PRODUCT_TYPE_PATH: Partial<Record<ProductTypeSlug, string>> = {
  "table-basse": "Home > Living Room > Coffee Tables",
  "meuble-tv": "Home > Living Room > TV Stands",
  "table-appoint": "Home > Living Room > Side Tables",
  "table-a-manger": "Home > Living Room > Dining Tables",
  buffet: "Home > Living Room > Sideboards",
  console: "Home > Living Room > Consoles",
  "table-de-chevet": "Home > Bedroom > Nightstands",
  coiffeuse: "Home > Bedroom > Vanities",
  commode: "Home > Bedroom > Dressers",
  armoire: "Home > Bedroom > Wardrobes",
  banc: "Home > Bedroom > Benches",
  "meuble-chaussures": "Home > Entryway > Shoe Storage",
  casiers: "Home > Entryway > Cubbies",
  bureau: "Home > Office > Desks",
  caisson: "Home > Office > Pedestals",
  etagere: "Home > Storage > Shelving",
};

const GOOGLE_CATEGORY: Partial<Record<ProductTypeSlug, string>> = {
  "table-basse": "Furniture > Living Room Furniture > Coffee Tables",
  "meuble-tv": "Furniture > Living Room Furniture > Entertainment Centers & TV Stands",
  "table-appoint": "Furniture > Living Room Furniture > End Tables",
  "table-a-manger": "Furniture > Kitchen & Dining Furniture > Dining Tables",
  buffet: "Furniture > Living Room Furniture > Sideboards & Buffets",
  console: "Furniture > Living Room Furniture > Console Tables",
  "table-de-chevet": "Furniture > Bedroom Furniture > Nightstands",
  coiffeuse: "Furniture > Bedroom Furniture > Dressers",
  commode: "Furniture > Bedroom Furniture > Dressers",
  armoire: "Furniture > Bedroom Furniture > Armoires & Wardrobes",
  banc: "Furniture > Living Room Furniture",
  "meuble-chaussures": "Furniture > Storage Furniture",
  casiers: "Furniture > Storage Furniture",
  bureau: "Furniture > Office Furniture > Desks",
  caisson: "Furniture > Office Furniture",
  etagere: "Furniture > Storage Furniture > Bookcases",
};

export function merchantProductType(product: Product) {
  const path = product.productType ? PRODUCT_TYPE_PATH[product.productType] : undefined;
  return path ?? "Home > Furniture";
}

export function googleProductCategory(product: Product) {
  const path = product.productType ? GOOGLE_CATEGORY[product.productType] : undefined;
  return path ?? "Furniture";
}
