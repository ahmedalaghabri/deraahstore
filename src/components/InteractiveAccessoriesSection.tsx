import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import { useStoreCart } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";

type AccessoryCopy = {
  ar: string;
  en: string;
};

type InteractiveAccessory = {
  id: string;
  name: AccessoryCopy;
  category: AccessoryCopy;
  price: number;
  image: string;
  spot: { x: number; y: number };
  visibleInCards?: boolean;
};

type InteractiveEdit = {
  id: string;
  brand: string;
  eyebrow: AccessoryCopy;
  badge: AccessoryCopy;
  title: AccessoryCopy;
  titleAccent: AccessoryCopy;
  description: AccessoryCopy;
  image: string;
  imageAlt: AccessoryCopy;
  products: InteractiveAccessory[];
};

const accessories: InteractiveAccessory[] = [
  {
    id: "interactive-proud-watch",
    name: { ar: "ساعة براود ستيل رجالية", en: "Proud steel watch" },
    category: { ar: "ساعات", en: "Watches" },
    price: 248,
    image: "/product-assets/category-cutouts/accessories-0.png",
    spot: { x: 28, y: 51 },
    visibleInCards: false,
  },
  {
    id: "interactive-onyx-ring",
    name: { ar: "خاتم براود بحجر عين النمر", en: "Proud tiger-eye ring" },
    category: { ar: "خواتم", en: "Rings" },
    price: 182,
    image: "/product-assets/category-cutouts/accessories-4.png",
    spot: { x: 23, y: 28 },
  },
  {
    id: "interactive-proud-pen",
    name: { ar: "قلم براود بول بوينت", en: "Proud ballpoint pen" },
    category: { ar: "أقلام", en: "Pens" },
    price: 128,
    image: "/product-assets/category-cutouts/accessories-9.png",
    spot: { x: 48, y: 29 },
    visibleInCards: false,
  },
  {
    id: "interactive-agate-beads",
    name: { ar: "سبحة عقيق براود", en: "Proud agate prayer beads" },
    category: { ar: "سبح", en: "Prayer beads" },
    price: 90,
    image: "/product-assets/category-cutouts/accessories-10.png",
    spot: { x: 15, y: 63 },
  },
  {
    id: "interactive-proud-sunglasses",
    name: { ar: "نظارة براود رجالي", en: "Proud men's sunglasses" },
    category: { ar: "نظارات", en: "Sunglasses" },
    price: 230,
    image: "/product-assets/category-cutouts/accessories-11.png",
    spot: { x: 54, y: 13 },
  },
  {
    id: "interactive-proud-pouch",
    name: { ar: "حقيبة يد رجالي براود كحلي", en: "Proud navy men's pouch" },
    category: { ar: "حقائب", en: "Bags" },
    price: 130,
    image: "/product-assets/interactive/mens-travel-pouch.png",
    spot: { x: 75, y: 58 },
  },
  {
    id: "interactive-proud-wallet",
    name: { ar: "محفظة براود جلدية كحلية", en: "Proud navy leather wallet" },
    category: { ar: "محافظ", en: "Wallets" },
    price: 85,
    image: "/product-assets/interactive/mens-wallet.png",
    spot: { x: 70, y: 75 },
    visibleInCards: false,
  },
];

const womenAccessories: InteractiveAccessory[] = [
  {
    id: "interactive-jewel-black-bag",
    name: { ar: "حقيبة بابيلون نسائية سوداء", en: "Papillon black women's bag" },
    category: { ar: "حقائب نسائية", en: "Women's bags" },
    price: 420,
    image: "/product-assets/category-cutouts/accessories-12.png",
    spot: { x: 18, y: 84 },
  },
  {
    id: "interactive-jewel-burgundy-bag",
    name: { ar: "حقيبة بابيلون بلون خمري", en: "Papillon burgundy bag" },
    category: { ar: "حقائب نسائية", en: "Women's bags" },
    price: 460,
    image: "/product-assets/category-cutouts/accessories-13.png",
    spot: { x: 81, y: 42 },
  },
  {
    id: "interactive-jewel-rose-watch",
    name: { ar: "ساعة بابيلون روز غولد", en: "Papillon rose-gold watch" },
    category: { ar: "ساعات نسائية", en: "Women's watches" },
    price: 590,
    image: "/product-assets/category-cutouts/accessories-14.png",
    spot: { x: 48, y: 35 },
  },
  {
    id: "interactive-jewel-green-watch",
    name: { ar: "ساعة بابيلون زمردية", en: "Papillon emerald watch" },
    category: { ar: "ساعات نسائية", en: "Women's watches" },
    price: 640,
    image: "/product-assets/category-cutouts/accessories-15.png",
    spot: { x: 54, y: 50 },
  },
  {
    id: "interactive-jewel-sunglasses",
    name: { ar: "نظارة بابيلون بإطار ذهبي", en: "Papillon gold-frame sunglasses" },
    category: { ar: "نظارات", en: "Sunglasses" },
    price: 280,
    image: "/product-assets/category-cutouts/accessories-16.png",
    spot: { x: 77, y: 42 },
  },
];

