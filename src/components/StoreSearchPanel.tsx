import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Clock3, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";
import PromptBar from "./PromptBar";
import { useStoreLocale } from "./StoreLocaleContext";

type SearchProduct = {
  name: string;
  nameAr: string;
  brand: string;
  brandAr: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  categoryAr: string;
  tags: string[];
  badge?: string;
  badgeAr?: string;
};

const SEARCH_PRODUCTS: SearchProduct[] = [
  { name: "Link White Limited Edition 150ml", nameAr: "لينك وايت إصدار محدود 150 مل", brand: "LINK", brandAr: "لينك", price: 288, oldPrice: 500, image: "/product-assets/real-products/link-white.png", category: "Perfumes", categoryAr: "العطور", tags: ["white", "limited", "link"], badge: "1+2 Free", badgeAr: "1+2 مجانًا" },
  { name: "Green Woods Eau de Parfum", nameAr: "جرين وودز أو دو بارفان", brand: "LINK", brandAr: "لينك", price: 258, oldPrice: 600, image: "/product-assets/real-products/green-woods.png", category: "Perfumes", categoryAr: "العطور", tags: ["green", "woods", "link"], badge: "1+2 Free", badgeAr: "1+2 مجانًا" },
  { name: "Black Woods Eau de Toilette", nameAr: "بلاك وودز أو دو تواليت", brand: "LINK", brandAr: "لينك", price: 208, oldPrice: 500, image: "/product-assets/real-products/black-woods.png", category: "Perfumes", categoryAr: "العطور", tags: ["black", "woody", "link"] },
  { name: "Maroon Perfume by Link 200ml", nameAr: "عطر مارون من لينك 200 مل", brand: "LINK", brandAr: "لينك", price: 308, oldPrice: 420, image: "/product-assets/real-products/maroon.png", category: "Perfumes", categoryAr: "العطور", tags: ["maroon", "floral", "link"], badge: "1+2 Free", badgeAr: "1+2 مجانًا" },
  { name: "Silver Woods Eau de Parfum", nameAr: "سيلفر وودز أو دو بارفان", brand: "LINK", brandAr: "لينك", price: 208, oldPrice: 500, image: "/product-assets/real-products/silver-woods.png", category: "Perfumes", categoryAr: "العطور", tags: ["silver", "woods", "link"] },
  { name: "DERAAH PRIVATE Enjoy Eau de Parfum 100ml", nameAr: "درعه برايفت إنجوي أو دو بارفان 100 مل", brand: "DERAAH PRIVATE", brandAr: "درعه برايفت", price: 159, oldPrice: 378, image: "/product-assets/private-555.png", category: "Gifts", categoryAr: "الهدايا", tags: ["555", "private", "gift"], badge: "Special offer", badgeAr: "عرض خاص" },
  { name: "MAIOS Aroma 100ml", nameAr: "مايوس أروما 100 مل", brand: "MAIOS", brandAr: "مايوس", price: 108, oldPrice: 268, image: "/product-assets/misk-toffee.png", category: "Oud", categoryAr: "العود", tags: ["aroma", "oud", "maios"] },
  { name: "PROUD Suave Perfume", nameAr: "عطر براود سوف", brand: "PROUD", brandAr: "براود", price: 294, oldPrice: 420, image: "/product-assets/leader.png", category: "Perfumes", categoryAr: "العطور", tags: ["suave", "proud", "signature"] },
  { name: "LINK Pedestal Extrait 100ml", nameAr: "لينك بيدستال إكستريت 100 مل", brand: "LINK", brandAr: "لينك", price: 348, image: "/product-assets/gallery/secondary-4.png", category: "Perfumes", categoryAr: "العطور", tags: ["pedestal", "extrait", "link"] },
  { name: "Bloom Gift Collection", nameAr: "مجموعة هدايا بلوم", brand: "MAIOS", brandAr: "مايوس", price: 190, oldPrice: 299, image: "/product-assets/buy-with-pink-detail.png", category: "Gifts", categoryAr: "الهدايا", tags: ["bloom", "gift", "collection"] },
];

