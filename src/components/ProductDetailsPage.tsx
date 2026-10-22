import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Minus, Plus, Eye, ArrowLeft, Check, Bell, Search, Heart, Share2, UserRound, ShoppingBag, Gift, Grid2X2, Home, Truck, MapPin, RotateCcw, ShieldCheck, BadgeCheck, Star, TicketPercent, Copy, ChevronRight, Clock3, X, Trash2 } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import CouponOffersDrawer from "./CouponOffersDrawer";
import StoreHeader from "./StoreHeader";
import StoreCartDrawer from "./StoreCartDrawer";
import { useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreFavorites } from "./StoreFavoritesContext";
import { formatPrice, freeSampleOptions, getCartItemSize, getGiftOfferForProduct } from "./storeCartData";
import SharedStoreFooter from "./StoreFooter";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreLocale } from "./StoreLocaleContext";
import CartBundleProgress from "./CartBundleProgress";
import ClickSpark from "./ClickSpark";
import SwipeToast from "./SwipeToast";
import BellToggle from "./BellToggle";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";

const ASSETS = {
  hero: "https://www.figma.com/api/mcp/asset/a7a83d98-3b50-4497-90e2-48c0c8da82b9.png",
  second: "https://www.figma.com/api/mcp/asset/cb6960d8-5acc-4ecd-9208-99d2a9483797.png",
  third: "https://www.figma.com/api/mcp/asset/32c319b0-8f49-4b4c-b817-a80e33f3da45.png",
  product: "/product-assets/gallery/secondary-4.png",
  galleryHero: "/product-assets/gallery/hero.png",
  gallerySecondary1: "/product-assets/gallery/leader-lifestyle.png",
  gallerySecondary2: "/product-assets/gallery/secondary-2.png",
  gallerySecondary3: "/product-assets/gallery/secondary-3.png",
  gallerySecondary7: "/product-assets/gallery/secondary-7.png",
  aroma: "https://www.figma.com/api/mcp/asset/f9de464c-40b0-4aa8-b65a-0738e9c5344d.png",
  // These are local exports from the lower recommendation cards. Keeping them
  // local avoids the Figma asset URLs expiring in the preview browser.
  yellow: "/product-assets/buy-with-yellow.png",
  pink: "/product-assets/recommendation-pink.png",
  bell: "https://www.figma.com/api/mcp/asset/610f3750-6220-49d7-83a2-070ef4c69797.svg",
  search: "https://www.figma.com/api/mcp/asset/513e09a3-ffa9-438b-829d-4e6e90e9ccb1.svg",
  account: "https://www.figma.com/api/mcp/asset/fe746576-a848-4cab-9e58-d7ddfc2ac28c.svg",
  cart: "https://www.figma.com/api/mcp/asset/e7c09fab-b61d-49cf-9831-16f10e0ee78f.svg",
  gift: "https://www.figma.com/api/mcp/asset/03abc764-106b-4130-81ad-5d5210228238.svg",
  categories: "https://www.figma.com/api/mcp/asset/3a4a1f10-15f0-4ca2-b59f-85b5d0c8fb82.svg",
  home: "https://www.figma.com/api/mcp/asset/6f9e69e0-6c6e-4900-8d9a-a5805cb9a86e.svg",
  fast: "https://www.figma.com/api/mcp/asset/a3383bf5-addb-4f74-b527-4d474a483bda.svg",
  returns: "https://www.figma.com/api/mcp/asset/881cae17-e7cb-47bd-8c7d-3144ecb846fb.svg",
  payment: "https://www.figma.com/api/mcp/asset/2387652e-3a8d-45e1-80f7-9de0c19bc9d8.svg",
  certificate: "https://www.figma.com/api/mcp/asset/2827267b-b29a-416f-84e6-43904fe1be8b.svg",
  share: "https://www.figma.com/api/mcp/asset/3d70a03d-0aee-4d1a-9388-dfd1f0dfd236.svg",
  heart: "https://www.figma.com/api/mcp/asset/94b50aa7-bd52-44d0-a50b-d7f5b205154d.svg",
  tabby: "https://www.figma.com/api/mcp/asset/20f34a57-da12-491a-abbe-58b5dfabee97.svg",
  tamara: "https://cdn.tamara.co/assets/png/tamara-logo-badge-en.png",
  addToCart: "/product-assets/button-jewelry.svg",
  tabbyBadge: "/product-assets/tabby-badge.svg",
  mukafaatiIcon: "/product-assets/mukafaati-stars.png",
};

const STORY_ASSETS = {
  hero: "/product-assets/story/raw-06.png",
  portrait: "/product-assets/story/raw-17.png",
  ingredients: "/product-assets/story/notes-pyramid.png",
  product: "/product-assets/story/raw-03.png",
  campaign: "/product-assets/story/raw-14.png",
  detail: "/product-assets/story/raw-13.png",
};

type SizeOption = { label: string; price: string };
export type Product = { name: string; brand: string; price: string; oldPrice: string; image: string; hoverImage?: string; offer?: string; views: string; sizes?: SizeOption[]; imageScale?: number; outOfStock?: boolean };
const PriceValue = RiyalPrice;
// Set to false to restore the previous price/stock presentation and hide the added purchase actions.
const PRODUCT_DETAIL_REFERENCE_ENHANCEMENTS = true;
// Set to false to restore the previous extra-color control and header treatment.
const PRODUCT_DETAIL_UI_POLISH = true;

export const recommendations: Product[] = [
  { name: "Link White Limited Edition 150ml", brand: "LINK", price: formatPrice(288), oldPrice: formatPrice(500), offer: "1+2 Free", views: "900+", image: "/product-assets/real-products/link-white.png", hoverImage: "/product-assets/hover-products/link-white-hover.png", sizes: [{ label: "150 ml", price: formatPrice(288) }, { label: "100 ml", price: formatPrice(258) }, { label: "50 ml", price: formatPrice(208) }] },
  { name: "Green Woods Eau de Parfum", brand: "LINK", price: formatPrice(258), oldPrice: formatPrice(600), offer: "1+2 Free", views: "9368+", image: "/product-assets/real-products/green-woods.png", hoverImage: "/product-assets/hover-products/green-woods-hover.png" },
  { name: "Black Woods Eau de Toilette", brand: "LINK", price: formatPrice(208), oldPrice: formatPrice(500), views: "16470+", image: "/product-assets/real-products/black-woods.png", hoverImage: "/product-assets/hover-products/black-woods-hover.png" },
  { name: "Maroon Perfume by Link 200ml", brand: "LINK", price: formatPrice(308), oldPrice: formatPrice(420), offer: "1+2 Free", views: "757+", image: "/product-assets/real-products/maroon.png", hoverImage: "/product-assets/hover-products/maroon-hover.png", outOfStock: true },
  { name: "Silver Woods Eau de Parfum", brand: "LINK", price: formatPrice(208), oldPrice: formatPrice(500), views: "1745+", image: "/product-assets/real-products/silver-woods.png", hoverImage: "/product-assets/hover-products/silver-woods-hover.png" },
];

const currentCartProduct: Product = { name: "Leader Perfume for Men 100 ml", brand: "MAIOS BRAND", price: formatPrice(220), oldPrice: formatPrice(500), views: "200", image: ASSETS.gallerySecondary3 };
const makeCartItem = (product: Product, quantity = 1, variant?: string): StoreCartItem => ({ id: `${product.name}-${variant ?? "default"}`, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image, quantity, variant });

function IconButton({ children, label, className = "", onClick }: { children: React.ReactNode; label: string; className?: string; onClick?: () => void }) {
  return <button type="button" aria-label={label} onClick={onClick} className={`flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#f3f3f3] bg-white text-[#1f2024] shadow-[0_5px_14px_rgba(8,15,52,.04)] ${className}`}>{children}</button>;
}

function AssetIcon({ src, alt = "", className = "h-6 w-6" }: { src: string; alt?: string; className?: string }) {
  const Icon = src === ASSETS.bell ? Bell : src === ASSETS.search ? Search : src === ASSETS.heart ? Heart : src === ASSETS.share ? Share2 : src === ASSETS.account ? UserRound : src === ASSETS.cart ? ShoppingBag : src === ASSETS.gift ? Gift : src === ASSETS.categories ? Grid2X2 : src === ASSETS.home ? Home : src === ASSETS.fast ? Truck : src === ASSETS.returns ? RotateCcw : src === ASSETS.payment ? ShieldCheck : BadgeCheck;
  if (src.startsWith("https://www.figma.com/api/mcp/asset/")) return <Icon aria-hidden="true" className={className} strokeWidth={1.5} />;
  return <img src={src} alt={alt} className={`${className} object-contain`} />;
}

function PaymentLogo({ title }: { title: "tabby" | "tamara" | "mis" }) {
    if (title === "mis") return <span aria-label="MIS Pay" className="flex h-[18px] w-[50px] items-center justify-center rounded-[5px] bg-[#43168b] text-[11px] font-black tracking-[-1px] text-white md:h-[22px] md:w-[65px] md:text-[14px]">MIS<sup className="ml-0.5 text-[6px] font-semibold tracking-normal md:text-[8px]">pay</sup></span>;
    if (title === "tabby") return <img src={ASSETS.tabbyBadge} alt="Tabby" className="h-[18px] w-[50px] object-contain mix-blend-multiply md:h-[22px] md:w-[65px]" />;
    return <img src={ASSETS.tamara} alt="Tamara" className="h-[18px] w-[50px] object-contain mix-blend-multiply md:h-[24px] md:w-[65px]" />;
}

