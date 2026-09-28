import nodemailer from "nodemailer";
import { store } from "@/config/store";
import { SHIPPING_OFFERED_SENTENCE, shippingCountryName } from "@/lib/shipping-zone";

export function isMailConfigured() {
  if (process.env.RESEND_API_KEY?.trim()) return true;
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

function fromAddress() {
  return (
    process.env.MAIL_FROM?.trim() || `France Mobilier <${store.supportEmail}>`
  );
}

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!isMailConfigured()) return false;
  const to = input.to.trim().toLowerCase();
  if (!to) return false;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [to],
        reply_to: store.supportEmail,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[mail] resend failed", res.status, detail.slice(0, 400));
      return false;
    }
    return true;
  }

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return false;

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: fromAddress(),
    to,
    replyTo: store.supportEmail,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  return true;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat(store.locale, { style: "currency", currency: store.currency }).format(
    cents / 100,
  );
}

const NAVY = "#0b2b55";
const CREAM = "#f7f5f1";
const MUTED = "#5c6170";
const BORDER = "#e4e0d8";
const LOGO_URL = `${store.domain.replace(/\/$/, "")}${store.logoPath}`;

function emailButton(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${NAVY};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;padding:12px 22px;border-radius:6px">${escapeHtml(label)}</a>`;
}

