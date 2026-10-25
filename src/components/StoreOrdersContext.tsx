import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const STORE_ORDERS_KEY = "deraah-orders";

export type StoreOrderItem = {
  id: string;
  name: string;
  image: string;
  price: string;
  quantity: number;
};

export type StoreOrder = {
  id: string;
  placedAt: string;
  status: "Delivered" | "On the way" | "Preparing";
  items: StoreOrderItem[];
  giftSelections?: Record<string, string[]>;
  freeSample?: { name: string; image: string };
  total: number;
};

const demoOrders: StoreOrder[] = [
  {
    id: "DRH-10827687",
    placedAt: "2026-10-21T10:00:00.000Z",
    status: "On the way",
    total: 1282,
    items: [
      { id: "demo-green-woods", name: "Green Woods Eau de Parfum", image: "/product-assets/real-products/green-woods.png", price: "258", quantity: 1 },
      { id: "demo-silver-woods", name: "Silver Woods Eau de Parfum", image: "/product-assets/real-products/silver-woods.png", price: "208", quantity: 1 },
      { id: "demo-link-white", name: "Link White Limited Edition 150ml", image: "/product-assets/real-products/link-white.png", price: "288", quantity: 1 },
      { id: "demo-black-woods", name: "Black Woods Eau de Toilette", image: "/product-assets/real-products/black-woods.png", price: "208", quantity: 1 },
      { id: "demo-maroon", name: "Maroon Perfume by Link 200ml", image: "/product-assets/real-products/maroon.png", price: "320", quantity: 1 },
    ],
  },
  { id: "DR-10284", placedAt: "2025-05-22T10:00:00.000Z", status: "Delivered", total: 628, items: [{ id: "demo-serein", name: "Serein Premium Men's Set", image: "/product-assets/category-cutouts/gifts-1.png", price: "628", quantity: 1 }] },
  { id: "DR-10197", placedAt: "2025-05-08T10:00:00.000Z", status: "On the way", total: 520, items: [{ id: "demo-robust", name: "Robust Men's Accessory & Care Set", image: "/product-assets/category-cutouts/gifts-0.png", price: "520", quantity: 1 }] },
  { id: "DR-10063", placedAt: "2025-04-17T10:00:00.000Z", status: "Delivered", total: 438, items: [{ id: "demo-link-black", name: "Link Black New Accessory Set", image: "/product-assets/category-cutouts/accessories-0.png", price: "438", quantity: 1 }] },
];

function normalizeOrder(value: unknown): StoreOrder | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || !Array.isArray(item.items)) return null;
  const items = item.items.filter(entry => entry && typeof entry === "object").map(entry => {
    const product = entry as Record<string, unknown>;
    return {
      id: String(product.id ?? product.name ?? "order-item"),
      name: String(product.name ?? "Deraah product"),
      image: typeof product.image === "string" ? product.image : "",
      price: String(product.price ?? "0"),
      quantity: Math.max(1, Number(product.quantity) || 1),
    };
  });
  if (!items.length && item.id !== "DRH-000000") return null;
  const status = item.status === "Delivered" || item.status === "Preparing" ? item.status : "On the way";
  const giftSelections = item.giftSelections && typeof item.giftSelections === "object" && !Array.isArray(item.giftSelections)
    ? Object.fromEntries(Object.entries(item.giftSelections as Record<string, unknown>).map(([itemId, giftIds]) => [itemId, Array.isArray(giftIds) ? giftIds.filter((giftId): giftId is string => typeof giftId === "string") : []]))
    : undefined;
  const freeSample = item.freeSample && typeof item.freeSample === "object" && !Array.isArray(item.freeSample)
    ? { name: String((item.freeSample as Record<string, unknown>).name ?? "Free sample"), image: typeof (item.freeSample as Record<string, unknown>).image === "string" ? (item.freeSample as Record<string, unknown>).image as string : "" }
    : undefined;
  return {
    id: item.id,
    placedAt: typeof item.placedAt === "string" ? item.placedAt : new Date().toISOString(),
    status,
    items,
    ...(giftSelections ? { giftSelections } : {}),
    ...(freeSample ? { freeSample } : {}),
    total: Number(item.total) || 0,
  };
}

function readOrders(): StoreOrder[] {
  if (typeof window === "undefined") return demoOrders;
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORE_ORDERS_KEY) ?? "[]");
    const savedOrders = Array.isArray(stored) ? stored.map(normalizeOrder).filter((order): order is StoreOrder => Boolean(order)) : [];
    const lastOrder = normalizeOrder(JSON.parse(window.localStorage.getItem("deraah-last-order") ?? "null"));
    const combined = [...demoOrders, lastOrder, ...savedOrders].filter((order): order is StoreOrder => Boolean(order));
    return combined.filter((order, index, orders) => orders.findIndex(candidate => candidate.id === order.id) === index);
  } catch {
    return demoOrders;
  }
}

type StoreOrdersContextValue = {
  orders: StoreOrder[];
  addOrder: (order: unknown) => void;
};

const StoreOrdersContext = createContext<StoreOrdersContextValue | null>(null);

export function StoreOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<StoreOrder[]>(readOrders);

  useEffect(() => {
    const syncOrders = () => setOrders(readOrders());
    window.addEventListener("storage", syncOrders);
    window.addEventListener("deraah-orders-updated", syncOrders);
    return () => {
      window.removeEventListener("storage", syncOrders);
      window.removeEventListener("deraah-orders-updated", syncOrders);
    };
  }, []);

  const addOrder = useCallback((value: unknown) => {
    const order = normalizeOrder(value);
    if (!order) return;
    setOrders(current => {
      const next = [order, ...current.filter(item => item.id !== order.id)];
      window.localStorage.setItem(STORE_ORDERS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("deraah-orders-updated"));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ orders, addOrder }), [orders, addOrder]);
  return <StoreOrdersContext.Provider value={value}>{children}</StoreOrdersContext.Provider>;
}

export function useStoreOrders() {
  const context = useContext(StoreOrdersContext);
  if (!context) throw new Error("useStoreOrders must be used inside StoreOrdersProvider");
  return context;
}
