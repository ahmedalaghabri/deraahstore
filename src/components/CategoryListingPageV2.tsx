import { ArrowDownUp, ArrowRight, Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";
import { ProductCard, type Product } from "./ProductDetailsPage";
import { useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreFavorites } from "./StoreFavoritesContext";
import { useStoreLocale } from "./StoreLocaleContext";
import { CATEGORY_GROUPS, getCategoryItemImage } from "./storeNavigation";
import { formatPrice } from "./storeCartData";

type CategoryProduct = {
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  outOfStock?: boolean;
  segments?: string[];
};

type SortOption = "recommended" | "price-low" | "price-high" | "name" | "newest";
type Availability = "all" | "in-stock" | "out-of-stock";

const perfumeProducts: CategoryProduct[] = [
  { name: "Green Woods Eau de Parfum", brand: "LINK", price: 258, oldPrice: 600, image: "/product-assets/real-products/green-woods.png", badge: "1+2 Free", segments: ["Men Perfumes", "Unisex Perfumes"] },
  { name: "Black Woods Eau de Toilette", brand: "LINK", price: 208, oldPrice: 500, image: "/product-assets/real-products/black-woods.png", badge: "1+2 Free", segments: ["Men Perfumes"] },
  { name: "Maroon Perfume by Link 200ml", brand: "LINK", price: 308, oldPrice: 420, image: "/product-assets/real-products/maroon.png", badge: "1+2 Free", outOfStock: true, segments: ["Women Perfumes", "Unisex Perfumes"] },
  { name: "Link White Limited Edition 150ml", brand: "LINK", price: 288, oldPrice: 500, image: "/product-assets/real-products/link-white.png", badge: "Limited Edition", segments: ["Niche perfumes", "Women Perfumes"] },
  { name: "Silver Woods Eau de Parfum", brand: "LINK", price: 208, oldPrice: 500, image: "/product-assets/real-products/silver-woods.png", badge: "New", segments: ["Men Perfumes", "Unisex Perfumes"] },
  { name: "DERAAH PRIVATE Enjoy Eau de Parfum 100ml", brand: "DERAAH PRIVATE", price: 159, oldPrice: 378, image: "/product-assets/private-555.png", badge: "Special Offer", segments: ["Niche perfumes", "Unisex Perfumes"] },
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
    brand: categoryName === "Gifts" && index % 2 ? "DERAAH PRIVATE" : categoryName,
    price: 99 + index * 31,
    oldPrice: index % 2 === 0 ? 129 + index * 31 : undefined,
    image: getCategoryItemImage(categoryName, name, index, category.image),
    badge: index === 0 ? "New" : index === 1 ? "Best Seller" : undefined,
  }));
}

function toStoreProduct(product: CategoryProduct): Product {
  return { name: product.name, brand: product.brand, price: formatPrice(product.price), oldPrice: formatPrice(product.oldPrice ?? product.price), image: product.image, offer: product.badge === "1+2 Free" ? product.badge : undefined, views: "", outOfStock: product.outOfStock };
}