const oudAccessories: InteractiveAccessory[] = [
  {
    id: "interactive-oud-musk-toffee",
    name: { ar: "عطر مسك وتوفي", en: "Musk & Toffee oud fragrance" },
    category: { ar: "عطور العود", en: "Oud fragrances" },
    price: 189,
    image: "/product-assets/category-cutouts/oud-0.png",
    spot: { x: 42, y: 69 },
  },
  {
    id: "interactive-oud-gemstone",
    name: { ar: "عطر الجيمستون", en: "Gemstone oud fragrance" },
    category: { ar: "عطور العود", en: "Oud fragrances" },
    price: 180,
    image: "/product-assets/category-cutouts/oud-1.png",
    spot: { x: 20, y: 69 },
  },
  {
    id: "interactive-oud-brown-leather",
    name: { ar: "عطر براون ليذر", en: "Brown Leather oud fragrance" },
    category: { ar: "عطور العود", en: "Oud fragrances" },
    price: 139,
    image: "/product-assets/category-cutouts/oud-2.png",
    spot: { x: 70, y: 69 },
  },
  {
    id: "interactive-oud-amber-vanilla",
    name: { ar: "عطر عنبر فانيليا", en: "Amber Vanilla oud fragrance" },
    category: { ar: "عطور العود", en: "Oud fragrances" },
    price: 160,
    image: "/product-assets/category-cutouts/oud-3.png",
    spot: { x: 88, y: 67 },
  },
  {
    id: "interactive-oud-moroccan-bakhoor",
    name: { ar: "باكت مروكي مشبع فاخر", en: "Luxury Moroccan bakhoor pack" },
    category: { ar: "العود والبخور", en: "Oud & bakhoor" },
    price: 99,
    image: "/product-assets/category-cutouts/oud-4.png",
    spot: { x: 57, y: 84 },
  },
];

const interactiveEdits: InteractiveEdit[] = [
  {
    id: "proud-edit",
    brand: "PROUD",
    eyebrow: { ar: "اختيارك اليومي", en: "The daily edit" },
    badge: { ar: "براود / ٢٠٢٥", en: "PROUD / 2025" },
    title: { ar: "أكمل إطلالتك،", en: "Complete the look," },
    titleAccent: { ar: "بتفاصيل تصنع الفرق.", en: "down to the detail." },
    description: { ar: "اكتشف مجموعة مختارة من إكسسوارات براود، منسقة معاً لإطلالة الرجل الأنيق.", en: "A considered edit of PROUD accessories, styled together for the modern gentleman." },
    image: "/product-assets/interactive/mens-accessories-lifestyle.png",
    imageAlt: { ar: "إطلالة رجل أنيقة مع إكسسوارات براود", en: "A modern gentleman styled with PROUD accessories" },
    products: accessories,
  },
  {
    id: "women-edit",
    brand: "PAPILLON",
    eyebrow: { ar: "تفاصيل أنثوية", en: "The feminine edit" },
    badge: { ar: "بابيلون / ٢٠٢٥", en: "PAPILLON / 2025" },
    title: { ar: "اختاري تفاصيلك،", en: "Choose your details," },
    titleAccent: { ar: "بلمسة تليق بك.", en: "made to feel like you." },
    description: { ar: "حقائب وساعات ونظارات أنثوية تجمع بين الهدوء والفخامة في إطلالة واحدة.", en: "Bags, watches and sunglasses brought together in one quietly luxurious edit." },
    image: "/product-assets/interactive/womens-accessories-lifestyle.png",
    imageAlt: { ar: "إطلالة أنثوية من مجموعة بابيلون", en: "A feminine Papillon accessories edit" },
    products: womenAccessories,
  },
  {
    id: "oud-edit",
    brand: "DERAAH OUD",
    eyebrow: { ar: "طقوس العود", en: "The oud ritual" },
    badge: { ar: "العود / مختارات", en: "OUD / EDIT" },
    title: { ar: "اكتشف نفحات العود،", en: "Discover the oud," },
    titleAccent: { ar: "من أول رشة.", en: "from the first spray." },
    description: { ar: "تشكيلة من العطور الشرقية والبخور بعمق دافئ يترك أثراً لا يُنسى.", en: "A warm edit of eastern fragrances and bakhoor with an unforgettable trail." },
    image: "/product-assets/interactive/oud-lifestyle.png",
    imageAlt: { ar: "عطر شرقي في مشهد لايف ستايل", en: "An eastern fragrance in a lifestyle setting" },
    products: oudAccessories,
  },
];

