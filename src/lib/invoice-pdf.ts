import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import { store } from "@/config/store";
import type { InvoiceRow } from "@/lib/invoices";

const NAVY = rgb(11 / 255, 43 / 255, 85 / 255);
const MUTED = rgb(92 / 255, 97 / 255, 112 / 255);
const LINE = rgb(228 / 255, 224 / 255, 216 / 255);

function formatMoney(cents: number) {
  return new Intl.NumberFormat(store.locale, { style: "currency", currency: store.currency }).format(
    cents / 100,
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(store.locale, { dateStyle: "long" }).format(value);
}

export async function buildInvoicePdf(invoice: InvoiceRow) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 800;

  try {
    const logoPath = path.join(process.cwd(), "public", store.logoPath.replace(/^\//, ""));
    if (fs.existsSync(logoPath)) {
      const bytes = fs.readFileSync(logoPath);
      const png = await doc.embedPng(bytes);
      const width = 120;
      const height = (png.height / png.width) * width;
      page.drawImage(png, { x: 48, y: y - height, width, height });
      y -= height + 16;
    }
  } catch {
    page.drawText(store.storeName, { x: 48, y, size: 16, font: bold, color: NAVY });
    y -= 28;
  }

  page.drawText("Invoice", { x: 48, y, size: 22, font: bold, color: NAVY });
  y -= 22;
  page.drawText(invoice.number, { x: 48, y, size: 12, font, color: MUTED });
  y -= 16;
  page.drawText(`Date: ${formatDate(invoice.issuedAt)}`, { x: 48, y, size: 10, font, color: MUTED });
  if (invoice.orderReference) {
    y -= 14;
    page.drawText(`Order: ${invoice.orderReference}`, { x: 48, y, size: 10, font, color: MUTED });
  }

  y -= 28;
  page.drawText("Seller", { x: 48, y, size: 11, font: bold, color: NAVY });
  y -= 16;
  const seller = [
    store.companyName,
    store.companyLegalForm,
    store.companyCity && store.companyPostalCode
      ? `${store.companyPostalCode} ${store.companyCity}`
      : store.companyCity,
    store.companyRegistration,
    "Amounts in USD. Tax is included where applicable; no separate VAT rate is shown.",
  ].filter(Boolean);
  for (const line of seller) {
    page.drawText(String(line), { x: 48, y, size: 10, font, color: MUTED });
    y -= 13;
  }

  y -= 10;
  page.drawText("Customer", { x: 48, y, size: 11, font: bold, color: NAVY });
  y -= 16;
  const buyer = [
    invoice.companyName,
    invoice.siren ? `SIREN ${invoice.siren}` : null,
    invoice.vatNumber ? `VAT ${invoice.vatNumber}` : null,
    invoice.billingLine1,
    [invoice.postalCode, invoice.city].filter(Boolean).join(" "),
    invoice.country,
  ].filter(Boolean);
  for (const line of buyer) {
    page.drawText(String(line), { x: 48, y, size: 10, font, color: MUTED });
    y -= 13;
  }

  y -= 18;
  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 1, color: LINE });
  y -= 18;
  page.drawText("Description", { x: 48, y, size: 10, font: bold, color: NAVY });
  page.drawText("Qty", { x: 360, y, size: 10, font: bold, color: NAVY });
  page.drawText("Total", { x: 470, y, size: 10, font: bold, color: NAVY });
  y -= 8;
  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 1, color: LINE });
  y -= 16;

  for (const item of invoice.items) {
    const name = item.name.length > 48 ? `${item.name.slice(0, 46)}…` : item.name;
    page.drawText(name, { x: 48, y, size: 10, font, color: rgb(0.13, 0.13, 0.13) });
    page.drawText(String(item.quantity), { x: 368, y, size: 10, font, color: MUTED });
    page.drawText(formatMoney(item.unitPriceCents * item.quantity), {
      x: 470,
      y,
      size: 10,
      font,
      color: rgb(0.13, 0.13, 0.13),
    });
    y -= 16;
  }

  y -= 8;
  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 1, color: LINE });
  y -= 22;
  page.drawText("Total", { x: 360, y, size: 12, font: bold, color: NAVY });
  page.drawText(formatMoney(invoice.amountCents), { x: 450, y, size: 12, font: bold, color: NAVY });

  y -= 36;
  page.drawText(`${store.storeName} — ${store.supportEmail}`, {
    x: 48,
    y,
    size: 9,
    font,
    color: MUTED,
  });

  return Buffer.from(await doc.save());
}
