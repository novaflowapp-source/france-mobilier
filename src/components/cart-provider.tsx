"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types/commerce";
import { cartLineKey } from "@/lib/products/repository";
import { trackAddToCart } from "@/lib/ads/gtag";
import { reportShopActivity } from "@/lib/activity-client";
import {
  WELCOME_WINDOW_MS,
  readWelcomeStartedFromStorage,
  welcomeOfferAt,
  writeWelcomeStartedToStorage,
  type WelcomeOfferView,
} from "@/lib/welcome-offer";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
  ready: boolean;
  welcome: WelcomeOfferView;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "francemobilier-cart-v1";

async function fetchWelcomeOffer(start: boolean, startedAt?: number | null) {
  const res = await fetch("/api/promo/welcome", {
    method: start ? "POST" : "GET",
    credentials: "same-origin",
    headers: start ? { "Content-Type": "application/json" } : undefined,
    body: start ? JSON.stringify({ startedAt: startedAt ?? undefined }) : undefined,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { startedAt?: number | null };
  return typeof data.startedAt === "number" ? data.startedAt : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [welcomeStartedAt, setWelcomeStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const skipPersist = useRef(true);
  const welcomeSynced = useRef(false);

  const applyStartedAt = useCallback((startedAt: number | null) => {
    if (!startedAt) return;
    setWelcomeStartedAt((current) => {
      const next = current ? Math.min(current, startedAt) : startedAt;
      writeWelcomeStartedToStorage(next);
      return next;
    });
  }, []);

  const startWelcomeOffer = useCallback(async () => {
    const optimistic = Date.now();
    setWelcomeStartedAt((current) => {
      if (current) return current;
      writeWelcomeStartedToStorage(optimistic);
      return optimistic;
    });
    try {
      applyStartedAt(await fetchWelcomeOffer(true, readWelcomeStartedFromStorage() ?? optimistic));
    } catch {
      /* keep optimistic start */
    }
  }, [applyStartedAt]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    applyStartedAt(readWelcomeStartedFromStorage());
    setReady(true);
  }, [applyStartedAt]);

  useEffect(() => {
    if (!ready || welcomeSynced.current) return;
    welcomeSynced.current = true;
    const hasItems = items.length > 0;
    const localStarted = Boolean(welcomeStartedAt);
    if (!hasItems && !localStarted) return;
    void (async () => {
      try {
        applyStartedAt(await fetchWelcomeOffer(hasItems, welcomeStartedAt));
      } catch {
        /* ignore */
      }
    })();
  }, [ready, items.length, welcomeStartedAt, applyStartedAt]);

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!welcomeStartedAt) return;
    if (welcomeStartedAt + WELCOME_WINDOW_MS <= Date.now()) {
      setNow(Date.now());
      return;
    }
    let intervalId = 0;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= welcomeStartedAt + WELCOME_WINDOW_MS && intervalId) {
        window.clearInterval(intervalId);
      }
    };
    tick();
    intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [welcomeStartedAt]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const key = cartLineKey(item.productId, item.variantId);
        const existing = current.find((row) => cartLineKey(row.productId, row.variantId) === key);
        if (existing) {
          return current.map((row) =>
            cartLineKey(row.productId, row.variantId) === key
              ? { ...row, quantity: row.quantity + quantity }
              : row,
          );
        }
        return [...current, { ...item, quantity }];
      });
      void startWelcomeOffer();
      reportShopActivity({
        type: "add_to_cart",
        productId: item.productId,
        productName: item.name,
        quantity,
        priceEur: item.price,
        variantId: item.variantId ?? null,
      });
      trackAddToCart({
        productId: item.productId,
        productName: item.name,
        priceEur: item.price,
        quantity,
      });
    },
    [startWelcomeOffer],
  );

  const removeItem = useCallback((productId: string, variantId?: string | null) => {
    const key = cartLineKey(productId, variantId);
    setItems((current) => current.filter((row) => cartLineKey(row.productId, row.variantId) !== key));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number, variantId?: string | null) => {
    const next = Math.floor(quantity);
    if (!Number.isFinite(next) || next < 1) return;
    const clamped = Math.min(20, next);
    const key = cartLineKey(productId, variantId);
    setItems((current) =>
      current.map((row) =>
        cartLineKey(row.productId, row.variantId) === key ? { ...row, quantity: clamped } : row,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, row) => sum + row.quantity, 0);
    const subtotal = items.reduce((sum, row) => sum + row.price * row.quantity, 0);
    return {
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      itemCount,
      subtotal,
      ready,
      welcome: welcomeOfferAt(welcomeStartedAt, now || welcomeStartedAt || 0),
    };
  }, [items, addItem, removeItem, setQuantity, clear, ready, welcomeStartedAt, now]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
