import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Droplets, Flower2, Gauge, Heart, Moon, RotateCcw, Snowflake, Sparkles, Sprout, Sun, Trees, Wind } from "lucide-react";
import { type Product as StoreProduct } from "./ProductDetailsPage";
import { RiyalPrice } from "./RiyalPrice";
import { useStoreLocale } from "./StoreLocaleContext";

type LabStep = "notes" | "body" | "moment" | "season" | "result";
type LabFamily = "fresh" | "woody" | "floral" | "sweet";
type LabBody = "light" | "balanced" | "rich";
type LabMoment = "day" | "date" | "night";
type LabSeason = "warm" | "mild" | "cool";

type LabChoice = {
  value: string;
  label: string;
  sublabel: string;
  colors: string[];
};

const noteChoices: LabChoice[] = [
  { value: "fresh", label: "Fresh", sublabel: "Bergamot · Green tea", colors: ["#d9eccb", "#9ec9a4", "#d5e9e4"] },
  { value: "woody", label: "Woody", sublabel: "Cedar · Amber", colors: ["#b47c5b", "#d5a05f", "#70463b"] },
  { value: "floral", label: "Floral", sublabel: "Rose · Soft musk", colors: ["#e6adbd", "#c8a9d6", "#eee0e8"] },
  { value: "sweet", label: "Sweet", sublabel: "Vanilla · Pear", colors: ["#dfb47a", "#e4c3a5", "#b87959"] },
];

const bodyChoices: LabChoice[] = [
  { value: "light", label: "Light", sublabel: "Soft presence", colors: ["#eadfe0", "#c9a9b4"] },
  { value: "balanced", label: "Balanced", sublabel: "Balanced presence", colors: ["#c9a2ad", "#8d3150"] },
  { value: "rich", label: "Rich", sublabel: "Rich trail", colors: ["#8d3150", "#4f1d32"] },
];

const momentChoices: LabChoice[] = [
  { value: "day", label: "Daytime", sublabel: "Daily ritual", colors: ["#f2c36d", "#e9a36e", "#d8e8c1"] },
  { value: "date", label: "Date night", sublabel: "Special evenings", colors: ["#e2a4b5", "#9f6b94", "#6f3f63"] },
  { value: "night", label: "Night", sublabel: "Evening plans", colors: ["#4a2b48", "#6f3f46", "#d6a05d"] },
];

const seasonChoices: LabChoice[] = [
  { value: "warm", label: "Warm", sublabel: "Bright and light", colors: ["#f4c56f", "#eb9d74", "#d9e8c5"] },
  { value: "mild", label: "Mild", sublabel: "Easy year-round", colors: ["#d8b1a1", "#bba7c7", "#9fb7ad"] },
  { value: "cool", label: "Cool", sublabel: "Warm and enveloping", colors: ["#6f3f46", "#a46a4d", "#d6a05d"] },
];

type FragranceProfile = {
  product: StoreProduct;
  families: LabFamily[];
  bodies: LabBody[];
  moments: LabMoment[];
  seasons: ("warm" | "mild" | "cool")[];
  notes: string[];
  signature: string;
};

/*
 * This is intentionally a catalog-shaped data layer rather than a family map.
 * Adding another Deraah SKU means adding its profile here (or replacing this
 * array with the feed/API later); the ranking UI does not need to change.
 */
