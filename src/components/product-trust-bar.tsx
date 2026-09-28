import { IconLock, IconReturn, IconTruck } from "@/components/icons";
import { SHIPPING_ZONE_LABEL } from "@/lib/shipping-zone";

const items = [
  {
    title: "Free shipping",
    text: `To ${SHIPPING_ZONE_LABEL}.`,
    icon: IconTruck,
  },
  {
    title: "Secure payment",
    text: "Credit card, Apple Pay, Google Pay, and more depending on your device.",
    icon: IconLock,
  },
  {
    title: "14-day returns",
    text: "From the day your order arrives.",
    icon: IconReturn,
  },
];

export function ProductTrustBar() {
  return (
    <ul className="grid gap-3 border-t border-border pt-5">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <item.icon className="mt-0.5 h-5 w-5 text-navy" />
          <div>
            <p className="text-sm font-medium text-navy">{item.title}</p>
            <p className="text-sm text-muted">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