const POPULAR_SEARCHES = ["Green Woods", "1+2 Free", "Gift collections", "Oud", "Deraah Private"];
const SEARCH_CATEGORY_LABELS: Record<string, string> = { All: "الكل", Perfumes: "العطور", Oud: "العود", Gifts: "الهدايا", Accessories: "الإكسسوارات" };
const POPULAR_SEARCH_LABELS: Record<string, string> = { "Green Woods": "جرين وودز", "1+2 Free": "1+2 مجانًا", "Gift collections": "مجموعات الهدايا", Oud: "العود", "Deraah Private": "درعه برايفت" };
const SEARCH_CATEGORIES = Object.keys(SEARCH_CATEGORY_LABELS);
const SEARCH_STORAGE_KEY = "deraah-recent-searches";
type SortOption = "relevance" | "price-low" | "price-high" | "value";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function SearchProductCard({ product, isArabic }: { product: SearchProduct; isArabic: boolean }) {
  const productName = isArabic ? product.nameAr : product.name;
  const brand = isArabic ? product.brandAr : product.brand;
  return (
    <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} className="group block h-fit min-w-0 overflow-hidden rounded-2xl border border-[#edf0f2] bg-white no-underline transition hover:-translate-y-0.5 hover:border-[#d9dfe5] hover:shadow-[0_12px_28px_rgba(15,23,42,.08)]">
      <span className="relative block aspect-square overflow-hidden bg-[#f5f4f2]">
        {product.badge && <span className="absolute start-1.5 top-1.5 z-10 rounded-full bg-white/95 px-1.5 py-0.5 text-[7px] font-semibold text-[#5e6670] shadow-sm">{isArabic ? product.badgeAr : product.badge}</span>}
        <img src={product.image} alt={productName} loading="lazy" className="block h-full w-full object-contain p-5 transition duration-300" />
      </span>
      <span className="block min-w-0 p-2">
        <span className="block text-[12px] font-semibold uppercase tracking-[.1em] text-[#9ca2aa]">{brand}</span>
        <strong className="mt-1 block min-h-[32px] line-clamp-2 text-[12px] font-semibold leading-4 text-[#20242a]">{productName}</strong>
      </span>
    </a>
  );
}

