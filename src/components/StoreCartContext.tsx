import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const STORE_CART_KEY = "deraah-cart";
export const STORE_GIFTS_KEY = "deraah-cart-gifts";
export const STORE_GIFT_CUSTOMIZATION_PREFIX = "deraah-gift-customization:";

export type StoreCartItem = {
  id: string;
  name: string;
  brand: string;
  price: string;
  oldPrice?: string;
  image: string;
  quantity: number;
  variant?: string;
};

export function isGiftCustomizationItem(item: Pick<StoreCartItem, "id">) {
  return item.id.startsWith(STORE_GIFT_CUSTOMIZATION_PREFIX);
}

export type StoreGiftSelections = Record<string, string[]>;

type StoreCartContextValue = {
  cartItems: StoreCartItem[];
  cartItemCount: number;
  subtotal: number;
  addToCart: (item: StoreCartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  replaceCart: (items: StoreCartItem[], giftSelections?: StoreGiftSelections) => void;
  giftSelections: StoreGiftSelections;
  setGiftSelections: (itemId: string, giftIds: string[]) => void;
};

const StoreCartContext = createContext<StoreCartContextValue | null>(null);

function readCart(): StoreCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORE_CART_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter(item => item && typeof item.id === "string" && Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0)
      .map(item => ({
        id: item.id,
        name: typeof item.name === "string" ? item.name : "Deraah product",
        brand: typeof item.brand === "string" ? item.brand : "",
        // Older store sessions persisted numeric prices. Normalize them here so
        // every connected page can safely apply string formatting.
        price: String(item.price ?? "0"),
        ...(typeof item.oldPrice === "string" ? { oldPrice: item.oldPrice } : {}),
        image: item.name === "Leader Perfume for Men 100 ml" ? "/product-assets/leader.png" : typeof item.image === "string" ? item.image : "",
        quantity: Math.max(1, Number(item.quantity)),
        ...(typeof item.variant === "string" ? { variant: item.variant } : {}),
      }));
  } catch {
    return [];
  }
}

function readGiftSelections(): StoreGiftSelections {
  if (typeof window === "undefined") return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(STORE_GIFTS_KEY) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).map(([itemId, giftIds]) => [
      itemId,
      Array.isArray(giftIds) ? giftIds.filter(giftId => typeof giftId === "string") : [],
    ]));
  } catch {
    return {};
  }
}

function priceValue(price: string) {
  return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<StoreCartItem[]>(readCart);
  const [giftSelections, setGiftSelectionsState] = useState<StoreGiftSelections>(readGiftSelections);

  useEffect(() => {
    const syncCart = () => {
      setCartItems(readCart());
      setGiftSelectionsState(readGiftSelections());
    };
    window.addEventListener("storage", syncCart);
    window.addEventListener("deraah-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("deraah-cart-updated", syncCart);
    };
  }, []);

  const commit = (update: StoreCartItem[] | ((currentItems: StoreCartItem[]) => StoreCartItem[])) => {
    setCartItems(currentItems => {
      const nextItems = typeof update === "function" ? update(currentItems) : update;
      const next = nextItems.filter(item => item.quantity > 0);
      window.localStorage.setItem(STORE_CART_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("deraah-cart-updated"));
      return next;
    });
  };

  const commitGiftSelections = (update: StoreGiftSelections | ((currentSelections: StoreGiftSelections) => StoreGiftSelections)) => {
    setGiftSelectionsState(currentSelections => {
      const nextSelections = typeof update === "function" ? update(currentSelections) : update;
      const next = Object.fromEntries(Object.entries(nextSelections).map(([itemId, giftIds]) => [itemId, [...new Set(giftIds)]]));
      window.localStorage.setItem(STORE_GIFTS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("deraah-cart-updated"));
      return next;
    });
  };

  const replaceCart = (nextItems: StoreCartItem[], nextSelections: StoreGiftSelections = {}) => {
    const normalizedItems = nextItems
      .filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.brand === "string" && typeof item.image === "string" && Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0)
      .map(item => ({
        ...item,
        price: String(item.price ?? "0"),
        ...(typeof item.oldPrice === "string" ? { oldPrice: item.oldPrice } : {}),
        quantity: Math.max(1, Math.floor(Number(item.quantity))),
        ...(typeof item.variant === "string" ? { variant: item.variant } : {}),
      }));
    const validItemIds = new Set(normalizedItems.map(item => item.id));
    const normalizedSelections = Object.fromEntries(Object.entries(nextSelections).filter(([itemId, giftIds]) => validItemIds.has(itemId) && Array.isArray(giftIds)).map(([itemId, giftIds]) => [itemId, [...new Set(giftIds.filter(giftId => typeof giftId === "string"))]]));
    setCartItems(normalizedItems);
    setGiftSelectionsState(normalizedSelections);
    window.localStorage.setItem(STORE_CART_KEY, JSON.stringify(normalizedItems));
    window.localStorage.setItem(STORE_GIFTS_KEY, JSON.stringify(normalizedSelections));
    window.dispatchEvent(new Event("deraah-cart-updated"));
  };

  const value = useMemo<StoreCartContextValue>(() => ({
    cartItems,
    cartItemCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: cartItems.reduce((total, item) => total + priceValue(item.price) * item.quantity, 0),
    addToCart: item => commit(currentItems => {
      const existing = currentItems.find(current => current.id === item.id);
      return existing
        ? currentItems.map(current => current.id === item.id ? { ...current, quantity: current.quantity + item.quantity } : current)
        : [...currentItems, item];
    }),
    updateQuantity: (id, quantity) => commit(currentItems => currentItems.map(item => item.id === id ? { ...item, quantity } : item)),
    removeItem: id => {
      commit(currentItems => currentItems.filter(item => item.id !== id));
      commitGiftSelections(currentSelections => {
        const next = { ...currentSelections };
        delete next[id];
        return next;
      });
    },
    clearCart: () => {
      commit([]);
      commitGiftSelections({});
    },
    replaceCart,
    giftSelections,
    setGiftSelections: (itemId, giftIds) => commitGiftSelections(currentSelections => ({ ...currentSelections, [itemId]: [...new Set(giftIds)] })),
  }), [cartItems, giftSelections]);

  return <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>;
}

export function useStoreCart() {
  const context = useContext(StoreCartContext);
  if (!context) throw new Error("useStoreCart must be used inside StoreCartProvider");
  return context;
}
