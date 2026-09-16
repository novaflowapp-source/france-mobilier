import { getDeliveryEstimate } from "@/lib/merchant/delivery";
import { getPublicPrice } from "@/lib/merchant/price";
import { formatLph } from "@/lib/products/merchandising";
import { getProductMeasures, productHeroImage, productGalleryImages } from "@/lib/products/presentation";
import { publicOrigin } from "@/lib/seo";
import type { Product, ProductVariant } from "@/lib/types/commerce";

export type MerchantOffer = {
  id: string;
  itemGroupId: string;
  product: Product;
  variant: ProductVariant | null;
  link: string;
  title: string;
  description: string;
  image: string;
  additionalImages: string[];
  color?: string;
  size?: string;
};

export function merchantOffers(product: Product): MerchantOffer[] {
  const base = publicOrigin();
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return [offerFrom(product, null, base)];
  }
  return variants.map((variant) => offerFrom(product, variant, base));
}

function offerFrom(product: Product, variant: ProductVariant | null, base: string): MerchantOffer {
  const id = variant?.id ?? product.id;
  const link = variant
    ? `${base}/produits/${product.slug}?variant=${encodeURIComponent(variant.id)}`
    : `${base}/produits/${product.slug}`;
  return {
    id,
    itemGroupId: product.id,
    product,
    variant,
    link,
    title: merchantTitle(product, variant),
    description: merchantDescription(product, variant),
    image: merchantImage(product, variant, base),
    additionalImages: additionalMerchantImages(product, variant, base),
    color: variant?.colorLabel,
    size: variant?.sizeLabel,
  };
}

export function merchantTitle(product: Product, variant?: ProductVariant | null) {
  if (product.merchantTitle) {
    return variant ? `${product.merchantTitle} – ${variant.colorLabel}, ${variant.sizeLabel}` : product.merchantTitle;
  }
  const parts = [product.name];
  if (product.material) parts.push(product.material);
  const lph = formatLph(product);
  if (lph && !variant) parts.push(lph);
  if (variant) parts.push(variant.colorLabel, variant.sizeLabel);
  return parts.join(" – ").slice(0, 150);
}

export function merchantDescription(product: Product, variant?: ProductVariant | null) {
  if (product.merchantDescription) return product.merchantDescription;
  const measures = getProductMeasures(product);
  const dims = [
    measures.widthCm != null ? `largeur ${measures.widthCm} cm` : null,
    measures.depthCm != null ? `profondeur ${measures.depthCm} cm` : null,
    measures.heightCm != null ? `hauteur ${measures.heightCm} cm` : null,
  ].filter(Boolean);
  const blocks = [
    product.description,
    product.material ? `Matière : ${product.material}.` : "",
    dims.length ? `Dimensions : ${dims.join(", ")}.` : "",
    variant ? `Variante : ${variant.colorLabel}, ${variant.sizeLabel}.` : "",
    product.madeToOrder ? "Fabriqué après commande, modèle standard non personnalisé." : "",
  ];
  return blocks.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function merchantImage(product: Product, variant: ProductVariant | null, base: string) {
  const src =
    variant?.image ||
    product.imageAssets?.find((asset) => asset.role === "product" && !asset.issues?.length)?.src ||
    productHeroImage(product);
  return src.startsWith("http") ? src : `${base}${src}`;
}

function additionalMerchantImages(product: Product, variant: ProductVariant | null, base: string) {
  const primary = merchantImage(product, variant, base);
  return productGalleryImages(product)
    .map((src) => (src.startsWith("http") ? src : `${base}${src}`))
    .filter((src) => src !== primary)
    .slice(0, 8);
}

export function offerPublicPrice(offer: MerchantOffer) {
  return getPublicPrice(offer.product, offer.variant);
}

export function offerPurchasable(offer: MerchantOffer) {
  return offer.product.availabilityStatus === "available";
}

export function offerIdentifiers(product: Product) {
  const brand = product.brand?.trim() || null;
  const gtin = product.gtin?.trim() || null;
  const mpn = product.mpn?.trim() || null;
  const exists = product.identifierExists ?? Boolean(brand || gtin || mpn);
  return { brand, gtin, mpn, identifierExists: exists };
}

export function offerHasStructuredShipping(product: Product) {
  return getDeliveryEstimate(product).structured;
}