export default function InteractiveAccessoriesSection() {
  const { language, direction } = useStoreLocale();
  const { addToCart } = useStoreCart();
  const isArabic = language === "العربية";
  const [activeEditId, setActiveEditId] = useState(interactiveEdits[0].id);
  const activeEdit = useMemo(
    () => interactiveEdits.find(edit => edit.id === activeEditId) ?? interactiveEdits[0],
    [activeEditId],
  );
  const cardAccessories = activeEdit.products.filter(accessory => accessory.visibleInCards !== false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [bundleAdded, setBundleAdded] = useState(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setActiveId(null);
    setAddedId(null);
    setBundleAdded(false);
  }, [activeEditId]);

  useEffect(() => {
    interactiveEdits.forEach(edit => {
      const image = new Image();
      image.src = edit.image;
    });
  }, []);

  const activeAccessory = useMemo(
    () => activeId ? activeEdit.products.find(accessory => accessory.id === activeId) ?? null : null,
    [activeEdit, activeId],
  );

  const copy = (text: AccessoryCopy) => (isArabic ? text.ar : text.en);

  const activeEditIndex = interactiveEdits.findIndex(edit => edit.id === activeEdit.id);

  const moveEdit = (delta: number) => {
    const nextIndex = (activeEditIndex + delta + interactiveEdits.length) % interactiveEdits.length;
    setActiveEditId(interactiveEdits[nextIndex].id);
  };

  const handleImagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const handleImagePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    moveEdit(deltaX < 0 ? 1 : -1);
  };

  const addAccessory = (accessory: InteractiveAccessory) => {
    addToCart({
      id: accessory.id,
      name: accessory.name.en,
      brand: activeEdit.brand,
      price: String(accessory.price),
      image: accessory.image,
      quantity: 1,
    });
    setAddedId(accessory.id);
    window.setTimeout(() => setAddedId(current => current === accessory.id ? null : current), 1600);
  };

  const addBundle = () => {
    activeEdit.products.forEach(accessory => addToCart({
      id: accessory.id,
      name: accessory.name.en,
      brand: activeEdit.brand,
      price: String(accessory.price),
      image: accessory.image,
      quantity: 1,
    }));
    setBundleAdded(true);
    window.setTimeout(() => setBundleAdded(false), 1800);
  };

  const Arrow = direction === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section
      aria-labelledby="interactive-accessories-title"
      dir={direction}
      className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-[#a77b3d]">
            <Sparkles size={13} strokeWidth={1.7} />
            {copy(activeEdit.eyebrow)}
          </p>
          <h2 id="interactive-accessories-title" className="max-w-[620px] text-3xl font-medium leading-[1.05] tracking-[-.045em] text-[#151619] sm:text-4xl lg:text-[48px]">
            {copy(activeEdit.title)}<br /><span className="text-[#7a203f]">{copy(activeEdit.titleAccent)}</span>
          </h2>
        </div>
      </div>

      <div className="interactive-edit-shell grid overflow-hidden rounded-[28px] bg-[#f4f0eb] shadow-[0_20px_55px_rgba(31,24,19,.08)] lg:h-[720px] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_clamp(480px,43.6vw,589px)]">
        <div className="interactive-edit-panel order-2 flex flex-col p-5 sm:p-8 lg:order-1 lg:me-[clamp(0px,12vw,192px)] lg:p-10 xl:p-12">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#d9d0c8] pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#a77b3d]">{copy(activeEdit.badge)}</p>
              <h3 className="mt-2 text-xl font-medium tracking-[-.03em] text-[#18191b] sm:text-2xl">{copy(activeEdit.titleAccent)}</h3>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#c9bfb5] text-xs text-[#726961]">{String(cardAccessories.length).padStart(2, "0")}</span>
          </div>

          <div className="space-y-1">
            {cardAccessories.map((accessory, index) => {
              const isActive = accessory.id === activeId;
              const isAdded = addedId === accessory.id;
              return (
                <div key={accessory.id} className={`group flex items-center gap-3 border-b border-[#ddd5ce] py-3 transition-colors sm:gap-4 ${isActive ? "border-[#7a203f]" : "hover:border-[#b69a73]"}`}>
                  <button type="button" onClick={() => setActiveId(accessory.id)} className="flex min-w-0 flex-1 items-center gap-3 text-start sm:gap-4" aria-pressed={isActive}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px] font-medium transition-colors ${isActive ? "border-[#7a203f] bg-[#7a203f] text-white" : "border-[#c9bfb5] text-[#77706a]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-white sm:h-[72px] sm:w-[72px]"><img src={accessory.image} alt="" className="h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110" /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[13px] font-medium text-[#1e1d1c] sm:text-sm">{copy(accessory.name)}</strong>
                      <span className="mt-1 block text-[10px] text-[#867b73]">{copy(accessory.category)}</span>
                      <span className="mt-2 block text-[13px] font-semibold text-[#1e1d1c]"><RiyalPrice value={accessory.price} /></span>
                    </span>
                  </button>
                  <button type="button" onClick={() => addAccessory(accessory)} aria-label={isArabic ? `إضافة ${copy(accessory.name)} إلى السلة` : `Add ${copy(accessory.name)} to cart`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all ${isAdded ? "bg-[#2d8b52] text-white" : "bg-[#171819] text-white hover:-translate-y-0.5 hover:bg-[#7a203f]"}`}>
                    {isAdded ? <Check size={16} /> : <Plus size={17} strokeWidth={1.7} />}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-4">
            <div>
              <span className="block text-[10px] uppercase tracking-[.16em] text-[#867b73]">{isArabic ? "الإجمالي" : "The complete edit"}</span>
              <strong className="mt-1 block text-xl font-medium text-[#18191b]"><RiyalPrice value={activeEdit.products.reduce((sum, accessory) => sum + accessory.price, 0)} /></strong>
            </div>
            <button type="button" onClick={addBundle} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#171819] px-5 text-xs font-semibold text-white transition hover:bg-[#7a203f] sm:px-6">
              {bundleAdded ? <Check size={15} /> : <ShoppingBag size={15} strokeWidth={1.7} />}
              {bundleAdded ? (isArabic ? "تمت الإضافة" : "Added to cart") : (isArabic ? "أضف الإطلالة كاملة" : "Add the full edit")}
              {!bundleAdded && <Arrow size={14} />}
            </button>
          </div>
        </div>

        <div
          className="interactive-edit-image group relative order-1 aspect-[4/5] overflow-hidden bg-[#d2c8bc] lg:order-2 lg:h-full lg:min-h-0 lg:aspect-auto"
          onPointerDown={handleImagePointerDown}
          onPointerUp={handleImagePointerUp}
          onPointerCancel={() => { swipeStart.current = null; }}
        >
          <img src={activeEdit.image} alt={copy(activeEdit.imageAlt)} className="absolute inset-0 h-full w-full object-contain object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

          <button
            type="button"
            onClick={() => moveEdit(-1)}
            aria-label={isArabic ? "الشريحة السابقة" : "Previous slide"}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.8)] transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft size={28} strokeWidth={1.6} />
          </button>

          <button
            type="button"
            onClick={() => moveEdit(1)}
            aria-label={isArabic ? "الشريحة التالية" : "Next slide"}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.8)] transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowRight size={28} strokeWidth={1.6} />
          </button>

          {activeEdit.products.map((accessory, index) => {
            const isActive = accessory.id === activeId;
            return (
              <span key={accessory.id} className="absolute block -translate-x-1/2 -translate-y-1/2 p-1.5" style={{ left: `${accessory.spot.x}%`, top: `${accessory.spot.y}%` }}>
                <button type="button" onClick={() => setActiveId(accessory.id)} aria-label={copy(accessory.name)} aria-pressed={isActive} className="relative rounded-full transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <span aria-hidden="true" className="absolute inset-0 rounded-full border border-white/85 opacity-60" />
                  <span className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border text-xs font-semibold backdrop-blur-md sm:h-11 sm:w-11 ${isActive ? "scale-110 border-white bg-[#7a203f] text-white shadow-[0_0_0_5px_rgba(255,255,255,.2)]" : "border-white/75 bg-black/20 text-white hover:bg-[#7a203f]/85"}`}>{String(index + 1).padStart(2, "0")}</span>
                {isActive && activeAccessory && <span className={`absolute top-full mt-3 ${direction === "rtl" ? "right-0" : "left-0"} min-w-[160px] rounded-xl border border-white/20 bg-[#151517]/90 px-3 py-2.5 text-start text-white shadow-xl backdrop-blur-md`}>
                  <strong className="block text-[11px] font-semibold">{copy(activeAccessory.name)}</strong>
                  <span className="mt-1 block text-[10px] text-white/65"><RiyalPrice value={activeAccessory.price} light /></span>
                </span>}
                </button>
              </span>
            );
          })}

          <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 text-white sm:p-7">
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-white/65">{isArabic ? "التفصيل الحالي" : "Selected detail"}</p>
              <p className="mt-1 text-sm font-medium">{activeAccessory ? copy(activeAccessory.name) : (isArabic ? "اختر منتجًا لعرض التفاصيل" : "Choose a product to see details")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