const fragranceCatalog: FragranceProfile[] = [
  {
    product: { name: "Green Woods Eau de Parfum", brand: "LINK", price: "⃁ 258", oldPrice: "⃁ 600", offer: "1+2 Free", views: "9368+", image: "/product-assets/real-products/green-woods.png", hoverImage: "/product-assets/hover-products/green-woods-hover.png" },
    families: ["fresh", "woody"], bodies: ["balanced"], moments: ["day", "date"], seasons: ["warm", "mild"], notes: ["Bergamot", "Green woods", "Cedar"], signature: "Clean, polished green woods.",
  },
  {
    product: { name: "Link White Limited Edition 150ml", brand: "LINK", price: "⃁ 288", oldPrice: "⃁ 500", offer: "1+2 Free", views: "900+", image: "/product-assets/real-products/link-white.png", hoverImage: "/product-assets/hover-products/link-white-hover.png" },
    families: ["fresh"], bodies: ["light", "balanced"], moments: ["day"], seasons: ["warm", "mild"], notes: ["Citrus", "White florals", "Musk"], signature: "Easy, soft citrus brightness.",
  },
  {
    product: { name: "Black Woods Eau de Toilette", brand: "LINK", price: "⃁ 208", oldPrice: "⃁ 500", views: "16470+", image: "/product-assets/real-products/black-woods.png", hoverImage: "/product-assets/hover-products/black-woods-hover.png" },
    families: ["woody"], bodies: ["balanced", "rich"], moments: ["day", "night"], seasons: ["mild", "cool"], notes: ["Woods", "Amber", "Musk"], signature: "Dark woods with quiet confidence.",
  },
  {
    product: { name: "Maroon Perfume by Link 200ml", brand: "LINK", price: "⃁ 308", oldPrice: "⃁ 420", offer: "1+2 Free", views: "757+", image: "/product-assets/real-products/maroon.png", hoverImage: "/product-assets/hover-products/maroon-hover.png" },
    families: ["woody", "sweet"], bodies: ["rich"], moments: ["date", "night"], seasons: ["cool"], notes: ["Warm woods", "Vanilla", "Amber"], signature: "Warm and expressive for memorable moments.",
  },
  {
    product: { name: "Silver Woods Eau de Parfum", brand: "LINK", price: "⃁ 208", oldPrice: "⃁ 500", views: "1745+", image: "/product-assets/real-products/silver-woods.png", hoverImage: "/product-assets/hover-products/silver-woods-hover.png" },
    families: ["woody", "fresh"], bodies: ["balanced"], moments: ["day", "date"], seasons: ["mild", "cool"], notes: ["Soft woods", "Pepper", "Musk"], signature: "A balanced, versatile choice with a refined character.",
  },
  {
    product: { name: "DERAAH PRIVATE Enjoy Eau de Parfum 100ml", brand: "DERAAH PRIVATE", price: "⃁ 159", oldPrice: "⃁ 378", offer: "Special Offer", views: "—", image: "/product-assets/private-555.png" },
    families: ["sweet", "floral"], bodies: ["balanced", "rich"], moments: ["date", "night"], seasons: ["mild", "cool"], notes: ["Fruits", "Florals", "Soft vanilla"], signature: "Playful sweetness with a soft, luxurious touch.",
  },
  {
    product: { name: "MAIOS Aroma 100 ml", brand: "MAIOS", price: "⃁ 108", oldPrice: "⃁ 268", offer: "Save later", views: "—", image: "/product-assets/misk-toffee.png" },
    families: ["sweet", "fresh"], bodies: ["light", "balanced"], moments: ["day"], seasons: ["warm", "mild"], notes: ["Musk", "Light sweetness", "Powder"], signature: "Soft, comforting and close to the skin.",
  },
  {
    product: { name: "PROUD Suave Perfume", brand: "PROUD", price: "⃁ 294", oldPrice: "⃁ 420", offer: "1+2 Free", views: "—", image: "/product-assets/leader.png" },
    families: ["fresh", "woody"], bodies: ["balanced", "rich"], moments: ["day", "night"], seasons: ["mild", "cool"], notes: ["Citrus", "Woods", "Patchouli"], signature: "Clean and confident with a polished finish.",
  },
  {
    product: { name: "LINK Pedestal Extrait 100 ml", brand: "LINK", price: "⃁ 348", oldPrice: "⃁ 696", offer: "Signature", views: "—", image: "/product-assets/real-products/link-white.jpg" },
    families: ["woody", "sweet"], bodies: ["rich"], moments: ["date", "night"], seasons: ["cool"], notes: ["Grapefruit", "Jasmine", "Vetiver", "Cedarwood"], signature: "Rich concentration with an elegant trail for important occasions.",
  },
];

type RankedSuggestion = FragranceProfile & { score: number; fit: number; label: string };

