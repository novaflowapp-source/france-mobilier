import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth, prepareAuth } from "@/lib/auth";
import { publicProRow, updateProCompanyProfile } from "@/lib/pro-access";
import { isValidSiren, lookupSiren, normalizeSiren } from "@/lib/siren";
import { SHIPPING_COUNTRY_CODES, normalizeShippingPostal } from "@/lib/shipping-zone";

const schema = z.object({
  companyName: z.string().trim().min(2).max(180),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  vatNumber: z.string().trim().max(32).optional(),
  website: z.string().trim().max(180).optional(),
  billingLine1: z.string().trim().max(200).optional(),
  billingLine2: z.string().trim().max(200).optional(),
  postalCode: z.string().trim().max(12).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.enum(SHIPPING_COUNTRY_CODES).optional(),
  siren: z.string().trim().max(14).optional(),
});

export async function PATCH(request: Request) {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the fields." }, { status: 400 });
  }

  const data = parsed.data;
  const country = data.country || "US";
  const nextSirenRaw = data.siren ? normalizeSiren(data.siren) : "";
  const french = Boolean(nextSirenRaw && isValidSiren(nextSirenRaw));
  const postalCode = data.postalCode ? normalizeShippingPostal(country, data.postalCode) : data.postalCode;
  if (data.postalCode && !postalCode) {
    return NextResponse.json({ error: "Invalid ZIP code for the selected country." }, { status: 400 });
  }

  const { getProAccessByUserId } = await import("@/lib/pro-access");
  const existing = await getProAccessByUserId(session.user.id);
  if (!existing) return NextResponse.json({ error: "No trade profile found." }, { status: 404 });

  let siren = existing.siren;
  let legalName = existing.legalName;
  let city = data.city || existing.city;
  let status = existing.status;

  if (french) {
    const nextSiren = nextSirenRaw;
    if (nextSiren !== existing.siren) {
      const company = await lookupSiren(nextSiren);
      if (!company) {
        return NextResponse.json(
          { error: "We could not find this company in the Sirene directory. Check the SIREN." },
          { status: 422 },
        );
      }
      if (!company.active) {
        return NextResponse.json(
          { error: "This company is no longer active. Trade access is not available for this SIREN." },
          { status: 422 },
        );
      }
      siren = company.siren;
      legalName = company.legalName;
      city = company.city || city;
      if (existing.status === "approved") {
        status = "pending";
      }
    } else {
      siren = nextSiren;
    }
  } else {
    siren = data.siren ? normalizeSiren(data.siren) : "";
    if (existing.status === "approved") {
      status = "pending";
    }
  }
  if (existing.status === "suspended" || existing.status === "rejected") {
    status = existing.status;
  }

  const row = await updateProCompanyProfile(session.user.id, {
    companyName: data.companyName,
    legalName,
    siren,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    vatNumber: data.vatNumber,
    website: data.website,
    billingLine1: data.billingLine1,
    billingLine2: data.billingLine2,
    postalCode: postalCode || existing.postalCode,
    city,
    country,
    status,
  });
  if (!row) return NextResponse.json({ error: "No trade profile found." }, { status: 404 });
  return NextResponse.json({ ok: true, request: publicProRow(row) });
}
