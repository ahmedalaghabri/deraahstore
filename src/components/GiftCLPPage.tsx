import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Gift, Search, Sparkles, Users } from "lucide-react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreFavorites } from "./StoreFavoritesContext";
import { ProductCard, ProductCarousel, QuickCartDrawer, type Product as StoreProduct } from "./ProductDetailsPage";
import { formatPrice } from "./storeCartData";

type GiftProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  imageScale?: number;
  recipients: string[];
  occasions: string[];
  categories: string[];
  styles: string[];
};

type GiftTile = { label: string; description: string; image: string; value: string; size?: "tall" | "medium"; surface?: string; accent?: string; titleColor?: string; detail?: string; imageOffsetClass?: string; imageWidthClass?: string; imageHeightClass?: string };

const deraahGiftImages = [
  "/product-assets/gifts/product-cutouts/rarti-accessory-set-v1.png",
  "/product-assets/gifts/product-cutouts/serein-premium-set-v1.png",
  "/product-assets/gifts/product-cutouts/papillon-care-set-v1.png",
  "/product-assets/gifts/product-cutouts/robust-care-set-v1.png",
  "/product-assets/gifts/product-cutouts/dream-premium-set-v1.png",
  "/product-assets/gifts/product-cutouts/link-black-set-v1.png",
  "/product-assets/gifts/product-cutouts/shuaa-home-set-v1.png",
  "/product-assets/gifts/product-cutouts/oriental-occasion-set-v1.png",
  "/product-assets/gifts/product-cutouts/lovti-bloom-v1.png",
  "/product-assets/gifts/product-cutouts/floret-eau-de-parfum-v1.png",
  "/product-assets/gifts/product-cutouts/enjoy-eau-de-parfum-v1.png",
];

const giftProducts: GiftProduct[] = [
  { id: "rarti-accessory", name: "Rarti Accessory Set", brand: "LINK", price: 580, image: deraahGiftImages[0], imageScale: 1.16, badge: "1 + 2 Free", recipients: ["Men", "Friend", "Father"], occasions: ["Birthday", "Thank you", "Just because", "Congratulations"], categories: ["Gifts for men", "Accessories"], styles: ["Luxury", "Practical"] },
  { id: "serein-premium", name: "Serein Premium Men's Set", brand: "MAIOS", price: 628, image: deraahGiftImages[1], imageScale: 1.12, badge: "10x points", recipients: ["Men", "Husband", "Father"], occasions: ["Birthday", "Wedding", "Thank you", "Congratulations", "Graduation", "Anniversary"], categories: ["Gifts for men", "Fragrances"], styles: ["Luxury", "Classic"] },
  { id: "papillon-care", name: "Papillon Y21 Care Set", brand: "ONE LOVE", price: 420, image: deraahGiftImages[2], imageScale: 1.26, badge: "Best seller", recipients: ["Women", "Mother", "Sister"], occasions: ["Birthday", "Thank you", "New baby", "Get well soon", "Love"], categories: ["Care", "Gifts for women"], styles: ["Soft", "Practical"] },
  { id: "robust-set", name: "Robust Men's Accessory & Care Set", brand: "CAGE", price: 520, image: deraahGiftImages[3], imageScale: 1.14, badge: "Deraah pick", recipients: ["Men", "Husband", "Friend"], occasions: ["Birthday", "Graduation", "Thank you", "Congratulations"], categories: ["Gifts for men", "Care"], styles: ["Practical", "Luxury"] },
  { id: "dream-premium", name: "Dream Premium Set", brand: "pour Moi", price: 590, image: deraahGiftImages[4], imageScale: 1.2, badge: "Complete gift", recipients: ["Women", "Wife", "Sister"], occasions: ["Birthday", "Wedding", "New baby", "Love", "Anniversary"], categories: ["Gifts for women", "Fragrances"], styles: ["Soft", "Luxury"] },
  { id: "link-black-set", name: "Link Black New Accessory Set", brand: "LINK", price: 438, image: deraahGiftImages[5], imageScale: 1.18, badge: "New", recipients: ["Men", "Husband", "Friend"], occasions: ["Birthday", "Graduation", "Just because", "Congratulations"], categories: ["Gifts for men", "Accessories"], styles: ["Classic", "Practical"] },
  { id: "shuaa-home", name: "Shuaa 4-Piece Home Set", brand: "DERAAH OUD", price: 570, image: deraahGiftImages[6], imageScale: 1.2, badge: "For the home", recipients: ["Mother", "Wife", "Family"], occasions: ["Wedding", "New baby", "Just because", "New home", "Congratulations"], categories: ["Home gifts", "Oud"], styles: ["Soft", "Luxury"] },
  { id: "east-occasion", name: "Oriental Occasion Set", brand: "DERAAH OUD", price: 2600, image: deraahGiftImages[7], imageScale: 1.08, badge: "Luxury gift", recipients: ["Family", "Husband", "Father"], occasions: ["Wedding", "Graduation", "Birthday", "Congratulations", "Anniversary", "New home"], categories: ["Oud", "Luxury gifts"], styles: ["Luxury", "Classic"] },
  { id: "lovti-bloom", name: "Lovti Bloom Eau de Parfum", brand: "MAIOS", price: 428, image: deraahGiftImages[8], imageScale: 1.24, badge: "Floral pick", recipients: ["Women", "Mother", "Sister"], occasions: ["Birthday", "Thank you", "Just because", "Love", "Anniversary"], categories: ["Fragrances", "Gifts for women"], styles: ["Soft", "Luxury"] },
  { id: "floret-eau-de-parfum", name: "Floret Eau de Parfum", brand: "GINGLE", price: 420, image: deraahGiftImages[9], imageScale: 1.22, badge: "New", recipients: ["Women", "Wife", "Friend"], occasions: ["Birthday", "Wedding", "Thank you", "Love", "Anniversary"], categories: ["Fragrances", "Gifts for women"], styles: ["Soft", "Classic"] },
  { id: "enjoy-eau-de-parfum", name: "Enjoy Eau de Parfum", brand: "DERAAH PRIVATE", price: 498, image: deraahGiftImages[10], imageScale: 1.2, badge: "Thoughtful pick", recipients: ["Women", "Men", "Family"], occasions: ["Birthday", "Graduation", "Just because", "Love", "Anniversary"], categories: ["Fragrances", "Unisex gifts"], styles: ["Classic", "Practical"] },
];