/** Customer email HTML layout — logo, brand colors, Gmail-friendly. */
function layoutCustomerEmail(input: { preheader: string; title: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;">
        <tr>
          <td align="center" style="padding:28px 32px 20px;border-bottom:1px solid ${BORDER};">
            <a href="${escapeHtml(store.domain)}" style="text-decoration:none">
              <img src="${escapeHtml(LOGO_URL)}" alt="${escapeHtml(store.storeName)}" width="168" style="display:block;width:168px;height:auto;border:0;margin:0 auto">
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;font-family:Georgia,'Times New Roman',serif;color:#222222;">
            ${input.body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${MUTED};border-top:1px solid ${BORDER};">
            ${escapeHtml(store.supportEmail)} — ${escapeHtml(store.supportHoursShort)}<br>
            ${escapeHtml(store.storeName)} · ${escapeHtml(store.companyCity)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export type OrderPaidEmail = {
  email: string;
  name: string;
  reference: string;
  amountCents: number;
  phone?: string | null;
  line1: string;
  postalCode: string;
  city: string;
  country?: string | null;
  items: { name: string; quantity: number; unitPriceCents: number }[];
  viewUrl: string;
  loginUrl: string;
  testMode: boolean;
  temporaryPassword?: string | null;
  companyName?: string | null;
  siren?: string | null;
  invoicesUrl?: string | null;
};

export function buildOrderPaidEmail(order: OrderPaidEmail) {
  const lines = order.items
    .map(
      (item) =>
        `${item.name} × ${item.quantity} — ${formatMoney(item.unitPriceCents * item.quantity)}`,
    )
    .join("\n");
  const subject = order.testMode
    ? `Test order ${order.reference} — ${store.storeName}`
    : `Order ${order.reference} — ${store.storeName}`;
  const intro = order.testMode
    ? "Test payment recorded. No real charge was made."
    : "We have received your payment.";
  const destination = `${order.line1}, ${order.postalCode} ${order.city}${
    order.country ? `, ${shippingCountryName(order.country)}` : ""
  }${order.phone ? `, ${order.phone}` : ""}`;
  const text = [
    `Hello ${order.name},`,
    "",
    intro,
    `Reference: ${order.reference}`,
    `Total: ${formatMoney(order.amountCents)}`,
    "",
    lines,
    "",
    `Shipping: ${destination}`,
    ...(order.companyName && order.siren
      ? [`Business invoice: ${order.companyName} (SIREN ${order.siren})`]
      : []),
    `View order: ${order.viewUrl}`,
    ...(order.invoicesUrl ? [`Your invoices: ${order.invoicesUrl}`] : []),
    "",
    ...(order.temporaryPassword
      ? [
          "An account was created so you can track orders:",
          `Sign-in email: ${order.email}`,
          `Temporary password: ${order.temporaryPassword}`,
          `Sign in: ${order.loginUrl}`,
          "After signing in, change this password in My account.",
          "",
        ]
      : []),
    `${SHIPPING_OFFERED_SENTENCE} We will email you when preparation is complete, then again when your package ships.`,
    `Support: ${store.supportEmail}`,
  ].join("\n");

  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222">${escapeHtml(item.name)} × ${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;text-align:right">${formatMoney(item.unitPriceCents * item.quantity)}</td>
        </tr>`,
    )
    .join("");

  const accountBlock = order.temporaryPassword
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;background:${CREAM};border:1px solid ${BORDER};border-radius:8px">
        <tr>
          <td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#222">
            <strong>Your account</strong><br>
            Sign-in email: ${escapeHtml(order.email)}<br>
            Temporary password: ${escapeHtml(order.temporaryPassword)}<br>
            <span style="color:${MUTED};font-size:13px">After signing in, change this password in My account.</span>
            <div style="margin-top:14px">${emailButton(order.loginUrl, "Sign in")}</div>
          </td>
        </tr>
      </table>`
    : "";

  const body = `
    ${
      order.testMode
        ? `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${NAVY};background:${CREAM};border:1px solid ${BORDER};border-radius:8px;padding:10px 14px">Test payment — no real charge.</p>`
        : ""
    }
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY}">Order confirmed</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">Hello ${escapeHtml(order.name)},<br>${escapeHtml(intro)}</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      <strong>Reference ${escapeHtml(order.reference)}</strong><br>
      Total ${formatMoney(order.amountCents)}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px">${rows}</table>
    <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:${MUTED}">
      Shipping: ${escapeHtml(destination)}
      ${
        order.companyName && order.siren
          ? `<br>Business invoice: ${escapeHtml(order.companyName)} (SIREN ${escapeHtml(order.siren)})`
          : ""
      }
    </p>
    <p style="margin:0 0 8px">${emailButton(order.viewUrl, "View order")}</p>
    ${
      order.invoicesUrl
        ? `<p style="margin:0 0 8px">${emailButton(order.invoicesUrl, "Download invoice")}</p>`
        : ""
    }
    ${accountBlock}
    <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:${MUTED}">${escapeHtml(SHIPPING_OFFERED_SENTENCE)} We will email you when preparation is complete, then again when your package ships.</p>
  `;

  return {
    subject,
    text,
    html: layoutCustomerEmail({
      preheader: `${intro} Reference ${order.reference}.`,
      title: subject,
      body,
    }),
  };
}

export async function sendOrderPaidEmail(order: OrderPaidEmail) {
  const built = buildOrderPaidEmail(order);
  return sendMail({ to: order.email, subject: built.subject, text: built.text, html: built.html });
}

export async function sendProAccessActivatedEmail(input: {
  email: string;
  firstName?: string | null;
  companyName: string;
  siren?: string | null;
}) {
  const accountUrl = `${store.domain.replace(/\/$/, "")}/account`;
  const greeting = input.firstName?.trim() ? `Hello ${input.firstName.trim()},` : "Hello,";
  const subject = "Your France Mobilier Pro access is active";
  const text = [
    greeting,
    "",
    "Your France Mobilier professional access is now active.",
    input.siren
      ? `Company: ${input.companyName} (SIREN ${input.siren}).`
      : `Company: ${input.companyName}.`,
    "Sign in to manage your business details, view orders, and request quotes for your projects.",
    `Account: ${accountUrl}`,
    "",
    "Best regards,",
    store.storeName,
  ].join("\n");
  const html = layoutCustomerEmail({
    preheader: "Your professional access is active.",
    title: subject,
    body: `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY}">Professional access activated</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      Your France Mobilier professional access is now active.
    </p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      ${escapeHtml(input.companyName)}${input.siren ? `<br>SIREN ${escapeHtml(input.siren)}` : ""}
    </p>
    <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      Sign in to manage your details, view orders, and request quotes.
    </p>
    <p style="margin:0">${emailButton(accountUrl, "Open my account")}</p>
    `,
  });
  return sendMail({ to: input.email, subject, text, html });
}

export async function sendProAccessRequestEmails(input: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName: string;
  phone?: string | null;
  siren?: string | null;
  vatNumber?: string | null;
  activity?: string | null;
  volume?: string | null;
  status: string;
}) {
  const greeting = input.firstName?.trim() ? `Hello ${input.firstName.trim()},` : "Hello,";
  if (input.status === "pending") {
    const clientSubject = "Your France Mobilier Pro request";
    await sendMail({
      to: input.email,
      subject: clientSubject,
      text: [
        greeting,
        "",
        "We have received your France Mobilier professional access request.",
        "Your application is being reviewed.",
        "You will receive an email as soon as your professional access is activated.",
        "",
        store.storeName,
      ].join("\n"),
      html: layoutCustomerEmail({
        preheader: "Your professional request is under review.",
        title: clientSubject,
        body: `
        <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY}">Request received</p>
        <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">${escapeHtml(greeting)}</p>
        <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
          We have received your France Mobilier professional access request.
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
          Your application is being reviewed. You will receive an email as soon as your professional access is activated.
        </p>
        `,
      }),
    });
  }

  const { b2bConfig } = await import("@/lib/b2b");
  const adminTo = b2bConfig().salesEmail;
  const adminUrl = `${store.domain.replace(/\/$/, "")}/admin/professionals`;
  const adminLines = [
    `Name: ${[input.firstName, input.lastName].filter(Boolean).join(" ") || "—"}`,
    `Company: ${input.companyName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "—"}`,
    `SIREN: ${input.siren || "—"}`,
    `VAT: ${input.vatNumber || "—"}`,
    `Activity: ${input.activity || "—"}`,
    `Estimated volume: ${input.volume || "—"}`,
    `Status: ${input.status}`,
    `Date: ${new Date().toLocaleString(store.locale)}`,
    adminUrl,
  ];
  await sendMail({
    to: adminTo,
    subject: "New France Mobilier Pro request",
    text: adminLines.join("\n"),
    html: `<p>${adminLines.map((line) => escapeHtml(line)).join("<br>")}</p>`,
  });
}

export async function sendWelcomeEmail(input: { email: string; name?: string | null }) {
  const accountUrl = `${store.domain.replace(/\/$/, "")}/account`;
  const catalogUrl = `${store.domain.replace(/\/$/, "")}/collections/meubles`;
  const greeting = input.name?.trim() ? `Hello ${input.name.trim()},` : "Hello,";
  const subject = `Welcome to ${store.storeName}`;
  const text = [
    greeting,
    "",
    `Your ${store.storeName} account is ready.`,
    "Track orders, save your details, and browse furniture from your account.",
    "If you have not ordered yet, promo code WELCOME gives 10% off your entire first order, once per US phone number.",
    `My account: ${accountUrl}`,
    `Shop furniture: ${catalogUrl}`,
    "",
    `Questions? ${store.supportEmail} — ${store.supportHoursShort}.`,
    "",
    store.storeName,
  ].join("\n");
  const html = layoutCustomerEmail({
    preheader: `Your ${store.storeName} account is ready.`,
    title: subject,
    body: `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY}">Welcome</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      Your ${escapeHtml(store.storeName)} account is ready. Track orders, save your details, and browse our furniture from your account. If you have not ordered yet, promo code WELCOME gives 10% off your entire first order, once per US phone number.
    </p>
    <p style="margin:0 0 8px">${emailButton(accountUrl, "Open my account")}</p>
    <p style="margin:0">${emailButton(catalogUrl, "Browse furniture")}</p>
    `,
  });
  return sendMail({ to: input.email, subject, text, html });
}

export async function sendPasswordResetEmail(input: { email: string; url: string }) {
  const subject = `Reset your password — ${store.storeName}`;
  const text = [
    "You asked to reset your account password.",
    "Open this link to choose a new one. It expires in one hour.",
    input.url,
    "If you did not request this, you can ignore this email.",
  ].join("\n");
  const html = layoutCustomerEmail({
    preheader: "Link to choose a new password.",
    title: subject,
    body: `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY}">New password</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      You asked to reset the password for your ${escapeHtml(store.storeName)} account.
    </p>
    <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      This link expires in one hour. If you did not request this, you can ignore this email.
    </p>
    <p style="margin:0">${emailButton(input.url, "Choose a new password")}</p>
    `,
  });
  return sendMail({ to: input.email, subject, text, html });
}

export type OrderLifecycleEmail = {
  email: string;
  name: string;
  reference: string;
  viewUrl: string;
  testMode: boolean;
  handlingBusinessDays: number;
  transitBusinessDays: number;
};

function lifecycleKindSubject(order: OrderLifecycleEmail, kind: "prepared" | "shipped") {
  const title = kind === "prepared" ? "Preparation complete" : "Package shipped";
  return order.testMode
    ? `${title} (test) ${order.reference} — ${store.storeName}`
    : `${title} — ${order.reference} — ${store.storeName}`;
}

export async function sendOrderPreparedEmail(order: OrderLifecycleEmail) {
  const subject = lifecycleKindSubject(order, "prepared");
  const intro = order.testMode
    ? "Test email: the preparation period shown on the site has elapsed."
    : "Your order preparation is complete.";
  const next =
    "Your package will be handed to the carrier. You will receive a second email when it ships. " +
    `Transit is then estimated at ${order.transitBusinessDays} business days.`;
  const text = [
    `Hello ${order.name},`,
    "",
    intro,
    `Reference: ${order.reference}`,
    next,
    `View order: ${order.viewUrl}`,
    "",
    `Support: ${store.supportEmail}`,
  ].join("\n");
  const html = layoutCustomerEmail({
    preheader: `Preparation complete. Reference ${order.reference}.`,
    title: subject,
    body: `
    ${
      order.testMode
        ? `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${NAVY};background:${CREAM};border:1px solid ${BORDER};border-radius:8px;padding:10px 14px">Test email — real shipment not confirmed.</p>`
        : ""
    }
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY}">Preparation complete</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">Hello ${escapeHtml(order.name)},<br>${escapeHtml(intro)}</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      <strong>Reference ${escapeHtml(order.reference)}</strong><br>
      Preparation: ${order.handlingBusinessDays} business days.
    </p>
    <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">${escapeHtml(next)}</p>
    <p style="margin:0">${emailButton(order.viewUrl, "View order")}</p>
    `,
  });
  return sendMail({ to: order.email, subject, text, html });
}

export async function sendOrderShippedEmail(order: OrderLifecycleEmail) {
  const subject = lifecycleKindSubject(order, "shipped");
  const intro = order.testMode
    ? "Test email: based on the stated timeline, the package is treated as shipped."
    : "Your package has shipped.";
  const next =
    `Transit is estimated at ${order.transitBusinessDays} business days. ` +
    "No tracking number is available yet — we will send it when the carrier provides one.";
  const text = [
    `Hello ${order.name},`,
    "",
    intro,
    `Reference: ${order.reference}`,
    next,
    `View order: ${order.viewUrl}`,
    "",
    `Support: ${store.supportEmail}`,
  ].join("\n");
  const html = layoutCustomerEmail({
    preheader: `Package shipped. Reference ${order.reference}.`,
    title: subject,
    body: `
    ${
      order.testMode
        ? `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${NAVY};background:${CREAM};border:1px solid ${BORDER};border-radius:8px;padding:10px 14px">Test email — no tracking number is invented.</p>`
        : ""
    }
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY}">Package shipped</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">Hello ${escapeHtml(order.name)},<br>${escapeHtml(intro)}</p>
    <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">
      <strong>Reference ${escapeHtml(order.reference)}</strong>
    </p>
    <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222">${escapeHtml(next)}</p>
    <p style="margin:0">${emailButton(order.viewUrl, "View order")}</p>
    `,
  });
  return sendMail({ to: order.email, subject, text, html });
}
