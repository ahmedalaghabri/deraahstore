import { useMemo, useState } from "react";
import { ArrowRight, Filter, Search, SlidersHorizontal } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import StoreRouteFrame from "./StoreRouteFrame";
import { SEARCH_PRODUCTS, type SearchProduct } from "./StoreSearchPanel";
import { useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";

function toCartItem(product: SearchProduct): StoreCartItem {
  return { id: `search-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name: product.name, brand: product.brand, price: String(product.price), oldPrice: product.oldPrice ? String(product.oldPrice) : undefined, image: product.image, quantity: 1 };
}

function SearchCard({ product, isArabic, onAdd }: { product: SearchProduct; isArabic: boolean; onAdd: () => void }) {
  const name = isArabic ? product.nameAr : product.name;
  const category = isArabic ? product.categoryAr : product.category;
  return <article className="group overflow-hidden rounded-[22px] border border-[#e6eaee] bg-white shadow-[0_10px_28px_rgba(16,24,40,.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(16,24,40,.1)]">
    <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} className="block no-underline">
      <div className="relative aspect-square bg-[#f2f3f3] p-6"><img src={product.image} alt={name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />{product.badge && <span className="absolute start-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#59616a] shadow-sm">{isArabic ? product.badgeAr : product.badge}</span>}</div>
      <div className="p-4"><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#9da3aa]">{isArabic ? product.brandAr : product.brand}</p><h2 className="mt-2 min-h-[44px] text-sm font-semibold leading-6 text-[#252a30]">{name}</h2><p className="mt-1 text-[11px] text-[#8a929b]">{category}</p><div className="mt-4 flex items-center justify-between gap-3"><RiyalPrice value={product.price} /><span className="text-[11px] text-[#a4aab0] line-through">{product.oldPrice ? <RiyalPrice value={product.oldPrice} /> : null}</span></div></div>
    </a>
    <button type="button" onClick={onAdd} className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl bg-[#20242a] px-3 py-3 text-xs font-semibold text-white transition hover:bg-[#3b4148]"><span>{isArabic ? "أضف إلى السلة" : "Add to cart"}</span><ArrowRight size={14} /></button>
  </article>;
}

export default function StoreSearchPage() {
  const { language } = useStoreLocale();
  const { addToCart } = useStoreCart();
  const isArabic = language === "العربية";
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("query") ?? params.get("q") ?? "";
  });
  const [category, setCategory] = useState("All");
  const [priceMax, setPriceMax] = useState(700);
  const [sort, setSort] = useState("relevance");
  const [addedName, setAddedName] = useState("");
  const labels: Record<string, string> = { All: "الكل", Perfumes: "العطور", Oud: "العود", Gifts: "الهدايا", Accessories: "الإكسسوارات" };
  const categories = ["All", "Perfumes", "Oud", "Gifts", "Accessories"];
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return SEARCH_PRODUCTS.filter(product => {
      const searchable = [product.name, product.nameAr, product.brand, product.brandAr, product.category, product.categoryAr, ...product.tags].join(" ").toLocaleLowerCase();
      return (!normalized || searchable.includes(normalized)) && (category === "All" || product.category === category) && product.price <= priceMax;
    }).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "value" ? ((b.oldPrice ?? b.price) - b.price) - ((a.oldPrice ?? a.price) - a.price) : 0);
  }, [category, priceMax, query, sort]);
  const add = (product: SearchProduct) => { addToCart(toCartItem(product)); setAddedName(product.name); window.setTimeout(() => setAddedName(""), 2200); };
  return <StoreRouteFrame mainClassName="pb-10">
    <section className="border-b border-[#e9edf0] bg-white px-5 pb-9 pt-28 sm:px-8 sm:pb-12 lg:px-12"><div className="mx-auto max-w-[1240px]"><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#b51d6a]">{isArabic ? "اكتشف المتجر" : "Discover the store"}</p><div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="text-3xl font-semibold tracking-[-.04em] text-[#20242a] sm:text-5xl">{isArabic ? "محرك البحث" : "Search the store"}</h1><p className="mt-3 max-w-[560px] text-sm leading-6 text-[#79818a]">{isArabic ? "ابحث عن العطور والهدايا والعلامات التجارية، ثم صفِّ النتائج بالطريقة التي تناسبك." : "Find fragrances, gifts and brands, then refine the results around what matters to you."}</p></div><a href="/ask-ai" className="inline-flex items-center gap-2 text-xs font-semibold text-[#20242a] underline underline-offset-4">{isArabic ? "تحتاج مساعدة؟ اسأل AI" : "Need help? Ask AI"}<ArrowRight size={14} /></a></div><label className="mt-8 flex h-14 items-center gap-3 rounded-2xl border border-[#cfd6dc] bg-[#f8fafb] px-4 shadow-[0_10px_24px_rgba(15,23,42,.04)] focus-within:border-[#20242a]"><Search size={20} className="shrink-0 text-[#717a83]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={isArabic ? "ابحث عن منتج، علامة أو تصنيف..." : "Search products, brands or categories..."} className="min-w-0 flex-1 bg-transparent text-sm text-[#20242a] outline-none placeholder:text-[#9ca4ac]" /><kbd className="hidden rounded-lg border border-[#dce1e5] bg-white px-2 py-1 text-[10px] text-[#8b939b] sm:block">⌘ K</kbd></label></div></section>
    <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8 lg:px-12"><div className="flex flex-col gap-5 lg:flex-row lg:items-start"><aside className="w-full rounded-2xl border border-[#e5e9ed] bg-white p-4 lg:sticky lg:top-24 lg:w-[230px]"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">{isArabic ? "تصفية النتائج" : "Filter results"}</h2><Filter size={15} className="text-[#8e969f]" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[#9da4ab]">{isArabic ? "التصنيف" : "Category"}</p><div className="mt-3 flex gap-2 overflow-x-auto lg:flex-col">{categories.map(item => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-xl px-3 py-2 text-start text-xs transition ${category === item ? "bg-[#20242a] font-semibold text-white" : "text-[#68717b] hover:bg-[#f3f5f6]"}`}>{isArabic ? labels[item] : item}</button>)}</div><label className="mt-6 block border-t border-[#edf0f2] pt-5"><span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-[#9da4ab]"><span>{isArabic ? "السعر حتى" : "Price up to"}</span><strong className="text-xs normal-case tracking-normal text-[#252a30]"><RiyalPrice value={priceMax} /></strong></span><input type="range" min="100" max="700" step="10" value={priceMax} onChange={event => setPriceMax(Number(event.target.value))} className="mt-4 w-full accent-[#20242a]" /></label></aside><div className="min-w-0 flex-1"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-[#8b939c]">{results.length} {isArabic ? "نتيجة" : "results"}</p><h2 className="mt-1 text-lg font-semibold">{query ? `“${query}”` : isArabic ? "منتجات مقترحة لك" : "Products for you"}</h2></div><label className="inline-flex items-center gap-2 rounded-xl border border-[#e1e6ea] bg-white px-3 py-2 text-xs text-[#6c747d]"><SlidersHorizontal size={14} /><select value={sort} onChange={event => setSort(event.target.value)} className="bg-transparent outline-none"><option value="relevance">{isArabic ? "الأكثر صلة" : "Relevance"}</option><option value="value">{isArabic ? "أفضل قيمة" : "Best value"}</option><option value="price-low">{isArabic ? "الأقل سعراً" : "Price: low to high"}</option><option value="price-high">{isArabic ? "الأعلى سعراً" : "Price: high to low"}</option></select></label></div>{results.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{results.map(product => <SearchCard key={product.name} product={product} isArabic={isArabic} onAdd={() => add(product)} />)}</div> : <div className="rounded-2xl border border-dashed border-[#d5dce1] bg-white px-6 py-16 text-center"><Search className="mx-auto text-[#98a1aa]" /><h2 className="mt-4 text-lg font-semibold">{isArabic ? "لم نجد نتائج مطابقة" : "No matching products"}</h2><p className="mt-2 text-sm text-[#7d8790]">{isArabic ? "جرّب كلمة أخرى أو أعد ضبط التصفية." : "Try a different term or reset the filters."}</p></div>}</div></div></section>
    {addedName && <div role="status" className="fixed bottom-6 start-1/2 z-[160] -translate-x-1/2 rounded-full bg-[#20242a] px-5 py-3 text-xs font-semibold text-white shadow-xl">{isArabic ? "أضيف المنتج إلى السلة" : "Product added to cart"}</div>}
  </StoreRouteFrame>;
}