const occasions = ["Birthday", "Love", "Get well soon", "New baby", "Congratulations", "Graduation", "Anniversary", "Wedding", "New home", "Thank you"];
const recipients = ["Women", "Men", "Wife", "Husband", "Mother", "Father", "Friend", "Family"];
const styles = ["Luxury", "Soft", "Practical", "Classic"];
const budgets = [{ label: "All prices", value: "all" }, { label: "Under 300", value: "under-300" }, { label: "300 – 600", value: "300-600" }, { label: "Over 600", value: "over-600" }];
const momentTiles: GiftTile[] = [
  { label: "Happy birthday", description: "Make their day", image: "/product-assets/gifts/moment-birthday-illustration.png", surface: "#f8e9ee", accent: "#a54b69", value: "Birthday" },
  { label: "I love you", description: "Say it with love", image: "/product-assets/gifts/moment-love-illustration.png", surface: "#f8e9ee", accent: "#b23c66", value: "Love" },
  { label: "Get well soon", description: "A gentle gesture", image: "/product-assets/gifts/moment-get-well-illustration-v2.png", surface: "#eaf3ec", accent: "#4f7e5e", value: "Get well soon" },
  { label: "New baby", description: "Welcome a little joy", image: "/product-assets/gifts/moment-new-baby-illustration.png", surface: "#eef0f8", accent: "#59709b", value: "New baby" },
  { label: "Congratulations", description: "Celebrate their moment", image: "/product-assets/gifts/moment-congratulations-illustration.png", surface: "#f6efe3", accent: "#9a7040", value: "Congratulations" },
  { label: "Happy graduation", description: "A proud new chapter", image: "/product-assets/gifts/moment-graduation-illustration.png", surface: "#eaf1f3", accent: "#4f7482", value: "Graduation" },
  { label: "Happy anniversary", description: "Keep your story close", image: "/product-assets/gifts/moment-anniversary-illustration.png", surface: "#f3e9e8", accent: "#9d5f5c", value: "Anniversary" },
  { label: "Newlyweds", description: "Celebrate their love", image: "/product-assets/gifts/moment-wedding-illustration.png", surface: "#f7ecec", accent: "#9b5e66", value: "Wedding" },
  { label: "Happy new home", description: "A fresh start", image: "/product-assets/gifts/moment-new-home-illustration.png", surface: "#edf2eb", accent: "#5c765a", value: "New home" },
  { label: "Thank you", description: "Say it with meaning", image: "/product-assets/gifts/moment-thank-you-illustration.png", surface: "#f0eef6", accent: "#756390", value: "Thank you" },
];

const giftIdeaTiles: GiftTile[] = [
  { label: "A signature perfume", description: "A scent they will remember", detail: "Find a fragrance that becomes part of the memory.", image: "/product-assets/category-cutouts/gifts-1.png", value: "Fragrances", surface: "#f8e9ee", accent: "#7d2348", titleColor: "#5b1f38", imageOffsetClass: "lg:mt-[136px]", imageWidthClass: "lg:w-[150px]", imageHeightClass: "lg:h-[206px]" },
  { label: "A preserved rose", description: "A lasting floral gift", detail: "A timeless rose to keep the moment close.", image: "/product-assets/gifts/product-cutouts/preserved-rose-v1.png", value: "Gifts for women", surface: "#edf0e8", accent: "#687440", titleColor: "#35422c", imageOffsetClass: "lg:mt-[131px]" },
  { label: "A ready gift set", description: "Beautifully and ready to give", detail: "A considered set that makes choosing feel easy.", image: "/product-assets/category-cutouts/gifts-0.png", value: "Gifts for men", surface: "#e9eff2", accent: "#315763", titleColor: "#26343c", imageOffsetClass: "lg:mt-[141px]", imageWidthClass: "lg:w-[156px]" },
  { label: "A refined bag", description: "An everyday detail with polish", detail: "A useful accessory with the feeling of a special gift.", image: "/product-assets/category-cutouts/accessories-8.png", value: "Accessories", surface: "#eaf1ed", accent: "#236a4d", titleColor: "#18382e", imageOffsetClass: "lg:mt-[139px]", imageWidthClass: "lg:w-[156px]" },
  { label: "Sunglasses", description: "A stylish finishing touch", detail: "A polished accessory they can enjoy every day.", image: "/product-assets/category-cutouts/accessories-3.png", value: "Accessories", surface: "#f3eee3", accent: "#8a693d", titleColor: "#5b442b", imageOffsetClass: "lg:mt-[151px]" },
  { label: "An oud collection", description: "A warm Deraah signature", detail: "A memorable oud gift for a little more ceremony.", image: "/product-assets/category-cutouts/oud-8.png", value: "Oud", surface: "#e8eef4", accent: "#214e73", titleColor: "#1d344a", imageOffsetClass: "lg:mt-[147px]", imageWidthClass: "lg:w-[169px]" },
];

type GiftBrowseChip = { label: string; filter: string; icon?: string; image?: string; filterType?: "occasion" | "category" | "recipient" };

const giftOccasionChips: GiftBrowseChip[] = [
  { label: "Global Flower Day", filter: "Gifts for women", filterType: "category", image: "/product-assets/gifts/luxury-floral-gift.png" },
  { label: "International Women's Day", filter: "Gifts for women", filterType: "category", image: deraahGiftImages[4] },
  { label: "Thank You", filter: "Thank you", image: deraahGiftImages[2] },
  { label: "Happy Birthday", filter: "Birthday", image: deraahGiftImages[8] },
  { label: "Happy Anniversary", filter: "Anniversary", image: deraahGiftImages[7] },
  { label: "New Home", filter: "New home", image: deraahGiftImages[6] },
  { label: "Congratulations", filter: "Congratulations", image: deraahGiftImages[3] },
  { label: "Congratulations to the Newlyweds", filter: "Wedding", image: deraahGiftImages[7] },
  { label: "I'm Sorry", filter: "Love", image: deraahGiftImages[4] },
  { label: "Blessed Umrah", filter: "Congratulations", image: deraahGiftImages[7] },
  { label: "New Year Gifts", filter: "Congratulations", image: deraahGiftImages[6] },
  { label: "Fragrances", filter: "Fragrances", filterType: "category", image: deraahGiftImages[1] },
  { label: "Eid Al-Fitr Gifts", filter: "Congratulations", image: deraahGiftImages[7] },
  { label: "Siblings' Day", filter: "Love", image: deraahGiftImages[0] },
  { label: "Manager's Day", filter: "Thank you", image: deraahGiftImages[0] },
  { label: "I Miss You", filter: "Love", image: deraahGiftImages[8] },
  { label: "Jewelry", filter: "Accessories", filterType: "category", image: deraahGiftImages[0] },
  { label: "Islamic New Year", filter: "Congratulations", image: deraahGiftImages[7] },
  { label: "Congratulations on the Promotion", filter: "Congratulations", image: deraahGiftImages[1] },
  { label: "Retirement", filter: "Congratulations", image: deraahGiftImages[7] },
  { label: "Farewell", filter: "Thank you", image: deraahGiftImages[6] },
  { label: "Saudi National Day", filter: "Congratulations", image: deraahGiftImages[3] },
  { label: "Just Because", filter: "Just because", image: deraahGiftImages[5] },
  { label: "Congratulations on the Opening", filter: "Congratulations", image: deraahGiftImages[3] },
  { label: "Congratulations on the License", filter: "Congratulations", image: deraahGiftImages[3] },
  { label: "Congratulations on the New Car", filter: "Congratulations", image: deraahGiftImages[5] },
  { label: "Congratulations on the New Job", filter: "Congratulations", image: deraahGiftImages[1] },
  { label: "Cake", filter: "Birthday", image: deraahGiftImages[8] },
  { label: "Get Well Soon", filter: "Get well soon", image: deraahGiftImages[2] },
  { label: "Saudi Founding Day", filter: "Congratulations", image: deraahGiftImages[6] },
  { label: "New Baby Congratulations", filter: "New baby", image: deraahGiftImages[2] },
  { label: "Sweets & Chocolate", filter: "Love", image: deraahGiftImages[4] },
  { label: "Flowers & Bouquets", filter: "Gifts for women", filterType: "category", image: "/product-assets/gifts/luxury-floral-gift.png" },
];

