import { eq } from "drizzle-orm";
import { db, ensureDatabase } from "@/lib/db";
import { shopOrder } from "@/lib/db/schema";
import { isMailConfigured, sendOrderPreparedEmail, sendOrderShippedEmail } from "@/lib/mail";
import { addBusinessDaysYmd, isOnOrAfterParisDay } from "@/lib/orders/business-days";
import { shopDeliveryDays } from "@/lib/orders/fulfillment";
import { getSiteUrl, stripeMode } from "@/lib/payments/stripe";

const INTERVAL_MS = 15 * 60 * 1000;
const FIRST_RUN_MS = 20_000;

type LifecycleResult = {
  prepared: number;
  shipped: number;
  skipped?: string;
};

const globalForLifecycle = globalThis as unknown as {
  orderLifecycleTimer?: ReturnType<typeof setInterval>;
  orderLifecycleRunning?: boolean;
};

function viewUrl(order: { id: string; viewToken: string | null }) {
  const token = order.viewToken ? `?t=${order.viewToken}` : "";
  return `${getSiteUrl()}/order/${order.id}${token}`;
}

function emailPayload(order: {
  email: string;
  name: string;
  reference: string | null;
  id: string;
  viewToken: string | null;
  handlingDays: number | null;
  transitDays: number | null;
}) {
  const days = shopDeliveryDays();
  return {
    email: order.email,
    name: order.name,
    reference: order.reference || order.id.slice(0, 8).toUpperCase(),
    viewUrl: viewUrl(order),
    testMode: stripeMode() === "test",
    handlingBusinessDays: order.handlingDays ?? days.handlingBusinessDays,
    transitBusinessDays: order.transitDays ?? days.transitBusinessDays,
  };
}

export async function processDueOrderEmails(): Promise<LifecycleResult> {
  if (globalForLifecycle.orderLifecycleRunning) {
    return { prepared: 0, shipped: 0, skipped: "busy" };
  }
  globalForLifecycle.orderLifecycleRunning = true;
  const result: LifecycleResult = { prepared: 0, shipped: 0 };
  try {
    if (!isMailConfigured()) {
      return { ...result, skipped: "mail-not-configured" };
    }
    await ensureDatabase();
    const days = shopDeliveryDays();
    const rows = await db.select().from(shopOrder).where(eq(shopOrder.status, "paid"));
    const now = new Date();

    for (const order of rows) {
      if (!order.paidAt) continue;
      const handling = order.handlingDays ?? days.handlingBusinessDays;
      const transit = order.transitDays ?? days.transitBusinessDays;
      if (order.handlingDays == null || order.transitDays == null) {
        await db
          .update(shopOrder)
          .set({
            handlingDays: handling,
            transitDays: transit,
          })
          .where(eq(shopOrder.id, order.id));
      }

      const prepDueOn = addBusinessDaysYmd(order.paidAt, handling);
      const prepDue = isOnOrAfterParisDay(now, prepDueOn);
      let prepSent = Boolean(order.prepEmailSentAt);

      if (!prepSent && prepDue) {
        try {
          const sent = await sendOrderPreparedEmail(emailPayload({ ...order, handlingDays: handling, transitDays: transit }));
          if (sent) {
            await db
              .update(shopOrder)
              .set({ preparedAt: now, prepEmailSentAt: now })
              .where(eq(shopOrder.id, order.id));
            prepSent = true;
            result.prepared += 1;
          }
        } catch (error) {
          console.error("[orders] prep email failed", order.id, error);
        }
        continue;
      }

      if (prepSent && !order.shipEmailSentAt && prepDue) {
        try {
          const sent = await sendOrderShippedEmail(emailPayload({ ...order, handlingDays: handling, transitDays: transit }));
          if (sent) {
            await db
              .update(shopOrder)
              .set({ shippedAt: now, shipEmailSentAt: now })
              .where(eq(shopOrder.id, order.id));
            result.shipped += 1;
          }
        } catch (error) {
          console.error("[orders] ship email failed", order.id, error);
        }
      }
    }
    return result;
  } finally {
    globalForLifecycle.orderLifecycleRunning = false;
  }
}

export function startOrderLifecycleScheduler() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (globalForLifecycle.orderLifecycleTimer) return;
  const tick = () => {
    void processDueOrderEmails().catch((error) => {
      console.error("[orders] lifecycle failed", error);
    });
  };
  const interval = setInterval(tick, INTERVAL_MS);
  interval.unref?.();
  globalForLifecycle.orderLifecycleTimer = interval;
  const first = setTimeout(tick, FIRST_RUN_MS);
  first.unref?.();
}