function rankFragrances(family: LabFamily, body: LabBody, moment: LabMoment, season: LabSeason): RankedSuggestion[] {
  const scored = fragranceCatalog.map(profile => {
    const familyScore = profile.families.includes(family) ? 46 : 8;
    const bodyScore = profile.bodies.includes(body) ? 30 : 8;
    const momentScore = profile.moments.includes(moment) ? 24 : 6;
    const seasonScore = profile.seasons.includes(season) ? 18 : 4;
    return { ...profile, score: familyScore + bodyScore + momentScore + seasonScore };
  }).sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));

  const chosen: typeof scored = [];
  for (const item of scored) {
    const alreadyHasFamily = chosen.some(selected => selected.families.includes(item.families[0]));
    if (chosen.length < 2 || !alreadyHasFamily || item.score >= 75) chosen.push(item);
    if (chosen.length === 3) break;
  }
  for (const item of scored) {
    if (chosen.length === 3) break;
    if (!chosen.includes(item)) chosen.push(item);
  }

  return chosen.slice(0, 3).map((profile, index) => ({
    ...profile,
    fit: Math.min(97, Math.max(74, Math.round(62 + profile.score * 0.3) - index * 6)),
    label: index === 0 ? "Closest to your taste" : index === 1 ? "Balanced alternative" : "A different angle",
  }));
}

const bodyHeights: Record<LabBody, string> = { light: "scale-y-[.936]", balanced: "scale-y-[1.128]", rich: "scale-y-[1.296]" };

const bottleColorways = [
  { name: "Link White Limited Edition 150ml", volumeMl: 150, imageScale: 1, image: "/product-assets/fragrance-lab/previous-3d/link-white.png" },
  { name: "Green Woods Eau de Parfum", volumeMl: 100, imageScale: 1, image: "/product-assets/fragrance-lab/previous-3d/green-woods.png" },
  { name: "Black Woods Eau de Toilette", volumeMl: 100, imageScale: 1, image: "/product-assets/fragrance-lab/previous-3d/black-woods.png" },
  { name: "Maroon Perfume by LINK 200ml", volumeMl: 200, imageScale: 1, image: "/product-assets/fragrance-lab/previous-3d/maroon.png" },
  { name: "Silver Woods Eau de Parfum", volumeMl: 100, imageScale: 1, image: "/product-assets/fragrance-lab/previous-3d/silver-woods.png" },
  { name: "LINK Privé Collection 02", volumeMl: 100, imageScale: 1, image: "/product-assets/fragrance-lab/3d/private-02.png" },
  { name: "LINK Maroon Wings", volumeMl: 200, imageScale: 1, image: "/product-assets/fragrance-lab/3d/maroon.png" },
  { name: "LINK Privé Collection 03", volumeMl: 100, imageScale: 1, image: "/product-assets/fragrance-lab/3d/private-03.png" },
  { name: "LINK Carmin Woods", volumeMl: 100, imageScale: 1, image: "/product-assets/fragrance-lab/3d/carmin.png" },
  { name: "LINK Golden Woods", volumeMl: 100, imageScale: 1, image: "/product-assets/fragrance-lab/3d/golden.png" },
];

function OrbitIcon({ step, value }: { step: LabStep; value: string }) {
  if (step === "notes") {
    if (value === "fresh") return <Droplets size={18} strokeWidth={1.7} />;
    if (value === "woody") return <Trees size={18} strokeWidth={1.7} />;
    if (value === "floral") return <Flower2 size={18} strokeWidth={1.7} />;
    return <Sprout size={18} strokeWidth={1.7} />;
  }
  if (step === "body") return <Gauge size={18} strokeWidth={1.7} />;
  if (step === "moment") {
    if (value === "day") return <Sun size={18} strokeWidth={1.7} />;
    if (value === "date") return <Wind size={18} strokeWidth={1.7} />;
    return <Moon size={18} strokeWidth={1.7} />;
  }
  if (value === "warm") return <Sun size={18} strokeWidth={1.7} />;
  if (value === "mild") return <Wind size={18} strokeWidth={1.7} />;
  return <Snowflake size={18} strokeWidth={1.7} />;
}

