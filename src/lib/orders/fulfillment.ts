import { getDefaultDeliveryProfile } from "@/lib/merchant/delivery";
import {
  addBusinessDaysYmd,
  formatParisDate,
  formatParisYmd,
  parisYmd,
} from "@/lib/orders/business-days";

export type OrderFulfillmentPhase = "preparing" | "prepared" | "shipped";

export type OrderFulfillment = {
  phase: OrderFulfillmentPhase;
  handlingBusinessDays: number;
  transitBusinessDays: number;
  preparedAt: Date | null;
  shippedAt: Date | null;
  expectedPreparedOn: string;
  expectedShippedOn: string;
};

export function shopDeliveryDays() {
  const profile = getDefaultDeliveryProfile();
  return {
    handlingBusinessDays: profile.handlingMinBusinessDays,
    transitBusinessDays: profile.transitMinBusinessDays,
  };
}

export function buildOrderFulfillment(order: {
  paidAt: Date | null;
  createdAt: Date;
  handlingDays?: number | null;
  transitDays?: number | null;
  preparedAt?: Date | null;
  shippedAt?: Date | null;
}): OrderFulfillment {
  const defaults = shopDeliveryDays();
  const handlingBusinessDays = order.handlingDays ?? defaults.handlingBusinessDays;
  const transitBusinessDays = order.transitDays ?? defaults.transitBusinessDays;
  const start = order.paidAt ?? order.createdAt;
  const expectedPreparedOn = addBusinessDaysYmd(start, handlingBusinessDays);
  const expectedShippedOn = order.preparedAt ? parisYmd(order.preparedAt) : expectedPreparedOn;
  const phase: OrderFulfillmentPhase = order.shippedAt
    ? "shipped"
    : order.preparedAt
      ? "prepared"
      : "preparing";
  return {
    phase,
    handlingBusinessDays,
    transitBusinessDays,
    preparedAt: order.preparedAt ?? null,
    shippedAt: order.shippedAt ?? null,
    expectedPreparedOn,
    expectedShippedOn,
  };
}

export function fulfillmentCustomerLabel(fulfillment: OrderFulfillment) {
  if (fulfillment.phase === "shipped") {
    const when = fulfillment.shippedAt ? ` on ${formatParisDate(fulfillment.shippedAt)}` : "";
    return `Shipped${when} — transit about ${fulfillment.transitBusinessDays} business days`;
  }
  if (fulfillment.phase === "prepared") {
    const when = fulfillment.preparedAt ? ` on ${formatParisDate(fulfillment.preparedAt)}` : "";
    return `Ready to ship${when} — shipping in progress`;
  }
  return `In preparation — expected ready by ${formatParisYmd(fulfillment.expectedPreparedOn)}`;
}
