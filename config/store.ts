/**
 * Branding & store configuration — edit this file to rebrand.
 */

const PRODUCTION_SITE_URL = "https://francemobilier.com";

function isLocalHostUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local");
  } catch {
    return true;
  }
}

function publicSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.BETTER_AUTH_URL?.trim();
  const value = (fromEnv || PRODUCTION_SITE_URL).replace(/\/$/, "");
  // Docker build sets BETTER_AUTH_URL=http://localhost:3000. That must not leak into
  // robots.txt / sitemap.xml or Google treats the catalog as unreachable.
  if (process.env.NODE_ENV === "production" && isLocalHostUrl(value)) {
    return PRODUCTION_SITE_URL;
  }
  return value;
}

export const store = {
  storeName: "France Mobilier",
  storeTagline: "Furniture chosen to make everyday rooms more comfortable, spacious, and simple.",
  tagline: "Furniture chosen to make everyday rooms more comfortable, spacious, and simple.",
  domain: publicSiteUrl(),
  supportEmail: process.env.SUPPORT_EMAIL?.trim() || "contact@francemobilier.com",
  /** Hours shown publicly (header, contact). Paris time — the business is based in France. */
  supportHoursShort: "Mon–Fri 10am–10pm Paris time",
  supportHours: "Monday–Friday, 10:00 a.m.–10:00 p.m. (Paris time)",
  country: "US",
  currency: "USD",
  locale: "en-US",
  logoPath: "/logo-france-mobilier.png",
  /** Legal name shown publicly: DPSP. */
  companyName: "DPSP",
  companyLegalForm: "Sole proprietorship (France)",
  companyTradeName: "DPSP",
  companyAddress: "75B Rue Chazière",
  companyCity: "Lyon",
  companyPostalCode: "69004",
  companyCountry: "France",
  companySiren: "882 131 071",
  companySiret: "882 131 071 00038",
  companyRegistration: "SIREN 882 131 071 — SIRET 882 131 071 00038",
  companyNaf: "47.91B — Distance selling on specialized catalog",
  vatNumber: "",
  phone: "",
  returnAddress: "",
  socials: {
    instagram: "",
    facebook: "",
    pinterest: "",
  },
} as const;

export const navigationGroups = [
  { href: "/new", label: "New" },
  {
    href: "/collections/living-room",
    label: "Living room",
    children: [
      { href: "/collections/coffee-tables", label: "Coffee tables" },
      { href: "/collections/tv-stands", label: "TV stands" },
      { href: "/collections/dining-tables", label: "Dining tables" },
      { href: "/collections/sideboards", label: "Sideboards" },
      { href: "/collections/consoles", label: "Consoles" },
    ],
  },
  {
    href: "/collections/bedroom",
    label: "Bedroom",
    children: [
      { href: "/collections/nightstands", label: "Nightstands" },
      { href: "/collections/vanities", label: "Vanities" },
      { href: "/collections/dressers", label: "Dressers" },
      { href: "/collections/wardrobes", label: "Wardrobes" },
    ],
  },
  {
    href: "/collections/entry-storage",
    label: "Entry & storage",
    children: [
      { href: "/collections/shoe-storage", label: "Shoe storage" },
      { href: "/collections/cubbies", label: "Cubbies" },
      { href: "/collections/consoles", label: "Consoles" },
    ],
  },
  {
    href: "/collections/office",
    label: "Office",
    children: [
      { href: "/collections/desks", label: "Desks" },
      { href: "/collections/pedestals", label: "Pedestals" },
    ],
  },
  { href: "/collections/small-spaces", label: "Small spaces" },
] as const;

export const navigation = navigationGroups.map(({ href, label }) => ({ href, label }));

export const secondaryNavigation = [
  { href: "/collections/furniture", label: "All furniture" },
  { href: "/guides", label: "Guides" },
  { href: "/collections/pets", label: "Pets" },
  { href: "/trade", label: "Trade" },
  { href: "/contact", label: "Contact" },
] as const;