const giftRelationshipChips: GiftBrowseChip[] = [
  { label: "Brother", filter: "Men", image: deraahGiftImages[0] },
  { label: "Sister", filter: "Women", image: deraahGiftImages[8] },
  { label: "Mother", filter: "Mother", image: deraahGiftImages[6] },
  { label: "Father", filter: "Father", image: deraahGiftImages[1] },
  { label: "Husband", filter: "Husband", image: deraahGiftImages[3] },
  { label: "Wife", filter: "Wife", image: deraahGiftImages[4] },
  { label: "Beloved", filter: "Women", image: deraahGiftImages[9] },
  { label: "Friend", filter: "Friend", image: deraahGiftImages[5] },
  { label: "Teacher", filter: "Friend", image: deraahGiftImages[2] },
  { label: "Manager", filter: "Men", image: deraahGiftImages[0] },
  { label: "Employee", filter: "Friend", image: deraahGiftImages[1] },
  { label: "Colleague", filter: "Friend", image: deraahGiftImages[5] },
  { label: "Boss", filter: "Men", image: deraahGiftImages[3] },
  { label: "Daughter", filter: "Women", image: deraahGiftImages[8] },
  { label: "Son", filter: "Men", image: deraahGiftImages[1] },
  { label: "Grandmother", filter: "Mother", image: deraahGiftImages[6] },
  { label: "Grandfather", filter: "Father", image: deraahGiftImages[7] },
  { label: "Bride", filter: "Wife", image: deraahGiftImages[7] },
  { label: "Groom", filter: "Husband", image: deraahGiftImages[3] },
  { label: "New Parents", filter: "Family", image: deraahGiftImages[2] },
  { label: "Neighbor", filter: "Friend", image: deraahGiftImages[6] },
  { label: "Doctor", filter: "Friend", image: deraahGiftImages[2] },
  { label: "Sister-in-law", filter: "Women", image: deraahGiftImages[4] },
  { label: "Brother-in-law", filter: "Men", image: deraahGiftImages[0] },
  { label: "Family", filter: "Family", image: deraahGiftImages[6] },
  { label: "A Couple", filter: "Family", image: deraahGiftImages[7] },
];

const giftHeroSlides = [
  { occasion: "Mother's Day", recipient: "For mothers", message: "A softer way to say thank you", eyebrow: "Mother's Day edit", title: "For the one who", highlight: "makes every day warmer.", description: "Thoughtful fragrance, flowers and care gifts for the woman who gives so much.", cta: "Shop Mother's Day gifts", reassurance: "Gift-ready details for her", filter: "Thank you", image: "/product-assets/gifts/hero-illustration-mothers-day.png?v=saudi-hijab-v1", surface: "#f7e8ed", imageScale: 0.72, titleColor: "#5b1f38", highlightColor: "#a44d6a", bodyColor: "#795b67", mutedColor: "#876875", eyebrowColor: "#9f5870", accentColor: "#7d2348" },
  { occasion: "Teacher's Day", recipient: "For teachers", message: "A thoughtful thank-you", eyebrow: "Teacher's Day edit", title: "Say thank you", highlight: "with something meaningful.", description: "Elegant Deraah picks for the teacher who makes a lasting difference.", cta: "Shop thank-you gifts", reassurance: "A memorable gesture, beautifully wrapped", filter: "Thank you", image: "/product-assets/gifts/hero-illustration-teachers-day.png?v=saudi-hijab-v1", surface: "#eaf1ed", imageScale: 0.72, titleColor: "#18382e", highlightColor: "#3e7b61", bodyColor: "#536960", mutedColor: "#668077", eyebrowColor: "#4b8068", accentColor: "#236a4d" },
  { occasion: "Father's Day", recipient: "For fathers", message: "For the man who is always there", eyebrow: "Father's Day edit", title: "For the man", highlight: "who is always there.", description: "Refined fragrance, oud and accessory sets chosen for the men who lead with care.", cta: "Shop Father's Day gifts", reassurance: "Bold scents. Thoughtful details.", filter: "Thank you", image: "/product-assets/gifts/hero-illustration-fathers-day.png?v=saudi-hijab-v1", surface: "#e8eef4", imageScale: 0.68, titleColor: "#1d344a", highlightColor: "#3e638b", bodyColor: "#536b7e", mutedColor: "#62798a", eyebrowColor: "#52728b", accentColor: "#214e73" },
  { occasion: "Birthday", recipient: "For someone special", message: "Make their day feel unforgettable", eyebrow: "Birthday edit", title: "Make their day", highlight: "feel unforgettable.", description: "Find a gift that feels as special as the person you are celebrating.", cta: "Shop birthday gifts", reassurance: "Ready to make them smile", filter: "Birthday", image: "/product-assets/gifts/hero-illustration-birthday.png?v=saudi-hijab-v1", surface: "#f8eee7", imageScale: 0.72, titleColor: "#5b2b32", highlightColor: "#b96b73", bodyColor: "#795d58", mutedColor: "#896b65", eyebrowColor: "#a05f59", accentColor: "#8a3e46" },
  { occasion: "Graduation", recipient: "For the graduate", message: "Celebrate the next chapter", eyebrow: "Graduation edit", title: "Celebrate", highlight: "the next chapter.", description: "A considered gift for a proud moment and everything that comes next.", cta: "Shop graduation gifts", reassurance: "A thoughtful start to something new", filter: "Graduation", image: "/product-assets/gifts/hero-illustration-graduation.png?v=saudi-hijab-v1", surface: "#e9eff2", imageScale: 0.7, titleColor: "#26343c", highlightColor: "#5d858f", bodyColor: "#5c7077", mutedColor: "#6d8287", eyebrowColor: "#61848d", accentColor: "#315763" },
  { occasion: "Anniversary", recipient: "For your partner", message: "Keep the beautiful moments close", eyebrow: "Anniversary edit", title: "Keep your story", highlight: "close.", description: "Celebrate the moments you share with a gift chosen for two.", cta: "Shop anniversary gifts", reassurance: "Made for your favourite person", filter: "Wedding", image: "/product-assets/gifts/hero-illustration-anniversary.png?v=saudi-hijab-v1", surface: "#efe7e5", imageScale: 0.72, titleColor: "#4b302e", highlightColor: "#a26d65", bodyColor: "#75605c", mutedColor: "#896f6b", eyebrowColor: "#996a62", accentColor: "#713e39" },
  { occasion: "New baby", recipient: "For new parents", message: "Welcome a little more joy", eyebrow: "New baby edit", title: "Welcome", highlight: "a little more joy.", description: "Warm and thoughtful gifts for a beautiful new beginning.", cta: "Shop new baby gifts", reassurance: "A gentle welcome, ready to give", filter: "New baby", image: "/product-assets/gifts/hero-illustration-new-baby.png?v=saudi-hijab-v1", surface: "#f2edf4", imageScale: 0.72, titleColor: "#422a4d", highlightColor: "#926997", bodyColor: "#746678", mutedColor: "#88758e", eyebrowColor: "#896692", accentColor: "#683d70" },
];

