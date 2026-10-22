import { ArrowLeft, ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreFavorites } from "./StoreFavoritesContext";
import { useStoreLocale } from "./StoreLocaleContext";
import { CATEGORY_GROUPS, getCategoryItemImage } from "./storeNavigation";
import { RiyalPrice } from "./RiyalPrice";
import BellToggle from "./BellToggle";

export type CategoryProduct = {
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  outOfStock?: boolean;
};

const perfumeProducts: CategoryProduct[] = [
  { name: "Green Woods Eau de Parfum", brand: "LINK", price: 258, oldPrice: 600, image: "/product-assets/real-products/green-woods.jpg", badge: "Best Seller" },
  { name: "Black Woods Eau de Toilette", brand: "LINK", price: 208, oldPrice: 500, image: "/product-assets/real-products/black-woods.jpg", badge: "1+2 Free" },
  { name: "Maroon Perfume by LINK 200ml", brand: "LINK", price: 308, oldPrice: 420, image: "/product-assets/real-products/maroon.jpg", badge: "1+2 Free", outOfStock: true },
  { name: "Link White Limited Edition 150ml", brand: "LINK", price: 288, oldPrice: 500, image: "/product-assets/real-products/link-white.jpg", badge: "Limited Edition" },
  { name: "Silver Woods Eau de Parfum", brand: "LINK", price: 208, oldPrice: 500, image: "/product-assets/real-products/silver-woods.jpg", badge: "New" },
  { name: "DERAAH PRIVATE Enjoy Eau de Parfum 100ml", brand: "DERAAH PRIVATE", price: 159, oldPrice: 378, image: "/product-assets/private-555.png", badge: "Special Offer" },
];

const categoryProductNames: Record<string, string[]> = {
  Oud: ["Oud And Incense", "Oriental Perfumes", "Oud Oil", "Al Sadu Collection", "Mixtures", "BODY MIST"],
  Gifts: ["Gifts For Men", "Gifts For Women", "Unisex Gifts", "Permanent Natural Rose", "gift box", "Perfume gifts", "Oud sets", "Accessory sets"],
  "Hair Care": ["Ceramic", "curly", "dryer", "Stylist", "Hair products", "Argan Set"],
  Accessories: ["Men Accessories", "Women-Accessories", "Men-Watches", "Sunglasses", "Men-Sets", "Women Bags"],
  "Home Care": ["Deraah-Home", "Air fresheners", "Scented Candles", "Room Spray", "Reed Diffuser"],
  "Body Care": ["Labeaute", "Body-Butter", "Body Fresheners", "Body Lotion", "Toilet Perfumes", "Shower Gel"],
};

function makeCategoryProducts(categoryName: string) {
  if (categoryName === "Perfumes") return perfumeProducts;
  const category = CATEGORY_GROUPS.find(group => group.name === categoryName) ?? CATEGORY_GROUPS[0];
  const names = categoryProductNames[categoryName] ?? category.items;
  return names.map((name, index) => ({
    name,
    brand: categoryName,
    price: 99 + index * 31,
    oldPrice: index % 2 === 0 ? 129 + index * 31 : undefined,
    image: getCategoryItemImage(categoryName, name, index, category.image),
    badge: index === 0 ? "New" : index === 1 ? "Best Seller" : undefined,
  }));
}