function ProductGallery({ favorite, onFavorite }: { favorite: boolean; onFavorite: () => void }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [lens, setLens] = useState({ x: 50, y: 50, backgroundSize: "220%", backgroundPosition: "50% 50%" });
  const images = [ASSETS.product, ASSETS.galleryHero, ASSETS.gallerySecondary1, ASSETS.gallerySecondary2, ASSETS.gallerySecondary3];
  const selectImage = (index: number) => {
    setActive(index);
    setZoom(1);
  };
  const moveImage = (direction: number) => selectImage((active + direction + images.length) % images.length);
  const handleLensMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const containerRect = event.currentTarget.getBoundingClientRect();
    const image = event.currentTarget.querySelector<HTMLImageElement>("img");
    const imageRect = image?.getBoundingClientRect();
    if (!imageRect) return;
    const lensSize = 128;
    const scale = 2.2;
    const imageX = Math.max(0, Math.min(imageRect.width, event.clientX - imageRect.left));
    const imageY = Math.max(0, Math.min(imageRect.height, event.clientY - imageRect.top));
    setLens({
      x: Math.max(8, Math.min(92, ((event.clientX - containerRect.left) / containerRect.width) * 100)),
      y: Math.max(8, Math.min(92, ((event.clientY - containerRect.top) / containerRect.height) * 100)),
      backgroundSize: `${imageRect.width * scale}px ${imageRect.height * scale}px`,
      backgroundPosition: `${-(imageX * scale - lensSize / 2)}px ${-(imageY * scale - lensSize / 2)}px`,
    });
  };
  return (
    <section className="relative min-w-0">
        <div className="relative aspect-square w-full max-w-[620px] overflow-hidden rounded-xl bg-[#f2f2f4] md:aspect-square md:h-auto md:w-full md:overflow-hidden">
        <button type="button" aria-label="Go back" onClick={() => window.history.back()} className="absolute left-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-[10px] border border-[#f3f3f3] bg-white text-[#171a1f] shadow-[0_5px_14px_rgba(8,15,52,.04)] backdrop-blur transition-colors hover:bg-white md:hidden"><ArrowLeft size={20} strokeWidth={1.8} /></button>
        <img src={images[active]} alt="Leader perfume" onClick={() => { setLightboxOpen(true); setZoom(1); }} className={`cursor-zoom-in ${active === 0 ? "absolute left-1/2 top-1/2 -mt-[30px] h-[360px] w-[180px] -translate-x-1/2 -translate-y-1/2 scale-[2] object-contain transition-transform duration-300 ease-out md:-mt-[100px] md:top-[135px] md:h-[450px] md:w-[400px] md:translate-y-0 md:scale-100 md:hover:scale-[1.02]" : "h-full w-full object-contain transition-transform duration-300 ease-out md:hover:scale-[1.02]"}`} />
        <div className="product-gallery-social-actions absolute bottom-[72px] left-4 z-20 flex items-center gap-3">
          <IconButton label={favorite ? "Remove from wishlist" : "Add to wishlist"} onClick={onFavorite}><Heart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} strokeWidth={1.7} /></IconButton>
          <IconButton label="Share product"><Share2 className="h-5 w-5" strokeWidth={1.7} /></IconButton>
        </div>
        <div className="product-gallery-watchers absolute bottom-4 left-4 z-20 flex items-end gap-3">
          <IconButton label="View product"><Eye size={18} strokeWidth={1.6} /></IconButton>
          <span className="text-[11px] text-black"><b className="text-red-500">200</b> people<br />are watching this product now</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {images.map(image => <button key={image} onClick={() => selectImage(images.indexOf(image))} aria-label={`View image ${images.indexOf(image) + 1}`} className="h-[82px] w-[82px] shrink-0 overflow-hidden rounded-lg border-0 bg-[#f2f2f4] p-0 transition-all"><img src={image} alt="" className="h-full w-full rounded-[5px] object-cover" /></button>)}
      </div>
      {lightboxOpen && createPortal(<div role="dialog" aria-modal="true" aria-label="Product image viewer" className="product-image-viewer fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-2 md:p-6" onClick={() => setLightboxOpen(false)}>
        <div className="relative flex h-full w-full max-w-[712px] flex-col overflow-hidden rounded-[14px] bg-[#f5f5f5] shadow-2xl md:h-auto" onClick={event => event.stopPropagation()}>
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between p-4 md:p-5"><span className="pointer-events-auto rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">{active + 1} / {images.length}</span><button type="button" aria-label="Close image viewer" onClick={() => setLightboxOpen(false)} className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white text-3xl leading-none text-[#444] shadow-md">×</button></div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#f1f1f3] md:h-[712px] md:flex-none" onMouseMove={handleLensMove} onWheel={event => { event.preventDefault(); setZoom(current => Math.max(1, Math.min(2.5, current + (event.deltaY < 0 ? .25 : -.25)))); }}>
            <img src={images[active]} alt="Leader perfume enlarged" className="max-h-full max-w-full object-contain transition-transform duration-200" style={{ transform: `scale(${zoom})` }} />
            <div aria-hidden="true" className="pointer-events-none absolute hidden h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-no-repeat bg-[#f1f1f3] shadow-[0_4px_18px_rgba(0,0,0,.3)] md:block" style={{ left: `${lens.x}%`, top: `${lens.y}%`, backgroundImage: `url(${images[active]})`, backgroundSize: lens.backgroundSize, backgroundPosition: lens.backgroundPosition }} />
            <button type="button" aria-label="Previous image" onClick={() => moveImage(-1)} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-3xl text-[#555] shadow-md">‹</button>
            <button type="button" aria-label="Next image" onClick={() => moveImage(1)} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-3xl text-[#555] shadow-md">›</button>
            <div className="absolute bottom-4 left-4 flex gap-2"><button type="button" aria-label="Zoom out" onClick={() => setZoom(current => Math.max(1, current - .25))} className="grid h-9 w-9 place-items-center rounded-full bg-white text-xl text-[#444] shadow-md">−</button><button type="button" aria-label="Zoom in" onClick={() => setZoom(current => Math.min(2.5, current + .25))} className="grid h-9 w-9 place-items-center rounded-full bg-white text-xl text-[#444] shadow-md">+</button></div>
          </div>
          <div className="flex gap-2 overflow-x-auto bg-white p-3 scrollbar-hide md:justify-center">{images.map((image, index) => <button key={`lightbox-${image}`} type="button" onClick={() => selectImage(index)} aria-label={`View enlarged image ${index + 1}`} className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg border-2 bg-[#f2f2f4] p-0 ${active === index ? "border-black" : "border-transparent"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>
        </div>
      </div>, document.body)}
    </section>
  );
}

function PaymentOffer() {
  return <div className="product-payment-offer mb-5 flex min-h-[78px] w-full max-w-[360px] min-w-0 flex-col items-start justify-center gap-1 rounded-lg border border-[#e7e7e7] bg-transparent px-3 py-2 md:h-[72px] md:min-h-0 md:w-full md:max-w-none md:px-4 md:py-2">
    <p className="min-w-0 w-full pb-[6px] text-left text-[12px] font-normal leading-[16px] text-black md:whitespace-nowrap"><span className="block whitespace-nowrap md:inline">Pay <strong className="text-[12px] font-bold"><PriceValue value={formatPrice(208)} /></strong>/mo or in <strong className="text-[12px] font-semibold">4 payments.</strong></span><span className="block md:ml-1 md:inline">Sharia-compliant. More options</span></p>
    <div className="flex shrink-0 flex-row items-center justify-start gap-2"><PaymentLogo title="tamara" /><PaymentLogo title="tabby" /><PaymentLogo title="mis" /></div>
  </div>;
}

function RewardBar() {
  return <div className="mb-0 flex h-[34px] w-[237px] max-w-[237px] shrink-0 items-center justify-start gap-1 bg-transparent px-0 text-black md:h-[38px] md:w-[222px] md:max-w-[222px] md:gap-1 md:px-0" aria-label="MUKAFAATI - Earn 2200 points">
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#a88fc4]" aria-hidden="true"><Star className="h-3 w-3 fill-white text-white" strokeWidth={1.5} /></span>
    <span className="whitespace-nowrap text-[9px] font-semibold tracking-[.2px] md:text-[10px]">Earn 2200 points Mukafaati</span>
  </div>;
}

function CouponOffers() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const coupons = [["5% Discount", `Get 5% off on orders of ${formatPrice(149)} or more.`, "GET5"], [`${formatPrice(35)} Discount`, `Get ${formatPrice(35)} off on orders of ${formatPrice(399)} or more.`, "OFF35", ["02", "10", "50"]], [`${formatPrice(50)} Discount`, `Get ${formatPrice(50)} off on orders of ${formatPrice(499)} or more.`, "OFF50", ["05", "18", "32"]], [`${formatPrice(70)} Discount`, `Get ${formatPrice(70)} off on orders of ${formatPrice(799)} or more.`, "OFF70"]];
  const copyCode = async (code: string) => {
    try { await navigator.clipboard?.writeText(code); } catch { /* Clipboard may be unavailable in preview. */ }
    setCopied(code);
    window.setTimeout(() => setCopied(current => current === code ? "" : current), 1600);
  };
  return <>
    <button type="button" onClick={() => setOpen(true)} className="product-coupon-offer mb-5 flex min-h-[78px] w-full max-w-[360px] items-center justify-between rounded-lg border border-[#e7e7e7] bg-transparent px-3 py-2 text-left md:h-[72px] md:min-h-0 md:w-full md:max-w-none md:px-4">
      <span className="flex min-w-0 items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f4e9f2] text-[#b33a76]"><Gift className="h-5 w-5" strokeWidth={1.7} /></span><span className="truncate text-[10px] font-normal text-black md:text-[11px]">Special coupons and gifts with this product</span></span><ChevronRight className="h-5 w-5 shrink-0 text-[#9aa1ac]" strokeWidth={1.7} />
    </button>
    {open && <div role="dialog" aria-modal="true" aria-labelledby="coupon-offers-title" className="fixed inset-0 z-50 flex justify-end bg-black/35" onClick={() => setOpen(false)}><section className="relative flex h-full max-h-none w-full max-w-[500px] flex-col overflow-y-auto rounded-l-[24px] bg-white px-5 pb-5 pt-6 shadow-2xl md:px-6 md:pt-7" onClick={event => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 id="coupon-offers-title" className="text-xl font-bold tracking-[-.02em] text-[#202126] md:text-2xl">Available Coupons</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close coupons" className="grid h-8 w-8 place-items-center rounded-full text-2xl leading-none text-[#777]">×</button></div><div className="grid gap-4">{coupons.map(([title, description, code, endsIn]) => <article key={code} className="relative overflow-hidden rounded-xl border border-[#dbe6f4] bg-[#eef5ff] px-4 py-[9px] md:px-5 md:py-[9px]"><div className="flex items-center gap-2"><h3 className="flex min-w-0 items-center gap-2 text-[14px] font-bold leading-5 text-[#202126] md:text-base"><TicketPercent className="h-5 w-5 shrink-0 text-[#27b99a]" strokeWidth={2} />{title}</h3></div><p className="mt-2 w-full max-w-[315px] text-[11px] leading-4 text-[#687386]">{description}</p><div className="mt-3 flex h-[42px] items-center justify-between gap-3 rounded-md border border-dashed border-[#9fc4f4] bg-white/70 px-3"><span className="text-xs font-bold tracking-wide text-[#4a5568]">{code}</span><button type="button" onClick={() => copyCode(code)} className={`-mr-[11px] -mt-px flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors ${copied === code ? "bg-[#e9f8ee] text-[#208447]" : "bg-[#287cf0] text-white hover:bg-[#1768d4]"}`}><Copy className="h-3.5 w-3.5" strokeWidth={1.8} />{copied === code ? "Copied ✓" : "Copy"}</button></div>{endsIn && <div className="mt-[7px] flex items-center justify-between pb-0"><span className="flex items-center gap-1.5 text-xs font-semibold text-[#687386]"><Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />Ends in</span><div className="flex items-end gap-1.5">{endsIn.map((value, index) => <span key={value} className="text-center"><strong className="block rounded-md bg-[#d51678] px-2 py-1 text-xs font-bold text-white">{value}</strong><small className="mt-1 block text-[9px] text-[#8a95a5]">{["Days", "Hours", "Minutes"][index]}</small></span>)}</div></div>}<div className="mt-0 flex items-center justify-between pt-3 text-[11px] text-[#8a95a5]"><span>Details, Terms and Conditions</span><ChevronDown className="h-4 w-4" strokeWidth={1.7} /></div></article>)}</div></section></div>}
  </>;
}

function UnifiedCouponOffers() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="product-coupon-offer mb-5 flex min-h-[78px] w-full max-w-[360px] items-center justify-between rounded-lg border border-[#e7e7e7] bg-transparent px-3 py-2 text-left md:h-[72px] md:min-h-0 md:w-full md:max-w-none md:px-4">
      <span className="flex min-w-0 items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f4e9f2] text-[#b33a76]"><Gift className="h-5 w-5" strokeWidth={1.7} /></span><span className="truncate text-[10px] font-normal text-black md:text-[11px]">Special coupons and gifts with this product</span></span><ChevronRight className="h-5 w-5 shrink-0 text-[#9aa1ac]" strokeWidth={1.7} />
    </button>
    <CouponOffersDrawer open={open} onClose={() => setOpen(false)} />
  </>;
}

function DeliveryAddressSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mobileDrag = useMobileSheetDrag(onClose);
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="delivery-address-title" className="store-mobile-sheet-overlay fixed inset-0 z-[60] flex justify-end bg-black/35 max-md:items-end" onClick={onClose}><aside style={mobileDrag.dragStyle} className="delivery-address-drawer store-mobile-sheet relative flex h-full w-full max-w-[500px] flex-col overflow-y-auto rounded-l-[24px] bg-white px-6 pb-6 pt-5 text-left shadow-2xl" onClick={event => event.stopPropagation()}><MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} /><div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4"><h2 id="delivery-address-title" className="text-base font-medium">Add Address</h2><button type="button" onClick={onClose} aria-label="Close address" className="text-2xl leading-none text-[#555]">×</button></div><button type="button" className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#e85a62] bg-[#f8fcff] text-[11px] font-medium text-[#222]"><span aria-hidden="true">📍</span>Select the delivery address</button><h3 className="mt-6 text-[11px] font-semibold">Address</h3><div className="mt-3 grid grid-cols-2 gap-2"><select aria-label="Select city" defaultValue="" className="h-10 rounded-md border border-[#d8dce3] bg-white px-3 text-[10px] text-[#555] outline-none"><option value="" disabled>Select City</option><option>Riyadh</option><option>Dubai</option></select><select aria-label="Select district" defaultValue="" className="h-10 rounded-md border border-[#d8dce3] bg-white px-3 text-[10px] text-[#555] outline-none"><option value="" disabled>Select District</option><option>Al-Olaya</option><option>Al-Malqa</option></select></div><label className="mt-5 block text-[11px] font-semibold">Street name<input placeholder="Exam : Eastern Ring Road" className="mt-2 h-10 w-full rounded-md border border-[#d8dce3] px-3 text-[10px] outline-none" /></label><label className="mt-5 block text-[11px] font-semibold">Short Address<input placeholder="Exam : RQSA6732" className="mt-2 h-10 w-full rounded-md border border-[#d8dce3] px-3 text-[10px] outline-none" /></label><fieldset className="mt-5"><legend className="text-[11px] font-semibold">Address type</legend><div className="mt-2 flex gap-1.5"><label className="rounded-md border border-[#4d72ff] bg-[#f3f6ff] px-3 py-2 text-[10px]"><input type="radio" name="address-type" defaultChecked className="mr-1" />Home</label><label className="rounded-md border border-[#e1e4ea] px-3 py-2 text-[10px]"><input type="radio" name="address-type" className="mr-1" />Work</label><label className="rounded-md border border-[#e1e4ea] px-3 py-2 text-[10px]"><input type="radio" name="address-type" className="mr-1" />Friend</label><label className="rounded-md border border-[#e1e4ea] px-3 py-2 text-[10px]"><input type="radio" name="address-type" className="mr-1" />Other</label></div></fieldset><label className="mt-5 flex items-center gap-2 text-[10px]"><input type="checkbox" /> Another person will receive the order</label><label className="mt-3 flex items-center gap-2 text-[10px]"><input type="checkbox" defaultChecked /> Set as default address</label><button type="button" onClick={onClose} className="mt-8 h-10 w-full rounded-md bg-black text-[11px] font-semibold text-white">Save and Continue</button></aside></div>;
}

function StorePickupOptions({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stores = [["Al-Ulaya Branch 1 - Riyadh", "Olaya Street, Riyadh 12241", "1.5 KM", "All In stock"], ["Al-Ulaya Branch 2 - Riyadh", "Olaya Street, Riyadh 12241", "3.0 KM", "Partially Available"], ["Al-Ulaya Branch 3 - Riyadh", "Olaya Street, Riyadh 12241", "3.5 KM", "Out of stock"]];
  const mobileDrag = useMobileSheetDrag(onClose);
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="store-pickup-title" className="store-mobile-sheet-overlay store-pickup-modal fixed inset-0 z-[60] flex justify-end bg-black/35 max-md:items-end" onClick={onClose}><aside style={mobileDrag.dragStyle} className="store-pickup-drawer store-mobile-sheet relative flex h-full w-full max-w-[500px] flex-col overflow-y-auto rounded-l-[24px] bg-white px-6 pb-6 pt-5 text-left shadow-2xl" onClick={event => event.stopPropagation()}><MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} /><div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4"><h2 id="store-pickup-title" className="text-base font-medium">Choose a store for pickup</h2><span className="text-[11px] text-[#777]">250 stores</span></div><div className="mt-5 space-y-2">{stores.map(([name, address, distance, status], index) => <button key={name} type="button" className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${index === 0 ? "border-[#58a8ff] bg-[#f5fbff]" : "border-[#e7e7e7] bg-white"}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#f04b9c] text-[#f04b9c]"><ShoppingBag className="h-4 w-4" strokeWidth={1.5} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><b className="text-[12px] font-medium text-[#222]">{name}</b><span className="shrink-0 text-[10px] text-[#777]">{distance}</span></span><span className="mt-1 block text-[10px] text-[#7a8491]">⌖ {address}</span><span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[9px] ${index === 0 ? "bg-[#e8f8ef] text-[#36a269]" : index === 1 ? "bg-[#fff2cf] text-[#a67b21]" : "bg-[#fde2e2] text-[#c77b7b]"}`}>{status}</span></span></button>)}</div></aside></div>;
}

function DeliveryOptions() {
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  return <>
    <section aria-label="Delivery and pickup options" className="product-delivery-options mb-5 flex w-full max-w-[360px] flex-col gap-0 rounded-lg border border-[#e7e7e7] bg-transparent px-4 py-3 text-left md:w-full md:max-w-none md:px-4 md:py-3">
      <button type="button" onClick={() => setDeliveryOpen(true)} className="flex w-full items-start gap-3 pb-4 text-left"><Truck className="mt-0.5 h-6 w-6 shrink-0 text-black" strokeWidth={1.4} /><span className="min-w-0 text-[12px] leading-[16px] text-[#333]"><span className="block">Delivery to <u className="underline-offset-2">Dubai</u></span><span className="flex items-start gap-1.5 text-[#555]"><span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#36a269]" />Delivery within 2 hours</span></span></button>
      <button type="button" onClick={() => setStoreOpen(true)} className="flex w-full items-start gap-3 border-t border-[#e7e7e7] pt-6 text-left"><MapPin className="mt-0.5 h-6 w-6 shrink-0 text-black" strokeWidth={1.4} /><span className="min-w-0 text-[12px] leading-[16px] text-[#333]"><span className="block">Pickup from <u className="underline-offset-2">Deraah - Mall of the Riyadh</u></span><span className="flex items-start gap-1.5 text-[#555]"><span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#36a269]" />Available to pickup within 2 Hours during store working hours</span></span></button>
    </section>
    <DeliveryAddressSheet open={deliveryOpen} onClose={() => setDeliveryOpen(false)} /><StorePickupOptions open={storeOpen} onClose={() => setStoreOpen(false)} />
    <style>{`.delivery-drawer, .store-drawer, .store-pickup-drawer, .delivery-address-drawer { animation: drawer-slide-in .28s cubic-bezier(.22,1,.36,1) both; } @media (max-width: 767px) { .delivery-drawer, .store-drawer, .store-pickup-drawer, .delivery-address-drawer { position: fixed !important; top: auto !important; right: 0 !important; bottom: 0 !important; left: 0 !important; height: auto !important; max-height: 88vh !important; max-width: none !important; border-radius: 24px 24px 0 0; padding: 20px 16px 24px; animation: sheet-slide-in .3s cubic-bezier(.22,1,.36,1) both; } }`}</style>
  </>;
}

function SizeOptions({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  const items = [["200 ml", "unavailable", formatPrice(220)], ["150 ml", "", formatPrice(270)], ["100 ml", "", formatPrice(220)], ["50 ml", "", formatPrice(180)]];
  return <div className="mb-4 flex gap-2 overflow-x-auto pb-4 md:overflow-visible md:pb-1">{items.map(([label, note, price]) => { const unavailable = Boolean(note); return <button key={label} disabled={unavailable} aria-label={`${label}${unavailable ? " unavailable" : ""}`} onClick={() => onSelect(label)} className={`h-[71px] w-[92px] shrink-0 rounded-md border p-2.5 text-left md:h-[68px] md:w-[96px] md:flex-none md:p-2 md:py-[9px] ${selected === label ? "border-black bg-black text-white" : unavailable ? "cursor-not-allowed border-transparent bg-[#f1f1f3] text-[#a8a8a8]" : "border-[#e7e7e7] bg-white text-black"}`}><div className="flex items-center justify-between text-[11px] md:text-[12px]"><span>{label}</span>{selected === label && <span className="grid h-4 w-4 place-items-center rounded-full border border-white bg-transparent text-white"><Check size={11} strokeWidth={2.5} /></span>}</div><span className={`block text-[9px] md:text-[9px] ${note ? "text-red-500" : selected === label ? "text-white/40" : "text-[#c7c7c7]"}`}><PriceValue value={note || formatPrice(320)} light={selected === label && !note} /></span><strong className="block text-[14px] md:text-[13px]"><PriceValue value={price} light={selected === label} /></strong></button>; })}</div>;
}

function ColorOptions({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreColorsDrag = useMobileSheetDrag(() => setMoreOpen(false));
  const items = [["Black", "#6f7775", "06", "Moonlight Olive"], ["Blue", "#8196a0", "05", "Velvet Blue"], ["Brown", "#b19d8e", "03", "Chestnut Avenue"]];
  const moreColors = ["#7b2638", "#9b5b4a", "#c28b78", "#e1b7a5", "#6d4053", "#8b6a7a", "#b58da0", "#d6bfd0", "#273d54", "#456b89", "#7b9db8", "#b8ccda", "#3d5148", "#637c68", "#91a88d", "#c2d0b8", "#8a6a39", "#b18a4e", "#d0b67c", "#eadbb8", "#5b315f", "#8d4770", "#426d75", "#ad6b35", "#bd8c9e"];
  const unavailableMoreColors = new Set([2, 7, 13, 18]);
  return <div className="mb-5 mt-3 md:mb-1 md:mt-0"><div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-3 md:gap-x-4">{items.map(([label, swatch, code, name]) => <button key={label} type="button" aria-label={`Color ${label}`} onClick={() => onSelect(label)} className="flex w-[60px] min-w-0 flex-col items-center text-center md:w-[62px]"><span className={`relative grid h-9 w-9 place-items-center rounded-full border-2 bg-transparent transition-all md:h-8 md:w-8 ${selected === label ? "border-[#287cf0]" : "border-[#e2e2e2]"}`}><span aria-hidden="true" className="h-7 w-7 rounded-full md:h-6 md:w-6" style={{ backgroundColor: swatch }} />{selected === label && <span className="absolute inset-[-4px] rounded-full border border-[#287cf0]" />}</span><span className="mt-2 whitespace-nowrap text-[10px] leading-3.5 text-[#555] md:text-[9px] md:leading-3"><b className="font-medium">{code}</b> {name}</span></button>)}<button type="button" onClick={() => setMoreOpen(true)} aria-label="Show 25 more colors" title="View 25 additional colors" className="flex w-auto min-w-[132px] items-center gap-2 text-left"><span aria-hidden="true" className="h-9 w-9 shrink-0 rounded-full border border-[#999]" style={{ background: "conic-gradient(#7b2638 0 20%, #456b89 20% 40%, #91a88d 40% 60%, #b18a4e 60% 80%, #bd8c9e 80% 100%)" }} /><span className="flex flex-col whitespace-nowrap text-left leading-3"><strong className="text-[10px] font-semibold text-[#222]">+25</strong><span className="text-[9px] text-[#666]">colors</span></span></button></div>{moreOpen && <div role="dialog" aria-modal="true" aria-label="More colors" className="store-mobile-sheet-overlay fixed inset-0 z-50 bg-black/30"><aside style={moreColorsDrag.dragStyle} className="store-mobile-sheet absolute bottom-0 right-0 flex h-auto max-h-[80vh] w-full max-w-none flex-col items-start rounded-t-[24px] bg-white p-5 shadow-2xl md:bottom-auto md:top-0 md:ml-[-18px] md:h-full md:max-h-none md:w-[335px] md:max-w-[335px] md:rounded-t-none"><MobileSheetHandle dragHandlers={moreColorsDrag.dragHandlers} /><div className="flex w-full items-center justify-between border-b border-[#eeeeee] pb-4"><h3 className="text-base font-bold">Additional Colors</h3><button type="button" onClick={() => setMoreOpen(false)} aria-label="Close more colors" className="grid h-8 w-8 place-items-center rounded-full border border-[#dddddd] text-xl">×</button></div><div className="flex min-h-0 w-full flex-1 flex-col items-start justify-start gap-2 overflow-y-auto py-5">{moreColors.map((swatch, index) => { const label = `Color ${index + 5}`; const price = 220 + (index % 5) * 10; const unavailable = unavailableMoreColors.has(index); return <button key={swatch} type="button" disabled={unavailable} aria-label={`${unavailable ? "Unavailable " : "Select "}${label}`} onClick={() => { onSelect(label); setMoreOpen(false); }} className={`flex w-full items-center gap-3 border-b border-[#eeeeee] px-2 py-3 text-left ${unavailable ? "cursor-not-allowed opacity-45" : "hover:bg-[#fafafa]"}`}><span className="h-9 w-9 shrink-0 rounded-full border border-[#dedede] p-1"><span className="block h-full w-full rounded-full" style={{ backgroundColor: swatch }} /></span><span className="text-[10px] text-[#555]"><span className="block font-medium">{label}</span><span className="block text-[9px] text-[#888]">{unavailable ? "Unavailable" : "Available"}</span></span>{unavailable ? <span className="ml-auto text-[10px] text-[#b44b4b]">Unavailable</span> : <span className="ml-auto flex items-baseline gap-2 whitespace-nowrap"><PriceValue value={price} className="text-xs text-black" /><s className="text-[10px] text-[#999]"><PriceValue value={formatPrice(320)} /></s></span>}</button>; })}</div></aside></div>}</div>;
}

function DetailAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return <div className="border-b border-[#ededed] py-4"><button type="button" onClick={() => setOpen(current => !current)} aria-expanded={open} aria-controls={contentId} className="flex w-full items-center justify-between text-[14px] font-medium text-black"><span>{title}</span><ChevronDown size={15} className={`transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`} /></button><div id={contentId} aria-hidden={!open} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}><div className="min-h-0 overflow-hidden pt-3 text-[12px] leading-6 text-[#696969] md:text-[13px]">{children}</div></div></div>;
}

const fragranceNoteGroups = [
  { title: "Top Notes", description: "The fresh first impression", columns: "grid-cols-2 md:grid-cols-4", notes: [{ name: "Bergamot", position: "24% 21%" }, { name: "Cardamom", position: "48% 21%" }] },
  { title: "Heart Notes", description: "The heart of the scent", columns: "grid-cols-2 md:grid-cols-4", notes: [{ name: "Lavender", position: "24% 57%" }, { name: "Violet", position: "48% 57%" }, { name: "Sage", position: "72% 57%" }] },
  { title: "Base Notes", description: "The lasting foundation", columns: "grid-cols-2 md:grid-cols-4", notes: [{ name: "Vanilla", position: "24% 93%" }, { name: "Leather", position: "48% 93%" }, { name: "Patchouli", position: "72% 93%" }, { name: "Woody Notes", position: "95% 93%" }] },
];

function FragranceNotes() {
  return <section aria-labelledby="fragrance-notes-title" className="mt-4 w-full rounded-2xl border border-[#e8e1d4] bg-transparent p-3 md:mt-4 md:w-fit md:max-w-[780px] md:p-4">
    <h3 id="fragrance-notes-title" className="mb-2 text-base font-medium text-[#181818] md:text-lg">Fragrance Notes</h3>
    <div className="divide-y divide-[#ded6c8]">
      {fragranceNoteGroups.map(group => <div key={group.title} className="grid grid-cols-[86px_1fr] items-center gap-3 py-2 first:pt-0 last:pb-0 md:grid-cols-[105px_1fr] md:gap-3">
        <div className="text-[#181818]"><h4 className="text-xs font-medium md:text-sm">{group.title}</h4><p className="mt-2 text-[10px] leading-3 md:text-xs md:leading-4">{group.description}</p></div>
        <div className={`grid ${group.columns} gap-2 md:flex md:flex-wrap md:items-center md:justify-center md:gap-3`}>
          {group.notes.map(note => <div key={note.name} className="relative aspect-[1.37] overflow-hidden rounded-xl bg-[#dcc8a7] md:w-[108px]" style={{ backgroundImage: "url('/product-assets/fragrance-notes.png')", backgroundPosition: note.position, backgroundSize: "560% auto" }}><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /><span className="absolute bottom-2 left-2 text-[10px] font-medium text-white drop-shadow md:text-xs">{note.name}</span></div>)}
        </div>
      </div>)}
    </div>
  </section>;
}

function ProductDescriptionSections() {
  return <div className="w-full"><DetailAccordion title="Description"><p className="text-[12px] leading-5 text-[#555]">A modern and confident fragrance with a fresh opening and warm woody base.</p></DetailAccordion><DetailAccordion title="Product Information">Leader Eau de Parfum for men, 100 ml.</DetailAccordion><DetailAccordion title="Fragrance Composition"><p className="text-[12px] leading-5 text-[#555]">Top notes blend into aromatic middle notes with a lasting woody finish.</p><FragranceNotes /></DetailAccordion><DetailAccordion title="Year of Manufacture">Original product from MAIOS brand.</DetailAccordion><DetailAccordion title="Return & Exchange Policy"><p className="text-[12px] leading-5 text-[#696969]">Returns and exchanges are accepted within 7 days of delivery for unused products in their original packaging. Please contact customer service to start a request.</p></DetailAccordion></div>;
}

const reviews = [
  { name: "Vanessa", date: "31 May 2026", text: "Epic woman is feminine, soft and alluring. It got attention but in a softer way.", initials: "V", color: "#657b53" },
  { name: "Susan", date: "24 April 2026", text: "An elegant complex fragrance that means business. I love it.", initials: "S", color: "#d879a2" },
  { name: "Thathiana", date: "15 August 2025", text: "I absolutely love it. So nice and smooth.", initials: "T", color: "#e49bc0" },
];

function ReviewsSection() {
  const [open, setOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const reviewFormDrag = useMobileSheetDrag(() => setReviewOpen(false));
  const reviewsListDrag = useMobileSheetDrag(() => setOpen(false));
  const recentReviewsRef = useRef<HTMLDivElement>(null);
  const moveReviews = (direction: number) => {
    recentReviewsRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  };
  return <><section aria-labelledby="reviews-title" className="relative left-1/2 mt-8 w-screen -translate-x-1/2 border-0 bg-[#f7f8fd] p-0 py-4 md:mt-10 md:min-h-[425px] md:py-4">
    <div className="mx-auto w-full max-w-[1440px] px-4 md:px-0">
    <h2 id="reviews-title" className="mt-[11px] pt-1 text-lg font-bold md:pb-1 md:text-xl">Reviews</h2>
    <div className="mt-3 grid grid-cols-[120px_minmax(0,1fr)] items-start gap-4 md:mt-[-31px] md:min-h-[275px] md:grid-cols-[205px_228px_minmax(0,1fr)] md:items-center md:gap-8">
    <div className="contents">
      <div className="md:h-[265px] md:w-[205px]"><span className="block text-xs text-[#333]">Average Rating</span><strong className="mt-3 block w-[120px] text-3xl leading-none">4.9</strong><div className="mt-2 w-[120px] text-xl leading-none tracking-[-2px] text-[#e7b817]">★★★★★</div><button type="button" onClick={() => setOpen(true)} className="mt-3 block text-xs text-[#b78a45] underline underline-offset-2">Read 10 Reviews</button><p className="mt-4 max-w-[150px] text-[10px] leading-4 text-[#333]">100.00% (1 of 1) of reviewers recommend this product</p><button type="button" onClick={() => setReviewOpen(true)} className="mt-4 flex w-[128px] items-center justify-center rounded-[6px] border border-black px-3 py-2 text-center text-xs font-medium text-black">WRITE REVIEW</button></div>
      <div className="h-[208px] w-[173px] max-w-full space-y-3 text-[9px] text-black md:h-auto md:w-[226px] md:max-w-none md:mb-2 md:ml-[-14px] md:mr-1 md:mt-px md:pt-[122px]">{[5, 4, 3, 2, 1].map((star, index) => <div key={star} className="flex items-center gap-2"><span className="w-[50px] shrink-0 whitespace-nowrap md:w-10">{star} Stars</span><div className="h-1 flex-1 overflow-hidden rounded-full bg-[#d8d6ce]"><span className="block h-full rounded-full bg-[#b78a45]" style={{ width: index === 0 ? "84%" : index === 1 ? "13%" : index === 2 ? "3%" : "0%" }} /></div><span className="w-7 shrink-0 text-right">{index === 0 ? "84%" : index === 1 ? "13%" : index === 2 ? "3%" : "0%"}</span></div>)}</div>
    </div>
    <div className="relative col-span-2 mt-5 md:col-span-1 md:col-start-3 md:row-start-1 md:mt-0"><div className="mb-3 flex items-center justify-between"><h3 className="text-base font-semibold">Recent Reviews</h3><button type="button" onClick={() => setOpen(true)} className="flex items-center justify-center rounded-md border border-black px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-black">All reviews</button></div><div className="relative"><div ref={recentReviewsRef} className="flex snap-x gap-3 overflow-x-auto pb-1 scrollbar-hide">{reviews.map(review => <article key={review.name} className="reviews-recent-card min-w-[280px] snap-start rounded-2xl border-0 bg-white p-4 md:min-w-0 md:flex-1"><div className="text-sm tracking-[-1px] text-[#e7b817]">★★★★★</div><p className="mt-1 text-xs leading-5 text-black">{review.text}</p><div className="mt-4 flex items-center gap-2 text-[11px] text-[#777]"><span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ backgroundColor: review.color }}>{review.initials}</span><span>{review.name} · {review.date}</span></div></article>)}</div><button type="button" onClick={() => moveReviews(-1)} aria-label="Previous reviews" className="absolute left-[-14px] top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#555] shadow-md md:grid"><ArrowLeft size={14} /></button><button type="button" onClick={() => moveReviews(1)} aria-label="Next reviews" className="absolute right-[-14px] top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#555] shadow-md md:grid"><ArrowLeft size={14} className="rotate-180" /></button></div></div>
    </div>
    {reviewOpen && createPortal(<div role="dialog" aria-modal="true" aria-labelledby="write-review-title" className="store-mobile-sheet-overlay fixed inset-0 z-50 flex justify-end bg-black/35 max-md:items-end"><form dir="ltr" onSubmit={event => { event.preventDefault(); setReviewOpen(false); }} style={reviewFormDrag.dragStyle} className="reviews-drawer store-mobile-sheet relative flex h-full max-h-none w-full max-w-[500px] flex-col overflow-y-auto rounded-l-[24px] bg-white px-6 pb-6 pt-8 text-left shadow-2xl"><MobileSheetHandle dragHandlers={reviewFormDrag.dragHandlers} /><button type="button" onClick={() => setReviewOpen(false)} aria-label="Close write review" className="absolute left-6 top-5 grid h-9 w-9 place-items-center text-2xl text-[#173d36]">×</button><div className="border-b border-[#e5e5e5] pb-5 pl-12"><p className="text-[11px] text-[#555]">Leader Perfume</p><h2 id="write-review-title" className="pt-[58px] text-lg font-semibold">Write a review</h2></div><p className="mt-5 text-[10px] text-[#555]">Required fields are marked with *</p><fieldset className="mt-5"><legend className="text-sm font-medium">Overall Rating *</legend><div className="mt-2 flex gap-2">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setReviewRating(value)} className={`text-2xl ${value <= reviewRating ? "text-[#b78a45]" : "text-[#d08baa]"}`}>☆</button>)}</div><p className="text-[10px] text-[#555]">1 star = Poor ; 5 star = Excellent</p></fieldset><h3 className="mt-8 text-sm font-semibold">Tell us about your experience</h3><input required type="text" placeholder="Name *" className="mt-3 h-10 w-full border border-[#aaa] px-3 text-xs italic outline-none focus:border-[#174b43]" /><textarea required minLength={60} placeholder="Your experience..." className="mt-4 h-24 w-full resize-none border border-[#aaa] p-3 text-xs italic outline-none focus:border-[#174b43]" /><div className="mt-4 flex items-center gap-2"><label className="inline-flex cursor-pointer items-center rounded border border-[#174b43] px-3 py-2 text-[10px] font-medium text-[#174b43]">ADD PHOTO<input type="file" accept="image/*" multiple className="hidden" /></label><span className="text-[10px] text-[#aaa]">Add up to 6 photos</span></div><h3 className="mt-8 text-sm font-semibold">Personal Information *</h3><input required type="email" placeholder="Email address *" className="mt-3 h-10 w-full border border-[#aaa] px-3 text-xs italic outline-none focus:border-[#174b43]" /><fieldset className="mt-8"><legend className="text-sm font-semibold">Would you recommend this product?</legend><div className="mt-3 flex gap-6 text-xs"><label className="flex items-center gap-2"><input required type="radio" name="recommend" value="yes" /> Yes</label><label className="flex items-center gap-2"><input type="radio" name="recommend" value="no" /> No</label></div></fieldset><label className="mt-8 flex items-center gap-2 text-xs"><input required type="checkbox" /> I agree to the <span className="font-semibold underline">terms &amp; conditions</span></label><p className="mt-5 text-[9px] text-[#555]">You may receive emails regarding this submission. Any emails will include the ability to opt-out of future communications.</p><button type="submit" disabled={reviewRating === 0} className="mt-10 h-11 w-full rounded bg-[#0f4c40] text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">SUBMIT REVIEW</button></form></div>, document.body)}
    </div>
  </section>{open && <div role="dialog" aria-modal="true" aria-labelledby="all-reviews-title" className="store-mobile-sheet-overlay fixed inset-0 z-50 flex justify-end bg-black/35 max-md:items-end"><div style={reviewsListDrag.dragStyle} className="reviews-drawer store-mobile-sheet relative flex h-full max-h-none w-full max-w-[500px] flex-col overflow-hidden rounded-l-[24px] bg-white px-6 pb-6 pt-8 shadow-2xl"><MobileSheetHandle dragHandlers={reviewsListDrag.dragHandlers} /><button onClick={() => setOpen(false)} aria-label="Close reviews" className="absolute left-6 top-5 grid h-9 w-9 place-items-center rounded-full bg-white text-2xl shadow-[0_3px_12px_rgba(0,0,0,.08)]">×</button><h2 id="all-reviews-title" className="pt-[58px] text-[30px] font-bold">Reviews</h2><div className="mt-4 grid grid-cols-[115px_1fr] items-center gap-4"><div><strong className="block text-3xl leading-none">4.9</strong><div className="mt-2 text-xl tracking-[-2px] text-[#e7b817]">★★★★★</div><span className="text-[11px]">10 ratings</span></div><div className="space-y-1 text-[9px]">{[5, 4, 3, 2, 1].map((star, index) => <div key={star} className="flex items-center gap-2"><span className="w-2">{star}</span><div className="h-2 flex-1 rounded-full bg-[#eef0f1]"><span className="block h-full rounded-full bg-black" style={{ width: index === 0 ? "92%" : index === 1 ? "18%" : "0%" }} /></div></div>)}</div></div><div className="mt-5 flex h-11 items-center gap-2 rounded-full border border-[#e2e5e7] px-4 text-[#777]"><Search size={17} /><span className="text-sm">Search</span></div><div className="mt-3 flex gap-2"><button className="rounded-full border border-[#e2e5e7] px-4 py-2 text-xs font-semibold">Sort by⌄</button><button className="rounded-full border border-[#e2e5e7] px-4 py-2 text-xs font-semibold">Rating⌄</button><button className="rounded-full border border-[#e2e5e7] px-4 py-2 text-xs font-semibold">Size⌄</button></div><div className="mt-5 space-y-3 overflow-y-auto pr-1">{reviews.map(review => <article key={review.name} className="rounded-2xl border border-[#eeeeee] p-4 shadow-[0_3px_12px_rgba(0,0,0,.03)]"><div className="text-xl tracking-[-2px] text-[#e7b817]">★★★★★</div><span className="text-[11px] text-[#888]">2ml Glass Spray</span><p className="mt-1 text-sm leading-5">{review.text}</p><div className="mt-3 flex items-center justify-between text-[11px] text-[#777]"><span className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ backgroundColor: review.color }}>{review.initials}</span>{review.name} · {review.date}</span><span>♧ Helpful　···</span></div></article>)}</div></div></div>}</>;
}