function categoryHref(categoryName: string, subcategory?: string) {
  const params = new URLSearchParams({ category: categoryName });
  if (subcategory) params.set("subcategory", subcategory);
  return `/category?${params.toString()}`;
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className="border-b border-[#ebe7e2] py-5 first:pt-1 last:border-b-0"><button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between text-left text-[13px] font-semibold text-[#242225]"><span>{title}</span><ChevronDown size={15} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} /></button>{open && <div className="mt-4">{children}</div>}</section>;
}

function FilterPanel({ categoryName, subcategories, selectedSubcategory, onSubcategory, brands, selectedBrands, onBrand, priceMax, onPriceMax, availability, onAvailability, onClear }: {
  categoryName: string;
  subcategories: string[];
  selectedSubcategory: string;
  onSubcategory: (value: string) => void;
  brands: string[];
  selectedBrands: string[];
  onBrand: (value: string) => void;
  priceMax: number;
  onPriceMax: (value: number) => void;
  availability: Availability;
  onAvailability: (value: Availability) => void;
  onClear: () => void;
}) {
  return <div>
    <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a5a2e]">Refine</p><h2 className="mt-1 text-lg font-medium text-[#242225]">Filter by</h2></div><button type="button" onClick={onClear} className="text-[11px] font-medium text-[#8d6b53] underline underline-offset-4">Clear all</button></div>
    <FilterSection title={categoryName === "Perfumes" ? "Collection" : "Category"}><div className="space-y-1"><button type="button" onClick={() => onSubcategory("")} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${!selectedSubcategory ? "bg-[#f3ece5] font-semibold text-[#6f4429]" : "text-[#55504b] hover:bg-[#faf7f4]"}`}><span>All {categoryName}</span>{!selectedSubcategory && <Check size={14} />}</button>{subcategories.slice(0, 8).map(item => <button type="button" key={item} onClick={() => onSubcategory(item)} className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${selectedSubcategory === item ? "bg-[#f3ece5] font-semibold text-[#6f4429]" : "text-[#55504b] hover:bg-[#faf7f4]"}`}><span>{item}</span>{selectedSubcategory === item && <Check size={14} />}</button>)}</div></FilterSection>
    <FilterSection title="Brand"><div className="space-y-3">{brands.map(brand => <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-xs text-[#55504b]"><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => onBrand(brand)} className="h-4 w-4 rounded border-[#cfc7c0] accent-[#242225]" /><span>{brand}</span></label>)}</div></FilterSection>
    <FilterSection title="Price"><div className="space-y-3"><div className="flex items-center justify-between text-xs text-[#6e6862]"><span>Up to</span><strong className="font-semibold text-[#242225]">SAR {priceMax}</strong></div><input aria-label="Maximum price" type="range" min="100" max="700" step="25" value={priceMax} onChange={event => onPriceMax(Number(event.target.value))} className="w-full accent-[#242225]" /><div className="flex justify-between text-[10px] text-[#aaa39c]"><span>SAR 100</span><span>SAR 700+</span></div></div></FilterSection>
    <FilterSection title="Availability"><div className="space-y-2">{[{ value: "all" as const, label: "All products" }, { value: "in-stock" as const, label: "In stock" }, { value: "out-of-stock" as const, label: "Out of stock" }].map(option => <button type="button" key={option.value} onClick={() => onAvailability(option.value)} className={`flex w-full items-center gap-2.5 text-left text-xs ${availability === option.value ? "font-semibold text-[#242225]" : "text-[#6e6862]"}`}><span className={`grid h-4 w-4 place-items-center rounded-full border ${availability === option.value ? "border-[#242225]" : "border-[#cfc7c0]"}`}>{availability === option.value && <span className="h-2 w-2 rounded-full bg-[#242225]" />}</span>{option.label}</button>)}</div></FilterSection>
  </div>;
}

type MobileFilterTab = "category" | "brand" | "price" | "availability";

function MobileFilterSheet({ categoryName, subcategories, selectedSubcategory, onSubcategory, brands, selectedBrands, onBrand, priceMax, onPriceMax, availability, onAvailability, onClear, resultCount, open, onClose }: {
  categoryName: string;
  subcategories: string[];
  selectedSubcategory: string;
  onSubcategory: (value: string) => void;
  brands: string[];
  selectedBrands: string[];
  onBrand: (value: string) => void;
  priceMax: number;
  onPriceMax: (value: number) => void;
  availability: Availability;
  onAvailability: (value: Availability) => void;
  onClear: () => void;
  resultCount: number;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<MobileFilterTab>("category");
  const mobileDrag = useMobileSheetDrag(onClose);
  if (!open) return null;
  const activeLabels = [selectedSubcategory, ...selectedBrands, priceMax < 700 ? `Up to SAR ${priceMax}` : "", availability !== "all" ? availability.replace("-", " ") : ""].filter(Boolean);
  const tabs: Array<{ value: MobileFilterTab; label: string }> = [
    { value: "category", label: categoryName === "Perfumes" ? "Collection" : "Category" },
    { value: "brand", label: "Brand" },
    { value: "price", label: "Price" },
    { value: "availability", label: "Availability" },
  ];
  return <div className="store-mobile-sheet-overlay fixed inset-0 z-[120] bg-[#0f172a]/35 backdrop-blur-[3px] md:hidden" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-label="Filter products" style={mobileDrag.dragStyle} onClick={event => event.stopPropagation()} className="category-filter-sheet store-mobile-sheet absolute inset-x-0 bottom-0 flex max-h-[calc(100dvh-16px)] flex-col overflow-hidden shadow-2xl">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="relative flex min-h-9 items-center justify-center pb-3"><h2 className="text-center font-semibold text-[#171717]">Filter By</h2><button type="button" onClick={onClose} aria-label="Close filters" className="absolute end-0 top-0 grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button></div>
      {activeLabels.length > 0 && <div className="mb-3 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">{activeLabels.map(label => <span key={label} className="shrink-0 rounded-full bg-[#f0efed] px-2.5 py-1 text-[10px] text-[#77706a]">{label}<span className="ms-1 text-[#aaa39c]">×</span></span>)}</div>}
      <div className="category-filter-content flex min-h-[220px] max-h-[min(45dvh,380px)] border-t border-[#f0eeeb]">
        <nav aria-label="Filter categories" className="w-[100px] shrink-0 border-e border-[#eeeae6] py-3 pe-3">{tabs.map(item => <button type="button" key={item.value} onClick={() => setTab(item.value)} className={`mb-1 block w-full rounded-full px-3 py-3 text-start text-[11px] transition-colors ${tab === item.value ? "bg-[#171717] font-medium text-white" : "text-[#3d3936]"}`}>{item.label}</button>)}</nav>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto py-3 ps-4 pe-1">
          {tab === "category" && <div className="space-y-0">{["", ...subcategories.slice(0, 8)].map(value => { const label = value || `All ${categoryName}`; const selected = selectedSubcategory === value; return <button type="button" key={label} onClick={() => onSubcategory(value)} className="flex min-h-11 w-full items-center justify-between border-b border-[#f0eeeb] text-start text-[11px] text-[#34302d]"><span>{label}</span><span className={`grid h-4 w-4 place-items-center rounded-full border ${selected ? "border-[#171717]" : "border-[#c9c3bd]"}`}>{selected && <span className="h-2 w-2 rounded-full bg-[#171717]" />}</span></button>; })}</div>}
          {tab === "brand" && <div className="space-y-0">{brands.map(brand => <label key={brand} className="flex min-h-11 cursor-pointer items-center justify-between border-b border-[#f0eeeb] text-[11px] text-[#34302d]"><span>{brand}</span><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => onBrand(brand)} className="h-4 w-4 rounded border-[#c9c3bd] accent-[#171717]" /></label>)}</div>}
          {tab === "price" && <div className="space-y-5 pt-3"><div className="flex items-center justify-between text-[11px] text-[#6e6862]"><span>Maximum price</span><strong className="font-semibold text-[#171717]">SAR {priceMax}</strong></div><input aria-label="Maximum price" type="range" min="100" max="700" step="25" value={priceMax} onChange={event => onPriceMax(Number(event.target.value))} className="mt-4 w-full accent-[#171717]" /><div className="flex justify-between text-[10px] text-[#aaa39c]"><span>SAR 100</span><span>SAR 700+</span></div></div>}
          {tab === "availability" && <div className="space-y-0">{[{ value: "all" as const, label: "All products" }, { value: "in-stock" as const, label: "In stock" }, { value: "out-of-stock" as const, label: "Out of stock" }].map(option => <button type="button" key={option.value} onClick={() => onAvailability(option.value)} className="flex min-h-11 w-full items-center justify-between border-b border-[#f0eeeb] text-start text-[11px] text-[#34302d]"><span>{option.label}</span><span className={`grid h-4 w-4 place-items-center rounded-full border ${availability === option.value ? "border-[#171717]" : "border-[#c9c3bd]"}`}>{availability === option.value && <span className="h-2 w-2 rounded-full bg-[#171717]" />}</span></button>)}</div>}
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-[#eeeae6] pt-4"><button type="button" onClick={onClear} className="px-1 text-[11px] text-[#6e6862] underline underline-offset-4">Clear</button><button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg bg-[#171717] text-[11px] font-semibold text-white">Found {resultCount} items</button></div>
    </section>
  </div>;
}

function MobileSortSheet({ open, onClose, sort, onSort }: { open: boolean; onClose: () => void; sort: SortOption; onSort: (value: SortOption) => void }) {
  const mobileDrag = useMobileSheetDrag(onClose);
  if (!open) return null;
  const options: Array<{ value: SortOption; label: string }> = [
    { value: "newest", label: "New" },
    { value: "recommended", label: "Best Match" },
    { value: "recommended", label: "Most Popular" },
    { value: "recommended", label: "Top Sellers" },
    { value: "price-low", label: "Price: low to high" },
    { value: "price-high", label: "Price: high to low" },
    { value: "name", label: "Product Name A - Z" },
  ];
  return <div className="store-mobile-sheet-overlay fixed inset-0 z-[120] bg-[#0f172a]/35 backdrop-blur-[3px] md:hidden" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-label="Sort products" style={mobileDrag.dragStyle} onClick={event => event.stopPropagation()} className="category-sort-sheet store-mobile-sheet absolute inset-x-0 bottom-0 flex max-h-[calc(100dvh-16px)] flex-col overflow-hidden shadow-2xl">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="relative flex min-h-9 items-center justify-center pb-3"><h2 className="text-center font-semibold text-[#171717]">Sort By</h2><button type="button" onClick={onClose} aria-label="Close sorting options" className="absolute end-0 top-0 grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button></div>
      <div className="category-sort-options max-h-[calc(100dvh-170px)] overflow-y-auto border-t border-[#f0eeeb]">{options.map(option => <button type="button" key={option.label} onClick={() => { onSort(option.value); onClose(); }} className={`flex min-h-11 w-full items-center justify-center border-b border-[#f0eeeb] text-[11px] ${sort === option.value ? "font-semibold text-[#171717]" : "text-[#34302d]"}`}>{option.label}</button>)}</div>
    </section>
  </div>;
}

function MobileCategoryControls({ filterCount, resultCount, onOpenFilter, onOpenSort }: { filterCount: number; resultCount: number; onOpenFilter: () => void; onOpenSort: () => void }) {
  return <div className="category-mobile-controls mx-auto flex w-full max-w-[1240px] items-center gap-2 border-b border-[#ebe7e2] bg-[#fbfaf8] px-5 py-4 md:hidden">
    <button type="button" onClick={onOpenFilter} className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[15px] border border-[#d7d2cd] bg-white px-3 text-[12px] text-[#34302d]"><SlidersHorizontal size={14} strokeWidth={1.7} /> <span>Filter</span>{filterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#171717] px-1.5 text-[10px] font-medium text-white">{filterCount}</span>}</button>
    <button type="button" onClick={onOpenSort} className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-[15px] border border-[#d7d2cd] bg-white px-3 text-[12px] text-[#34302d]"><ArrowDownUp size={14} strokeWidth={1.7} /><span>Sort</span><ChevronDown size={14} strokeWidth={1.7} /></button>
    <span className="sr-only">{resultCount} results</span>
  </div>;
}

export default function CategoryListingPageV2() {
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category") ?? "Perfumes";
  const category = CATEGORY_GROUPS.find(group => group.name.toLowerCase() === requestedCategory.toLowerCase()) ?? CATEGORY_GROUPS[0];
  const requestedSubcategory = params.get("subcategory") ?? "";
  const { direction } = useStoreLocale();
  const { favoriteNames, toggleFavorite } = useStoreFavorites();
  const { cartItems, addToCart } = useStoreCart();
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [mobileFilterSheetOpen, setMobileFilterSheetOpen] = useState(false);
  const filtersOpen = false;
  const setFiltersOpen = setMobileFilterSheetOpen;
  const [sortOpen, setSortOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [sort, setSort] = useState<SortOption>("recommended");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(700);
  const [availability, setAvailability] = useState<Availability>("all");
  const products = useMemo(() => makeCategoryProducts(category.name), [category.name]);
  const subcategories = category.items.filter(item => item.toLowerCase() !== `all ${category.name}`.toLowerCase());
  const brands = useMemo(() => Array.from(new Set(products.map(product => product.brand))), [products]);
  const activeProducts = useMemo(() => {
    const segmentProducts = requestedSubcategory ? products.filter(product => !product.segments || product.segments.includes(requestedSubcategory)) : products;
    const filtered = segmentProducts.filter(product => (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) && product.price <= priceMax && (availability === "all" || (availability === "out-of-stock" ? product.outOfStock : !product.outOfStock)));
    return [...filtered].sort((left, right) => {
      if (sort === "price-low") return left.price - right.price;
      if (sort === "price-high") return right.price - left.price;
      if (sort === "name") return left.name.localeCompare(right.name);
      if (sort === "newest") return Number(Boolean(right.badge)) - Number(Boolean(left.badge));
      return products.indexOf(left) - products.indexOf(right);
    });
  }, [availability, priceMax, products, requestedSubcategory, selectedBrands, sort]);
  const hasFilters = Boolean(requestedSubcategory || selectedBrands.length || priceMax < 700 || availability !== "all");
  const clearFilters = () => { setSelectedBrands([]); setPriceMax(700); setAvailability("all"); if (requestedSubcategory) window.location.assign(categoryHref(category.name)); };
  const selectSubcategory = (value: string) => window.location.assign(categoryHref(category.name, value || undefined));
  const toggleBrand = (brand: string) => setSelectedBrands(current => current.includes(brand) ? current.filter(item => item !== brand) : [...current, brand]);
  const handleAdd = (product: Product, quantity: number, variant?: string) => { const item: StoreCartItem = { id: `${product.name}-${variant ?? "default"}`, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image, quantity, variant }; addToCart(item); setToast(`${product.name} added to cart`); window.setTimeout(() => setToast(""), 2200); };
  const handleFavorite = (product: Product) => toggleFavorite({ id: product.name, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image });
  const filterPanelProps = { categoryName: category.name, subcategories, selectedSubcategory: requestedSubcategory, onSubcategory: selectSubcategory, brands, selectedBrands, onBrand: toggleBrand, priceMax, onPriceMax: setPriceMax, availability, onAvailability: setAvailability, onClear: clearFilters };
  const pageTitle = requestedSubcategory || category.name;
  const pageDescription = requestedSubcategory ? `Discover our ${requestedSubcategory.toLowerCase()} collection, selected for the Deraah ritual.` : category.description || `Explore the full ${category.name.toLowerCase()} collection and find the pieces that fit your ritual.`;
  return <div dir={direction} className="store-category-page min-h-screen bg-[#fbfaf8] font-sans text-start text-[#161616]">
    <MobileFilterSheet {...filterPanelProps} resultCount={activeProducts.length} open={mobileFilterSheetOpen} onClose={() => setMobileFilterSheetOpen(false)} />
    <MobileSortSheet open={sortOpen} onClose={() => setSortOpen(false)} sort={sort} onSort={setSort} />
    <StoreHeader />
    <main>
      <section className="border-b border-[#ebe7e2] bg-[#f3ece5] px-5 pb-9 pt-8 sm:px-8 sm:pb-12 sm:pt-12 lg:px-12"><div className="mx-auto max-w-[1240px]"><nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] text-[#7e746c]"><a href="/" className="no-underline transition-colors hover:text-[#9a5a2e]">Home</a><ArrowRight size={12} /><a href={categoryHref(category.name)} className="no-underline transition-colors hover:text-[#9a5a2e]">{category.name}</a>{requestedSubcategory && <><ArrowRight size={12} /><span className="font-medium text-[#4f4741]">{requestedSubcategory}</span></>}</nav><div className="mt-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#9a5a2e]">Category collection</p><h1 className="mt-3 text-4xl font-medium tracking-[-.045em] text-[#2d2522] sm:text-5xl">{pageTitle}</h1><p className="mt-4 max-w-[580px] text-sm leading-6 text-[#706a65]">{pageDescription}</p></div><div className="flex items-center gap-3 text-xs text-[#7c746d]"><span>{activeProducts.length} products</span><span className="h-1 w-1 rounded-full bg-[#b8ada3]" /><span>Curated for you</span></div></div><div className="mt-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"><a href={categoryHref(category.name)} className={`shrink-0 rounded-full border px-4 py-2 text-xs no-underline transition-colors ${!requestedSubcategory ? "border-[#242225] bg-[#242225] text-white" : "border-[#d9cec4] bg-white/70 text-[#5c534d] hover:border-[#9a5a2e] hover:text-[#9a5a2e]"}`}>All {category.name}</a>{subcategories.slice(0, 8).map(item => <a key={item} href={categoryHref(category.name, item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs no-underline transition-colors ${requestedSubcategory === item ? "border-[#242225] bg-[#242225] text-white" : "border-[#d9cec4] bg-white/70 text-[#5c534d] hover:border-[#9a5a2e] hover:text-[#9a5a2e]"}`}>{item}</a>)}</div></div></section>
      <MobileCategoryControls filterCount={selectedBrands.length + (requestedSubcategory ? 1 : 0) + (availability !== "all" ? 1 : 0) + (priceMax < 700 ? 1 : 0)} resultCount={activeProducts.length} onOpenFilter={() => setMobileFilterSheetOpen(true)} onOpenSort={() => setSortOpen(true)} />
      <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12"><div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#ebe7e2] pb-5"><div className="flex items-center gap-3"><button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d9cec4] bg-white px-4 text-xs font-medium text-[#242225] md:hidden"><SlidersHorizontal size={15} /> Filters{hasFilters && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#242225] px-1 text-[9px] text-white">{selectedBrands.length + (requestedSubcategory ? 1 : 0) + (availability !== "all" ? 1 : 0) + (priceMax < 700 ? 1 : 0)}</span>}</button><p className="text-xs text-[#7c746d"><strong className="font-semibold text-[#242225]">{activeProducts.length}</strong> results</p></div><label className="flex h-10 items-center gap-2 rounded-full border border-[#d9cec4] bg-white px-4 text-xs text-[#6e6862]">Sort by<select value={sort} onChange={event => setSort(event.target.value as SortOption)} className="bg-transparent font-medium text-[#242225] outline-none"><option value="recommended">Recommended</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select><ChevronDown size={14} /></label></div><div className="flex items-start gap-8"><aside className="hidden w-[232px] shrink-0 rounded-2xl border border-[#ebe7e2] bg-white px-5 py-5 md:block"><FilterPanel {...filterPanelProps} /></aside><div className="min-w-0 flex-1">{activeProducts.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-4 lg:gap-x-5">{activeProducts.map(product => { const storeProduct = toStoreProduct(product); return <ProductCard key={product.name} product={storeProduct} layout="grid" favorite={favoriteNames.includes(product.name)} onFavorite={() => handleFavorite(storeProduct)} onAddToCart={handleAdd} />; })}</div> : <div className="rounded-2xl border border-dashed border-[#d9cec4] bg-white px-6 py-20 text-center"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a5a2e]">No matches yet</p><h2 className="mt-3 text-2xl font-medium text-[#242225]">Try adjusting your filters</h2><p className="mx-auto mt-2 max-w-[360px] text-sm leading-6 text-[#77706a]">There are no products matching the current selection. Clear a filter to continue exploring.</p><button type="button" onClick={clearFilters} className="mt-6 rounded-full bg-[#242225] px-5 py-3 text-xs font-semibold text-white">Clear filters</button></div>}</div></div></section>
      <section className="border-y border-[#ebe7e2] bg-white"><div className="mx-auto grid max-w-[1240px] gap-0 px-5 sm:grid-cols-3 sm:px-8 lg:px-12"><div className="border-b border-[#ebe7e2] py-6 sm:border-b-0 sm:border-e sm:pe-8"><p className="text-xs font-semibold text-[#242225]">Curated with care</p><p className="mt-1 text-[11px] leading-5 text-[#7c746d]">Thoughtful picks from Deraah collections.</p></div><div className="border-b border-[#ebe7e2] py-6 sm:border-b-0 sm:border-e sm:px-8"><p className="text-xs font-semibold text-[#242225]">Fast delivery</p><p className="mt-1 text-[11px] leading-5 text-[#7c746d]">A smooth delivery experience across Saudi Arabia.</p></div><div className="py-6 sm:ps-8"><p className="text-xs font-semibold text-[#242225]">Need a hand?</p><p className="mt-1 text-[11px] leading-5 text-[#7c746d]">Our team is here to help you find your signature.</p></div></div></section>
    </main>
    {filtersOpen && <div className="fixed inset-0 z-[100] bg-black/35 md:hidden" onClick={() => setFiltersOpen(false)}><section role="dialog" aria-modal="true" aria-label="Filter products" onClick={event => event.stopPropagation()} className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[26px] bg-white px-5 pb-8 pt-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-[#242225]">Filter products</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e1dd] text-[#55504b]"><X size={17} /></button></div><FilterPanel {...filterPanelProps} /><button type="button" onClick={() => setFiltersOpen(false)} className="mt-5 h-11 w-full rounded-xl bg-[#242225] text-xs font-semibold text-white">Show {activeProducts.length} results</button></section></div>}
    {toast && <div role="status" className="fixed bottom-24 left-1/2 z-[160] -translate-x-1/2 rounded-full bg-[#171717] px-5 py-3 text-xs font-medium text-white shadow-xl md:bottom-6">{toast}</div>}
    <StoreFooter /><div className="md:hidden"><StoreMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(collapsed => !collapsed)} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} /></div>
  </div>;
}
