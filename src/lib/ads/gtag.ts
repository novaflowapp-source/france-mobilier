export const GOOGLE_ADS_ID = "AW-17892406919";
export const GOOGLE_ADS_PURCHASE_SEND_TO = "AW-17892406919/RYdXCMq7ydYcEIft4dNC";
export const GOOGLE_ADS_BEGIN_CHECKOUT_SEND_TO = "AW-17892406919/XapeCOu1o4AdEIft4dNC";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const gtagBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');
`.trim();

export function adsConsentState(granted: boolean) {
  const value = granted ? "granted" : "denied";
  return {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  };
}

export function trackPurchaseConversion(input: {
  transactionId: string;
  valueEur: number;
  newCustomer?: boolean;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const transactionId = input.transactionId.trim();
  if (!transactionId) return;
  const key = `fm-ads-purchase:${transactionId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore quota / private mode */
  }
  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
    transaction_id: transactionId,
    value: Math.round(input.valueEur * 100) / 100,
    currency: "EUR",
    ...(typeof input.newCustomer === "boolean" ? { new_customer: input.newCustomer } : {}),
  });
}

export function trackAddToCart(input: {
  productId: string;
  productName: string;
  priceEur: number;
  quantity: number;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "add_to_cart", {
    currency: "EUR",
    value: Math.round(input.priceEur * input.quantity * 100) / 100,
    items: [
      {
        item_id: input.productId,
        item_name: input.productName,
        quantity: input.quantity,
        price: Math.round(input.priceEur * 100) / 100,
      },
    ],
  });
}

export function trackViewItem(input: { productId: string; productName: string; priceEur: number }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "view_item", {
    currency: "EUR",
    value: Math.round(input.priceEur * 100) / 100,
    items: [
      {
        item_id: input.productId,
        item_name: input.productName,
        price: Math.round(input.priceEur * 100) / 100,
      },
    ],
  });
}

export function trackBeginCheckout(input: { valueEur: number; itemCount: number }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (input.itemCount < 1) return;
  const value = Math.round(input.valueEur * 100) / 100;
  window.gtag("event", "begin_checkout", {
    currency: "EUR",
    value,
    items: [{ quantity: input.itemCount }],
  });
  const key = "fm-ads-begin-checkout";
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore quota / private mode */
  }
  window.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_BEGIN_CHECKOUT_SEND_TO,
    value,
    currency: "EUR",
  });
}