function PreferenceVisual({ family, body, moment, season, step, choices, activeValue, onChoose }: { family: LabFamily; body: LabBody; moment: LabMoment; season: LabSeason; step: LabStep; choices: LabChoice[]; activeValue: string | null; onChoose: (value: string) => void }) {
  const [bottleIndex, setBottleIndex] = useState(0);
  const note = noteChoices.find(choice => choice.value === family) ?? noteChoices[0];
  const presence = bodyChoices.find(choice => choice.value === body) ?? bodyChoices[1];
  const atmosphere = momentChoices.find(choice => choice.value === moment) ?? momentChoices[0];
  const weather = seasonChoices.find(choice => choice.value === season) ?? seasonChoices[1];
  const preferenceSummary = step === "notes" ? note.label : step === "body" ? `${note.label} · ${presence.label}` : step === "moment" ? `${note.label} · ${presence.label} · ${atmosphere.label}` : `${note.label} · ${presence.label} · ${weather.label}`;
  const activeChoice = choices.find(choice => choice.value === activeValue);
  const activeIndex = Math.max(0, choices.findIndex(choice => choice.value === activeValue));
  const selectionKind = step === "notes" ? "Character" : step === "body" ? "Presence" : step === "moment" ? "Occasion" : step === "season" ? "Atmosphere" : "Preferences";
  const orbitProgress = step === "notes" ? 0.25 : step === "body" ? 0.5 : step === "moment" ? 0.75 : 1;
  const orbitPositions = choices.length === 4
    ? [{ left: "-3%", top: "50%", transform: "translateY(-50%)" }, { left: "50%", top: "-3%", transform: "translateX(-50%)" }, { right: "-3%", top: "50%", transform: "translateY(-50%)" }, { left: "50%", bottom: "-3%", transform: "translateX(-50%)" }]
    : [{ left: "50%", top: "-3%", transform: "translateX(-50%)" }, { right: "10%", bottom: "10%" }, { left: "10%", bottom: "10%" }];

  useEffect(() => {
    const timer = window.setInterval(() => setBottleIndex(index => (index + 1) % bottleColorways.length), 2200);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="fragrance-lab-orbit-float relative mx-auto w-full max-w-[520px] pb-14">
    <div className="relative aspect-square w-full overflow-visible rounded-full bg-black shadow-[0_24px_70px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,255,255,.12)]">
      <span className="fragrance-lab-spin absolute inset-[4%] rounded-full border-[1.5px] border-dashed border-white/30" />
      <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute inset-[10%] h-[80%] w-[80%] -rotate-90 overflow-visible">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff" strokeWidth="1.6" opacity=".28" />
        <circle cx="50" cy="50" r="45" pathLength="1" fill="none" stroke="#6f1e3b" strokeWidth="2.2" strokeLinecap="round" className="fragrance-lab-progress transition-[stroke-dasharray] duration-1000 ease-out" style={{ strokeDasharray: `${orbitProgress} 1` }} />
      </svg>
      <span className="fragrance-lab-spin absolute inset-[24%] rounded-full border-[1.5px] border-white/25 [animation-direction:reverse] [animation-duration:11s]" />

      {step !== "result" ? choices.map((choice, index) => <button
        key={choice.value}
        type="button"
        onClick={() => onChoose(choice.value)}
        aria-label={`Choose ${choice.label}`}
        aria-pressed={activeValue === choice.value}
        className={`absolute z-10 flex h-[58px] w-[58px] flex-col items-center justify-center rounded-full border text-center font-semibold transition duration-300 hover:-translate-y-1 sm:h-[76px] sm:w-[76px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a4b9] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${activeValue === choice.value ? "scale-110 border-[#d6a4b9] bg-white/15 text-white shadow-[0_0_0_5px_rgba(214,164,185,.18),0_14px_28px_rgba(0,0,0,.35)]" : "border-white/35 bg-black/75 text-white shadow-[0_10px_20px_rgba(0,0,0,.28)]"}`}
        style={orbitPositions[index]}
      >
        <span className={`grid h-6 w-6 place-items-center rounded-full sm:h-7 sm:w-7 ${activeValue === choice.value ? "bg-white/20 text-white" : "bg-white/10 text-white/80"}`}><OrbitIcon step={step} value={choice.value} /></span>
        <span className="mt-1 max-w-[64px] truncate text-[10px] font-bold leading-4 tracking-[.01em] sm:max-w-[78px] sm:text-[11px]">{choice.label}</span>
      </button>) : <>
        <span className="fragrance-lab-float absolute left-[10%] top-[24%] grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-black/80 text-white shadow-[0_10px_20px_rgba(0,0,0,.28)]"><OrbitIcon step="notes" value={family} /></span>
        <span className="fragrance-lab-float absolute right-[10%] top-[18%] grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-black/80 text-white shadow-[0_10px_20px_rgba(0,0,0,.28)] [animation-delay:-1.4s]"><OrbitIcon step="body" value={body} /></span>
        <span className="fragrance-lab-float absolute bottom-[20%] right-[14%] grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-black/80 text-white shadow-[0_10px_20px_rgba(0,0,0,.28)] [animation-delay:-2.5s]"><OrbitIcon step="moment" value={moment} /></span>
      </>}

      <span className="fragrance-lab-pulse absolute bottom-[18%] left-[15%] h-3 w-3 rounded-full bg-[#8d3150] shadow-[0_0_0_9px_rgba(141,49,80,.10)]" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[81%] z-0 h-[2.4%] w-[34%] -translate-x-1/2 rounded-[50%] bg-[#29232b]/35 blur-[7px]" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[82.2%] z-0 h-[1.2%] w-[22%] -translate-x-1/2 rounded-[50%] bg-[#17141a]/60 blur-[2.5px]" />
      <div className="absolute inset-0 flex items-center justify-center transition duration-500">
        <div className="relative z-10 flex h-[68%] w-[48%] items-center justify-center transition duration-500">
          <div className={`relative z-10 h-[clamp(140px,18vw,220px)] w-[clamp(140px,18vw,220px)] shrink-0 origin-bottom transition-transform duration-500 ${bodyHeights[body]}`} data-volume-ml={bottleColorways[bottleIndex].volumeMl} style={{ marginTop: "clamp(8px, 1.4vw, 16px)" }}>
            <div key={bottleColorways[bottleIndex].name} className="fragrance-lab-bottle-flip absolute inset-0 flex items-center justify-center" style={{ perspective: "900px", transformStyle: "preserve-3d" }}>
              <img src={bottleColorways[bottleIndex].image} alt="LINK fragrance bottle" className="fragrance-lab-bottle-depth h-full w-full object-contain" style={{ transform: `translateZ(18px) scaleX(1.3) scale(${bottleColorways[bottleIndex].imageScale})` }} />
              <img src={bottleColorways[bottleIndex].image} alt="" aria-hidden="true" className="fragrance-lab-bottle-depth pointer-events-none absolute inset-0 h-full w-full object-contain" style={{ transform: `rotateY(180deg) translateZ(18px) scaleX(1.3) scale(${bottleColorways[bottleIndex].imageScale})`, filter: "brightness(.72) saturate(.92)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-black/90 px-3.5 py-2 text-[11px] font-bold tracking-[.01em] text-white shadow-[0_8px_20px_rgba(0,0,0,.35)] sm:text-xs"><span className="inline-flex items-center gap-1.5"><Sparkles size={13} /> {step === "result" ? `Preferences: ${preferenceSummary}` : activeChoice ? `${selectionKind}: ${activeChoice.label}` : "Start by choosing a preference"}</span><span className="h-3.5 w-px bg-white/25" /><span className="text-white/65">{step === "result" ? "4 / 4" : activeChoice ? `${activeIndex + 1} / ${choices.length}` : `0 / ${choices.length}`}</span></div>
  </div>;
}

function FavoriteStyleProductCard({ product, favorite, onFavorite, label, fit, signature }: { product: StoreProduct; favorite: boolean; onFavorite: () => void; label: string; fit: number; signature: string }) {
  return <article className="overflow-hidden rounded-2xl border border-[#e4e9f0] bg-white">
    <div className="relative grid h-[148px] place-items-center bg-[#f5f7f9] p-4 sm:h-[170px] sm:p-5">
      <img src={product.image} alt={product.name} className="h-auto w-auto max-h-[118px] max-w-[128px] object-contain mix-blend-multiply sm:max-h-[145px] sm:max-w-[150px]" />
      <button type="button" aria-label={`${favorite ? "إزالة" : "إضافة"} ${product.name} ${favorite ? "من" : "إلى"} المفضلة`} onClick={onFavorite} className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ${favorite ? "text-[#cd1a76]" : "text-[#69717a]"}`}><Heart size={15} fill={favorite ? "currentColor" : "none"} /></button>
      {product.offer && <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-[#6f1e3b] shadow-sm">{product.offer}</span>}
    </div>
    <div className="p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2"><span className="rounded-full bg-[#f7e8ed] px-2 py-1 text-[9px] font-semibold text-[#8d3150]">{label}</span><span className="text-[9px] font-semibold text-[#a35a71]">{fit}%</span></div>
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9aa1ac]">{product.brand}</p>
      <h4 className="mt-1 min-h-[40px] line-clamp-2 text-[12px] font-semibold leading-5 text-[#20252b] sm:text-sm">{product.name}</h4>
      <p className="mt-2 min-h-[32px] line-clamp-2 text-[10px] leading-4 text-[#7d858f]">{signature}</p>
      <div className="mt-3 flex items-center sm:mt-4">
        <div className="min-w-0 text-sm font-semibold text-[#20252b]"><RiyalPrice value={product.price} /></div>
      </div>
    </div>
  </article>;
}

export default function FragranceLab({ onFavorite, favorites }: { onAdd: (product: StoreProduct, quantity?: number, variant?: string) => void; onFavorite: (product: StoreProduct) => void; favorites: string[] }) {
  const [step, setStep] = useState<LabStep>("notes");
  const [family, setFamily] = useState<LabFamily | null>(null);
  const [body, setBody] = useState<LabBody | null>(null);
  const [moment, setMoment] = useState<LabMoment | null>(null);
  const [season, setSeason] = useState<LabSeason | null>(null);
  const preferenceFamily = family ?? "fresh";
  const preferenceBody = body ?? "balanced";
  const preferenceMoment = moment ?? "day";
  const preferenceSeason = season ?? "mild";
  const products = useMemo(() => rankFragrances(preferenceFamily, preferenceBody, preferenceMoment, preferenceSeason), [preferenceFamily, preferenceBody, preferenceMoment, preferenceSeason]);
  const activeChoices = step === "notes" ? noteChoices : step === "body" ? bodyChoices : step === "moment" ? momentChoices : seasonChoices;
  const progress = step === "notes" ? 1 : step === "body" ? 2 : step === "moment" ? 3 : step === "season" ? 4 : 5;
  const activeValue = step === "notes" ? family : step === "body" ? body : step === "moment" ? moment : season;

  const reset = () => {
    setStep("notes");
    setFamily(null);
    setBody(null);
    setMoment(null);
    setSeason(null);
  };

  const choose = (value: string) => {
    if (step === "notes") {
      setFamily(value as LabFamily);
      setStep("body");
    } else if (step === "body") {
      setBody(value as LabBody);
      setStep("moment");
    } else if (step === "moment") {
      setMoment(value as LabMoment);
      setStep("season");
    } else if (step === "season") {
      setSeason(value as LabSeason);
      setStep("result");
    }
  };

  const goBack = () => {
    if (step === "body") setStep("notes");
    else if (step === "moment") setStep("body");
    else if (step === "season") setStep("moment");
  };

  const { direction } = useStoreLocale();

  return <section id="fragrance-lab" dir={direction} aria-labelledby="fragrance-lab-title" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
    <style>{`@keyframes fragrance-lab-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fragrance-lab-pulse{0%,100%{transform:scale(.9);opacity:.75}50%{transform:scale(1.25);opacity:1}}@keyframes fragrance-lab-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@keyframes fragrance-lab-orbit-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes fragrance-lab-bottle-prism{0%,9%{opacity:0;transform:scale(.9) translateY(10px);clip-path:circle(0% at 50% 84%)}18%{opacity:.92;transform:scale(.98) translateY(2px);clip-path:circle(34% at 50% 72%)}31%,42%{opacity:1;transform:scale(1) translateY(0);clip-path:circle(115% at 50% 50%)}52%{opacity:0;transform:scale(1.045) translateY(-7px);clip-path:circle(0% at 50% 18%)}53%,100%{opacity:0;transform:scale(1.045) translateY(-7px);clip-path:circle(0% at 50% 18%)}}@keyframes fragrance-lab-bottle-shine{0%,100%{opacity:0;background-position:170% 0}18%{opacity:.45}42%{opacity:.8;background-position:-70% 0}58%,100%{opacity:0;background-position:-70% 0}}.fragrance-lab-spin{animation:fragrance-lab-spin 18s linear infinite}.fragrance-lab-pulse{animation:fragrance-lab-pulse 2.8s ease-in-out infinite}.fragrance-lab-float{animation:fragrance-lab-float 4.5s ease-in-out infinite}.fragrance-lab-orbit-float{animation:fragrance-lab-orbit-float 6s ease-in-out infinite}.fragrance-lab-bottle-variant{opacity:0;animation:fragrance-lab-bottle-prism 10s cubic-bezier(.22,.8,.22,1) infinite;will-change:opacity,transform,clip-path}.fragrance-lab-bottle-shine{background:linear-gradient(108deg,transparent 32%,rgba(255,255,255,.08) 41%,rgba(255,255,255,.9) 50%,rgba(255,255,255,.1) 59%,transparent 68%);background-size:220% 100%;background-position:170% 0;mix-blend-mode:screen;animation:fragrance-lab-bottle-shine 4.8s ease-in-out infinite;will-change:background-position,opacity;-webkit-mask-image:url('/product-assets/fragrance-lab/3d/private-02.png');mask-image:url('/product-assets/fragrance-lab/3d/private-02.png');-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:100% 100%;mask-size:100% 100%}@media (prefers-reduced-motion:reduce){.fragrance-lab-spin,.fragrance-lab-pulse,.fragrance-lab-float,.fragrance-lab-orbit-float,.fragrance-lab-bottle-shine{animation:none}.fragrance-lab-bottle-variant{animation:none;opacity:0}.fragrance-lab-progress{transition:none!important}}`}</style>
    <style>{`@keyframes fragrance-lab-bottle-zoom-switch{0%{opacity:0;filter:blur(1.6px);transform:translate3d(0,-9px,0) scale(1.22)}12%{opacity:.9;filter:blur(.45px);transform:translate3d(0,-4px,0) scale(1.08)}22%{opacity:1;filter:blur(0);transform:translate3d(0,0,0) scale(1)}64%{opacity:1;filter:blur(0);transform:translate3d(0,0,0) scale(1)}82%{opacity:.72;filter:blur(.45px);transform:translate3d(0,1px,0) scale(.9)}100%{opacity:0;filter:blur(1.8px);transform:translate3d(0,2px,0) scale(.72)}}.fragrance-lab-bottle-flip{animation:fragrance-lab-bottle-zoom-switch 2.05s cubic-bezier(.22,.72,.3,1) both;backface-visibility:visible;transform-style:preserve-3d;transform-origin:center;will-change:transform,opacity,filter}.fragrance-lab-bottle-depth{backface-visibility:hidden;transform-style:preserve-3d}@media (prefers-reduced-motion:reduce){.fragrance-lab-bottle-flip{animation:none;opacity:1;transform:none}}`}</style>
    <div id="fragrance-lab-title" className="grid overflow-hidden rounded-[24px] border border-[#eadfe0] bg-white shadow-[0_24px_70px_rgba(75,39,53,.10)] lg:grid-cols-[.92fr_1.08fr]">
          <div className="relative overflow-visible bg-black px-5 py-7 text-white sm:px-10 sm:py-10">
            <div className="relative">
              <p className="max-w-[320px] text-[15px] font-semibold leading-7 text-white/80 sm:text-base">Choose your preferences and we'll recommend the closest fragrance.</p>
              <div className="mt-6"><PreferenceVisual family={preferenceFamily} body={preferenceBody} moment={preferenceMoment} season={preferenceSeason} step={step} choices={activeChoices} activeValue={activeValue} onChoose={choose} /></div>
              {step === "result" && <button type="button" onClick={reset} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-white/15"><RotateCcw size={14} /> Choose new preferences</button>}
            </div>
          </div>

          <div className="flex min-h-[440px] flex-col justify-between p-5 sm:p-8">
            <div>{step !== "result" ? <>
              <div className="flex items-center justify-between gap-4"><span className="text-[10px] font-bold tracking-[.12em] text-[#a35a71]">Step {progress} of 4</span><button type="button" onClick={goBack} disabled={step === "notes"} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8d3150] transition-opacity disabled:pointer-events-none disabled:opacity-0"><ArrowRight size={12} /> Back</button></div>
              <h3 className="mt-4 text-2xl font-medium tracking-[-.04em] text-[#2d1b23] sm:text-3xl">{step === "notes" ? "Which character do you prefer?" : step === "body" ? "How would you like it to wear?" : step === "moment" ? "What occasion are you shopping for?" : "Which atmosphere feels like you?"}</h3>
              <p className="mt-2 max-w-[430px] text-xs leading-5 text-[#806b72]">{step === "notes" ? "Choose the style closest to your taste." : step === "body" ? "Set the presence you prefer." : step === "moment" ? "Choose the occasion you are shopping for." : "Choose the atmosphere that suits you."}</p>
            </> : <>
              <div className="flex items-center gap-2 text-[#8d3150]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f7e8ed]"><Check size={15} /></span><p className="text-[10px] font-bold tracking-[.12em]">Your picks are ready</p></div>
              <h3 className="mt-4 text-2xl font-medium tracking-[-.04em] text-[#2d1b23] sm:text-3xl">Three fragrances for your taste</h3>
              <p className="mt-2 max-w-[430px] text-xs leading-5 text-[#806b72]">From hundreds of fragrances, we selected the closest matches based on your character, presence, occasion and atmosphere.</p>
              <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-[#f7e8ed] px-3 py-2 text-[10px] font-semibold text-[#8d3150]">{noteChoices.find(choice => choice.value === family)?.sublabel}</span><span className="rounded-full bg-[#f5efec] px-3 py-2 text-[10px] font-semibold text-[#6f555e]">Presence {bodyChoices.find(choice => choice.value === body)?.label}</span><span className="rounded-full bg-[#f5efec] px-3 py-2 text-[10px] font-semibold text-[#6f555e]">{momentChoices.find(choice => choice.value === moment)?.label}</span><span className="rounded-full bg-[#f5efec] px-3 py-2 text-[10px] font-semibold text-[#6f555e]">Atmosphere {seasonChoices.find(choice => choice.value === season)?.label}</span></div>
              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">{products.map(profile => <FavoriteStyleProductCard key={profile.product.name} product={profile.product} label={profile.label} fit={profile.fit} signature={profile.signature} favorite={favorites.includes(profile.product.name)} onFavorite={() => onFavorite(profile.product)} />)}</div>
            </>}</div>

            {step !== "result" && <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#eee2e0] pt-5"><span className="text-[10px] text-[#9a858b]">{activeValue ? "Tap a point to continue." : "Start by choosing a point on the circle."}</span><span className="flex items-center gap-1.5">{[1, 2, 3, 4].map(item => <i key={item} className={`h-1.5 rounded-full transition-all ${item < progress || (item === progress && Boolean(activeValue)) ? "w-7 bg-[#8d3150]" : "w-2 bg-[#eadfe0]"}`} />)}</span></div>}
          </div>
    </div>
  </section>;
}