export const collections = [
  {
    slug: "living-room",
    name: "Living room",
    description: "Tables, TV stands, and pieces chosen to make the living room easier to live in.",
    rooms: ["living-room"] as const,
    image: "/lifestyle/maison.jpg",
  },
  {
    slug: "bedroom",
    name: "Bedroom",
    description: "Nightstands, vanities, and compact pieces to organize the bedroom.",
    rooms: ["bedroom"] as const,
    image: "/lifestyle/marque.jpg",
  },
  {
    slug: "entry-storage",
    name: "Entry & storage",
    description: "Practical furniture for organizing the entryway and making the most of narrow spaces.",
    rooms: ["entry"] as const,
    image: "/lifestyle/rangement.jpg",
  },
  {
    slug: "office",
    name: "Office",
    description: "Desks and storage for working from home with ease.",
    rooms: ["office"] as const,
    image: "/lifestyle/bureau.jpg",
  },
  {
    slug: "small-spaces",
    name: "Small spaces",
    description: "Furniture selected to add comfort without crowding the room.",
    smallSpace: true,
    image: "/lifestyle/petits-espaces.jpg",
  },
  {
    slug: "furniture",
    name: "All furniture",
    description: "The France Mobilier collection.",
    rooms: ["living-room", "bedroom", "entry", "office"] as const,
    secondary: true,
  },
  {
    slug: "coffee-tables",
    name: "Coffee tables",
    description: "Compact coffee tables for living rooms where every inch counts.",
    productTypes: ["coffee-table"] as const,
    secondary: true,
  },
  {
    slug: "tv-stands",
    name: "TV stands",
    description: "Shallow TV stands that sit close to the wall.",
    productTypes: ["tv-stand"] as const,
    secondary: true,
  },
  {
    slug: "dining-tables",
    name: "Dining tables",
    description: "Extendable dining tables for rooms that need to stay flexible.",
    productTypes: ["dining-table"] as const,
    secondary: true,
  },
  {
    slug: "nightstands",
    name: "Nightstands",
    description: "Nightstands with clear dimensions, for compact bedrooms.",
    productTypes: ["nightstand"] as const,
    secondary: true,
  },
  {
    slug: "vanities",
    name: "Vanities",
    description: "Vanities chosen for everyday use and a manageable footprint.",
    productTypes: ["vanity"] as const,
    secondary: true,
  },
  {
    slug: "shoe-storage",
    name: "Shoe storage",
    description: "Shoe cabinets selected to organize the entry, including narrow halls.",
    productTypes: ["shoe-storage"] as const,
    secondary: true,
  },
  {
    slug: "cubbies",
    name: "Cubbies",
    description: "Shallow cubby units that line up along a wall.",
    productTypes: ["cubbies"] as const,
    secondary: true,
  },
  {
    slug: "sideboards",
    name: "Sideboards",
    description: "Low sideboards that sit flush along the wall.",
    productTypes: ["sideboard"] as const,
    secondary: true,
  },
  {
    slug: "consoles",
    name: "Consoles",
    description: "Shallow consoles for the living room or entry.",
    productTypes: ["console"] as const,
    secondary: true,
  },
  {
    slug: "dressers",
    name: "Dressers",
    description: "Dressers for a more organized, calmer bedroom.",
    productTypes: ["dresser"] as const,
    secondary: true,
  },
  {
    slug: "wardrobes",
    name: "Wardrobes",
    description: "Narrow wardrobes for apartment bedrooms.",
    productTypes: ["wardrobe"] as const,
    secondary: true,
  },
  {
    slug: "desks",
    name: "Desks",
    description: "Compact desks for working from home with ease.",
    productTypes: ["desk"] as const,
    secondary: true,
  },
  {
    slug: "pedestals",
    name: "Pedestals",
    description: "Pedestal storage beside the desk so the work surface stays clear.",
    productTypes: ["pedestal"] as const,
    secondary: true,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Accessories to finish a piece of furniture.",
    rooms: ["accessories"] as const,
    secondary: true,
  },
  {
    slug: "pets",
    name: "Pets",
    description: "Practical pieces that sit comfortably in the home.",
    categories: ["pets"] as const,
    rooms: ["accessories"] as const,
    secondary: true,
    image: "/lifestyle/animaux.jpg",
  },
] as const;