export function CategoryProductCard({ product, favorite, onFavorite, onAdd }: { product: CategoryProduct; favorite: boolean; onFavorite: () => void; onAdd: () => void }) {
  return <article className="group relative overflow-hidden rounded-[18px] border border-[#ece9e4] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,25,18,.1)]">
    <div className="relative aspect-[.9] overflow-hidden bg-[#f5f4f2]">
      <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} aria-label={`View ${product.name}`} className="block h-full w-full">
        <img src={product.image} alt={product.name} className="h-full w-full object-contain p-7 transition duration-500 group-hover:scale-[1.035]" />
      </a>
      {product.outOfStock ? <span className="store-offer-badge single absolute left-1/2 top-0 z-10 flex h-[18px] w-[120px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-b-[6px] bg-white text-[9px] font-semibold text-[#d50000]"><span className="store-offer-badge-track"><span>OUT OF STOCK</span></span></span> : product.badge && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium text-[#242424] shadow-sm">{product.badge}</span>}
      <button type="button" aria-label={`${favorite ? "Remove" : "Add"} ${product.name} ${favorite ? "from" : "to"} wishlist`} onClick={onFavorite} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm transition hover:bg-[#111] hover:text-white ${favorite ? "text-[#b01f4b]" : "text-[#222]"}`}><Heart size={16} fill={favorite ? "currentColor" : "none"} strokeWidth={1.7} /></button>
    </div>
    <div className="p-4 sm:p-5">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[.16em] text-[#88837d]">{product.brand}</p>
      <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} className="block min-h-[42px] text-[13px] font-medium leading-5 text-[#181818] no-underline transition-colors hover:text-[#9a5a2e]">{product.name}</a>
      <div className="product-card-actions mt-4 flex items-center justify-between gap-3"><div className="flex items-baseline gap-2 whitespace-nowrap"><strong className="text-[15px] font-semibold text-[#111]"><RiyalPrice value={product.price} /></strong>{product.oldPrice && <s className="text-[10px] text-[#9b9996]"><RiyalPrice value={product.oldPrice} /></s>}</div>{product.outOfStock ? <BellToggle offLabel="Notify me" onLabel="Notified" size="sm" color="#111111" background="#ffffff" onColor="#111111" onBackground="#ffffff" radius={18} ringAmplitude={12} ringPasses={4} ringDuration={700} badge={false} className="product-notify-toggle ml-auto" /> : <button type="button" aria-label={`Add ${product.name} to cart`} onClick={onAdd} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d8d4cf] text-[#161616] transition hover:border-[#161616] hover:bg-[#161616] hover:text-white"><ShoppingBag size={16} strokeWidth={1.7} /></button>}</div>
    </div>
  </article>;
}

export default function CategoryListingPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category") ?? "Perfumes";
  const category = CATEGORY_GROUPS.find(group => group.name.toLowerCase() === requestedCategory.toLowerCase()) ?? CATEGORY_GROUPS[0];
  const { direction } = useStoreLocale();
  const { favoriteNames, toggleFavorite } = useStoreFavorites();
  const { cartItems, addToCart } = useStoreCart();
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [toast, setToast] = useState("");
  const products = useMemo(() => makeCategoryProducts(category.name), [category.name]);

  const handleAdd = (product: CategoryProduct) => {
    const item: StoreCartItem = { id: `${product.name}-default`, name: product.name, brand: product.brand, price: String(product.price), oldPrice: product.oldPrice === undefined ? undefined : String(product.oldPrice), image: product.image, quantity: 1 };
    addToCart(item);
    setToast(`${product.name} added to cart`);
    window.setTimeout(() => setToast(""), 2200);
  };

  return <div dir={direction} className="store-category-page min-h-screen bg-[#fbfaf8] font-sans text-start text-[#161616]">
    <StoreHeader />
    <main>
      <section className="border-b border-[#ebe7e2] bg-[#f3ece5] px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12">
        <div className="mx-auto max-w-[1240px]"><a href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#68635e] no-underline transition-colors hover:text-[#9a5a2e]"><ArrowLeft size={14} /> Back to store</a><p className="mt-9 text-[10px] font-semibold uppercase tracking-[.22em] text-[#9a5a2e]">Category collection</p><div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="text-4xl font-medium tracking-[-.045em] text-[#2d2522] sm:text-5xl">{category.name}</h1><p className="mt-4 max-w-[580px] text-sm leading-6 text-[#706a65]">Explore the full {category.name.toLowerCase()} collection and find the pieces that fit your ritual.</p></div><span className="text-xs text-[#7c746d]">{products.length} products</span></div><div className="mt-8 flex gap-2 overflow-x-auto pb-1">{category.items.slice(0, 8).map(item => <a key={item} href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="shrink-0 rounded-full border border-[#d9cec4] bg-white/70 px-4 py-2 text-xs text-[#5c534d] no-underline transition-colors hover:border-[#9a5a2e] hover:text-[#9a5a2e]">{item}</a>)}</div></div>
      </section>
      <section className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-medium uppercase tracking-[.22em] text-[#9a5a2e]">Shop {category.name}</p><h2 className="text-2xl font-medium tracking-[-.03em] text-[#111] sm:text-3xl">All products</h2></div><span className="text-xs text-[#7c746d]">Curated for you</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{products.map(product => <CategoryProductCard key={product.name} product={product} favorite={favoriteNames.includes(product.name)} onFavorite={() => toggleFavorite({ id: product.name, name: product.name, brand: product.brand, price: String(product.price), oldPrice: product.oldPrice === undefined ? undefined : String(product.oldPrice), image: product.image })} onAdd={() => handleAdd(product)} />)}</div></section>
    </main>
    {toast && <div role="status" className="fixed bottom-6 left-1/2 z-[160] -translate-x-1/2 rounded-full bg-[#171717] px-5 py-3 text-xs font-medium text-white shadow-xl">{toast}</div>}
    <StoreFooter />
    <div className="md:hidden"><StoreMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(collapsed => !collapsed)} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} /></div>
  </div>;
}