type BundleProduct = { name: string; price: string; image: string; unavailable?: boolean };

const bundleProducts: BundleProduct[] = [
  { name: recommendations[1].name, price: recommendations[1].price, image: recommendations[1].image },
  { name: "Leader Sport 100 ml", price: formatPrice(348), image: recommendations[2].image },
  { name: "Leader men's accessory set", price: formatPrice(640), image: recommendations[0].image },
];

function BoughtTogether() {
  const [selected, setSelected] = useState([false, true, true]);
  const selectedProducts = bundleProducts.filter((_, index) => selected[index] && !bundleProducts[index].unavailable);
  const total = selectedProducts.reduce((sum, product) => sum + Number(product.price.replace(/[^0-9]/g, "")), 0);

  return <section aria-labelledby="bought-together-title" className="mt-8 overflow-hidden rounded-2xl border border-[#eeeeee] bg-[#fafcff] p-4 md:mt-10 md:p-6">
    <h2 id="bought-together-title" className="text-left text-base font-bold text-black">Bought often together</h2>
    <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-2 scrollbar-hide md:items-stretch md:justify-between">
      {bundleProducts.map((product, index) => <div key={product.name} className="flex shrink-0 snap-start items-center gap-2">
        <button type="button" disabled={product.unavailable} onClick={() => setSelected(current => current.map((value, itemIndex) => itemIndex === index ? !value : value))} aria-label={`${product.unavailable ? "Unavailable: " : "Select "}${product.name}`} className={`relative flex min-h-[208px] w-[142px] shrink-0 flex-col overflow-hidden rounded-[12px] border-0 bg-white text-center transition-shadow md:min-h-[220px] ${index === 1 ? "md:w-[146px]" : "md:w-[128px]"} ${product.unavailable ? "cursor-not-allowed opacity-55" : "hover:shadow-lg"}`}>
          <span className={`absolute left-3 top-3 grid h-3.5 w-3.5 place-items-center rounded-full border-2 ${selected[index] ? "border-[#3f82f5] bg-[#3f82f5] text-white" : "border-[#dce5f0] bg-transparent text-transparent"}`}><Check size={8} /></span>
          {product.unavailable && <span className="absolute left-11 top-4 text-[10px] font-normal text-[#ef8585]">Not available</span>}
          <div className="bought-together-image flex h-[104px] items-center justify-center p-2 md:h-[124px] md:p-3"><img src={product.image} alt="" className="bought-together-product-image h-[74px] w-[74px] object-contain mix-blend-multiply" /></div>
          <div className="flex min-h-[68px] flex-col items-start px-3 pb-3 pt-2 text-left md:px-4 md:pt-3"><p className="min-h-[32px] w-full text-xs leading-4 text-[#374257]">{product.name}</p><strong className="mt-2 block px-1 text-left text-[12px] text-black"><PriceValue value={product.price} /></strong></div>
        </button>
        {index < bundleProducts.length - 1 && <span aria-hidden="true" className="text-3xl font-light text-[#9aadc5]">+</span>}
      </div>)}
    </div>
    <button type="button" disabled={selectedProducts.length === 0} className="mt-4 h-11 w-full rounded-full bg-[#f1f2f3] text-sm font-semibold text-black transition-colors hover:bg-[#e5e7e9] disabled:opacity-40 md:h-11 md:text-sm">Buy {selectedProducts.length || 0} items together{total > 0 && <> · <PriceValue value={formatPrice(total)} /></>}</button>
  </section>;
}

