export type AvailabilityStatus = "coming_soon" | "available" | "out_of_stock";

export type ProductCategory =
  | "home"
  | "storage"
  | "office"
  | "kitchen"
  | "bathroom"
  | "pets";

export type ProductRoom = "living-room" | "bedroom" | "entry" | "office" | "accessories";

export type ProductTypeSlug =
  | "coffee-table"
  | "tv-stand"
  | "side-table"
  | "dining-table"
  | "nightstand"
  | "vanity"
  | "shoe-storage"
  | "cubbies"
  | "shelf"
  | "desk"
  | "stand"
  | "organizer"
  | "cart"
  | "storage"
  | "pet-furniture"
  | "sideboard"
  | "console"
  | "dresser"
  | "wardrobe"
  | "pedestal"
  | "bench";

export type ProductImageIssue =
  | "chinese_text"
  | "supplier_logo"
  | "watermark"
  | "foreign_marketing"
  | "embedded_commercial"
  | "supplier_diagram";

export type ProductImageRole = "lifestyle" | "product" | "detail" | "dimensions";

export type ProductImageAsset = {
  src: string;
  role?: ProductImageRole;
  issues?: ProductImageIssue[];
  replaceWhenPossible?: boolean;
  notes?: string;
};

export type ProductDailyUse = {
  title: string;
  text: string;
};

export type ProductFaqItem = {
  question: string;
  answer: string;
};

export type ProductMeasures = {
  widthCm?: number;
  depthCm?: number;
  heightCm?: number;
  usefulHeightCm?: number;
  legHeightCm?: number;
  cabinetHeightCm?: number;
  crossbarFromFloorCm?: number;
};

export type ProductColor = string;

export type ProductVariant = {
  id: string;
  color: ProductColor;
  colorLabel: string;
  swatchClass?: string;
  sizeCm: number;
  sizeLabel: string;
  price: number;
  compareAtPrice: number | null;
  supplierVariantId: string | null;
  weightKg?: number;
  image?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Extra names for JSON-LD `alternateName` (search variants, not a second page). */
  alternateNames?: string[];
  category: ProductCategory;
  /** Room merchandising. A product can belong to more than one room. */
  rooms?: ProductRoom[];
  productType?: ProductTypeSlug;
  /** Customer-facing material. Only when known — never infer a wood species. */
  material?: string;
  smallSpaceFriendly?: boolean;
  extensible?: boolean;
  modular?: boolean;
  featured?: boolean;
  /** Named visual collection only when products truly match. */
  collectionId?: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  variants?: ProductVariant[];
  defaultVariantId?: string;
  formatsLabel?: string;
  sizesLabel?: string;
  images: string[];
  /** Metadata for gallery assets. Does not replace `images` order; used to flag supplier files. */
  imageAssets?: ProductImageAsset[];
  features: string[];
  /** Short above-the-fold benefits. Falls back to `features`. */
  benefits?: string[];
  /** “Pourquoi vous allez l’aimer” — not a spec dump. */
  highlights?: string[];
  /** “Pensé pour votre quotidien” — usage, not technical rows. */
  dailyUses?: ProductDailyUse[];
  faq?: ProductFaqItem[];
  specifications: Record<string, string>;
  measures?: ProductMeasures;
  madeToOrder?: boolean;
  /** Truly customized for one customer — not the same as made-to-order. */
  customizedForCustomer?: boolean;
  returnEligible?: boolean;
  handlingMinBusinessDays?: number;
  handlingMaxBusinessDays?: number;
  transitMinBusinessDays?: number;
  transitMaxBusinessDays?: number;
  brand?: string;
  gtin?: string;
  mpn?: string;
  identifierExists?: boolean;
  merchantTitle?: string;
  merchantDescription?: string;
  merchantTitleSource?: "human" | "ai" | "mixed";
  merchantDescriptionSource?: "human" | "ai" | "mixed";
  availabilityStatus: AvailabilityStatus;
  supplierProvider: "buckydrop" | "manual" | null;
  supplierProductId: string | null;
  supplierVariantId: string | null;
  weight: number | null;
  dimensions: string | null;
  shippingMinDays: number | null;
  shippingMaxDays: number | null;
  professionalEligible?: boolean;
  quoteEligible?: boolean;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "supplier_ordered"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type Customer = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
};

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  supplierProvider: "buckydrop" | "manual" | null;
  supplierProductId: string | null;
  supplierVariantId: string | null;
};

export type Tracking = {
  shippingProvider: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

export type Fulfillment = {
  status: "pending" | "submitted" | "shipped" | "delivered" | "failed";
  provider: "buckydrop" | "manual" | null;
  providerOrderId: string | null;
  tracking: Tracking;
};

export type Order = {
  orderId: string;
  status: OrderStatus;
  customer: Customer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  currency: "USD";
  subtotal: number;
  shippingTotal: number;
  total: number;
  fulfillment: Fulfillment;
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
};