function SearchProductRow({ product, rank, isArabic }: { product: SearchProduct; rank: number; isArabic: boolean }) {
  const productName = isArabic ? product.nameAr : product.name;
  return (
    <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} className="group flex items-center gap-3 rounded-xl px-2 py-2 no-underline transition-colors hover:bg-white">
      <span className="w-4 shrink-0 text-center text-[12px] font-medium text-[#7f8790]">{rank}</span>
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#f1f2f2]">
        <img src={product.image} alt={productName} loading="lazy" className="block h-full w-full max-h-full max-w-full object-contain p-1" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium text-[#242830]">{productName}</span>
        <span className="mt-0.5 block text-[11px] text-[#8a929b]">{isArabic ? product.categoryAr : product.category}</span>
      </span>
      <ArrowRight size={14} className="shrink-0 text-[#9ba2aa] transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

function SearchFeaturedProduct({ product, isArabic }: { product: SearchProduct; isArabic: boolean }) {
  const productName = isArabic ? product.nameAr : product.name;
  return (
    <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} className="group mt-4 block overflow-hidden rounded-2xl border border-[#e5e7e9] bg-white no-underline transition hover:border-[#cfd4d9] hover:shadow-[0_12px_26px_rgba(15,23,42,.08)]">
      <span className="relative block aspect-[1.45] overflow-hidden bg-[#f1f2f2]">
        {product.badge && <span className="absolute start-3 top-3 z-10 rounded-full bg-white/90 px-2 py-1 text-[8px] font-semibold text-[#5e6670] shadow-sm">{isArabic ? product.badgeAr : product.badge}</span>}
        <img src={product.image} alt={productName} loading="lazy" className="block h-full w-full object-contain p-8" />
      </span>
      <span className="flex items-center gap-3 bg-[#171a1f] px-3 py-3 text-white">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-[#242830]">1</span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-[13px] font-semibold">{productName}</strong>
          <span className="mt-0.5 block text-[11px] text-white/65">{isArabic ? product.categoryAr : product.category}</span>
        </span>
        <ArrowRight size={18} className="shrink-0" />
      </span>
    </a>
  );
}

function SearchAiEmptyState({ language, query, onQueryChange }: { language: string; query: string; onQueryChange: (value: string) => void }) {
  const isArabic = language === "العربية";
  const copy = isArabic
    ? {
        eyebrow: "خدمة الضيوف",
        title: "ما الذي تود السؤال عنه؟",
        subtitle: "نحن في خدمتك للإجابة عن أسئلتك حول العطور أو أي منتج آخر.",
        questions: ["كيف أختار العطر المناسب لشخصيتي؟", "ما الفرق بين العطر وماء العطر؟", "كيف أجعل رائحة العطر تدوم طوال اليوم؟"],
        answers: ["ابدأ باختيار النفحات التي تحبها، مثل الحمضيات أو الزهور أو الأخشاب أو العنبر. جرّب العطر على بشرتك وانتظر قليلًا قبل اتخاذ قرارك.", "العطر المركز يحتوي عادةً على نسبة أعلى من الزيوت العطرية ويدوم لفترة أطول، بينما ماء العطر أخف ومناسب للاستخدام اليومي.", "ضع العطر على نقاط النبض مثل المعصمين والرقبة، ورطّب البشرة أولًا لتحافظ على الرائحة لمدة أطول."],
        placeholders: ["اسأل عن أي شيء تحب...", "نحن هنا في خدمتك..."],
        ask: "اسأل",
        service: "خدمة الضيوف",
      }
    : {
        eyebrow: "Guest service",
        title: "What would you like to ask?",
        subtitle: "We’re here to answer questions about fragrances or any other products.",
        questions: ["How do I choose a fragrance for my personality?", "What is the difference between perfume and eau de parfum?", "How can I make my fragrance last all day?"],
        answers: ["Start with the notes you enjoy, such as fresh citrus, soft florals, warm woods, or amber. Try the fragrance on your skin and give it a little time before deciding.", "Perfume usually has a higher fragrance-oil concentration and lasts longer, while eau de parfum is lighter and works well for everyday wear.", "Apply fragrance to pulse points like your wrists and neck, and moisturize your skin first to help the scent last longer."],
        placeholders: ["Ask about anything you like...", "We’re here to help you..."],
        ask: "Ask",
        service: "Guest service",
      };

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [conversation, setConversation] = useState<Array<{ question: string; answer: string }>>([]);
  useEffect(() => {
    const interval = window.setInterval(() => setPlaceholderIndex(current => (current + 1) % copy.placeholders.length), 3000);
    return () => window.clearInterval(interval);
  }, [copy.placeholders.length]);

  const answerForQuestion = () => isArabic
    ? "سأساعدك بكل سرور. أخبرني بتفضيلاتك أو المنتج الذي تبحث عنه وسأقترح لك ما يناسبك."
    : "I’ll be happy to help. Tell me what you prefer or which product you’re looking for, and I’ll suggest the best options.";

  const startConversation = (question: string, answer: string) => {
    setConversation(current => [...current, { question, answer }]);
    onQueryChange("");
  };

  return <div className="flex min-h-full flex-col items-center px-4 py-5 text-center md:justify-center md:px-6 md:py-20">
    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f7eaf0] text-[#b51d6a] sm:h-14 sm:w-14"><Sparkles size={21} strokeWidth={1.5} className="sm:h-6 sm:w-6" /></span>
    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#b51d6a] sm:mt-5">{copy.eyebrow}</p>
    <h2 className="mt-2 text-xl font-semibold tracking-[-.03em] text-[#20242a] sm:mt-3 sm:text-3xl">{copy.title}</h2>
    <p className="mt-2 max-w-[420px] text-xs leading-5 text-[#7b838c] sm:mt-3 sm:text-sm sm:leading-6">{copy.subtitle}</p>
    <div className="mt-5 grid w-full max-w-[680px] gap-2.5 text-start sm:mt-9 sm:gap-3 md:grid-cols-3">
      {copy.questions.map((question, index) => <button key={question} type="button" onClick={() => startConversation(question, copy.answers[index])} className="group flex min-h-[84px] items-center justify-between gap-3 rounded-2xl border border-[#e5e9ee] bg-white px-4 py-3 text-start text-xs font-medium leading-5 text-[#343a42] shadow-[0_6px_18px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:border-[#d6a5bc] hover:shadow-[0_10px_24px_rgba(15,23,42,.08)] sm:min-h-[92px] sm:py-4"><span>{question}</span><ArrowRight size={15} className="shrink-0 text-[#b51d6a] transition-transform group-hover:translate-x-0.5" /></button>)}
    </div>
    {conversation.length > 0 && <div className="mt-4 w-full max-w-[680px] space-y-2.5 text-start sm:mt-6 sm:space-y-3" aria-live="polite">
      {conversation.map((message, index) => <div key={`${message.question}-${index}`}>
        <div className="ms-auto max-w-[86%] rounded-2xl rounded-ee-md bg-[#171a1f] px-3.5 py-2.5 text-xs leading-5 text-white sm:px-4 sm:py-3">{message.question}</div>
        <div className="mt-2 max-w-[92%] rounded-2xl rounded-es-md border border-[#e5e9ee] bg-white px-3.5 py-2.5 text-xs leading-5 text-[#343a42] shadow-[0_6px_18px_rgba(15,23,42,.04)] sm:px-4 sm:py-3"><span className="mb-1 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#b51d6a]">{copy.service}</span>{message.answer}</div>
      </div>)}
    </div>}
    <PromptBar
      value={query}
      onValueChange={onQueryChange}
      placeholder={copy.placeholders[placeholderIndex]}
      aria-label={copy.placeholders[0]}
      className="store-ai-prompt-bar sticky bottom-0 z-10 mt-auto w-full max-w-[680px] sm:mt-5"
      color="#343a42"
      background="#ffffff"
      menuBackground="#ffffff"
      sparkColor="#b51d6a"
      width={680}
      radius={16}
      maxRows={3}
      onDictate={() => ""}
      onSend={text => {
        const trimmedQuestion = text.trim();
        if (trimmedQuestion) startConversation(trimmedQuestion, answerForQuestion());
      }}
    />
  </div>;
}

function SearchExperience({ open, onClose, initialMode = "search", isAuthenticated, isScrolled }: { open: boolean; onClose: () => void; initialMode?: "search" | "ai"; isAuthenticated: boolean; isScrolled: boolean }) {
  const { language, direction } = useStoreLocale();
  const isArabic = language === "العربية";
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileDrag = useMobileSheetDrag(onClose);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [category, setCategory] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(700);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [discoveryTab, setDiscoveryTab] = useState<"recent" | "recommended">("recommended");
  const [aiMode, setAiMode] = useState(initialMode === "ai");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveSuggestion(-1);
    setCategory("All");
    setFiltersOpen(false);
    setPriceMax(700);
    setSortBy("relevance");
    setDiscoveryTab("recommended");
    setAiMode(initialMode === "ai");
    try {
      const stored = JSON.parse(window.localStorage.getItem(SEARCH_STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) setRecentSearches(stored.filter((item): item is string => typeof item === "string").slice(0, 5));
    } catch {
      setRecentSearches([]);
    }
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const isBackKey = event.key === "BrowserBack" || event.key === "GoBack" || event.key === "Back" || (event.altKey && event.key === "ArrowLeft");
      if (event.key === "Escape" || isBackKey) {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const normalizedQuery = normalize(query);
  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    const terms = new Set<string>();
    SEARCH_PRODUCTS.forEach(product => {
      [product.name, product.brand, product.category, ...product.tags].forEach(term => {
        if (normalize(term).includes(normalizedQuery)) terms.add(term);
      });
    });
    return [...terms].slice(0, 6);
  }, [normalizedQuery]);

  const matches = useMemo(() => {
    const filtered = SEARCH_PRODUCTS.filter(product => {
      const searchable = normalize([product.name, product.brand, product.category, ...product.tags].join(" "));
      return (!normalizedQuery || searchable.includes(normalizedQuery)) && (category === "All" || product.category === category) && product.price <= priceMax;
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "value") return (b.oldPrice ?? b.price) - b.price - ((a.oldPrice ?? a.price) - a.price);
      return normalizedQuery ? Number(normalize(a.name).startsWith(normalizedQuery)) < Number(normalize(b.name).startsWith(normalizedQuery)) ? 1 : -1 : 0;
    });
  }, [category, normalizedQuery, priceMax, sortBy]);

  const discoveryProducts = discoveryTab === "recent" ? SEARCH_PRODUCTS.slice(0, 5) : SEARCH_PRODUCTS.slice(0, 4);
  const desktopHeaderOffset = isScrolled
    ? (isAuthenticated ? "md:me-[290px]" : "md:me-[240px]")
    : (isAuthenticated ? "md:me-[344.625px]" : "md:me-[290px]");
  const categoryLabel = (categoryName: string) => isArabic ? SEARCH_CATEGORY_LABELS[categoryName] ?? categoryName : categoryName;
  const popularLabel = (term: string) => isArabic ? POPULAR_SEARCH_LABELS[term] ?? term : term;

  const recordSearch = (value: string) => {
    const next = [value, ...recentSearches.filter(item => normalize(item) !== normalize(value))].slice(0, 5);
    setRecentSearches(next);
    try {
      window.localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable in private browsing; search still works.
    }
  };

  const submitSearch = (value = query) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    recordSearch(trimmed);
    onClose();
    window.location.assign(`/product-details?search=${encodeURIComponent(trimmed)}#details`);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion(current => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion(current => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      setQuery(suggestions[activeSuggestion]);
      submitSearch(suggestions[activeSuggestion]);
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <div dir={direction} role="presentation" className="store-search-overlay store-side-overlay store-mobile-sheet-overlay fixed inset-0 z-[30] bg-[#0f172a]/35 backdrop-blur-[3px]" onClick={onClose} />
      <div dir={direction} role="dialog" aria-modal="true" aria-label={isArabic ? "البحث في المتجر" : "Search products"} className="pointer-events-none fixed inset-0 z-[95] flex items-end md:items-start">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[1240px] items-end md:items-start md:px-0">
          <section onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className={`store-search-panel store-mobile-sheet pointer-events-auto flex max-h-[calc(100dvh-100px)] w-full flex-1 flex-col overflow-hidden rounded-[24px] border border-[#e5e9ee] bg-[#fbfcfd] text-start shadow-[0_24px_70px_rgba(15,23,42,.22)] transition-[margin,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${desktopHeaderOffset} md:mt-[82px] max-md:h-auto max-md:min-h-0 max-md:max-h-[calc(100dvh-16px)] max-md:rounded-t-[28px] max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0 max-md:overscroll-contain`}>
            <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
            <header className="flex shrink-0 items-center gap-3 border-b border-[#edf0f2] bg-white px-5 pb-3 pt-3 md:px-7 max-md:px-4 max-md:pt-0">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <img src="/product-assets/deraah-wordmark.svg" alt="DERAAH" className="hidden h-[27px] w-[82px] shrink-0 object-contain md:block" />
                <span aria-hidden="true" className="hidden h-7 w-px shrink-0 bg-[#e2e4e7] md:block" />
                {aiMode ? <div className="flex min-w-0 flex-1 items-center justify-end gap-5">
                  <kbd className="hidden shrink-0 rounded-lg border border-[#d8dde2] px-2 py-1 text-[10px] font-medium text-[#7c858e] md:inline">esc</kbd>
                  <div role="tablist" aria-label={isArabic ? "أوضاع البحث" : "Search modes"} className="inline-flex shrink-0 items-center rounded-full bg-[#f0f1f2] p-0.5">
                    <button type="button" role="tab" aria-selected={false} onClick={() => { setAiMode(false); window.requestAnimationFrame(() => inputRef.current?.focus()); }} className="inline-flex h-9 items-center gap-1 rounded-full px-4 text-xs font-medium text-[#5e6670] transition hover:text-[#20242a]"><Search size={13} /> {isArabic ? "بحث" : "Search"}</button>
                    <button type="button" role="tab" aria-selected={true} className="inline-flex h-9 items-center gap-1 rounded-full bg-[#171a1f] px-4 text-xs font-semibold text-white"><Sparkles size={13} strokeWidth={1.6} /> {isArabic ? "اسأل الذكاء الاصطناعي" : "Ask AI"}</button>
                  </div>
                </div> : <form className="flex min-w-0 flex-1 items-center gap-2 max-md:rounded-full max-md:border max-md:border-[#e1e6eb] max-md:bg-white max-md:px-2" onSubmit={event => { event.preventDefault(); submitSearch(activeSuggestion >= 0 ? suggestions[activeSuggestion] : query); }}>
                  <Search className="shrink-0 text-[#343a42]" size={20} strokeWidth={1.7} />
                  <input ref={inputRef} aria-label={isArabic ? "ابحث في المتجر" : "Search in the store"} aria-autocomplete="list" aria-controls="search-suggestions" aria-activedescendant={activeSuggestion >= 0 ? `search-suggestion-${activeSuggestion}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActiveSuggestion(-1); }} onKeyDown={handleInputKeyDown} placeholder={isArabic ? "ابحث عن المنتجات أو العلامات أو التصنيفات" : "Search products, brands, or categories"} className="min-w-0 flex-1 bg-transparent text-[14px] text-[#222] outline-none placeholder:text-[#969da6] max-md:text-[13px]" />
                  {query && <button type="button" aria-label={isArabic ? "مسح البحث" : "Clear search"} onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#7b838c] hover:bg-[#f1f3f5]"><X size={15} /></button>}
                  <kbd className="hidden shrink-0 rounded-lg border border-[#d8dde2] px-2 py-1 text-[10px] font-medium text-[#7c858e] md:inline">esc</kbd>
                  <button type="submit" className="hidden h-9 shrink-0 items-center rounded-full bg-[#171a1f] px-4 text-xs font-semibold text-white transition hover:bg-[#343940] md:inline-flex">{isArabic ? "بحث" : "Search"}</button>
                  <button type="button" onClick={() => setAiMode(true)} className="hidden h-9 shrink-0 items-center gap-1 rounded-full bg-[#f0f1f2] px-3 text-xs text-[#5e6670] transition hover:bg-[#e6e8ea] md:inline-flex"><Sparkles size={13} strokeWidth={1.6} /> {isArabic ? "اسأل الذكاء الاصطناعي" : "Ask AI"}</button>
                  <button type="button" onClick={() => setAiMode(true)} aria-label={isArabic ? "اسأل الذكاء الاصطناعي" : "Ask AI"} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#f0f1f2] px-2.5 text-[11px] font-medium text-[#5e6670] transition hover:bg-[#e6e8ea] max-md:-mr-2 md:hidden"><Sparkles size={13} strokeWidth={1.6} /> {isArabic ? "اسأل" : "Ask AI"}</button>
                </form>}
              </div>
              <button type="button" aria-label={isArabic ? "إغلاق البحث" : "Close search"} onClick={onClose} className="pointer-events-auto hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1] max-md:grid"><X size={18} /></button>
            </header>
            {!aiMode && <nav aria-label={isArabic ? "تصنيفات البحث" : "Search categories"} className="flex shrink-0 snap-x items-center gap-2 overflow-x-auto border-b border-[#edf0f2] bg-white px-5 py-3 scrollbar-hide md:px-7">
              {SEARCH_CATEGORIES.map(item => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${category === item ? "border-[#171a1f] bg-[#171a1f] text-white" : "border-[#dfe3e7] bg-white text-[#5e6670] hover:border-[#171a1f] hover:text-[#171a1f]"}`}>{categoryLabel(item)}</button>)}
            </nav>}

            <div className="store-search-content min-h-0 flex-1 overscroll-contain overflow-y-auto">
                {aiMode ? <SearchAiEmptyState language={language} query={query} onQueryChange={value => { setQuery(value); setActiveSuggestion(-1); }} /> : (!normalizedQuery ? <div className="grid min-h-full md:grid-cols-[minmax(0,1.42fr)_minmax(280px,.86fr)]">
                <div className="px-6 py-6 md:px-7 md:py-7">
                  <section aria-labelledby="recent-searches-title"><div className="flex items-center justify-between"><h3 id="recent-searches-title" className="flex items-center gap-2 text-sm font-semibold text-[#24282e]"><Clock3 size={16} className="text-[#7e8790]" /> {isArabic ? "الأخيرة" : "Recent"}</h3>{recentSearches.length > 0 && <button type="button" onClick={() => { setRecentSearches([]); window.localStorage.removeItem(SEARCH_STORAGE_KEY); }} className="text-xs font-medium text-[#7d858f] hover:text-[#20242a]">{isArabic ? "مسح" : "Clear"}</button>}</div>{recentSearches.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{recentSearches.map(term => <button key={term} type="button" onClick={() => setQuery(term)} className="inline-flex items-center gap-2 rounded-full border border-[#e3e7eb] bg-white px-3 py-2 text-xs text-[#4b535c] transition hover:border-[#20242a] hover:text-[#20242a]"><Clock3 size={12} />{isArabic ? popularLabel(term) : term}<X size={12} className="text-[#9ca2aa]" /></button>)}</div> : <p className="mt-4 text-xs text-[#9299a1]">{isArabic ? "ستظهر عمليات البحث الأخيرة هنا." : "Your recent searches will appear here."}</p>}</section>
                  <section aria-labelledby="trending-searches-title" className="mt-8"><h3 id="trending-searches-title" className="flex items-center gap-2 text-sm font-semibold text-[#24282e]"><Sparkles size={16} className="text-[#b99654]" /> {isArabic ? "الأكثر بحثًا" : "Trending"}</h3><div className="mt-4 grid gap-y-1 sm:grid-cols-2">{POPULAR_SEARCHES.map((term, index) => <button key={term} type="button" onClick={() => setQuery(term)} className="group flex items-center gap-3 rounded-lg px-1 py-2 text-start transition hover:bg-white"><span className="w-6 text-[12px] text-[#8c949d]">{String(index + 1).padStart(2, "0")}</span><span className="flex-1 text-[14px] font-medium text-[#242830]">{popularLabel(term)}</span><ArrowRight size={14} className="text-[#9ba2aa] transition-transform group-hover:translate-x-0.5" /></button>)}</div></section>
                </div>
                <aside aria-label={isArabic ? "منتجات رائجة" : "Popular products"} className="border-t border-[#edf0f2] bg-[#fafafa] px-6 py-6 md:border-s md:border-t-0 md:px-6 md:py-7"><h3 className="text-sm font-semibold text-[#24282e]">{isArabic ? "الرائج الآن" : "Popular right now"}</h3>{discoveryProducts[0] && <SearchFeaturedProduct product={discoveryProducts[0]} isArabic={isArabic} />}<div className="mt-4 space-y-1">{discoveryProducts.slice(1).map((product, index) => <SearchProductRow key={product.name} product={product} rank={index + 2} isArabic={isArabic} />)}</div></aside>
              </div> : <div className="px-6 py-6 md:px-7 md:py-7">
                {suggestions.length > 0 && <section aria-labelledby="suggestions-title" className="mb-5"><div className="flex items-center justify-between"><h3 id="suggestions-title" className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#9299a1]">{isArabic ? "اقتراحات البحث" : "Search suggestions"}</h3><span className="text-[10px] text-[#a0a6ad]">{isArabic ? "استخدم ↑ ↓ للتنقل" : "Use ↑ ↓ to navigate"}</span></div><div id="search-suggestions" role="listbox" className="mt-2 overflow-hidden rounded-2xl border border-[#edf0f2] bg-white">{suggestions.map((suggestion, index) => <button id={`search-suggestion-${index}`} key={suggestion} type="button" role="option" aria-selected={activeSuggestion === index} onMouseEnter={() => setActiveSuggestion(index)} onClick={() => submitSearch(suggestion)} className={`flex w-full items-center gap-3 px-4 py-3 text-start text-xs transition ${activeSuggestion === index ? "bg-[#f4f6f8] text-[#20242a]" : "text-[#616a74] hover:bg-[#f8fafb]"}`}><Search size={14} className="text-[#a0a7af]" /><span className="flex-1">{suggestion}</span><ArrowRight size={14} className="text-[#adb3ba] transition-transform" /></button>)}</div></section>}
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-[#24282e]">{isArabic ? "المنتجات" : "Products"}</h3><p className="mt-1 text-[11px] text-[#8a929b]">{matches.length} {isArabic ? (matches.length === 1 ? "نتيجة" : "نتائج") : (matches.length === 1 ? "match" : "matches")} {isArabic ? "لـ" : "for"} “{query}”</p></div><button type="button" onClick={() => setFiltersOpen(current => !current)} aria-expanded={filtersOpen} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${filtersOpen || category !== "All" || priceMax < 700 ? "border-[#20242a] bg-[#20242a] text-white" : "border-[#dfe5ea] bg-white text-[#4c555f] hover:border-[#20242a]"}`}><SlidersHorizontal size={14} /> {isArabic ? "تصفية" : "Filters"} {category !== "All" || priceMax < 700 ? <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9px] text-[#20242a]">{Number(category !== "All") + Number(priceMax < 700)}</span> : null}</button></div>
                {filtersOpen && <div className="mt-4 rounded-2xl border border-[#e6eaee] bg-white p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#30363d]"><Filter size={14} /> {isArabic ? "تحسين النتائج" : "Refine your results"}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#969da5]">{isArabic ? "التصنيف" : "Category"}</p><div className="mt-2 flex flex-wrap gap-2">{SEARCH_CATEGORIES.map(item => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full border px-2.5 py-1.5 text-[11px] transition ${category === item ? "border-[#20242a] bg-[#20242a] text-white" : "border-[#e3e7eb] text-[#626b75] hover:border-[#20242a]"}`}>{category === item && <Check size={11} className="mr-1 inline" />}{categoryLabel(item)}</button>)}</div></div><label><span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.1em] text-[#969da5]"><span>{isArabic ? "السعر حتى" : "Price up to"}</span><span className="text-xs normal-case tracking-normal text-[#30363d]"><RiyalPrice value={priceMax} /></span></span><input type="range" min="100" max="700" step="10" value={priceMax} onChange={event => setPriceMax(Number(event.target.value))} className="mt-4 w-full accent-[#20242a]" /></label></div><div className="mt-4 border-t border-[#eef0f2] pt-4"><label className="flex items-center gap-3 text-xs text-[#616a74]"><span className="font-semibold text-[#30363d]">{isArabic ? "ترتيب حسب" : "Sort by"}</span><select value={sortBy} onChange={event => setSortBy(event.target.value as SortOption)} className="rounded-lg border border-[#e1e6eb] bg-white px-2.5 py-2 text-xs text-[#3f4750] outline-none"><option value="relevance">{isArabic ? "الأكثر صلة" : "Relevance"}</option><option value="value">{isArabic ? "أفضل قيمة" : "Best value"}</option><option value="price-low">{isArabic ? "السعر: من الأقل للأعلى" : "Price: low to high"}</option><option value="price-high">{isArabic ? "السعر: من الأعلى للأقل" : "Price: high to low"}</option></select></label></div></div>}
                {matches.length > 0 ? <><div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">{matches.slice(0, 6).map(product => <SearchProductCard key={product.name} product={product} isArabic={isArabic} />)}</div>{matches.length > 6 && <button type="button" onClick={() => submitSearch()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#20242a] py-3 text-xs font-semibold text-white transition hover:bg-[#343940]">{isArabic ? `عرض كل النتائج (${matches.length})` : `View all ${matches.length} results`} <ArrowRight size={14} /></button>}</> : <div className="mt-5 rounded-2xl border border-dashed border-[#dfe5ea] bg-white px-5 py-10 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f3f5f6] text-[#7c858e]"><Search size={19} /></span><h3 className="mt-4 text-sm font-semibold text-[#30363d]">{isArabic ? "لا توجد نتائج مطابقة تمامًا" : "No exact matches yet"}</h3><p className="mx-auto mt-2 max-w-[310px] text-xs leading-5 text-[#858d96]">{isArabic ? "جرّب كلمة أوسع، أو تحقق من الإملاء، أو استكشف أحد عمليات البحث الرائجة." : "Try a broader term, check the spelling, or explore a popular search below."}</p><p className="mt-4 text-xs font-semibold text-[#30363d]">{isArabic ? "هل تقصد؟" : "Do you mean?"}</p><div className="mt-2 flex flex-wrap justify-center gap-2">{POPULAR_SEARCHES.slice(0, 3).map(term => <button key={term} type="button" onClick={() => setQuery(term)} className="rounded-full border border-[#e3e7eb] px-3 py-2 text-[11px] text-[#5b646e] hover:border-[#20242a]">{popularLabel(term)}</button>)}</div></div>}
              </div>)}
            </div>
            <footer className={`${aiMode ? "hidden" : "flex"} shrink-0 items-center gap-5 border-t border-[#edf0f2] bg-white px-6 py-3 text-[10px] text-[#89919a] max-md:hidden`}> <span><kbd className="mr-1 rounded border border-[#d8dde2] px-1.5 py-0.5">↑</kbd><kbd className="mr-1 rounded border border-[#d8dde2] px-1.5 py-0.5">↓</kbd> {isArabic ? "تنقل" : "Navigate"}</span><span><kbd className="mr-1 rounded border border-[#d8dde2] px-1.5 py-0.5">↵</kbd> {isArabic ? "كل النتائج" : "All results"}</span><span><kbd className="mr-1 rounded border border-[#d8dde2] px-1.5 py-0.5">⌘K</kbd> {isArabic ? "فتح/إغلاق" : "Toggle"}</span></footer>
          </section>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default SearchExperience;
