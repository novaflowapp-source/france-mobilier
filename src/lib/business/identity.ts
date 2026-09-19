import { store } from "@/config/store";

export type BusinessIdentity = {
  storeName: string;
  legalName: string;
  legalForm: string;
  streetAddress: string | null;
  postalCode: string;
  city: string;
  country: string;
  countryCode: "FR";
  siren: string;
  siret: string;
  registration: string;
  naf: string;
  vatNumber: string | null;
  phone: string | null;
  email: string;
  hours: string;
  hoursShort: string;
  relationship: string;
  domain: string;
  url: string;
};

function envValue(name: string) {
  return process.env[name]?.trim() || "";
}

function streetLineOnly(raw: string, postal: string, city: string) {
  let street = raw.trim();
  if (postal && street.includes(postal)) {
    street = street.slice(0, street.indexOf(postal)).replace(/[,\s]+$/, "").trim();
  } else if (city && new RegExp(`,\\s*${city}\\s*$`, "i").test(street)) {
    street = street.replace(new RegExp(`,\\s*${city}\\s*$`, "i"), "").trim();
  }
  return street;
}

export function getBusinessIdentity(): BusinessIdentity {
  const rawStreet = envValue("BUSINESS_STREET_ADDRESS") || store.companyAddress || "";
  const street = rawStreet ? streetLineOnly(rawStreet, store.companyPostalCode, store.companyCity) : "";
  const phone = envValue("BUSINESS_PHONE") || store.phone || "";
  return {
    storeName: store.storeName,
    legalName: store.companyName,
    legalForm: store.companyLegalForm,
    streetAddress: street || null,
    postalCode: store.companyPostalCode,
    city: store.companyCity,
    country: store.companyCountry,
    countryCode: "FR",
    siren: store.companySiren,
    siret: store.companySiret,
    registration: store.companyRegistration,
    naf: store.companyNaf,
    vatNumber: store.vatNumber || null,
    phone: phone || null,
    email: store.supportEmail,
    hours: store.supportHours,
    hoursShort: store.supportHoursShort,
    relationship: `${store.storeName} est une boutique en ligne exploitée par ${store.companyName}.`,
    domain: store.domain.replace(/^https?:\/\//, ""),
    url: store.domain.replace(/\/$/, ""),
  };
}

export function formatStreetPostalCity(identity = getBusinessIdentity()) {
  return [identity.streetAddress, [identity.postalCode, identity.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

export function formatPublicAddress(identity = getBusinessIdentity()) {
  return [formatStreetPostalCity(identity), identity.country].filter(Boolean).join(", ");
}

export function organizationJsonLd(identity = getBusinessIdentity()) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: identity.storeName,
    legalName: identity.legalName,
    url: identity.url,
    email: identity.email,
    logo: `${identity.url}${store.logoPath}`,
    taxID: identity.siren,
    ...(identity.phone ? { telephone: identity.phone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(identity.streetAddress ? { streetAddress: identity.streetAddress } : {}),
      postalCode: identity.postalCode,
      addressLocality: identity.city,
      addressCountry: identity.countryCode,
    },
  };
}