function ProductStory() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const rows = [
    { image: STORY_ASSETS.portrait, title: "Leader by Proud: A Pure Blend of Fruits, Woods, and Amber", text: "Crafted with carefully selected natural ingredients, this Eastern-inspired fragrance blends apple, red berries, bergamot, orange, and lemon with rose, jasmine, and violet." },
    { image: STORY_ASSETS.ingredients, title: "A Refined Blend of Fruits, Woods, and Amber", text: "Carefully selected ingredients create an Eastern signature of apple, red berries, bergamot, orange, and lemon, layered with rose, jasmine, violet, cedarwood musk, patchouli, and oud." },
    { image: STORY_ASSETS.campaign, title: "A Balance of Freshness and Refinement", text: "Meet Leader Sport, a fragrance created for confidence, movement, and the pursuit of your next goal." },
    { image: STORY_ASSETS.product, title: "Arturito Landi: The Creator of Luxury", text: "Inspired by dreams, wonder, light, and night, this luminous sculpture captures the essence of a vision shaped with imagination and refined craftsmanship." },
  ];

  return <section id="product-story" aria-labelledby="product-story-title" dir="ltr" className="relative left-1/2 mt-12 w-screen -translate-x-1/2 overflow-hidden bg-black text-white md:mt-16">
    <div className="mx-auto max-w-[1200px]">
      <div className="relative overflow-hidden bg-black px-5 pb-7 pt-8 text-center md:px-16 md:pb-9 md:pt-12">
        <button type="button" onClick={() => setStoryOpen(current => !current)} aria-expanded={storyOpen} aria-controls="product-story-content" className="absolute right-5 top-5 rounded-full border border-white/30 px-3 py-1.5 text-[10px] text-white/80 transition-colors hover:bg-white/10 md:right-16 md:top-8 md:text-xs">{storyOpen ? "Hide details" : "Show details"}</button>
        <p className="mb-3 text-xs text-white/60 md:text-sm">Leader by Proud</p>
        <h2 id="product-story-title" className="mx-auto max-w-[760px] text-xl font-semibold leading-tight md:text-3xl">Designed with Luxury to Express Your Eastern Heritage</h2>
        {!storyOpen && <p className="mt-3 text-[10px] text-white/50 md:text-xs">Tap “Show details” to explore the fragrance story</p>}
      </div>

      {storyOpen && <div id="product-story-content">
        <div className="relative overflow-hidden bg-black px-5 pb-8 text-center md:px-16 md:pb-14">
          <p className="mx-auto max-w-[620px] text-[10px] leading-6 text-white/60 md:text-xs">An aromatic story that brings together luxury and freshness in details crafted to last.</p>
          <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden md:mt-10">
            <img src={STORY_ASSETS.hero} alt="Leader by Proud fragrance" className="h-[240px] w-full object-cover opacity-90 md:h-[515px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <button type="button" onClick={() => setVideoOpen(current => !current)} aria-label={videoOpen ? "Close product video" : "Play product video"} className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/75 bg-black/25 text-xl backdrop-blur-sm transition-colors hover:bg-white/20">{videoOpen ? "×" : "▶"}</button>
          </div>
          {videoOpen && <div className="relative left-1/2 w-screen -translate-x-1/2 border border-white/15 bg-[#111] px-5 py-3 text-center text-[10px] text-white/70">Product story video — press × to return to the story</div>}
        </div>

        <div className="space-y-10 px-5 pb-14 md:space-y-0 md:px-16 md:pb-24">
          {rows.map((row, index) => <article key={`${row.title}-${index}`} className={`grid items-center gap-7 md:min-h-[430px] md:grid-cols-2 md:gap-20 ${index >= 2 ? "md:pt-16" : ""} ${index % 2 === 0 ? "" : "md:[&>div:first-child]:order-2"}`}>
            <div dir="ltr" className="text-left md:px-4"><h3 className="mb-4 text-lg font-bold md:text-2xl">{row.title}</h3><p className="text-xs leading-7 text-white/70 md:text-sm md:leading-8">{row.text}</p></div>
            <div className={`flex h-[260px] items-center justify-center ${index === 2 ? "md:h-[515px]" : "md:h-[512px]"}`}><img src={row.image} alt={row.title} className={`h-full w-full object-contain ${index === 3 ? "grayscale" : ""}`} /></div>
          </article>)}
        </div>
      </div>}
    </div>
  </section>;
}

function PricePair({ price, oldPrice, className = "" }: { price: string; oldPrice?: string; className?: string }) {
  return <div className={`flex flex-col-reverse items-start gap-0 leading-tight whitespace-nowrap md:flex-row md:items-baseline md:gap-2 ${className}`}><strong className="pr-2 text-[16px] font-medium text-[#111827]"><PriceValue value={price} valueClassName="font-medium" /></strong>{oldPrice && <s className="product-card-old-price text-[11px] text-[#6b7280]"><PriceValue value={oldPrice} /></s>}</div>;
}

