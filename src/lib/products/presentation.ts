import type {
  Product,
  ProductFaqItem,
  ProductImageAsset,
  ProductMeasures,
} from "@/lib/types/commerce";
import { deliveryCustomerLabel } from "@/lib/merchant/delivery";
import { SHIPPING_ZONE_LABEL } from "@/lib/shipping-zone";

const PARSED_DIMENSION_KEYS =
  /^(largeur|width|hauteur|height|profondeur|depth|pieds|legs|caisson|cabinet|traverse|crossbar|hauteur des pieds|leg height|hauteur utile|useful height)$/i;
const EXTRA_DIMENSION_KEYS = /^(hauteur min\/max|min\/max height|plateau|top|module)$/i;

function formatLengthCm(cm: number) {
  const inches = Math.round((cm / 2.54) * 10) / 10;
  return `${inches} in (${cm} cm)`;
}

export function getImageAsset(product: Product, src: string): ProductImageAsset | undefined {
  return product.imageAssets?.find((asset) => asset.src === src);
}

export function isSupplierDiagram(product: Product, src: string) {
  const asset = getImageAsset(product, src);
  return asset?.role === "dimensions" || Boolean(asset?.issues?.includes("supplier_diagram"));
}

export function hasImageIssues(product: Product, src: string) {
  return Boolean(getImageAsset(product, src)?.issues?.length);
}

function parseCmValue(raw: string): number | undefined {
  const exact = raw.trim().match(/^(\d+(?:[.,]\d+)?)\s*cm$/i);
  if (exact) return Number(exact[1].replace(",", "."));
  const loose = raw.trim().match(/^(\d+(?:[.,]\d+)?)\s*cm\b/i);
  if (loose && !/[–-]/.test(raw)) return Number(loose[1].replace(",", "."));
  return undefined;
}

export function getProductMeasures(product: Product): ProductMeasures {
  const fromSpecs: ProductMeasures = {};
  for (const [key, value] of Object.entries(product.specifications)) {
    const cm = parseCmValue(value);
    if (cm == null) continue;
    const normalized = key.toLowerCase();
    if (normalized === "largeur" || normalized === "width") fromSpecs.widthCm = cm;
    else if (normalized === "profondeur" || normalized === "depth") fromSpecs.depthCm = cm;
    else if (normalized === "hauteur" || normalized === "height") fromSpecs.heightCm = cm;
    else if (
      normalized === "pieds" ||
      normalized === "hauteur des pieds" ||
      normalized === "legs" ||
      normalized === "leg height"
    ) {
      fromSpecs.legHeightCm = cm;
    } else if (normalized === "caisson" || normalized === "cabinet") fromSpecs.cabinetHeightCm = cm;
    else if (normalized === "traverse" || normalized === "crossbar") fromSpecs.crossbarFromFloorCm = cm;
    else if (normalized === "hauteur utile" || normalized === "useful height") fromSpecs.usefulHeightCm = cm;
  }
  return { ...fromSpecs, ...product.measures };
}

export function measureEntries(product: Product): { label: string; value: string }[] {
  const measures = getProductMeasures(product);
  const rows: { label: string; value: string }[] = [];
  if (measures.widthCm != null) rows.push({ label: "Width", value: formatLengthCm(measures.widthCm) });
  if (measures.depthCm != null) rows.push({ label: "Depth", value: formatLengthCm(measures.depthCm) });
  if (measures.heightCm != null) rows.push({ label: "Height", value: formatLengthCm(measures.heightCm) });
  if (measures.usefulHeightCm != null) {
    rows.push({ label: "Useful height", value: formatLengthCm(measures.usefulHeightCm) });
  }
  if (measures.cabinetHeightCm != null) {
    rows.push({ label: "Cabinet height", value: formatLengthCm(measures.cabinetHeightCm) });
  }
  if (measures.legHeightCm != null) rows.push({ label: "Leg height", value: formatLengthCm(measures.legHeightCm) });
  if (measures.crossbarFromFloorCm != null) {
    rows.push({ label: "Crossbar (from floor)", value: formatLengthCm(measures.crossbarFromFloorCm) });
  }
  for (const [key, value] of Object.entries(product.specifications)) {
    if (!value.trim()) continue;
    if (EXTRA_DIMENSION_KEYS.test(key)) rows.push({ label: key, value });
    else if (PARSED_DIMENSION_KEYS.test(key) && parseCmValue(value) == null) {
      rows.push({ label: key, value });
    }
  }
  return rows;
}

export function canDrawDiagram(product: Product) {
  const measures = getProductMeasures(product);
  return measures.widthCm != null && measures.heightCm != null;
}

export function productGalleryImages(product: Product): string[] {
  const hideDiagram = canDrawDiagram(product);
  const visible = product.images.filter((src) => !(hideDiagram && isSupplierDiagram(product, src)));
  return [...visible].sort((a, b) => {
    const flaggedA = hasImageIssues(product, a) ? 1 : 0;
    const flaggedB = hasImageIssues(product, b) ? 1 : 0;
    return flaggedA - flaggedB;
  });
}

export function productHeroImage(product: Product): string {
  return productGalleryImages(product)[0] ?? product.images[0] ?? "";
}

export function productBenefits(product: Product): string[] {
  return (product.benefits ?? product.features).slice(0, 4);
}

export function productHighlights(product: Product): string[] {
  return (product.highlights ?? []).slice(0, 4);
}

export function deliveryLabel(product: Product): string | null {
  return deliveryCustomerLabel(product);
}

export function specificationRows(product: Product): [string, string][] {
  const dimsShown = measureEntries(product).length > 0;
  return Object.entries(product.specifications).filter(([key, value]) => {
    if (!value.trim() || /^(non renseigné|not specified)$/i.test(value)) return false;
    if (dimsShown && (PARSED_DIMENSION_KEYS.test(key) || EXTRA_DIMENSION_KEYS.test(key))) return false;
    return true;
  });
}

export function productFaqItems(product: Product): ProductFaqItem[] {
  const items: ProductFaqItem[] = [...(product.faq ?? [])];
  const knownQuestions = new Set(items.map((item) => item.question.toLowerCase()));
  const add = (question: string, answer: string) => {
    if (knownQuestions.has(question.toLowerCase())) return;
    items.push({ question, answer });
    knownQuestions.add(question.toLowerCase());
  };

  const dims = measureEntries(product);
  if (dims.length > 0) {
    add("What are the dimensions?", dims.map((row) => `${row.label}: ${row.value}`).join(" · "));
  } else if (product.dimensions) {
    add("What are the dimensions?", product.dimensions);
  }

  const delivery = deliveryLabel(product);
  if (delivery) {
    add(
      "How long does shipping take?",
      product.madeToOrder
        ? `This piece is made after you order. ${delivery.charAt(0).toUpperCase()}${delivery.slice(1)}. We do not give a fixed delivery date.`
        : `${delivery.charAt(0).toUpperCase()}${delivery.slice(1)}.`,
    );
  }

  if (product.features.some((feature) => /montage|assembl/i.test(feature))) {
    add("Does it ship assembled?", "Some assembly is required. Details are listed in the specifications.");
  }

  add("Where do you ship?", `We ship to ${SHIPPING_ZONE_LABEL}, with tracking.`);
  add("How do I track my order?", "A tracking number is emailed after the package ships, when the carrier provides one.");
  add(
    "Can I return it?",
    "You can return unused items within 14 days of delivery. See the Returns page for how to start a return.",
  );

  return items;
}