function FilterPills({ options, selected, onChange }: { options: string[]; selected: string; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2">{options.map(option => <button key={option} type="button" onClick={() => onChange(selected === option ? "" : option)} className={`rounded-full border px-3.5 py-2 text-[11px] transition-colors ${selected === option ? "border-[#6f1e3b] bg-[#6f1e3b] text-white" : "border-[#e8dce0] bg-white text-[#55464b] hover:border-[#b8778b] hover:bg-[#fff8fa]"}`}>{option}</button>)}</div>;
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: string }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#a35a71]">{eyebrow}</p><h2 className="text-2xl font-medium tracking-[-.045em] text-[#321b24] sm:text-3xl">{title}</h2>{description && <p className="mt-2 max-w-[590px] text-xs leading-5 text-[#88757b]">{description}</p>}</div>{action && <a href="#gift-results" className="relative z-30 inline-flex items-center gap-2 text-xs font-medium text-[#6f1e3b] no-underline hover:underline lg:me-20">{action}<ArrowRight size={14} /></a>}</div>;
}

function DiscoveryTile({ tile, onSelect, wide = false, uniform = false }: { tile: GiftTile; onSelect: () => void; wide?: boolean; uniform?: boolean }) {
  const heightClass = uniform ? "h-[140px]" : tile.size === "tall" ? "lg:h-[252px]" : tile.size === "medium" ? "lg:h-[205px]" : "";
  const minHeightClass = uniform ? "" : wide ? "min-h-[145px]" : "min-h-[176px]";
  const overflowClass = uniform ? "overflow-visible" : "overflow-hidden";
  const imageClass = uniform ? "absolute -top-24 inset-x-0 h-[calc(100%+80px)] w-full object-contain p-4 mix-blend-multiply transition duration-500 group-hover:scale-110" : "absolute inset-0 h-full w-full object-contain p-5 mix-blend-multiply transition duration-500 group-hover:scale-110";
  return <button type="button" onClick={onSelect} className={`group relative isolate w-full ${overflowClass} rounded-[18px] bg-transparent text-left ${minHeightClass} ${heightClass}`}>
    {uniform ? <img src={tile.image} alt="" className="absolute -top-[72px] left-1/2 z-20 h-[150px] w-[150px] -translate-x-1/2 object-contain p-2 drop-shadow-[0_12px_16px_rgba(50,27,36,.16)] transition duration-500 group-hover:scale-110" /> : <img src={tile.image} alt="" className={imageClass} />}
    <span className="pointer-events-none absolute inset-0 z-0 rounded-[18px] bg-[#e8dde2]" />
    <span className="pointer-events-none absolute inset-0 z-10 rounded-[18px] bg-[linear-gradient(to_top,rgba(38,21,28,.94)_0%,rgba(50,27,36,.58)_42%,rgba(50,27,36,.12)_78%,rgba(50,27,36,0)_100%)]" />
    <span className="relative z-30 flex h-full flex-col justify-end p-4 text-white [text-shadow:0_1px_3px_rgba(25,12,18,.4)]"><strong className="block max-w-full truncate text-sm font-bold tracking-[-.01em]">{tile.label}</strong><span className="mt-1 block max-w-[170px] truncate text-[10px] font-medium leading-4 text-white/95">{tile.description}</span></span>
  </button>;
}

function MomentCarousel({ tiles, railRef, onSelect, onScroll }: { tiles: GiftTile[]; railRef: RefObject<HTMLDivElement>; onSelect: (value: string) => void; onScroll: (direction: number) => void }) {
  return <div className="relative"><div ref={railRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 pt-[96px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tiles.map(tile => <div key={tile.value} className="w-[260px] shrink-0 snap-start sm:w-[280px] lg:w-[180px]"><DiscoveryTile tile={tile} wide uniform onSelect={() => onSelect(tile.value)} /></div>)}</div><button type="button" onClick={() => onScroll(-1)} aria-label="Previous gift moments" className="absolute left-0 top-1/2 z-20 grid h-9 w-9 -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full bg-white text-[#321b24] shadow-[0_8px_20px_rgba(50,27,36,.13)] transition hover:scale-105"><ArrowLeft size={16} /></button><button type="button" onClick={() => onScroll(1)} aria-label="Next gift moments" className="absolute right-0 top-1/2 z-20 grid h-9 w-9 translate-x-1/3 -translate-y-1/2 place-items-center rounded-full bg-white text-[#321b24] shadow-[0_8px_20px_rgba(50,27,36,.13)] transition hover:scale-105"><ArrowRight size={16} /></button></div>;
}

function GiftIdeaCarousel({ tiles, railRef, onSelect, onScroll }: { tiles: GiftTile[]; railRef: RefObject<HTMLDivElement>; onSelect: (value: string) => void; onScroll: (direction: number) => void }) { return <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12"><SectionHeading eyebrow="Gift inspiration" title="Discover great gift ideas" description="Start with the kind of gift you want to give, then explore a few Deraah favourites." /><div className="relative"><div ref={railRef} className="gift-idea-rail snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{tiles.map(tile => <button key={`${tile.value}-${tile.label}`} type="button" onClick={() => onSelect(tile.value)} className="group flex min-w-0 flex-col items-center text-center transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7d2348] focus-visible:ring-offset-4" style={{ color: tile.titleColor ?? "#321b24" }}><span className="relative flex h-[245px] w-full items-start justify-center overflow-visible transition duration-500 group-hover:-translate-y-1 sm:h-[275px] lg:h-[320px]"><span className="absolute inset-0 z-0 bg-no-repeat bg-center bg-contain" aria-hidden="true" style={{ backgroundColor: tile.surface ?? "#f5eff0", transform: "scale(1.3)", transformOrigin: "center top", WebkitMaskImage: "url('/product-assets/gift-box.svg')", maskImage: "url('/product-assets/gift-box.svg')", WebkitMaskPosition: "center", maskPosition: "center", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskSize: "contain", maskSize: "contain" }} /><img src={tile.image} alt={tile.label} className={`relative z-10 mt-[34px] h-[170px] w-full object-contain px-1 mix-blend-multiply transition duration-500 group-hover:scale-105 sm:mt-[46px] sm:h-[190px] lg:h-[200px] lg:py-0 ${tile.imageOffsetClass ?? "lg:mt-[62px]"} ${tile.imageWidthClass ?? ""} ${tile.imageHeightClass ?? ""}`} /></span><strong className="mt-4 min-h-[24px] text-sm font-semibold sm:text-base">{tile.label}</strong><span className="mt-1 min-h-[32px] max-w-[180px] text-[10px] leading-4 opacity-70 sm:text-[11px]">{tile.description}</span><span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.14em]" style={{ color: tile.accent ?? "#7d2348" }}>Explore <ArrowRight size={11} /></span></button>)}</div><button type="button" onClick={() => onScroll(-1)} aria-label="Previous gift suggestions" className="absolute left-0 top-[42%] z-20 grid h-9 w-9 -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full bg-white text-[#321b24] shadow-[0_8px_20px_rgba(50,27,36,.13)] transition hover:scale-105 lg:-left-3"><ArrowLeft size={16} /></button><button type="button" onClick={() => onScroll(1)} aria-label="Next gift suggestions" className="absolute right-0 top-[42%] z-20 grid h-9 w-9 translate-x-1/3 -translate-y-1/2 place-items-center rounded-full bg-white text-[#321b24] shadow-[0_8px_20px_rgba(50,27,36,.13)] transition hover:scale-105 lg:-right-3"><ArrowRight size={16} /></button></div></section>; }

function GiftBrowseTabs({ occasion, recipient, category, onOccasionSelect, onRecipientSelect, onCategorySelect }: { occasion: string; recipient: string; category: string; onOccasionSelect: (value: string) => void; onRecipientSelect: (value: string) => void; onCategorySelect: (value: string) => void }) {
  const occasionRailRef = useRef<HTMLDivElement>(null);
  const scrollOccasions = (direction: number) => {
    const rail = occasionRailRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(320, rail.clientWidth * 0.72), behavior: "smooth" });
  };
  const renderChip = (chip: GiftBrowseChip) => {
    const selected = chip.filterType === "category" ? category : chip.filterType === "recipient" ? recipient : occasion;
    const onSelect = chip.filterType === "category" ? onCategorySelect : chip.filterType === "recipient" ? onRecipientSelect : onOccasionSelect;
    return <button key={chip.label} type="button" aria-pressed={selected === chip.filter} onClick={() => onSelect(selected === chip.filter ? "" : chip.filter)} className={`group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-left text-[11px] font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#441039] ${selected === chip.filter ? "border-white bg-white text-[#441039]" : "border-white/15 bg-white/10 text-white hover:border-white/35 hover:bg-white/20"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full ${selected === chip.filter ? "bg-[#f5e6df]" : "bg-white/90"}`}>{chip.image ? <img src={chip.image} alt="" className="h-full w-full object-contain mix-blend-multiply" /> : <span className="text-base leading-none" aria-hidden="true">{chip.icon}</span>}</span><span className="pe-1">{chip.label}</span></button>;
  };
  const occasionRows = [0, 1, 2].map(row => giftOccasionChips.filter((_, index) => index % 3 === row));

  return <section id="gift-offers" className="mx-auto max-w-[1336px] px-5 pb-10 sm:px-8 sm:pb-14 lg:px-12"><div className="overflow-hidden rounded-[26px] bg-[#441039] px-5 py-8 text-white shadow-[0_18px_42px_rgba(68,16,57,.16)] sm:px-8 sm:py-10 lg:px-[34px] lg:py-[33px]"><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/60">Gift discovery</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em] sm:text-3xl">Find a gift for the moment and the person</h2><p className="mx-auto mt-2 max-w-[600px] text-xs leading-5 text-white/65">Browse thoughtful occasions and relationships, then let the gift collection narrow the choice for you.</p></div><div className="mt-8 xl:ml-[32px] xl:mr-[-13px] xl:w-[1110px]"><p className="mb-3 text-center text-sm font-semibold sm:text-base">Gift categories</p><div className="relative"><div ref={occasionRailRef} className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div dir="ltr" className="flex w-max flex-col gap-2">{occasionRows.map((row, rowIndex) => <div key={rowIndex} className="flex w-max gap-2">{row.map(renderChip)}</div>)}</div></div><button type="button" onClick={() => scrollOccasions(-1)} aria-label="Previous gift categories" className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#441039] shadow-[0_8px_20px_rgba(50,27,36,.2)] transition hover:scale-105 lg:grid lg:ml-[-24px]"><ArrowLeft size={16} /></button><button type="button" onClick={() => scrollOccasions(1)} aria-label="Next gift categories" className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#441039] shadow-[0_8px_20px_rgba(50,27,36,.2)] transition hover:scale-105 lg:grid lg:mr-[-24px]"><ArrowRight size={16} /></button></div></div><div className="my-8 h-px bg-white/12" /><div><p className="mb-3 text-center text-sm font-semibold sm:text-base">Who would you like to gift today?</p><div dir="ltr" className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:justify-center lg:overflow-visible">{giftRelationshipChips.map(renderChip)}</div></div></div></section>;
}

function GiftRail({ eyebrow, title, description, products, favoriteNames, onFavorite, onAddToCart }: { eyebrow: string; title: string; description: string; products: StoreProduct[]; favoriteNames: string[]; onFavorite: (product: StoreProduct) => void; onAddToCart: (product: StoreProduct, quantity: number) => void }) {
  if (!products.length) return null;
  return <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 lg:px-12"><SectionHeading eyebrow={eyebrow} title={title} description={description} action="View all" /><ProductCarousel products={products} imageFit="gift" favorites={favoriteNames} onFavorite={onFavorite} onAddToCart={onAddToCart} /></section>;
}

export default function GiftCLPPage() {
  const { favoriteNames, toggleFavorite } = useStoreFavorites();
  const { addToCart, cartItems, cartItemCount } = useStoreCart();
  const [occasion, setOccasion] = useState("");
  const [recipient, setRecipient] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("all");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const [quickCartOpen, setQuickCartOpen] = useState(false);
  const [lastAddedCartItem, setLastAddedCartItem] = useState<StoreCartItem | null>(null);
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(2);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveHeroSlide(index => (index + 1) % giftHeroSlides.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  const toStoreProduct = (product: GiftProduct): StoreProduct => ({ name: product.name, brand: product.brand, price: formatPrice(product.price), oldPrice: product.oldPrice === undefined ? "" : formatPrice(product.oldPrice), image: product.image, imageScale: product.imageScale, offer: product.badge, views: "" });
  const visibleProducts = useMemo(() => {
    let next = giftProducts.filter(product => {
      const recipientMatch = !recipient || product.recipients.includes(recipient);
      const occasionMatch = !occasion || product.occasions.includes(occasion);
      const styleMatch = !style || product.styles.includes(style);
      const categoryMatch = !category || product.categories.includes(category);
      const budgetMatch = budget === "all" || (budget === "under-300" && product.price < 300) || (budget === "300-600" && product.price >= 300 && product.price <= 600) || (budget === "over-600" && product.price > 600);
      return recipientMatch && occasionMatch && styleMatch && categoryMatch && budgetMatch;
    });
    if (sort === "price-low") next = [...next].sort((a, b) => a.price - b.price);
    if (sort === "price-high") next = [...next].sort((a, b) => b.price - a.price);
    return next;
  }, [budget, category, occasion, recipient, sort, style]);

  const selectedCount = [occasion, recipient, style, category].filter(Boolean).length + (budget !== "all" ? 1 : 0);
  const scrollToResults = () => document.getElementById("gift-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const selectFilter = (setter: (value: string) => void, value: string) => { setter(value); window.setTimeout(scrollToResults, 0); };
  const handleAdd = (product: GiftProduct, quantity = 1) => { const item: StoreCartItem = { id: product.id, name: product.name, brand: product.brand, price: String(product.price), image: product.image, quantity }; const existing = cartItems.find(cartItem => cartItem.id === item.id); addToCart(item); setLastAddedCartItem(existing ? { ...existing, quantity: existing.quantity + quantity } : item); setQuickCartOpen(true); };
  const handleFavorite = (product: StoreProduct) => { const source = giftProducts.find(item => item.name === product.name); if (source) toggleFavorite({ id: source.id, name: source.name, brand: source.brand, price: formatPrice(source.price), image: source.image }); };
  const handleRailAdd = (product: StoreProduct, quantity: number) => { const source = giftProducts.find(item => item.name === product.name); if (source) handleAdd(source, quantity); };
  const resetFilters = () => { setOccasion(""); setRecipient(""); setStyle(""); setBudget("all"); setCategory(""); };
  const heroSlide = giftHeroSlides[activeHeroSlide];
  const moveHeroSlide = (direction: number) => setActiveHeroSlide(index => (index + direction + giftHeroSlides.length) % giftHeroSlides.length);
  const giftIdeaRailRef = useRef<HTMLDivElement>(null);
  const scrollGiftIdeas = (direction: number) => { const rail = giftIdeaRailRef.current; if (!rail) return; const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth); if (!maxScroll) return; const distance = Math.min(Math.max(220, rail.clientWidth * 0.62), maxScroll); const target = rail.scrollLeft + direction * distance; if (direction > 0 && rail.scrollLeft > 2 && target >= maxScroll - 2) { rail.scrollTo({ left: 0, behavior: "smooth" }); return; } if (direction < 0 && rail.scrollLeft > 2 && target <= 2) { rail.scrollTo({ left: maxScroll, behavior: "smooth" }); return; } rail.scrollBy({ left: direction * distance, behavior: "smooth" }); };
  useEffect(() => {
    const timer = window.setInterval(() => scrollGiftIdeas(1), 3000);
    return () => window.clearInterval(timer);
  }, []);
  const momentRailRef = useRef<HTMLDivElement>(null);
  const scrollMoments = (direction: number) => { const rail = momentRailRef.current; if (!rail) return; const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth); if (!maxScroll) return; const distance = Math.min(Math.max(280, rail.clientWidth * 0.6), maxScroll); const target = rail.scrollLeft + direction * distance; if (direction > 0 && target >= maxScroll - 2) { rail.scrollTo({ left: 0, behavior: "smooth" }); return; } if (direction < 0 && target <= 2) { rail.scrollTo({ left: maxScroll, behavior: "smooth" }); return; } rail.scrollBy({ left: direction * distance, behavior: "smooth" }); };
  useEffect(() => {
    const timer = window.setInterval(() => scrollMoments(1), 3000);
    return () => window.clearInterval(timer);
  }, []);
  const menProducts = useMemo(() => giftProducts.filter(product => product.categories.includes("Gifts for men")).map(toStoreProduct), []);
  const womenProducts = useMemo(() => giftProducts.filter(product => product.categories.includes("Gifts for women")).map(toStoreProduct), []);
  const homeProducts = useMemo(() => giftProducts.filter(product => product.categories.includes("Home gifts") || product.categories.includes("Oud")).map(toStoreProduct), []);
  const luxuryProducts = useMemo(() => giftProducts.filter(product => product.styles.includes("Luxury")).map(toStoreProduct), []);

  return <div dir="ltr" className="min-h-screen bg-[#fcfaf9] font-sans text-[#211a1d]">
    <StoreHeader />
    <QuickCartDrawer open={quickCartOpen} item={lastAddedCartItem} items={cartItems} onViewCart={() => { setQuickCartOpen(false); window.location.assign("/checkout"); }} onClose={() => setQuickCartOpen(false)} />
    <main className="bg-[#fffff9]">
      <section className="relative overflow-hidden border-b border-[#eddfe2] transition-colors duration-500" style={{ backgroundColor: heroSlide.surface }}><div className="absolute -left-24 top-[-90px] h-[340px] w-[340px] rounded-full bg-white/35 blur-3xl" /><div className="absolute bottom-[-130px] right-[25%] h-[300px] w-[300px] rounded-full bg-white/40 blur-3xl" /><div className="relative mx-auto grid max-w-[1240px] items-center gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-12 lg:grid-cols-[1fr_460px] lg:gap-12 lg:px-12 lg:pb-16 lg:pt-14"><div className="order-2 lg:order-1"><a href="/" className="inline-flex items-center gap-2 text-[11px] font-medium no-underline transition-colors hover:text-[#6f1e3b]" style={{ color: heroSlide.mutedColor }}><ArrowLeft size={14} /> Home / Gifts</a><p className="mt-8 text-[10px] font-bold uppercase tracking-[.24em]" style={{ color: heroSlide.eyebrowColor }}>{heroSlide.eyebrow}</p><h1 className="mt-3 max-w-[660px] text-4xl font-medium leading-[1.08] tracking-[-.05em] transition-all duration-300 sm:text-5xl lg:text-[64px]" style={{ color: heroSlide.titleColor }}>{heroSlide.title}<br /><span style={{ color: heroSlide.highlightColor }}>{heroSlide.highlight}</span></h1><p className="mt-5 max-w-[560px] text-sm leading-7 transition-all duration-300 sm:text-base" style={{ color: heroSlide.bodyColor }}>{heroSlide.description}</p><div className="mt-7 flex flex-wrap items-center gap-3"><button type="button" onClick={() => { setOccasion(heroSlide.filter); window.setTimeout(scrollToResults, 0); }} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(111,30,59,.16)] transition hover:brightness-95" style={{ backgroundColor: heroSlide.accentColor }}>{heroSlide.cta} <ArrowRight size={14} /></button><span className="inline-flex items-center gap-2 text-[11px]" style={{ color: heroSlide.mutedColor }}><Check size={15} style={{ color: heroSlide.accentColor }} /> {heroSlide.reassurance}</span></div></div><div className="relative order-1 mx-auto h-[285px] w-full max-w-[380px] lg:order-2 lg:h-[390px] lg:max-w-none"><div className="absolute inset-x-7 bottom-8 top-8 rounded-[34px] bg-white/15 shadow-[0_25px_50px_rgba(40,49,65,.12)] backdrop-blur-[2px] transition-colors duration-500" style={{ backgroundColor: heroSlide.surface }} /><div className="absolute left-3 top-8 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/80 shadow-sm" style={{ color: heroSlide.accentColor }}><Sparkles size={15} /></div><div className="absolute right-0 top-2 z-20 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-[10px] font-semibold shadow-sm transition-all duration-300" style={{ color: heroSlide.titleColor }}>{heroSlide.occasion}</div><img key={heroSlide.occasion} src={heroSlide.image} alt={`${heroSlide.occasion} gift inspiration`} style={{ transform: `scale(${heroSlide.imageScale})` }} className="gift-hero-illustration relative z-10 block h-full w-full lg:-mt-[57px] lg:mr-[23px] lg:mb-[49px] lg:-ml-[84px] lg:h-[442px] lg:w-[510px] object-contain mix-blend-multiply drop-shadow-[0_24px_20px_rgba(40,49,65,.14)] transition-transform duration-500" /><span className="absolute bottom-12 left-2 z-20 rounded-2xl bg-white/90 px-4 py-3 text-left shadow-[0_12px_24px_rgba(40,49,65,.12)]"><strong className="block text-lg font-semibold" style={{ color: heroSlide.titleColor }}>{heroSlide.recipient}</strong><span className="text-[10px]" style={{ color: heroSlide.mutedColor }}>{heroSlide.message}</span><span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.12em]" style={{ color: heroSlide.accentColor }}><Sparkles size={11} /> Curated gift edit</span></span><div className="absolute bottom-0 right-0 z-30 flex items-center gap-2 rounded-full bg-white/90 p-1 shadow-[0_8px_20px_rgba(40,49,65,.12)]"><button type="button" onClick={() => moveHeroSlide(-1)} aria-label="Previous gift occasion" className="grid h-7 w-7 place-items-center transition hover:bg-[#f3e7eb]" style={{ color: heroSlide.titleColor }}><ArrowLeft size={13} /></button><div className="flex items-center gap-1" aria-label={`${activeHeroSlide + 1} of ${giftHeroSlides.length}`}>{giftHeroSlides.map((slide, index) => <button key={slide.occasion} type="button" onClick={() => setActiveHeroSlide(index)} aria-label={`Show ${slide.occasion}`} className={`h-1.5 rounded-full transition-all ${index === activeHeroSlide ? "w-5" : "w-1.5 bg-[#d8c7cc]"}`} style={index === activeHeroSlide ? { backgroundColor: heroSlide.accentColor } : undefined} />)}</div><button type="button" onClick={() => moveHeroSlide(1)} aria-label="Next gift occasion" className="grid h-7 w-7 place-items-center transition hover:bg-[#f3e7eb]" style={{ color: heroSlide.titleColor }}><ArrowRight size={13} /></button></div></div></div></section>

      <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12"><SectionHeading eyebrow="For every moment" title="Gifts for every moment" description="Choose the feeling first, then let Deraah help you find a gift that makes it memorable." /><MomentCarousel tiles={momentTiles} railRef={momentRailRef} onSelect={value => selectFilter(setOccasion, value)} onScroll={scrollMoments} /></section>


      <GiftIdeaCarousel tiles={giftIdeaTiles} railRef={giftIdeaRailRef} onSelect={value => selectFilter(setCategory, value)} onScroll={scrollGiftIdeas} />
      <GiftBrowseTabs occasion={occasion} recipient={recipient} category={category} onOccasionSelect={value => selectFilter(setOccasion, value)} onRecipientSelect={value => selectFilter(setRecipient, value)} onCategorySelect={value => selectFilter(setCategory, value)} />

      <GiftRail eyebrow="A considered start" title="Gifts for him" description="Polished accessories, fragrance and care sets selected for the men in your life." products={menProducts} favoriteNames={favoriteNames} onFavorite={handleFavorite} onAddToCart={handleRailAdd} />
      <GiftRail eyebrow="Soft details" title="Gifts for her" description="Thoughtful fragrance and care choices made for a beautiful everyday moment." products={womenProducts} favoriteNames={favoriteNames} onFavorite={handleFavorite} onAddToCart={handleRailAdd} />
      <GiftRail eyebrow="A Deraah signature" title="Oud & home gifts" description="Warm scents and home details that make the space feel more personal." products={homeProducts} favoriteNames={favoriteNames} onFavorite={handleFavorite} onAddToCart={handleRailAdd} />
      <GiftRail eyebrow="Make it memorable" title="Luxury gifts" description="For the moments that deserve a little more ceremony." products={luxuryProducts} favoriteNames={favoriteNames} onFavorite={handleFavorite} onAddToCart={handleRailAdd} />

      <section id="gift-results" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-10 sm:px-8 sm:py-14 lg:px-12"><div className="mb-7 flex flex-col gap-4 border-b border-[#eee5e5] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-[#a35a71]">Curated for you</p><h2 className="text-3xl font-medium tracking-[-.045em] text-[#321b24]">Gifts chosen with love</h2><p className="mt-2 text-xs text-[#88757b]">{visibleProducts.length} gifts selected from Deraah’s gift collection</p></div><label className="flex items-center gap-2 text-[11px] text-[#75656b]">Sort by<select value={sort} onChange={event => setSort(event.target.value)} className="rounded-full border border-[#e5dadd] bg-white px-3 py-2 text-[11px] text-[#342329] outline-none"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={13} className="-ms-7 pointer-events-none" /></label></div>{visibleProducts.length ? <div className="grid grid-cols-2 gap-[6px] sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">{visibleProducts.map(product => <ProductCard key={product.id} product={toStoreProduct(product)} layout="grid" imageFit="gift" favorite={favoriteNames.includes(product.name)} onFavorite={() => handleFavorite(toStoreProduct(product))} onAddToCart={() => handleAdd(product)} />)}</div> : <div className="rounded-[22px] border border-dashed border-[#dccbd0] bg-white px-5 py-16 text-center"><Search className="mx-auto h-7 w-7 text-[#b48b99]" /><h3 className="mt-4 text-lg font-semibold text-[#4b2735]">We couldn’t find an exact match</h3><p className="mt-2 text-xs text-[#88757b]">Try changing one of your choices and we’ll suggest a closer match.</p></div>}</section>

      <section className="mx-auto max-w-[1240px] px-5 pb-8 sm:px-8 lg:px-12"><div className="grid gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-[18px] border border-[#eee3e3] bg-white p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f3] text-[#a34e6b]"><Users size={18} /></span><span><strong className="block text-xs text-[#3b242d]">Something for everyone</strong><small className="mt-1 block text-[10px] text-[#927d82]">Gifts for men, women, and family</small></span></div><div className="flex items-center gap-3 rounded-[18px] border border-[#eee3e3] bg-white p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f9f1e7] text-[#9a6a40]"><Gift size={18} /></span><span><strong className="block text-xs text-[#3b242d]">Wrapping made for the moment</strong><small className="mt-1 block text-[10px] text-[#927d82]">Arrives ready to give</small></span></div><div className="flex items-center gap-3 rounded-[18px] border border-[#eee3e3] bg-white p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef8f0] text-[#2c8b4b]"><Sparkles size={18} /></span><span><strong className="block text-xs text-[#3b242d]">Simple, clear choices</strong><small className="mt-1 block text-[10px] text-[#927d82]">Find your gift in a few easy steps</small></span></div></div></section>
      <section id="gift-finder" className="relative z-10 mx-auto max-w-[1240px] scroll-mt-24 px-5 py-6 sm:px-8 sm:py-10 lg:px-12"><div className="overflow-hidden rounded-[20px] border border-[#eadde0] bg-white shadow-[0_12px_34px_rgba(87,33,53,.07)]"><div className="grid lg:grid-cols-[1fr_275px]"><div className="p-5 sm:p-8 lg:p-10"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a35a71]">Gift finder</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em] text-[#321b24] sm:text-3xl">Make choosing a gift easier</h2><p className="mt-2 text-xs leading-5 text-[#826c72]">Answer a few questions and we’ll sort the closest options for you.</p></div><span className="hidden rounded-full bg-[#fff4f6] px-3 py-1.5 text-[10px] font-semibold text-[#8b3b56] sm:inline-flex">{selectedCount ? `${selectedCount} selections` : "Quick pick"}</span></div><div className="mt-8 grid gap-7 sm:grid-cols-2"><div><p className="mb-3 text-xs font-semibold text-[#342329]">Who is it for?</p><FilterPills options={recipients.slice(0, 6)} selected={recipient} onChange={setRecipient} /></div><div><p className="mb-3 text-xs font-semibold text-[#342329]">What is the occasion?</p><FilterPills options={occasions} selected={occasion} onChange={setOccasion} /></div><div><p className="mb-3 text-xs font-semibold text-[#342329]">Which style fits best?</p><FilterPills options={styles} selected={style} onChange={setStyle} /></div><div><p className="mb-3 text-xs font-semibold text-[#342329]">Choose your budget</p><div className="flex flex-wrap gap-2">{budgets.map(option => <button key={option.label} type="button" onClick={() => setBudget(option.value)} className={`rounded-full border px-3.5 py-2 text-[11px] transition-colors ${budget === option.value ? "border-[#6f1e3b] bg-[#6f1e3b] text-white" : "border-[#e8dce0] bg-white text-[#55464b] hover:border-[#b8778b] hover:bg-[#fff8fa]"}`}>{option.label}</button>)}</div></div></div><div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e7e9] pt-6"><button type="button" onClick={resetFilters} className="text-[11px] font-medium text-[#88757b] underline underline-offset-4">Reset choices</button><button type="button" onClick={scrollToResults} className="inline-flex items-center gap-2 rounded-full bg-[#231a1d] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#6f1e3b]">Show matching gifts <ArrowRight size={14} /></button></div></div><div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#f8f0ec] p-7 sm:p-8"><div className="absolute -bottom-10 -left-8 h-48 w-48 rounded-full bg-[#e9c6cf]/60 blur-2xl" /><div className="relative"><span className="inline-flex rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-semibold text-[#8a4f61]">Deraah touch</span><h3 className="mt-4 max-w-[190px] text-2xl font-medium leading-tight text-[#6f1e3b]">A gift that says<br />a lot about you.</h3><p className="mt-3 max-w-[210px] text-[11px] leading-5 text-[#866d71]">From fragrance to accessories, our selections are ready to make the moment unforgettable.</p></div><img src="/product-assets/gifts/gift-stack-3d.png" alt="Deraah gifts" className="absolute bottom-[-20px] left-[-4px] h-[170px] w-[170px] object-contain drop-shadow-[0_14px_14px_rgba(89,36,56,.14)]" /></div></div></div></section>
    </main>
    <StoreFooter />
    <div className="md:hidden"><StoreMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(collapsed => !collapsed)} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
  </div>;
}
