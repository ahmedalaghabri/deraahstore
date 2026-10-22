import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const STORE_FAVORITES_KEY = "deraah-favorites";

export type StoreFavoriteProduct = {
  id: string;
  name: string;
  brand: string;
  price: string;
  oldPrice?: string;
  image: string;
};

export type StoreFavoriteInput = Omit<StoreFavoriteProduct, "price" | "oldPrice"> & {
  price: string | number;
  oldPrice?: string | number;
};

type StoreFavoritesContextValue = {
  favorites: StoreFavoriteProduct[];
  favoriteNames: string[];
  isFavorite: (name: string) => boolean;
  toggleFavorite: (product: StoreFavoriteInput) => void;
  removeFavorite: (id: string) => void;
};

const StoreFavoritesContext = createContext<StoreFavoritesContextValue | null>(null);

function readFavorites(): StoreFavoriteProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORE_FAVORITES_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.image === "string").map(item => ({
      id: item.id,
      name: item.name,
      brand: typeof item.brand === "string" ? item.brand : "",
      price: String(item.price ?? ""),
      oldPrice: item.oldPrice == null ? undefined : String(item.oldPrice),
      image: item.image,
    }));
  } catch {
    return [];
  }
}

function normalizeFavorite(product: StoreFavoriteInput): StoreFavoriteProduct {
  return {
    id: product.id || product.name,
    name: product.name,
    brand: product.brand,
    price: String(product.price),
    oldPrice: product.oldPrice == null ? undefined : String(product.oldPrice),
    image: product.image,
  };
}

function persistFavorites(favorites: StoreFavoriteProduct[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_FAVORITES_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("deraah-favorites-updated"));
}

export function StoreFavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<StoreFavoriteProduct[]>(readFavorites);

  useEffect(() => {
    const syncFavorites = () => setFavorites(readFavorites());
    window.addEventListener("storage", syncFavorites);
    window.addEventListener("deraah-favorites-updated", syncFavorites);
    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("deraah-favorites-updated", syncFavorites);
    };
  }, []);

  const toggleFavorite = useCallback((input: StoreFavoriteInput) => {
    const product = normalizeFavorite(input);
    const existing = favorites.some(item => item.id === product.id || item.name === product.name);
    const nextFavorites = existing
      ? favorites.filter(item => item.id !== product.id && item.name !== product.name)
      : [...favorites, product];
    setFavorites(nextFavorites);
    persistFavorites(nextFavorites);
    window.dispatchEvent(new CustomEvent("deraah-favorite-feedback", { detail: { action: existing ? "removed" : "added", product } }));
  }, [favorites]);

  const removeFavorite = useCallback((id: string) => {
    const nextFavorites = favorites.filter(item => item.id !== id);
    setFavorites(nextFavorites);
    persistFavorites(nextFavorites);
  }, [favorites]);

  const value = useMemo<StoreFavoritesContextValue>(() => ({
    favorites,
    favoriteNames: favorites.map(item => item.name),
    isFavorite: name => favorites.some(item => item.name === name),
    toggleFavorite,
    removeFavorite,
  }), [favorites, removeFavorite, toggleFavorite]);

  return <StoreFavoritesContext.Provider value={value}>{children}</StoreFavoritesContext.Provider>;
}

export function useStoreFavorites() {
  const context = useContext(StoreFavoritesContext);
  if (!context) throw new Error("useStoreFavorites must be used inside StoreFavoritesProvider");
  return context;
}