export function ProductCard({ product, recent = false, layout = "rail", imageFit = "default", onAddToCart, favorite = false, onFavorite }: { product: Product; recent?: boolean; layout?: "rail" | "grid"; imageFit?: "default" | "gift"; onAddToCart?: (product: Product, quantity: number, variant?: string) => void; favorite?: boolean; onFavorite?: () => void }) {
  const [addedCount, setAddedCount] = useState(0);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const sizePickerDrag = useMobileSheetDrag(() => setSizePickerOpen(false));
  const [selectedSize, setSelectedSize] = useState("");
  const [pickerQuantity, setPickerQuantity] = useState(1);
  const selectedSizeOption = product.sizes?.find(option => option.label === selectedSize);
  const giftOffer = getGiftOfferForProduct(product.name);
  const chooseAddAction = () => {
    if (product.sizes?.length) {
      setSelectedSize("");
      setPickerQuantity(1);
      setSizePickerOpen(true);
      return;
    }
    setAddedCount(count => count + 1);
    onAddToCart?.(product, 1);
  };
  const addSelectedSize = () => {
    if (!selectedSizeOption) return;
    setAddedCount(count => count + pickerQuantity);
    onAddToCart?.(product, pickerQuantity, selectedSizeOption.label);
    setSizePickerOpen(false);
  };

  return <>
    <article dir="ltr" className={`group relative shrink-0 overflow-hidden rounded-[14px] bg-white ${layout === "grid" ? "w-full max-w-none" : `w-[calc((100vw_-_24px)/2)] max-w-none snap-start md:w-[calc((100%_-_12px)/2)] md:max-w-[290px] ${recent ? "lg:w-[calc((100%_-_48px)/4.5)] lg:max-w-none" : "lg:w-[calc((100%_-_36px)/4)]"}`}`}>
      <div className="product-card-media group relative flex h-[220px] items-center justify-center overflow-hidden bg-[#F5F6F7] px-6 py-5 md:h-[300px]">{product.outOfStock ? <span className="store-offer-badge single absolute left-1/2 top-0 z-10 flex h-[18px] w-[120px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-b-[6px] bg-white text-[10px] font-semibold text-[#d50000]"><span className="store-offer-badge-track"><span>OUT OF STOCK</span></span></span> : (product.offer || giftOffer) && <span className={`store-offer-badge relative flex items-center justify-center overflow-hidden rounded-b-[6px] bg-white text-[10px] font-semibold text-[#111] ${giftOffer ? "has-gift" : ""}`}><span className="store-offer-badge-track">{product.offer && <><span>Offer</span><span>{product.offer}</span></>}{giftOffer && <span className="inline-flex items-center justify-center gap-1 text-[#287a43]"><Gift size={10} strokeWidth={1.8} />Gift available</span>}</span></span>}<a href="/product-details" aria-label={`View ${product.name}`} className="absolute inset-0 z-0 flex items-center justify-center"><img src={product.image} alt={product.name} style={product.imageScale ? { transform: `translateY(${imageFit === "gift" ? "0rem" : ".75rem"}) scale(${product.imageScale})` } : undefined} className={`product-card-original-image ${imageFit === "gift" ? (layout === "grid" ? "h-[180px] w-[190px] md:h-[240px] md:w-[220px]" : "h-[180px] w-[190px] md:h-[230px] md:w-[220px]") : layout === "grid" ? "h-[180px] w-[165px] md:h-[200px] md:w-[200px]" : "h-[140px] w-[115px] md:h-[200px]"} ${imageFit === "gift" ? "object-center" : "translate-y-3"} object-contain mix-blend-multiply contrast-[1.03] saturate-[1.04] transition-opacity duration-300 ease-out ${product.hoverImage ? "group-hover:opacity-0" : ""}`} />{product.hoverImage && <img src={product.hoverImage} alt="" aria-hidden="true" className="product-card-hover-image pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}</a></div>
      <div className="pointer-events-auto absolute right-3 top-3 z-20 flex flex-col gap-2 opacity-100 transition-opacity duration-200 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100"><ClickSpark sparkColor={["#b01f4b", "#dc6690", "#d9ad69"]} shape="star" sparkCount={8} sparkSize={10} sparkWidth={1.8} sparkRadius={20} duration={420} glow={0.25} className={`pointer-events-auto h-9 w-9 ${recent ? "mt-[19px]" : ""} max-md:ml-[3px] max-md:mt-[15px]`} style={{ width: 36, height: 36 }}><button type="button" aria-label={`${favorite ? "Remove" : "Add"} ${product.name} ${favorite ? "from" : "to"} wishlist`} onClick={event => { event.stopPropagation(); onFavorite?.(); }} className={`pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white shadow-md ${favorite ? "text-[#b01f4b]" : "text-[#171717]"}`}><Heart size={17} fill={favorite ? "currentColor" : "none"} strokeWidth={1.7} /></button></ClickSpark></div>
      <div className="relative flex min-h-[160px] flex-col justify-start border-t-0 bg-white px-4 py-4 md:h-[163px] md:min-h-0 md:py-[14px]">
      <div className={`relative z-30 ${sizePickerOpen ? "md:hidden" : ""}`}><div className="mb-1 flex items-center justify-between gap-2"><p className="text-[10px] font-medium text-[#6b7280]">{product.brand}</p><div className="flex items-center gap-1.5 text-[10px]" aria-label="Product rating 4.8 out of 5"><span className="text-[10px] leading-none text-[#d4a844]">★</span><span className="text-[10px] font-semibold text-[#6b7280]">4.8</span></div></div><a href="/product-details" className="block min-h-[40px] pt-1 line-clamp-2 whitespace-normal text-[12px] font-medium leading-5 text-[#111827] no-underline transition-colors hover:text-[#9a5a2e] md:text-[14px]">{product.name}</a></div>
      <div className={`group/action relative mt-8 flex h-10 items-center justify-between md:mt-4 ${sizePickerOpen ? "md:hidden" : ""}`}><PricePair price={product.price} oldPrice={product.oldPrice} className="md:mr-3" />{product.outOfStock ? <BellToggle offLabel="Notify me" onLabel="You'll be notified" size="sm" color="#111111" background="#ffffff" onColor="#ffffff" onBackground="#111111" radius={18} ringAmplitude={12} ringPasses={4} ringDuration={700} badge={false} className="product-notify-toggle ml-auto" /> : <button onMouseEnter={() => setIsCartHovered(true)} onMouseLeave={() => setIsCartHovered(false)} onClick={chooseAddAction} aria-label={`${product.sizes?.length ? "Choose size for" : "Add"} ${product.name} to cart`} style={{ backgroundColor: isCartHovered ? "#000000" : "transparent", color: isCartHovered ? "#ffffff" : "#000000" }} className={`group/cart absolute right-0 ml-auto flex h-10 items-center justify-between overflow-hidden rounded-lg border border-[#c2c2c2] px-3 font-bold transition-[width,background-color,color] duration-200 ${isCartHovered ? "w-full" : "w-10"} active:scale-[.99]`}><span className={`whitespace-nowrap text-[12px] font-bold text-white ${isCartHovered ? "mx-0 inline" : "hidden"}`}>{product.sizes?.length ? "Choose size" : "Add +"}</span>{isCartHovered && !product.sizes?.length && <PriceValue value={product.price} light className="ml-auto text-[12px] font-bold" />}<img src={ASSETS.addToCart} alt="" className={`absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain ${isCartHovered ? "hidden" : "h-[40px] w-11 md:h-[42px] md:w-12"}`} /></button>}{addedCount > 0 && <span role="status" aria-label={`${addedCount} product${addedCount > 1 ? "s" : ""} added to cart`} className="absolute -right-2 -top-2 z-20 grid h-5 w-5 place-items-center rounded-full bg-[#e53935] text-[10px] font-bold text-white shadow-md">{addedCount}</span>}</div>
      {product.sizes?.length && sizePickerOpen && <div className="absolute inset-x-0 bottom-0 z-20 hidden min-h-[210px] flex-col justify-end rounded-b-[14px] border-t border-[#f1f1f1] bg-white px-4 py-3 md:flex"><div className="relative z-30"><p className="mb-1 text-[11px] font-medium text-[#6b7280]">{product.brand}</p><p className="min-h-[40px] truncate text-[12px] font-semibold leading-5 text-[#111827] md:line-clamp-2 md:whitespace-normal md:text-[14px]">{product.name}</p></div><div className="mt-2 grid grid-cols-3 gap-1.5">{product.sizes.map(option => <button key={option.label} type="button" onClick={() => setSelectedSize(option.label)} className={`relative rounded-md border px-1.5 py-2 text-left text-[12px] transition-colors ${selectedSize === option.label ? "border-black bg-black text-white" : "border-[#dedede] bg-white hover:border-[#b99654]"}`}><span className="block text-[12px] font-semibold">{option.label}</span><PriceValue value={option.price} light={selectedSize === option.label} className={`block text-[12px] leading-3 ${selectedSize === option.label ? "font-semibold" : "text-[#555]"}`} />{selectedSize === option.label && <Check size={12} className="absolute right-1 top-1" />}</button>)}</div><button type="button" disabled={!selectedSizeOption} onClick={addSelectedSize} className={`mt-3 flex h-10 w-full items-center justify-between rounded-md px-3 text-[12px] font-semibold text-white ${selectedSizeOption ? "bg-black" : "cursor-not-allowed bg-[#8d8d8d]"}`}><span>{selectedSizeOption ? "Add +" : "Select size"}</span><PriceValue value={selectedSizeOption?.price ?? ""} light={Boolean(selectedSizeOption)} /></button></div>}
    </div>
    </article>
    {sizePickerOpen && product.sizes && createPortal(<div role="dialog" aria-modal="true" aria-labelledby="product-size-picker-title" className="store-mobile-sheet-overlay fixed inset-0 z-[90] flex items-end bg-black/45 md:hidden" onClick={() => setSizePickerOpen(false)}><section dir="ltr" style={sizePickerDrag.dragStyle} onClick={event => event.stopPropagation()} className="product-size-picker-sheet store-mobile-sheet max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white px-4 pb-8 pt-3 shadow-2xl"><MobileSheetHandle dragHandlers={sizePickerDrag.dragHandlers} /><div className="product-size-picker-header mb-3 grid grid-cols-[96px_minmax(0,1fr)] items-start gap-4"><div className="grid min-h-[112px] w-[96px] shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7]"><img src={product.image} alt="" className="block h-auto w-auto max-h-[75px] max-w-[84px] object-contain" /></div><div className="min-w-0 pt-1"><h2 id="product-size-picker-title" className="text-[14px] font-semibold leading-5 text-[#171a1f]">{product.name}</h2><div className="mt-3 flex h-8 w-[96px] items-center justify-between rounded-full bg-[#f5f5f5] px-[7px] pt-1"><button type="button" onClick={() => setPickerQuantity(value => Math.max(1, value - 1))} aria-label="Decrease quantity" className="grid h-7 w-7 place-items-center rounded-full text-xl leading-none text-[#171a1f]">−</button><span className="min-w-4 text-center text-[14px] font-medium text-[#171a1f]">{pickerQuantity}</span><button type="button" onClick={() => setPickerQuantity(value => value + 1)} aria-label="Increase quantity" className="grid h-7 w-7 place-items-center rounded-full text-xl leading-none text-[#171a1f]">+</button></div></div></div><h3 className="product-size-picker-title mb-2 text-[11px] font-bold text-black">Size Options</h3><div className="product-size-picker-options mt-[3px] mb-[13px] flex gap-2 overflow-x-auto pb-1">{product.sizes.map(option => <button key={option.label} type="button" onClick={() => setSelectedSize(option.label)} className={`relative h-[71px] w-[92px] shrink-0 rounded-md border p-2.5 text-left transition-colors ${selectedSize === option.label ? "border-black bg-black text-white" : "border-[#e7e7e7] bg-white text-black"}`}><span className="block text-[11px]">{option.label.replace(/\s/g, "")}</span><PriceValue value={option.price} light={selectedSize === option.label} className={`text-[14px] font-bold ${selectedSize === option.label ? "text-white" : "text-black"}`} />{selectedSize === option.label && <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full border-2 border-white text-white"><Check size={12} strokeWidth={2.5} /></span>}</button>)}</div><button type="button" disabled={!selectedSizeOption} onClick={addSelectedSize} className={`product-size-picker-submit flex h-12 w-full items-center justify-between rounded-lg px-4 text-base font-bold text-white ${selectedSizeOption ? "bg-black" : "cursor-not-allowed bg-[#8d8d8d]"}`}><span>{selectedSizeOption ? "Add to cart" : "Select size"}</span><PriceValue value={selectedSizeOption?.price ?? ""} light={Boolean(selectedSizeOption)} /></button></section></div>, document.body)}
  </>;
}

export function ProductCarousel({ products, recent = false, imageFit = "default", onAddToCart, favorites = [], onFavorite }: { products: Product[]; recent?: boolean; imageFit?: "default" | "gift"; onAddToCart?: (product: Product, quantity: number, variant?: string) => void; favorites?: string[]; onFavorite?: (product: Product) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: number) => trackRef.current?.scrollBy({ left: direction * 215, behavior: "smooth" });
  return <div className="relative">
    <div ref={trackRef} className={`flex snap-x snap-mandatory gap-[6px] overflow-x-auto px-0 pb-2 scrollbar-hide md:gap-3 md:px-4 ${recent ? "lg:mt-[68px]" : ""}`}>{products.map(product => <ProductCard product={product} recent={recent} imageFit={imageFit} onAddToCart={onAddToCart} favorite={favorites.includes(product.name)} onFavorite={() => onFavorite?.(product)} key={`${recent ? "recent-" : ""}${product.name}`} />)}</div>
    <div className="absolute -top-11 right-0 flex gap-2"><button onClick={() => move(-1)} aria-label="Previous products" className="grid h-8 w-8 place-items-center rounded-full border border-[#dedede] bg-white"><ArrowLeft size={14} /></button><button onClick={() => move(1)} aria-label="Next products" className="grid h-8 w-8 place-items-center rounded-full border border-[#dedede] bg-white"><ArrowLeft size={14} className="rotate-180" /></button></div>
  </div>;
}

function ProductPricingSummary() {
  if (!PRODUCT_DETAIL_REFERENCE_ENHANCEMENTS) return <div className="mb-5"><p className="mb-1 text-xs text-[#585858]">&lt; MAIOS BRAND</p><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h1 className="text-base font-bold tracking-[.4px]">Leader Perfume for Men 100 ml</h1><div className="mt-2 flex items-center justify-start gap-2" aria-label="Product rating 4.9 out of 5"><span className="text-base leading-none tracking-[-2px] text-[#e7b817]">★★★★★</span><strong className="text-[11px]">4.9</strong><span className="text-[10px] text-[#777]">(10 ratings)</span></div></div><div className="flex shrink-0 items-start"><span className="store-offer-badge product-detail-offer-badge single relative flex h-[20px] w-[65px] items-center justify-center overflow-hidden text-[9px] font-semibold"><span className="store-offer-badge-track"><span>Only 2 left</span></span></span></div></div><div className="mt-2 flex flex-col items-start gap-2"><div className="flex shrink-0 items-baseline gap-2 whitespace-nowrap"><strong className="text-base"><PriceValue value={formatPrice(220)} /></strong><s className="text-xs text-[#777]"><PriceValue value={formatPrice(500)} /></s></div><div className="flex w-full justify-start"><RewardBar /></div></div></div>;
  const currentPrice = 220;
  const oldPrice = 500;
  const discount = Math.round((1 - currentPrice / oldPrice) * 100);
  return <div className="mb-5 product-pricing-summary"><p className="mb-1 text-xs text-[#585858]">&lt; MAIOS BRAND</p><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h1 className="text-base font-bold tracking-[.4px] md:text-lg">Leader Perfume for Men 100 ml</h1><div className="mt-2 flex items-center justify-start gap-2" aria-label="Product rating 4.9 out of 5"><span className="text-base leading-none tracking-[-2px] text-[#e7b817]">★★★★★</span><strong className="text-[11px]">4.9</strong><span className="text-[10px] text-[#777]">(10 ratings)</span></div></div></div><div className="mt-3 flex flex-wrap items-center gap-2 whitespace-nowrap"><strong className="text-xl font-bold leading-none md:text-2xl"><PriceValue value={formatPrice(currentPrice)} /></strong><s className="text-xs text-[#777] md:text-sm"><PriceValue value={formatPrice(oldPrice)} /></s><span className="rounded-full bg-[#c13b43] px-2.5 py-1 text-[10px] font-bold text-white md:text-[11px]">{discount}% Off</span></div><div className="mt-2 flex w-full justify-start"><RewardBar /></div><div className="mt-2 w-full max-w-[420px]" aria-label="Low stock: 2 items remaining"><div className="flex items-center justify-between gap-3 text-[10px] text-[#333] md:text-[11px]"><span><span className="mr-1 text-[#c13b43]">Hurry up, only</span><strong>2</strong> items left in stock.</span><span className="rounded-full bg-[#fff1f1] px-2 py-1 font-semibold text-[#c13b43]">Low stock</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8e8e8]"><span className="block h-full w-[18%] rounded-full bg-[#c13b43]" /></div></div></div>;
}

export function QuickCartDrawer({ open, item, items, onViewCart, onClose }: { open: boolean; item: StoreCartItem | null; items: StoreCartItem[]; onViewCart: () => void; onClose: () => void }) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  if (!item || !mounted) return null;
  const handleClose = () => {
    setMounted(false);
    onClose();
  };
  const productPrice = formatPrice(Number(item.price.replace(/[^0-9]/g, "")) * item.quantity);
  return <SwipeToast
    key={`${item.id}-${item.quantity}`}
    open={open}
    title="Added to cart"
    icon={<img src={item.image} alt="" />}
    description={<>
      <span className="quick-cart-toast__status">Your product was added successfully.</span>
      <span className="quick-cart-toast__product">
        <span className="quick-cart-toast__thumb"><img src={item.image} alt={item.name} /></span>
        <span>
          <span className="quick-cart-toast__brand">{item.brand}</span>
          <strong className="quick-cart-toast__name">{item.name}</strong>
          {item.variant && <span className="quick-cart-toast__status">{item.variant}</span>}
          <span className="quick-cart-toast__price"><PriceValue value={productPrice} /></span>
        </span>
        <span className="quick-cart-toast__qty">{item.quantity}×</span>
      </span>
      <div className="quick-cart-toast__bundle"><CartBundleProgress items={items} compact showAddProducts={false} /></div>
    </>}
    actionLabel="View cart"
    onAction={onViewCart}
    onClose={handleClose}
    background="#ffffff"
    color="#171a1f"
    fuseColor="#cd1a76"
    width={460}
    radius={18}
    slideMs={400}
    settleBounce={0.2}
    swipeDistance={40}
    duration={5000}
    fuse="bottom"
    pauseOnHover
    closeButton
    className="quick-cart-toast"
  />;
}

export default function ProductDetailsPage({ cartPage = false }: { cartPage?: boolean }) {
  const { direction } = useStoreLocale();
  const { cartItems, cartItemCount, addToCart: addSharedCartItem } = useStoreCart();
  const { favoriteNames, isFavorite, toggleFavorite } = useStoreFavorites();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("100 ml");
  const [color, setColor] = useState("Black");
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [quickCartOpen, setQuickCartOpen] = useState(false);
  const [cartFlyAnimation, setCartFlyAnimation] = useState<{ id: number; image: string } | null>(null);
  const [cartOpen, setCartOpen] = useState(cartPage);
  const [lastAddedCartItem, setLastAddedCartItem] = useState<StoreCartItem | null>(null);
  const toggleProductFavorite = (product: Product) => toggleFavorite({ id: product.name, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image });
  const addToCart = (product: Product, quantityToAdd = 1, variant?: string) => {
    const itemId = `${product.name}-${variant ?? "default"}`;
    const addedItem = makeCartItem(product, quantityToAdd, variant);
    addSharedCartItem(addedItem);
    const existing = cartItems.find(item => item.id === itemId);
    setLastAddedCartItem(existing ? { ...existing, quantity: existing.quantity + quantityToAdd } : addedItem);
    setQuickCartOpen(true);
    setCartFlyAnimation({ id: Date.now(), image: product.image });
  };
  const openCartPage = () => {
    setQuickCartOpen(false);
    window.location.assign("/checkout");
  };
  const closeCartPage = () => {
    setCartOpen(false);
  };

  useEffect(() => {
    if (!cartFlyAnimation) return;
    const timeoutId = window.setTimeout(() => setCartFlyAnimation(null), 950);
    return () => window.clearTimeout(timeoutId);
  }, [cartFlyAnimation]);


  useEffect(() => {
    let lastScrollY = window.scrollY;
    let frameId = 0;
    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        if (Math.abs(delta) >= 12) {
          if (currentScrollY <= 80 || delta < 0) setMobileNavCollapsed(false);
          else setMobileNavCollapsed(true);
          lastScrollY = currentScrollY;
        }
        frameId = 0;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);
  return <div dir={direction} data-bs-theme="light" className={`product-detail-page store-page min-h-screen text-black ${PRODUCT_DETAIL_UI_POLISH ? "product-detail-ui-polish" : ""}`}>
    <style>{PRODUCT_DETAIL_UI_POLISH ? `
      .product-detail-ui-polish #details button[aria-label="Show 25 more colors"] {
        display: flex !important;
        width: auto !important;
        min-width: 110px !important;
        height: 46px !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 4px !important;
        padding: 0 10px !important;
        border: 1px solid #d9dde1 !important;
        border-radius: 9999px !important;
        background: #fff !important;
      }
      .product-detail-ui-polish #details button[aria-label="Show 25 more colors"] > span:first-child {
        display: none !important;
      }
      .product-detail-ui-polish #details button[aria-label="Show 25 more colors"] > span:nth-child(2) {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        gap: 4px !important;
        margin: 0 !important;
        color: #222 !important;
        font-size: 10px !important;
        line-height: 1 !important;
      }
      .product-detail-ui-polish #details button[aria-label="Show 25 more colors"] > span:nth-child(2) > strong,
      .product-detail-ui-polish #details button[aria-label="Show 25 more colors"] > span:nth-child(2) > span {
        display: inline !important;
        color: #222 !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
      }
      .product-detail-ui-polish > header {
        z-index: 50 !important;
        isolation: isolate;
        opacity: 1 !important;
        background: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        box-shadow: none !important;
      }
    ` : ""}</style>
    <style>{`@media (min-width: 768px) { #details > .mb-5 > .mt-2.flex.flex-col.items-start.gap-2 { flex-direction: row !important; align-items: center !important; gap: 0.75rem !important; } #details > .mb-5 > .mt-2.flex.flex-col.items-start.gap-2 > .flex.w-full.justify-start { width: auto !important; } } #details button[aria-label^="Color "] { position: relative; height: 71px; width: 104px; flex-direction: row; align-items: center; gap: 8px; overflow: hidden; border: 1px solid #e7e7e7; border-radius: 8px; background: #fff; padding: 8px; text-align: left; transition: border-color .2s, background-color .2s, transform .2s; } #details button[aria-label^="Color "]:hover { border-color: #aeb8c4; transform: translateY(-1px); } #details button[aria-label^="Color "]:has(.border-\\[\\#287cf0\\]) { border-color: #111; background: #111; color: #fff; } #details button[aria-label^="Color "] > span:first-child { height: 34px; width: 34px; flex: 0 0 34px; } #details button[aria-label^="Color "] > span:first-child > span { height: 26px; width: 26px; } #details button[aria-label^="Color "] > span:last-child { margin-top: 0; min-width: 0; overflow: hidden; font-size: 10px; line-height: 13px; white-space: normal; } #details button[aria-label^="Color "] > span:last-child b { display: block; } #details button[aria-label^="Color "]:has(.border-\\[\\#287cf0\\]) > span:last-child { color: #fff; } #details button[aria-label="Show more colors"] { height: 71px; width: 104px; flex-direction: row; justify-content: flex-start; gap: 8px; border: 1px solid #e7e7e7; border-radius: 8px; background: #fff; padding: 8px; text-align: left; } #details button[aria-label="Show more colors"] > span:first-child { height: 34px; width: 34px; flex: 0 0 34px; } #details button[aria-label="Show more colors"] > span:last-child { margin-top: 0; font-size: 10px; line-height: 13px; }`}</style>
    <style>{`#details button[aria-label^="Color "], #details button[aria-label="Show more colors"] { width: 78px; } @media (min-width: 768px) { #details button[aria-label^="Color "], #details button[aria-label="Show more colors"] { width: 90px; } }`}</style>
    <style>{`#details > .mb-5 > .mt-2.flex.flex-col.items-start.gap-2 { flex-direction: column !important; align-items: flex-start !important; gap: 0.5rem !important; } #details > .mb-5 > .mt-2.flex.flex-col.items-start.gap-2 > .flex.w-full.justify-start { width: 100% !important; justify-content: flex-start !important; }`}</style>
    <style>{`@keyframes offer-badge-first { 0%, 38% { opacity: 1; transform: translateY(0); } 50%, 88% { opacity: 0; transform: translateY(-100%); } 100% { opacity: 1; transform: translateY(0); } } @keyframes offer-badge-second { 0%, 38% { opacity: 0; transform: translateY(100%); } 50%, 88% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(100%); } } .store-offer-badge { text-align: center !important; } .store-offer-badge-track { position: relative !important; display: block !important; width: 100% !important; height: 100% !important; flex: 0 0 100% !important; overflow: hidden !important; } .store-offer-badge-track > span { position: absolute !important; inset: 0 !important; display: flex !important; width: 100% !important; height: 100% !important; align-items: center !important; justify-content: center !important; text-align: center !important; white-space: nowrap !important; } .store-offer-badge:not(.single) .store-offer-badge-track > span:first-child { animation: offer-badge-first 4s ease-in-out infinite; } .store-offer-badge:not(.single) .store-offer-badge-track > span:nth-child(2) { animation: offer-badge-second 4s ease-in-out infinite; } .store-offer-badge.single .store-offer-badge-track > span, .product-detail-offer-badge .store-offer-badge-track > span { animation: none !important; opacity: 1 !important; transform: none !important; } @media (prefers-reduced-motion: reduce) { .store-offer-badge-track > span { animation: none !important; } .store-offer-badge:not(.single) .store-offer-badge-track > span:nth-child(2) { opacity: 1 !important; transform: none !important; } }`}</style>
    <style>{`@keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } } @keyframes sheet-slide-in { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } } @keyframes drawer-slide-in { from { opacity: 0; transform: translateX(36px); } to { opacity: 1; transform: translateX(0); } } #details button[aria-label^="Color "] > span:first-child > span.absolute { display: none !important; } #details button[aria-label^="Color "]:has(.border-\\[\\#287cf0\\]) > span:first-child { border-color: #fff !important; border-width: 1px !important; } #details aside { top: 0 !important; right: 0 !important; bottom: auto !important; left: auto !important; height: 100% !important; max-height: none !important; width: 100% !important; max-width: 500px !important; border-radius: 24px 0 0 24px !important; padding: 32px 24px 24px !important; animation: drawer-slide-in .28s cubic-bezier(.22,1,.36,1) both; } section:has(#coupon-offers-title), .reviews-drawer { animation: drawer-slide-in .28s cubic-bezier(.22,1,.36,1) both; } div:has(> .reviews-drawer), div:has(> section:has(#coupon-offers-title)), aside { animation: modal-fade-in .22s ease-out both; } @media (max-width: 767px) { aside, .reviews-drawer, section:has(#coupon-offers-title) { position: fixed !important; top: auto !important; right: 0 !important; bottom: 0 !important; left: 0 !important; height: auto !important; max-height: 88vh !important; width: 100% !important; max-width: none !important; border-radius: 24px 24px 0 0 !important; padding: 16px 16px 24px !important; animation: sheet-slide-in .3s cubic-bezier(.22,1,.36,1) both; } div:has(> .reviews-drawer), div:has(> section:has(#coupon-offers-title)) { align-items: flex-end !important; animation: modal-fade-in .22s ease-out both; } } @media (prefers-reduced-motion: reduce) { aside, .reviews-drawer, section:has(#coupon-offers-title), div:has(> .reviews-drawer), div:has(> section:has(#coupon-offers-title)) { animation: none !important; } }`}</style>
    <style>{`#details button[aria-label^="Color "] > span:first-child { height: 27px !important; width: 27px !important; flex-basis: 27px !important; position: absolute; top: 8px; left: 8px; right: auto; } #details button[aria-label^="Color "] > span:first-child > span { height: 21px !important; width: 21px !important; } #details button[aria-label^="Color "] { flex-direction: column !important; align-items: flex-start !important; justify-content: space-between !important; gap: 0 !important; } #details button[aria-label^="Color "] > span:last-child { align-self: flex-start; margin-top: 4px !important; max-width: 100%; height: 47px !important; padding-top: 26px !important; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; white-space: normal; line-height: 13px; font-size: 12px !important; } #details button[aria-label^="Color "] > span:last-child b { display: inline !important; } section:has(#coupon-offers-title) article h3 { font-size: 14px !important; } section:has(#coupon-offers-title) article p { margin-top: 15px !important; width: 286.56px; max-width: calc(100vw - 48px); } #details button[aria-label="Show more colors"] { flex-direction: column !important; align-items: flex-start !important; justify-content: space-between !important; gap: 0 !important; } #details button[aria-label="Show more colors"] > span:first-child { position: absolute; top: 8px; left: 8px; right: auto; } #details button[aria-label="Show more colors"] > span:last-child { align-self: flex-start; margin-top: auto; min-width: 0; max-width: 100%; overflow: hidden; white-space: normal; overflow-wrap: anywhere; line-height: 13px; } @media (max-width: 767px) { #product-story article:nth-of-type(4) img { object-fit: cover !important; } }`}</style>
    <style>{`#details .order-1:nth-child(2) button[aria-label^="Color "], #details .order-1:nth-child(2) button[aria-label="Show more colors"] { height: 46px !important; width: 46px !important; min-width: 46px !important; padding: 0 !important; border: 0 !important; border-radius: 999px !important; background: transparent !important; display: grid !important; place-items: center !important; } #details .order-1:nth-child(2) button[aria-label^="Color "] > span:first-child, #details .order-1:nth-child(2) button[aria-label="Show more colors"] > span:first-child { position: relative !important; inset: auto !important; height: 38px !important; width: 38px !important; flex-basis: 38px !important; border: 1px solid #d9dde1 !important; } #details .order-1:nth-child(2) button[aria-label^="Color "]:has(.border-\\[\\#287cf0\\]) > span:first-child { border-color: #111 !important; border-width: 1px !important; } #details .order-1:nth-child(2) button[aria-label^="Color "] > span:first-child > span { height: 31px !important; width: 31px !important; } #details .order-1:nth-child(2) button[aria-label^="Color "] > span:last-child, #details .order-1:nth-child(2) button[aria-label="Show more colors"] > span:last-child { display: none !important; } #details .order-1:nth-child(2) > .mb-5 > .flex.flex-wrap { align-items: center; gap: 14px !important; }`}</style>
    <style>{`#details > .mb-5 { margin-bottom: 24px !important; } #details > .flex.flex-col { gap: 0 !important; } #details > .flex.flex-col > div.order-1, #details > .flex.flex-col > div.order-2 { margin-bottom: 20px !important; } #details > .flex.flex-col > div.order-1 > div.mb-5 { margin-top: 0 !important; margin-bottom: 0 !important; } #details > .flex.flex-col > div.order-2 > div.mb-4 { margin-bottom: 0 !important; } @media (max-width: 767px) { #details > .mb-5 { margin-bottom: 16px !important; } #details > .flex.flex-col { gap: 14px !important; } #details > .flex.flex-col > div.order-1, #details > .flex.flex-col > div.order-2 { margin-bottom: 0 !important; } #details > .flex.flex-col > div.order-1 > div.mb-5, #details > .flex.flex-col > div.order-2 > div.mb-4 { margin-bottom: 0 !important; } #details > .product-payment-offer, #details > .product-coupon-offer, #details > .product-delivery-options { margin-bottom: 16px !important; } #details > .product-benefits-grid { margin-top: 8px !important; margin-bottom: 20px !important; } }`}</style>
    <style>{`@media (max-width: 767px) { aside, .reviews-drawer, section:has(#coupon-offers-title), .delivery-drawer, .store-drawer, .store-pickup-drawer, .delivery-address-drawer { height: fit-content !important; min-height: 0 !important; max-height: calc(100vh - 24px) !important; overflow-y: auto !important; } body .store-pickup-drawer { height: max-content !important; min-height: 0 !important; align-self: flex-end !important; }`}</style>
    <style>{`.delivery-address-drawer > button.mt-5 { margin-top: 20px !important; font-size: 12px !important; } .delivery-address-drawer h3, .delivery-address-drawer label, .delivery-address-drawer legend { font-size: 12px !important; } .delivery-address-drawer h3.mt-6 { margin-top: 20px !important; } .delivery-address-drawer > h3 + div.mt-3 { margin-top: 12px !important; } .delivery-address-drawer label.mt-5 { margin-top: 20px !important; } .delivery-address-drawer fieldset.mt-5 { margin-top: 20px !important; } .delivery-address-drawer fieldset > div.mt-2 { margin-top: 10px !important; } .delivery-address-drawer > label.mt-5 + label.mt-5 { margin-top: 18px !important; } .delivery-address-drawer > label.mt-3 { margin-top: 12px !important; } .delivery-address-drawer > button.mt-8 { margin-top: 24px !important; } .delivery-address-drawer select { font-size: 12px !important; }`}</style>
    <style>{`body .delivery-address-drawer, body .store-pickup-drawer { height: auto !important; min-height: 0 !important; } @media (max-width: 767px) { #details aside.delivery-address-drawer, #details aside.store-pickup-drawer { position: fixed !important; inset: auto 0 0 0 !important; height: auto !important; min-height: 0 !important; max-height: calc(100vh - 24px) !important; align-self: flex-end !important; border-radius: 24px 24px 0 0 !important; } main#details > button.mb-5 > span > span { font-size: 12px !important; } }`}</style>
    <style>{`body > div.fixed.inset-0:has(> .reviews-drawer) { justify-content: flex-end !important; } body > div.fixed.inset-0:has(> .reviews-drawer) > .reviews-drawer { margin-left: auto !important; } body .reviews-drawer input:not([type="radio"]):not([type="checkbox"]), body .reviews-drawer textarea { border: 1px solid #d8dce3 !important; border-radius: 6px !important; background: #fff !important; color: #222 !important; font-size: 12px !important; outline: none !important; } body .reviews-drawer input:not([type="radio"]):not([type="checkbox"]) { height: 40px !important; } body .reviews-drawer textarea { height: 96px !important; resize: none !important; } body .reviews-drawer input:not([type="radio"]):not([type="checkbox"]):focus, body .reviews-drawer textarea:focus { border-color: #174b43 !important; } body .reviews-drawer h3, body .reviews-drawer legend { font-size: 12px !important; } body .reviews-drawer > div.border-b { padding-bottom: 16px !important; } @media (max-width: 767px) { body > div.fixed.inset-0:has(> .reviews-drawer) { align-items: flex-end !important; } body > div.fixed.inset-0:has(> .reviews-drawer) > .reviews-drawer { margin: 0 !important; } body .reviews-drawer { padding: 20px 16px 24px !important; } }`}</style>
    <style>{`body .reviews-drawer label.inline-flex { height: 40px !important; align-items: center !important; border: 1px solid #d8dce3 !important; border-radius: 6px !important; background: #fff !important; padding: 0 12px !important; }`}</style>
    <style>{`#details > div.fixed.inset-0:has(> .store-pickup-modal) { z-index: 70 !important; background: rgba(0,0,0,.35) !important; } @media (max-width: 767px) { #details > div.fixed.inset-0:has(> .store-pickup-modal) { align-items: flex-end !important; } }`}</style>
    <style>{`body form.reviews-drawer { background: #fafcff !important; } body form.reviews-drawer > div.border-b { border-color: #dfe3e8 !important; } body form.reviews-drawer input[type="text"], body form.reviews-drawer input[type="email"], body form.reviews-drawer textarea { border-color: #cfd6df !important; border-radius: 6px !important; background: #fff !important; } body form.reviews-drawer > label.inline-flex { border-color: #cfd6df !important; border-radius: 6px !important; background: #fff !important; color: #174b43 !important; } @media (max-width: 767px) { body form.reviews-drawer { border-radius: 24px 24px 0 0 !important; padding: 20px 24px 24px !important; } body form.reviews-drawer > div.border-b { padding-left: 0 !important; } }`}</style>
    <style>{`body form.reviews-drawer { background: linear-gradient(180deg, #f8fbff 0%, #ffffff 42%) !important; } body form.reviews-drawer::before { content: ""; position: absolute; top: 10px; left: 50%; width: 42px; height: 4px; border-radius: 999px; background: #d5dce5; transform: translateX(-50%); opacity: 0; } body form.reviews-drawer > div.border-b { border-bottom: 1px solid #dfe5ec !important; } body form.reviews-drawer > div.border-b p { color: #6b7788 !important; font-size: 12px !important; } body form.reviews-drawer > div.border-b h2 { color: #102c3a !important; letter-spacing: -.02em; } body form.reviews-drawer > fieldset.mt-5 { padding: 16px !important; border: 1px solid #e3e9f0 !important; border-radius: 14px !important; background: rgba(255,255,255,.9) !important; box-shadow: 0 8px 24px rgba(21,52,75,.06) !important; } body form.reviews-drawer > fieldset.mt-5 legend, body form.reviews-drawer > h3 { color: #183846 !important; } body form.reviews-drawer input[type="text"], body form.reviews-drawer input[type="email"], body form.reviews-drawer textarea { border-color: #d5dee8 !important; box-shadow: 0 3px 10px rgba(35,65,90,.04) !important; transition: border-color .2s, box-shadow .2s !important; } body form.reviews-drawer input[type="text"]:focus, body form.reviews-drawer input[type="email"]:focus, body form.reviews-drawer textarea:focus { border-color: #247465 !important; box-shadow: 0 0 0 3px rgba(36,116,101,.12) !important; } body form.reviews-drawer > label.inline-flex { border: 1px dashed #9bb2c2 !important; color: #247465 !important; justify-content: center !important; font-size: 12px !important; } body form.reviews-drawer > fieldset.mt-8 { padding: 14px 16px !important; border: 1px solid #e3e9f0 !important; border-radius: 14px !important; background: #fff !important; } body form.reviews-drawer > button[type="submit"] { border-radius: 8px !important; background: linear-gradient(135deg, #0f4c40, #247465) !important; box-shadow: 0 8px 18px rgba(15,76,64,.2) !important; letter-spacing: .02em !important; } @media (max-width: 767px) { body form.reviews-drawer::before { opacity: 1; } body form.reviews-drawer { padding-top: 28px !important; } }`}</style>
    <style>{`body form.reviews-drawer input[type="text"], body form.reviews-drawer input[type="email"] { height: 56px !important; min-height: 56px !important; border-radius: 8px !important; padding: 0 16px !important; font-size: 12px !important; } body form.reviews-drawer textarea { min-height: 96px !important; border-radius: 8px !important; padding: 14px 16px !important; }`}</style>
    <style>{`body .reviews-drawer input[type="text"], body .reviews-drawer input[type="email"], body .reviews-drawer textarea { display: block !important; box-sizing: border-box !important; min-height: 40px !important; width: 100% !important; border: 1px solid #d8dce3 !important; border-radius: 6px !important; background: #fff !important; padding: 0 12px !important; font-size: 12px !important; line-height: 20px !important; } body .reviews-drawer textarea { height: 96px !important; padding: 10px 12px !important; } body .reviews-drawer label.inline-flex { display: flex !important; width: 100% !important; }`}</style>
    <style>{`body form.reviews-drawer { padding: 32px 24px 24px !important; } body form.reviews-drawer > div.border-b { margin: 0 !important; padding: 0 0 16px 48px !important; } body form.reviews-drawer > div.border-b h2 { padding-top: 58px !important; } body form.reviews-drawer > div.border-b + p.mt-5 { margin-top: 48px !important; } body form.reviews-drawer > fieldset.mt-5 { margin-top: 48px !important; } body form.reviews-drawer > h3.mt-8 { margin-top: 34px !important; } body form.reviews-drawer > input.mt-3, body form.reviews-drawer > textarea.mt-4 { margin-top: 14px !important; } body form.reviews-drawer > label.mt-4 { margin-top: 14px !important; } body form.reviews-drawer > h3.mt-8 + input.mt-3 { margin-top: 14px !important; } body form.reviews-drawer > fieldset.mt-8 { margin-top: 34px !important; } body form.reviews-drawer > label.mt-8 { margin-top: 28px !important; } body form.reviews-drawer > p.mt-5 { line-height: 16px !important; } @media (max-width: 767px) { body form.reviews-drawer { padding: 20px 16px 24px !important; } }`}</style>
    <style>{`body form.reviews-drawer > div.border-b + p.mt-5 { margin-top: 24px !important; } body form.reviews-drawer > fieldset.mt-5 { margin-top: 24px !important; } body form.reviews-drawer > h3.mt-8 { margin-top: 24px !important; } body form.reviews-drawer > fieldset.mt-8 { margin-top: 24px !important; } body form.reviews-drawer > label.mt-8 { margin-top: 20px !important; } body form.reviews-drawer > input.mt-3, body form.reviews-drawer > textarea.mt-4, body form.reviews-drawer > label.mt-4 { margin-top: 12px !important; } body form.reviews-drawer > input[type="text"], body form.reviews-drawer > input[type="email"] { height: 40px !important; min-height: 40px !important; } body form.reviews-drawer > textarea { height: 96px !important; min-height: 96px !important; } body form.reviews-drawer h3, body form.reviews-drawer legend { font-size: 12px !important; font-weight: 600 !important; } body form.reviews-drawer > label.mt-8 { font-size: 12px !important; }`}</style>
    <style>{`body > div.fixed.inset-0:has(> .reviews-drawer) { justify-content: flex-end !important; } body .reviews-drawer { width: 100% !important; max-width: 500px !important; border-radius: 24px 0 0 24px !important; animation: drawer-slide-in .28s cubic-bezier(.22,1,.36,1) both; } @media (max-width: 767px) { body > div.fixed.inset-0:has(> .reviews-drawer) { align-items: flex-end !important; } body .reviews-drawer { position: fixed !important; inset: auto 0 0 0 !important; width: 100% !important; max-width: none !important; height: auto !important; min-height: 0 !important; max-height: calc(100vh - 24px) !important; border-radius: 24px 24px 0 0 !important; padding: 20px 16px 24px !important; animation: sheet-slide-in .3s cubic-bezier(.22,1,.36,1) both; } body .reviews-drawer h3, body .reviews-drawer legend, body .reviews-drawer label { font-size: 12px !important; } body .reviews-drawer input:not([type=\"radio\"]):not([type=\"checkbox\"]), body .reviews-drawer textarea { width: 100% !important; border: 1px solid #d8dce3 !important; border-radius: 6px !important; background: #fff !important; font-size: 11px !important; } body .reviews-drawer input:not([type=\"radio\"]):not([type=\"checkbox\"]) { height: 40px !important; } body .reviews-drawer textarea { height: 96px !important; } }`}</style>
    <style>{`body form.reviews-drawer input[type="text"], body form.reviews-drawer input[type="email"] { height: 56px !important; min-height: 56px !important; width: 100% !important; box-sizing: border-box !important; border: 1px solid #cfd6df !important; border-radius: 8px !important; background: #fff !important; padding: 0 16px !important; font-size: 12px !important; } body form.reviews-drawer textarea { height: 96px !important; min-height: 96px !important; width: 100% !important; box-sizing: border-box !important; border: 1px solid #cfd6df !important; border-radius: 8px !important; background: #fff !important; padding: 14px 16px !important; font-size: 12px !important; } body form.reviews-drawer > fieldset.mt-5 { padding: 16px !important; border: 1px solid #e3e9f0 !important; border-radius: 14px !important; background: #fff !important; box-shadow: 0 8px 24px rgba(21,52,75,.06) !important; } body form.reviews-drawer > fieldset.mt-8 { padding: 14px 16px !important; border: 1px solid #e3e9f0 !important; border-radius: 14px !important; background: #fff !important; } body form.reviews-drawer > label.inline-flex { height: 40px !important; width: 100% !important; justify-content: center !important; border: 1px dashed #9bb2c2 !important; border-radius: 8px !important; background: #fff !important; }`}</style>
    <style>{`.mobile-category-sheet { position: absolute !important; top: auto !important; right: 0 !important; bottom: 0 !important; left: 0 !important; display: block !important; height: min(760px, calc(100dvh - 16px)) !important; max-height: calc(100dvh - 16px) !important; width: 100% !important; max-width: none !important; min-height: 0 !important; overflow: hidden !important; border-radius: 26px 26px 0 0 !important; padding: 12px 16px calc(20px + env(safe-area-inset-bottom)) !important; background: rgba(255,255,255,.85) !important; } .mobile-category-sheet > .mobile-category-list { display: block !important; height: calc(100% - 112px) !important; max-height: none !important; min-height: 0 !important; overflow-y: auto !important; overscroll-behavior: contain !important; -webkit-overflow-scrolling: touch !important; scrollbar-width: thin !important; } @media (min-width: 768px) { .mobile-category-sheet { display: none !important; } }`}</style>
    <style>{`.mobile-category-browser { top: 0 !important; bottom: 0 !important; height: 100dvh !important; max-height: 100dvh !important; padding: max(18px, env(safe-area-inset-top)) 0 0 !important; background: #fff !important; border-radius: 0 !important; } .mobile-category-top { display: flex; align-items: center; gap: 10px; padding: 0 14px 16px; } .mobile-category-search { display: flex; align-items: center; gap: 10px; flex: 1; height: 48px; padding: 0 12px; border: 1px solid #e4e5e8; border-radius: 12px; background: #f8f8f9; } .mobile-category-search input { font-size: 12px !important; } .mobile-category-search-icon { display: grid; height: 32px; width: 32px; flex: none; place-items: center; color: #25262a; } .mobile-category-layout { display: grid; grid-template-columns: 118px minmax(0, 1fr); height: calc(100% - 82px); min-height: 0; border-top: 1px solid #ececef; } .mobile-category-rail { min-height: 0; overflow-y: auto; background: #f5f5f6; border-right: 1px solid #ececef; } .mobile-category-rail-item { display: flex; width: 100%; min-height: 58px; align-items: center; border: 0; border-bottom: 1px solid #e9e9eb; background: transparent; padding: 12px 10px; color: #25262a; text-align: left; font-size: 12px; line-height: 17px; } .mobile-category-rail-item.is-active { border-left: 3px solid #111; background: #fff; padding-left: 7px; font-weight: 700; } .mobile-category-results { display: flex; min-width: 0; min-height: 0; flex-direction: column; overflow-y: auto; padding: 22px 14px 12px; background: #fff; text-align: left; } .mobile-category-tile { display: flex; min-width: 0; flex-direction: column; align-items: center; gap: 12px; border: 0; border-radius: 0; background: transparent; padding: 10px 8px 12px; color: #202125; text-align: center; text-decoration: none; box-shadow: none; } .mobile-category-tile-image { display: block; aspect-ratio: 1; width: 100%; border-radius: 0; background-color: transparent; background-image: url('/product-assets/category-atlas.png'); background-repeat: no-repeat; background-size: 400% auto; background-position: center; mix-blend-mode: multiply; } .mobile-category-tile > span:last-child { width: 100%; font-size: 11px; font-weight: 600; line-height: 15px; text-align: center; } .mobile-category-view-all { position: sticky; bottom: 0; z-index: 1; flex: none; margin-top: auto; padding: 12px 0 max(8px, env(safe-area-inset-bottom)); background: linear-gradient(to bottom, rgba(255,255,255,.82), #fff 24%); } .mobile-barcode-panel { margin: 0 14px 12px; border: 1px solid #e7e8eb; border-radius: 16px; background: #fff; padding: 14px; box-shadow: 0 8px 22px rgba(25,27,32,.08); } .mobile-barcode-frame { display: grid; height: 180px; place-items: center; overflow: hidden; border-radius: 12px; background: #101113; } .mobile-barcode-frame video { height: 100%; width: 100%; object-fit: cover; } @media (min-width: 768px) { .mobile-category-browser { display: none !important; } }`}</style>
<style>{`body [role='dialog'][aria-labelledby='coupon-offers-title'], body [role='dialog'][aria-labelledby='delivery-address-title'], body [role='dialog'][aria-labelledby='store-pickup-title'], body [role='dialog'][aria-label='More colors'], body [role='dialog'][aria-labelledby='product-size-picker-title'], body [role='dialog'][aria-labelledby='write-review-title'], body [role='dialog'][aria-labelledby='all-reviews-title'], body [role='dialog'][aria-label='Search products'], body [class~='z-[120]'] { background: rgba(15, 23, 42, .42) !important; } body [role='dialog'][aria-labelledby='coupon-offers-title'] > section, body [role='dialog'][aria-labelledby='delivery-address-title'] > aside, body [role='dialog'][aria-labelledby='store-pickup-title'] > aside, body [role='dialog'][aria-label='More colors'] > aside, body [role='dialog'][aria-labelledby='product-size-picker-title'] > section, body [role='dialog'][aria-labelledby='write-review-title'] > form, body [role='dialog'][aria-labelledby='all-reviews-title'] > .reviews-drawer, body [role='dialog'][aria-label='Search products'] > section, body [class~='z-[120]'] > aside, body [class~='z-[120]'] > div { background: #fff !important; color: #171a1f !important; border: 1px solid #e5e9ee !important; box-shadow: 0 24px 70px rgba(15, 23, 42, .18) !important; } body [role='dialog'][aria-labelledby='coupon-offers-title'] > section, body [role='dialog'][aria-labelledby='delivery-address-title'] > aside, body [role='dialog'][aria-labelledby='store-pickup-title'] > aside, body [role='dialog'][aria-label='Search products'] > section, body [class~='z-[120]'] > aside { border-radius: 24px 0 0 24px !important; } body [role='dialog'][aria-label='More colors'] > aside, body [role='dialog'][aria-labelledby='product-size-picker-title'] > section, body [role='dialog'][aria-labelledby='write-review-title'] > form, body [role='dialog'][aria-labelledby='all-reviews-title'] > .reviews-drawer, body [class~='z-[120]'] > div { border-radius: 24px 24px 0 0 !important; } body [role='dialog'] h2, body [class~='z-[120]'] h2 { color: #171a1f !important; } body [role='dialog'] button[aria-label^='Close'], body [class~='z-[120]'] button[aria-label^='Close'] { display: grid !important; height: 36px !important; width: 36px !important; place-items: center !important; border: 1px solid #e1e6eb !important; border-radius: 999px !important; background: #f6f7f8 !important; color: #39414a !important; font-size: 22px !important; line-height: 1 !important; } body [role='dialog'][aria-labelledby='coupon-offers-title'] article { border-color: #e2e7ec !important; border-radius: 16px !important; background: #f8fafc !important; } body [role='dialog'][aria-labelledby='coupon-offers-title'] article button { border-radius: 8px !important; background: #171a1f !important; color: #fff !important; } body [role='dialog'][aria-labelledby='coupon-offers-title'] article svg { color: #b99654 !important; } body [role='dialog'][aria-labelledby='store-pickup-title'] .store-pickup-drawer > div > button { border-color: #e2e7ec !important; border-radius: 14px !important; background: #fff !important; } body [role='dialog'][aria-labelledby='store-pickup-title'] .store-pickup-drawer > div > button:first-child { border-color: #171a1f !important; background: #f8fafc !important; } body [role='dialog'][aria-labelledby='store-pickup-title'] .store-pickup-drawer > div > button span[class*='border-[#f04b9c]'] { border-color: #b99654 !important; color: #b99654 !important; } body [role='dialog'][aria-labelledby='write-review-title'] > form, body [role='dialog'][aria-labelledby='all-reviews-title'] > .reviews-drawer { background: #fff !important; } body .reviews-drawer fieldset { border-color: #e2e7ec !important; background: #f8fafc !important; box-shadow: none !important; } body .reviews-drawer input, body .reviews-drawer textarea { border-color: #d8dfe6 !important; background: #fff !important; } body .reviews-drawer button[type='submit'] { background: #171a1f !important; box-shadow: none !important; } body [role='dialog'][aria-label='Search products'] label { border: 1px solid #e1e6eb !important; border-radius: 14px !important; background: #f8fafc !important; } body [class~='z-[120]'] button:not([aria-label^='Close']) { border-color: #e2e7ec !important; } .product-detail-page [class~='z-[100]'] { background: rgba(15, 23, 42, .42) !important; } .product-detail-page [class~='z-[100]'] > .mobile-category-sheet { border: 1px solid #e5e9ee !important; border-bottom: 0 !important; border-radius: 24px 24px 0 0 !important; background: #fff !important; box-shadow: 0 24px 70px rgba(15, 23, 42, .18) !important; } .product-detail-page [class~='z-[100]'] .mobile-category-rail { background: #f8fafc !important; border-color: #e5e9ee !important; } .product-detail-page [class~='z-[100]'] .mobile-category-rail-item.is-active { border-left-color: #171a1f !important; background: #fff !important; } .product-detail-page [class~='z-[100]'] .mobile-barcode-panel { border-color: #e2e7ec !important; background: #f8fafc !important; box-shadow: none !important; } @keyframes product-modal-panel-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } } @media (max-width: 767px) { body [role='dialog'][aria-labelledby='coupon-offers-title'] > section, body [role='dialog'][aria-labelledby='delivery-address-title'] > aside, body [role='dialog'][aria-labelledby='store-pickup-title'] > aside, body [role='dialog'][aria-label='More colors'] > aside, body [role='dialog'][aria-labelledby='product-size-picker-title'] > section, body [role='dialog'][aria-labelledby='write-review-title'] > form, body [role='dialog'][aria-labelledby='all-reviews-title'] > .reviews-drawer, body [role='dialog'][aria-label='Search products'] > section, body [class~='z-[120]'] > div, .product-detail-page [class~='z-[100]'] > .mobile-category-sheet { animation: product-modal-panel-in .28s cubic-bezier(.22, 1, .36, 1) both !important; } } @media (prefers-reduced-motion: reduce) { body [role='dialog'] > *, body [class~='z-[120]'] > *, .product-detail-page [class~='z-[100]'] > * { animation: none !important; } }`}</style>
    <style>{`body [role='dialog'][aria-labelledby='write-review-title'] > form, body [role='dialog'][aria-labelledby='all-reviews-title'] > .reviews-drawer { background: #fff !important; border: 1px solid #e5e9ee !important; border-radius: 24px 0 0 24px !important; box-shadow: 0 24px 70px rgba(15, 23, 42, .18) !important; } body form.reviews-drawer::before { display: none !important; opacity: 0 !important; } body form.reviews-drawer > div.border-b h2 { padding-top: 0 !important; } body [role='dialog'][aria-labelledby='write-review-title'] > form > button[aria-label^='Close'], body [role='dialog'][aria-labelledby='all-reviews-title'] > .reviews-drawer > button[aria-label^='Close'] { top: 20px !important; right: 20px !important; left: auto !important; height: 36px !important; width: 36px !important; border: 1px solid #e1e6eb !important; border-radius: 999px !important; background: #f6f7f8 !important; color: #39414a !important; box-shadow: none !important; } @media (max-width: 767px) { body [role='dialog'][aria-labelledby='write-review-title'] > form, body [role='dialog'][aria-labelledby='all-reviews-title'] > .reviews-drawer { width: 100% !important; max-width: none !important; height: auto !important; max-height: calc(100dvh - 16px) !important; border-radius: 24px 24px 0 0 !important; } }`}</style>
      <style>{`#details .order-1:nth-child(2) button[aria-label^="Color "] > span:first-child > span.absolute { display: none !important; } #details .order-1:nth-child(2) button[aria-label^="Color "]:has(.border-\\[\\#287cf0\\]) > span:first-child { border-color: #287cf0 !important; border-width: 2px !important; }`}</style>
      <StoreHeader />
      <style>{`@keyframes cart-fly-to-header { 0% { opacity: 0; transform: translate3d(0, 42vh, 0) scale(1.15) rotate(-8deg); } 16% { opacity: 1; } 72% { opacity: 1; transform: translate3d(16vw, -22vh, 0) scale(.65) rotate(8deg); } 100% { opacity: 0; transform: translate3d(30vw, -42vh, 0) scale(.12) rotate(18deg); } } @keyframes cart-fly-to-header-mobile { 0% { opacity: 0; transform: translate3d(0, 28vh, 0) scale(1.1); } 18% { opacity: 1; } 75% { opacity: 1; transform: translate3d(18vw, -18vh, 0) scale(.55); } 100% { opacity: 0; transform: translate3d(28vw, -34vh, 0) scale(.1); } } @keyframes quick-cart-enter { from { opacity: 0; transform: translateX(38px); } to { opacity: 1; transform: translateX(0); } } @keyframes quick-cart-timer { from { transform: scaleX(1); } to { transform: scaleX(0); } } .cart-fly-product { animation: cart-fly-to-header .9s cubic-bezier(.22,1,.36,1) both; } .quick-cart-panel { animation: quick-cart-enter .34s cubic-bezier(.22,1,.36,1) both; } .quick-cart-timer { animation: quick-cart-timer 5s linear both; } .quick-cart-timer-paused { animation-play-state: paused; } @media (max-width: 767px) { .cart-fly-product { animation-name: cart-fly-to-header-mobile; } .quick-cart-panel { animation: sheet-slide-in .34s cubic-bezier(.22,1,.36,1) both; } } @media (prefers-reduced-motion: reduce) { .cart-fly-product, .quick-cart-panel, .quick-cart-timer { animation: none !important; } .cart-fly-product { display: none; } }`}</style>
      {cartFlyAnimation && <div key={cartFlyAnimation.id} aria-hidden="true" className="cart-fly-product cart-fly-product-pro pointer-events-none fixed bottom-[92px] left-1/2 z-[180] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border border-white bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,.22)]"><img src={cartFlyAnimation.image} alt="" className="h-full w-full object-contain" /></div>}
      <QuickCartDrawer open={quickCartOpen} item={lastAddedCartItem} items={cartItems} onViewCart={openCartPage} onClose={() => setQuickCartOpen(false)} />
      <StoreCartDrawer mode={cartPage ? "page" : "drawer"} open={cartOpen} onClose={closeCartPage} onBack={cartPage ? () => window.location.assign("/product-details") : undefined} />
      <div className="container-fluid mx-auto max-w-[1400px] px-0 md:px-3"><div className="store-layout-row row g-5"><div className="col-md-6 col-xl-6 min-w-0"><ProductGallery favorite={isFavorite(currentCartProduct.name)} onFavorite={() => toggleProductFavorite(currentCartProduct)} /><div className="mt-8 hidden w-full max-w-[620px] md:block"><ProductDescriptionSections /></div></div><main id="details" className="col-md-6 col-xl-6 min-w-0 px-3 pb-24 md:px-3 md:pb-0 md:pt-8">
        <ProductPricingSummary />
        <div className="flex flex-col">
          <div className="order-2 md:order-1"><p className="mb-2 text-[11px] font-bold text-black md:text-sm">Size Options</p><SizeOptions selected={size} onSelect={setSize} /></div>
          <div className="product-color-options order-1 md:order-2"><p className="mb-2 text-[11px] font-bold text-black md:text-sm">Colors: {color}</p><ColorOptions selected={color} onSelect={setColor} /></div>
        </div>
        <PaymentOffer />
        <UnifiedCouponOffers /><DeliveryOptions />
        <div className="product-benefits-grid my-5 grid grid-cols-4 gap-x-1 gap-y-0 text-center md:grid-cols-4 md:gap-1">{[[ASSETS.returns, "Easy returns", "Within 7 days"], [ASSETS.payment, "Safe payment", "Flexible options"], [ASSETS.certificate, "EXCLUSIVE and", "Original Product"], [ASSETS.fast, "Fast shipping", "1-4 days max"]].map(([icon, title, sub]) => <div key={title} className="flex min-w-0 flex-col items-center gap-1"><AssetIcon src={icon} className="h-6 w-6" /><b className="text-[10px] leading-[13px] md:text-[11px] md:leading-normal">{title}</b><span className="text-[9px] leading-[13px] md:text-[10px] md:leading-[14px]">{sub}</span></div>)}</div>
        <div className="md:hidden"><ProductDescriptionSections /></div>
        <BoughtTogether />
      </main></div>
      <div className="w-full px-0 md:px-0"><ReviewsSection /></div>
      <ProductStory />
      <div className="w-full px-0 md:px-4 lg:px-6">
        <section id="recommendations" className="mt-10"><h2 className="mb-1 px-4 text-left text-base font-bold md:px-0 md:text-2xl">Buy With This Product</h2><p className="mb-4 px-4 text-left text-[10px] text-[#696969] md:px-0 md:text-xs">Products customers often choose with this fragrance</p><ProductCarousel products={recommendations} onAddToCart={addToCart} favorites={favoriteNames} onFavorite={toggleProductFavorite} /></section>
        <section id="recent" className="mt-10"><h2 className="mb-4 px-4 text-left text-base font-bold md:px-0 md:text-2xl">Recently Viewed</h2><ProductCarousel products={recommendations} recent onAddToCart={addToCart} favorites={favoriteNames} onFavorite={toggleProductFavorite} /></section>
      </div>
    </div>
    <SharedStoreFooter />
    <div className={`product-sticky-cart ${mobileNavCollapsed ? "bottom-0" : "bottom-[75px]"} fixed left-1/2 z-40 flex h-[61px] w-full max-w-[430px] -translate-x-1/2 items-center justify-center gap-2 bg-white px-2 transition-[bottom] duration-300 ease-in-out md:bottom-6 md:left-auto md:right-6 md:mr-0 md:max-w-[430px] md:translate-x-0 md:rounded-2xl md:px-2 md:shadow-xl`}><button onClick={() => addToCart(currentCartProduct, quantity)} aria-label={`Add ${quantity} product${quantity > 1 ? "s" : ""} to cart`} className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-lg bg-black px-4 text-base font-bold text-white"><span>Add to cart</span><PriceValue value={formatPrice(220 * quantity)} light className="text-base font-bold" /></button><div aria-label="Select quantity" className="flex h-12 w-[96px] shrink-0 items-center justify-center gap-2 rounded-lg border border-black bg-black text-white"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" className="grid h-[42px] w-7 place-items-center rounded-md border-0 bg-black text-white"><Minus size={12} /></button><span className="min-w-4 text-center text-sm font-semibold">{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="grid h-[42px] w-7 place-items-center rounded-md border-0 bg-black text-white"><Plus size={12} /></button></div></div>
    <div className="md:hidden"><StoreMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(collapsed => !collapsed)} onOpenCategories={() => { window.dispatchEvent(new Event("store:open-menu")); setMobileNavCollapsed(false); }} onOpenCart={() => { window.dispatchEvent(new Event("store:open-cart")); setMobileNavCollapsed(false); }} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
  </div>;
}
