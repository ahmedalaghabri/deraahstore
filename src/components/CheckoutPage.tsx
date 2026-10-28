import { createPortal } from "react-dom";
import { Fragment, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Briefcase, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Copy, CreditCard, Eye, Gift, Home, Link2, List, Map as MapIcon, MapPin, MoreVertical, Music2, PackageOpen, PenLine, Phone, Play, Plus, Search, Share2, ShieldCheck, ShoppingCart, SlidersHorizontal, Tag, TicketPercent, Trash2, Truck, UserRound, Video, X } from "lucide-react";
import QRCode from "qrcode";
import { RiyalPrice } from "./RiyalPrice";
import CouponOffersDrawer, { couponOffers } from "./CouponOffersDrawer";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreLocale } from "./StoreLocaleContext";
import { isGiftCustomizationItem, STORE_GIFT_CUSTOMIZATION_PREFIX, useStoreCart, type StoreCartItem, type StoreGiftSelections } from "./StoreCartContext";
import { useStoreOrders } from "./StoreOrdersContext";
import CartBundleProgress from "./CartBundleProgress";
import { getCartItemOriginalPrice, getFreeUnitsByItem, getGiftOfferForProduct, getGiftSelectionLimit } from "./storeCartData";
import StoreGiftPicker, { SelectedGiftsCard } from "./StoreGiftPicker";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";

const checkoutCouponOffers = [
  ...couponOffers,
  { title: "10% Discount", description: "10% off on your order.", code: "APP10", minimum: 0, discountType: "percent" as const, discountValue: 10 },
];

export type Address = { id: string; label: string; recipient: string; phone: string; city: string; street: string; code?: string; nationalCode?: string; latitude?: number; longitude?: number; otherLabel?: string; recipientDifferent?: boolean; isDefault?: boolean; addressType?: "home" | "redbox" };
type CheckoutStage = "cart" | "payment";
type GiftCustomization = { cardId: string; recipient: string; message: string; signature: string; mediaUrl: string; packagingId: string };

const defaultGiftCustomization: GiftCustomization = { cardId: "classic", recipient: "", message: "", signature: "", mediaUrl: "", packagingId: "red" };
const GIFT_CUSTOMIZATION_KEY = "deraah-gift-customization";
const GIFT_ORDER_KEY = "deraah-gift-order";
const giftCardOptions = [
  { id: "classic", title: "Classic Deraah", price: "Free", note: "A timeless blank card", image: "/product-assets/gift-cards/classic-triptych.png", mark: "✿" },
  { id: "birthday", title: "Happy Birthday", price: "SAR 15", note: "Make their day brighter", image: "/product-assets/gift-cards/birthday-triptych.png", mark: "كل عام وأنت بخير" },
  { id: "congrats", title: "Congratulations", price: "SAR 15", note: "For proud moments", image: "/product-assets/gift-cards/congratulations-triptych.png", mark: "مبروك التخرج" },
  { id: "thank-you", title: "Thank You", price: "SAR 15", note: "A warm note of gratitude", image: "/product-assets/gift-cards/thank-you-triptych.png", mark: "Thank you" },
  { id: "wedding", title: "Wedding & Anniversary", price: "SAR 20", note: "For a beautiful milestone", image: "/product-assets/gift-cards/wedding-triptych.png", mark: "With love" },
  { id: "baby", title: "New Baby", price: "SAR 20", note: "A gentle welcome", image: "/product-assets/gift-cards/baby-triptych.png", mark: "Welcome little one" },
];
type GiftPackagingOption = { id: string; title: string; price: string; images: string[]; triptychIndex?: number; artworkScale?: number };
const giftPackagingOptions: GiftPackagingOption[] = [
  { id: "red", title: "Ruby red box", price: "Free", images: ["https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw3c159d0c/images/10211221053000-2006-1.png?q=50&sh=920&sw=920", "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw3c159d0c/images/10211221053000-2006-2.png?q=50&sh=920&sw=920"], artworkScale: 1.08 },
  { id: "blue", title: "Midnight blue box", price: "SAR 10", images: ["https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dwb3d3decf/images/10211221053000-2008-1.png?sh=920&sw=920", "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dwb3d3decf/images/10211221053000-2008-2.png?sh=920&sw=920"], artworkScale: 1.1 },
  { id: "green", title: "Sage green box", price: "SAR 10", images: ["https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw4aff568a/images/10211221053000-2012-1.png?q=50&sh=920&sw=920", "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw4aff568a/images/10211221053000-2012-2.png?q=50&sh=920&sw=920"], artworkScale: 1.28 },
  { id: "pearl", title: "Pearl white box", price: "SAR 10", images: ["/product-assets/gift-cards/packaging-extra-front.png", "/product-assets/gift-cards/packaging-extra-detail.png"], triptychIndex: 0 },
  { id: "blush", title: "Blush pink box", price: "SAR 15", images: ["/product-assets/gift-cards/packaging-extra-front.png", "/product-assets/gift-cards/packaging-extra-detail.png"], triptychIndex: 1 },
  { id: "champagne", title: "Champagne beige box", price: "SAR 15", images: ["/product-assets/gift-cards/packaging-extra-front.png", "/product-assets/gift-cards/packaging-extra-detail.png"], triptychIndex: 2 },
];

function priceValue(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function readGiftCustomization() {
  if (typeof window === "undefined") return defaultGiftCustomization;
  try {
    const saved = JSON.parse(window.localStorage.getItem(GIFT_CUSTOMIZATION_KEY) ?? "null") as Partial<GiftCustomization> | null;
    if (!saved || typeof saved !== "object") return defaultGiftCustomization;
    return {
      ...defaultGiftCustomization,
      ...Object.fromEntries(Object.entries(saved).filter(([, value]) => typeof value === "string")),
    } as GiftCustomization;
  } catch {
    return defaultGiftCustomization;
  }
}

function giftCustomizationItemId(type: "card" | "packaging", optionId: string) {
  return `${STORE_GIFT_CUSTOMIZATION_PREFIX}${type}:${optionId}`;
}

function getGiftCustomizationPaidItems(customization: GiftCustomization): StoreCartItem[] {
  const card = giftCardOptions.find(option => option.id === customization.cardId);
  const packaging = giftPackagingOptions.find(option => option.id === customization.packagingId);
  const selections = [
    card && { type: "card" as const, option: card, image: card.image, brand: "Deraah gift card" },
    packaging && { type: "packaging" as const, option: packaging, image: packaging.images[0], brand: "Deraah gift packaging" },
  ].filter(Boolean) as Array<{ type: "card" | "packaging"; option: (typeof giftCardOptions)[number] | GiftPackagingOption; image: string; brand: string }>;

  return selections.flatMap(({ type, option, image, brand }) => {
    const value = priceValue(option.price);
    return value > 0 ? [{
      id: giftCustomizationItemId(type, option.id),
      name: option.title,
      brand,
      price: String(value),
      image,
      quantity: 1,
      variant: "Gift customization",
    }] : [];
  });
}

function GiftCustomizationFreeItems({ customization, enabled }: { customization: GiftCustomization; enabled: boolean }) {
  if (!enabled) return null;
  const card = giftCardOptions.find(option => option.id === customization.cardId);
  const packaging = giftPackagingOptions.find(option => option.id === customization.packagingId);
  const freeItems = [
    card && priceValue(card.price) === 0 ? { id: `free-card-${card.id}`, title: card.title, subtitle: "Complimentary gift card", image: <GiftTriptychArtwork image={card.image} frame={0} className="h-full w-full" /> } : null,
    packaging && priceValue(packaging.price) === 0 ? { id: `free-packaging-${packaging.id}`, title: packaging.title, subtitle: "Complimentary gift packaging", image: <GiftPackagingArtwork option={packaging} frame={0} /> } : null,
  ].filter(Boolean) as Array<{ id: string; title: string; subtitle: string; image: React.ReactNode }>;
  if (!freeItems.length) return null;

  return <section className="checkout-gift-cards rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-[18px] font-semibold md:text-xl">Gift cards</h2><p className="mt-1 text-xs text-[#6d7178]">Free items included with your gift customization</p></div><span className="shrink-0 rounded-full bg-[#ecfdf1] px-3 py-1.5 text-[11px] font-semibold text-[#208447]">FREE</span></div>
    <div className="mt-4 divide-y divide-[#edf0f3]">{freeItems.map(item => <article key={item.id} className="flex items-center gap-3 border-t border-[#edf0f3] py-3 first:border-t-0"><span className="grid h-[84px] w-[84px] shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7]">{item.image}</span><div className="min-w-0 flex-1"><h3 className="truncate text-[14px] font-semibold leading-5">{item.title}</h3><p className="mt-1 text-[12px] text-[#6d7178]">{item.subtitle}</p></div><strong className="shrink-0 text-[13px] font-semibold text-[#208447]">Free</strong></article>)}</div>
  </section>;
}

function giftSelectionSummary(customization: GiftCustomization) {
  const card = giftCardOptions.find(option => option.id === customization.cardId);
  const box = giftPackagingOptions.find(option => option.id === customization.packagingId);
  return `${box?.title ?? "Gift box"} + ${card?.title ?? "Gift card"} card`;
}

function PaymentMethodIcon({ id, large = false }: { id: string; large?: boolean }) {
  let mark = <img src="/product-assets/payment-logos/circum-credit-card-1.svg" alt="Credit or debit card" className="h-auto w-[22px] object-contain" />;
  if (id === "apple") mark = <img src="/product-assets/payment-logos/Apple-Pay.svg" alt="Apple Pay" className="h-8 w-8 object-contain" />;
  if (id === "cod") mark = <img src="/product-assets/payment-logos/hugeicons_cash-02.svg" alt="Cash on delivery" className="h-auto w-[22px] translate-y-px object-contain" />;
  if (id === "tamara") mark = <span className="grid w-8 place-items-center rounded-[4px] px-0.5 py-1"><img src="/product-assets/payment-logos/Tamara-custom.svg" alt="Tamara" className="h-auto w-7 object-contain" /></span>;
  if (id === "tabby") mark = <span className="grid w-8 place-items-center rounded-[4px] px-0.5 py-1 text-[7px] font-extrabold tracking-[-.04em] text-[#171a1f]">tabby</span>;
  if (id === "mukafaati") mark = <img src="/product-assets/payment-logos/andrsrxn_star-circle.svg" alt="Mukafaati" className="h-auto w-[22px] object-contain" />;
  if (id === "deraah-gift") mark = <Gift size={18} strokeWidth={1.8} />;
  const iconSize = "h-8 w-8";
  return <span className={`flex shrink-0 items-center justify-center overflow-hidden ${iconSize}`} aria-hidden={id !== "apple" && id !== "tamara" && id !== "tabby"}>{mark}</span>;
}

function PaymentMethodOption({ id, title, description, cardDescription, selected, balance, disabled = false, onSelect, onToggleWallet }: { id: string; title: string; description: string; cardDescription?: string; selected: boolean; balance?: number; disabled?: boolean; onSelect: () => void; onToggleWallet?: (enabled: boolean) => void }) {
  const { direction } = useStoreLocale();
  const isRtl = direction === "rtl";
  const descriptionSize = "text-[10px]";
  const displayDescription = id === "card" ? cardDescription ?? "Last used card" : description;
  const isWallet = id === "mukafaati";
  const iconFrame = id === "tamara" ? "flex h-8 w-10 rounded-md border-0 bg-gradient-to-br from-[#ffc4b7] via-[#e8d1ef] to-[#a9ddff] transition-colors hover:brightness-[.98]" : id === "tabby" ? "flex h-8 w-10 rounded-md border-0 bg-[#37eda4] transition-colors hover:brightness-[.98]" : id === "deraah-gift" ? "flex h-8 w-10 rounded-md border-0 bg-[#fceaf4] text-[#b01869] transition-colors hover:brightness-[.98]" : "flex h-8 w-10 rounded-md border border-[#e3e7ec] bg-white transition-colors hover:bg-[#fbfcfd]";
  return <div className={`checkout-payment-option relative grid w-full min-w-0 grid-cols-[20px_40px_minmax(0,1fr)] items-center gap-x-2 rounded-xl p-3 text-left transition-colors ${selected ? "bg-[#ecfdf1] ring-2 ring-[#2c8b4b]" : "bg-[#f8fafc]"}`}>
    {isWallet ? <button type="button" role="checkbox" aria-checked={selected} aria-label={`${selected ? "Disable" : "Enable"} ${title}`} onClick={() => onToggleWallet?.(!selected)} className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8b4b]/35 ${selected ? "border-[#2c8b4b] bg-[#2c8b4b] text-white" : "border-[#c8d0d9] bg-white text-transparent"}`}>{selected && <Check size={13} strokeWidth={3} />}</button> : <button type="button" disabled={disabled} onClick={onSelect} aria-label={`Select ${title}`} aria-pressed={selected} className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-[#2c8b4b]" : "border-[#c8d0d9]"} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}>{selected && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</button>}
    <button type="button" disabled={disabled} onClick={onSelect} aria-label={`Select ${title} icon`} className={`${iconFrame} shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff]/50 ${disabled ? "cursor-not-allowed opacity-40" : ""}`}><PaymentMethodIcon id={id} large={isWallet} /></button>
    <button type="button" disabled={disabled} onClick={onSelect} className={`min-w-0 flex-1 text-left ${isWallet ? "max-w-[159px]" : ""} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}><strong className="block text-sm">{title}</strong><small className={`mt-0.5 block leading-3 text-[#6d7178] ${descriptionSize}`}>{displayDescription}</small></button>
    {isWallet && <div className={`pointer-events-none absolute top-2.5 ${isRtl ? "left-3 right-auto" : "right-3 left-auto"}`}><RiyalPrice value={money(balance ?? 0)} className="text-[14px] font-bold leading-4 text-[#208447]" /></div>}
  </div>;
}

function ApplePayActionButton({ disabled, onClick, className = "" }: { disabled: boolean; onClick: () => void; className?: string }) {
  return <button type="button" lang="en" disabled={disabled} onClick={onClick} aria-label="Continue with Apple Pay" className={`apple-pay-action-button ${className}`}>
    <span className="apple-pay-button-fallback" aria-hidden="true"><span>Continue with</span><img src="/product-assets/payment-logos/Apple-Pay.svg" alt="" /></span>
    <span className="sr-only">Continue with Apple Pay</span>
  </button>;
}

type PaymentId = "card" | "apple" | "cod" | "tamara" | "tabby" | "deraah-gift" | "mukafaati";
type CheckoutPaymentId = Exclude<PaymentId, "mukafaati">;
type CardDetails = { holder: string; number: string; expiry: string; cvv: string };
type DeraahGiftDetails = { number: string; pin: string };

function CardPaymentPanel({ details, onChange }: { details: CardDetails; onChange: (field: keyof CardDetails, value: string) => void }) {
  return <div role="region" aria-label="Card details" className="checkout-card-details-panel w-full min-w-0 rounded-xl border border-[#b9d2ff] bg-[#f5fbff] p-3 shadow-[0_4px_16px_rgba(110,168,255,.08)] sm:p-4">
    <div className="flex min-w-0 items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#287cf0]"><CreditCard size={18} /></span><div className="min-w-0"><strong className="block text-[13px] sm:text-sm">Card details</strong><p className="mt-1 text-[11px] leading-4 text-[#6d7178] sm:text-xs">Enter your card details to pay securely.</p></div></div>
    <div className="mt-4 grid min-w-0 gap-3">
      <label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[#4c5560] sm:text-xs">Cardholder name<input aria-label="Cardholder name" value={details.holder} onChange={event => onChange("holder", event.target.value)} placeholder="Name on card" autoComplete="cc-name" className="h-10 min-w-0 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-[13px] font-normal text-[#171a1f] outline-none transition-colors focus:border-[#6ea8ff] sm:text-sm" /></label>
      <label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[#4c5560] sm:text-xs">Card number<input aria-label="Card number" value={details.number} onChange={event => onChange("number", event.target.value.replace(/[^0-9 ]/g, "").slice(0, 19))} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" className="h-10 min-w-0 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-[13px] font-normal tracking-[.08em] text-[#171a1f] outline-none transition-colors focus:border-[#6ea8ff] sm:text-sm" /></label>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3"><label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[#4c5560] sm:text-xs">Expiry date<input aria-label="Expiry date" value={details.expiry} onChange={event => onChange("expiry", event.target.value.slice(0, 5))} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" className="h-10 min-w-0 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-[13px] font-normal text-[#171a1f] outline-none transition-colors focus:border-[#6ea8ff] sm:text-sm" /></label><label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[#4c5560] sm:text-xs">CVV<input aria-label="CVV" value={details.cvv} onChange={event => onChange("cvv", event.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="123" inputMode="numeric" autoComplete="cc-csc" className="h-10 min-w-0 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-[13px] font-normal text-[#171a1f] outline-none transition-colors focus:border-[#6ea8ff] sm:text-sm" /></label></div>
    </div>
  </div>;
}

function DeraahGiftPaymentPanel({ details, onChange, balance, applied, feedback, onVerify, onApply, onRemove }: { details: DeraahGiftDetails; onChange: (field: keyof DeraahGiftDetails, value: string) => void; balance: number | null; applied: boolean; feedback: string; onVerify: () => void; onApply: () => void; onRemove: () => void }) {
  const { language, direction } = useStoreLocale();
  const isArabic = language === "العربية";
  const canVerify = details.number.replace(/\s/g, "").length >= 8 && details.pin.length >= 4;
  const copy = (english: string, arabic: string) => isArabic ? arabic : english;
  return <div dir={direction} role="region" aria-label={copy("Deraah Gift details", "تفاصيل درعه جيفت")} className="checkout-deraah-gift-panel w-full min-w-0 rounded-xl border border-[#f1bfd7] bg-[#fff8fc] p-3 shadow-[0_4px_16px_rgba(176,24,105,.07)] sm:p-4">
    <div className="flex min-w-0 items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fceaf4] text-[#b01869]"><Gift size={18} /></span><div className="min-w-0"><strong className="block text-[13px] sm:text-sm">{copy("Deraah Gift", "درعه جيفت")}</strong><p className="mt-1 text-[11px] leading-4 text-[#6d7178] sm:text-xs">{copy("Enter your gift card number and PIN to verify the balance and use it for this order.", "أدخل رقم بطاقة الهدية والرقم السري للتحقق من الرصيد واستخدامه في هذا الطلب.")}</p></div></div>
    <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(120px,.65fr)]">
      <label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[#4c5560] sm:text-xs">{copy("Gift card number", "رقم بطاقة الهدية")}<input aria-label={copy("Gift card number", "رقم بطاقة الهدية")} value={details.number} onChange={event => onChange("number", event.target.value.replace(/[^0-9 ]/g, "").slice(0, 19))} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="off" dir="ltr" className="h-10 min-w-0 w-full rounded-lg border border-[#e5d6df] bg-white px-3 text-[13px] font-normal tracking-[.08em] text-[#171a1f] outline-none transition-colors focus:border-[#b01869] sm:text-sm" /></label>
      <label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[#4c5560] sm:text-xs">{copy("PIN", "الرقم السري")}<input aria-label={copy("Gift card PIN", "الرقم السري لبطاقة الهدية")} value={details.pin} onChange={event => onChange("pin", event.target.value.replace(/[^0-9]/g, "").slice(0, 8))} placeholder="000000" inputMode="numeric" autoComplete="off" dir="ltr" className="h-10 min-w-0 w-full rounded-lg border border-[#e5d6df] bg-white px-3 text-[13px] font-normal tracking-[.12em] text-[#171a1f] outline-none transition-colors focus:border-[#b01869] sm:text-sm" /></label>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={onVerify} disabled={!canVerify} className="h-10 rounded-lg bg-[#b01869] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#941457] disabled:cursor-not-allowed disabled:bg-[#d9a7be]">{copy("Check balance", "تحقق من الرصيد")}</button>{feedback && <p role="status" className="text-[11px] font-medium text-[#208447]">{feedback}</p>}</div>
    {balance !== null && <div className="mt-4 rounded-lg border border-[#e7c6d8] bg-white p-3"><div className="flex items-center justify-between gap-3"><span className="text-[11px] text-[#6d7178]">{copy("Available balance", "الرصيد المتاح")}</span><RiyalPrice value={money(balance)} className="text-sm font-bold text-[#b01869]" /></div>{applied ? <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-[#ecfdf1] px-3 py-2 text-[11px] font-semibold text-[#208447]"><span>{copy("Gift card applied to this order", "تم تطبيق بطاقة الهدية على هذا الطلب")}</span><button type="button" onClick={onRemove} className="shrink-0 underline underline-offset-2">{copy("Remove", "إزالة")}</button></div> : <button type="button" onClick={onApply} className="mt-3 h-10 w-full rounded-lg border border-[#b01869] bg-white px-4 text-[11px] font-semibold text-[#b01869] transition-colors hover:bg-[#fff1f8]">{copy("Apply Deraah Gift", "تطبيق درعه جيفت")}</button>}</div>}
  </div>;
}

function MukafaatiPaymentPanel({ feedback, onSelectProvider }: { feedback: string; onSelectProvider: (provider: LoyaltyProvider) => void }) {
  const { direction } = useStoreLocale();
  const providerGridAlignment = direction === "rtl" ? "lg:pl-[278px]" : "lg:pr-[278px]";
  return <>
    <p className="mb-3 text-center text-[11px] leading-4 text-[#6d7178]">You can add and use your other points to pay.</p>
    <div className={`grid grid-cols-4 gap-2 p-0 ${providerGridAlignment}`}>
      <span className="sr-only">Choose a loyalty program to add points</span>
      {loyaltyProviders.map(provider => <button key={provider.id} type="button" onClick={() => onSelectProvider(provider)} aria-label={`Add points from ${provider.title}`} className="flex aspect-square w-full max-w-[92px] min-w-0 min-h-0 items-center justify-center justify-self-center rounded-xl border border-[#e5e9ee] bg-white p-1 transition-colors hover:border-[#b9d2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff]/50"><LoyaltyProviderMark provider={provider} square /></button>)}
    </div>
    {feedback && <p role="status" className="mt-3 rounded-lg bg-[#ecfdf1] px-3 py-2 text-[11px] font-medium text-[#208447]">{feedback}</p>}
  </>;
}

function PaymentDetailsPanel({ payment, cardDetails, onCardChange, deraahGiftDetails, deraahGiftBalance, deraahGiftApplied, deraahGiftFeedback, onDeraahGiftChange, onVerifyDeraahGift, onApplyDeraahGift, onRemoveDeraahGift }: { payment: CheckoutPaymentId; cardDetails: CardDetails; onCardChange: (field: keyof CardDetails, value: string) => void; deraahGiftDetails: DeraahGiftDetails; deraahGiftBalance: number | null; deraahGiftApplied: boolean; deraahGiftFeedback: string; onDeraahGiftChange: (field: keyof DeraahGiftDetails, value: string) => void; onVerifyDeraahGift: () => void; onApplyDeraahGift: () => void; onRemoveDeraahGift: () => void }) {
  if (payment === "card") return <CardPaymentPanel details={cardDetails} onChange={onCardChange} />;
  if (payment === "deraah-gift") return <DeraahGiftPaymentPanel details={deraahGiftDetails} onChange={onDeraahGiftChange} balance={deraahGiftBalance} applied={deraahGiftApplied} feedback={deraahGiftFeedback} onVerify={onVerifyDeraahGift} onApply={onApplyDeraahGift} onRemove={onRemoveDeraahGift} />;
  return null;
}

function ShippingCartSummary({ items, orderItemCount, subtotal, className = "" }: { items: StoreCartItem[]; orderItemCount: number; subtotal: number; className?: string }) {
  return <div className={`shipping-cart-summary rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6 ${className}`}><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="text-xl leading-none text-[#171a1f]">▸</span><div><h2 className="text-[18px] font-semibold">Order details</h2><p className="mt-1 text-xs text-[#6d7178]">Review your products before payment</p></div></div><button type="button" onClick={() => window.location.assign("/checkout")} aria-label="Edit cart details" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dfe4e8] text-lg text-[#171a1f] transition-colors hover:bg-[#f5f7f8]">✎</button></div><div className="mt-5 flex items-center gap-3"><div className="flex min-w-0 items-center gap-1.5">{items.slice(0, 3).map(item => <span key={item.id} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7]"><img src={item.image} alt="" className="h-8 w-8 object-contain" /></span>)}{items.length > 3 && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f5f6f7] text-xs font-semibold text-[#6d7178]">+{items.length - 3}</span>}</div><span className="min-w-0 flex-1 text-sm text-[#6d7178]">{orderItemCount} items in your cart</span><RiyalPrice value={money(subtotal)} className="shrink-0 text-base font-semibold" /></div><button type="button" onClick={() => window.location.assign("/checkout")} className="mt-4 text-xs font-semibold text-[#2c8b4b]">Edit cart details</button></div>;
}

function GiftTriptychArtwork({ image, frame, className = "" }: { image: string; frame: number; className?: string }) {
  // The source artwork is a three-panel strip with white fold guides between panels.
  // Use a small frame-specific crop so the guides stay outside the visible card.
  const frameOffsets = [4, 2, 0];
  const safeFrame = Math.max(0, Math.min(frame, 2));
  return <div className={`relative aspect-square overflow-hidden ${className}`}><img src={image} alt="" className="absolute left-0 top-0 h-full w-[300%] max-w-none object-cover transition-transform duration-700 ease-in-out" style={{ transform: `translateX(calc(-${safeFrame * 33.3333}% + ${frameOffsets[safeFrame]}%)) scale(1.06)`, transformOrigin: "center center" }} /></div>;
}

function GiftCardImagePreviewModal({ card, onClose }: { card: (typeof giftCardOptions)[number]; onClose: () => void }) {
  return <div role="dialog" aria-modal="true" aria-labelledby="gift-card-image-preview-title" className="store-mobile-sheet-overlay fixed inset-0 z-[165] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={onClose}>
    <section className="flex max-h-[92vh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] bg-white px-5 pb-4 pt-5 md:px-7 md:py-6"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9a5a2e]">Card preview</p><h2 id="gift-card-image-preview-title" className="mt-1 text-xl font-semibold text-[#171717] md:text-2xl">{card.title}</h2><p className="mt-1 text-xs text-[#737982]">{card.note}</p></div><button type="button" onClick={onClose} aria-label="Close card preview" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#555b63] transition-colors hover:bg-[#e9edf1]"><X size={19} /></button></header>
      <div className="min-h-0 overflow-y-auto bg-[#f5f6f7] p-5 md:p-7"><div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm"><GiftTriptychArtwork image={card.image} frame={0} className="!aspect-auto h-[min(68vh,560px)] w-full" /></div></div>
      <footer className="flex shrink-0 justify-end border-t border-[#e5e7eb] bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))] md:px-7 md:pb-7"><button type="button" onClick={onClose} className="h-11 rounded-[10px] bg-[#242223] px-6 text-[11px] font-semibold text-white transition-colors hover:bg-[#090909]">Back</button></footer>
    </section>
  </div>;
}

function GiftPackagingImagePreviewModal({ option, frame, onClose }: { option: GiftPackagingOption; frame: number; onClose: () => void }) {
  return <div role="dialog" aria-modal="true" aria-labelledby="gift-packaging-image-preview-title" className="store-mobile-sheet-overlay fixed inset-0 z-[165] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={onClose}>
    <section className="flex max-h-[92vh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5e7eb] bg-white px-5 pb-4 pt-5 md:px-7 md:py-6"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9a5a2e]">Gift box preview</p><h2 id="gift-packaging-image-preview-title" className="mt-1 text-xl font-semibold text-[#171717] md:text-2xl">{option.title}</h2><p className="mt-1 text-xs text-[#737982]">{option.price}</p></div><button type="button" onClick={onClose} aria-label="Close gift box preview" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#555b63] transition-colors hover:bg-[#e9edf1]"><X size={19} /></button></header>
      <div className="min-h-0 overflow-y-auto bg-[#f5f6f7] p-5 md:p-7"><div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm"><div className="h-[min(68vh,560px)] w-full"><GiftPackagingArtwork option={option} frame={frame} /></div></div></div>
      <footer className="flex shrink-0 justify-end border-t border-[#e5e7eb] bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))] md:px-7 md:pb-7"><button type="button" onClick={onClose} className="h-11 rounded-[10px] bg-[#242223] px-6 text-[11px] font-semibold text-white transition-colors hover:bg-[#090909]">Back</button></footer>
    </section>
  </div>;
}

function GiftPreviewModal({ customization, onClose }: { customization: GiftCustomization; onClose: () => void }) {
  const card = giftCardOptions.find(option => option.id === customization.cardId) ?? giftCardOptions[0];
  return <div role="dialog" aria-modal="true" aria-labelledby="gift-preview-title" className="store-mobile-sheet-overlay fixed inset-0 z-[170] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={onClose}>
    <section className="flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-[#edf0f3] p-5 md:p-6"><div><h2 id="gift-preview-title" className="text-xl font-semibold text-[#171a1f] md:text-2xl">Gift card preview</h2><p className="mt-1 text-xs text-[#6d7178]">See the printed card and how the recipient will open your attached media.</p></div><button type="button" onClick={onClose} aria-label="Close gift preview" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3f7ff] text-[#171a1f]"><X size={19} /></button></header>
      <div className="space-y-5 bg-[#efefef] p-4 md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <div><div className="h-[360px] overflow-hidden rounded-2xl border border-[#ead8cc] bg-white shadow-sm"><GiftTriptychArtwork image={card.image} frame={0} className="!aspect-auto h-full w-full" /></div><p className="mt-3 text-center text-xs font-medium text-[#0f5260]">Back side (cover)</p></div>
          <div><div className="relative flex min-h-[360px] flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#ead8cc] bg-white p-6 text-center shadow-sm"><span className="text-4xl font-light text-[#bd927c]">{card.mark}</span><div className="max-w-[90%]"><p className={`whitespace-pre-wrap text-[15px] leading-7 ${customization.message ? "text-[#5d4b43]" : "text-[#c5b5aa]"}`}>{customization.message || "Your message will appear here"}</p>{customization.recipient && <p className="mt-4 text-xs font-semibold text-[#8d7567]">To {customization.recipient}</p>}{customization.signature && (customization.signature.startsWith("data:image/") ? <img src={customization.signature} alt="Handwritten signature" className="mx-auto mt-5 max-h-12 max-w-[170px] object-contain" /> : <p className="mt-5 border-t border-[#ead8cc] pt-3 text-xs font-medium text-[#8d7567]">{customization.signature}</p>)}</div>{customization.mediaUrl && <div className="mt-4 flex flex-col items-center gap-2"><GiftQrCode value={customization.mediaUrl} /><p className="text-[11px] font-semibold text-[#6d5c53]">Enjoyed your gift? Scan to send a heartfelt thank-you.</p></div>}</div><p className="mt-3 text-center text-xs font-medium text-[#0f5260]">Front side (message)</p></div>
        </div>
      </div>
      <footer className="border-t border-[#edf0f3] bg-white p-4 md:p-6"><button type="button" onClick={onClose} className="h-11 w-[126px] max-w-full rounded-lg bg-[#171a1f] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#25282d]">Back</button></footer>
    </section>
  </div>;
}

function GiftQrCode({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    let active = true;
    setDataUrl("");
    QRCode.toDataURL(value, { errorCorrectionLevel: "M", margin: 1, width: 180, color: { dark: "#171a1f", light: "#ffffff" } }).then(nextDataUrl => {
      if (active) setDataUrl(nextDataUrl);
    }).catch(() => {
      if (active) setDataUrl("");
    });
    return () => { active = false; };
  }, [value]);
  return dataUrl ? <img src={dataUrl} alt="QR code for the attached song or video" className="h-28 w-28 rounded-lg border border-[#e8e1d8] bg-white p-1" /> : <span className="grid h-28 w-28 place-items-center rounded-lg border border-dashed border-[#d9cfc4] bg-[#fffaf5] text-[10px] font-semibold text-[#8d7567]">Preparing QR code</span>;
}

function getMediaPreview(url: string) {
  const normalized = url.trim();
  const isAudio = /spotify|soundcloud|music|audio|podcast/i.test(normalized);
  let hostname = "Attached link";
  try {
    hostname = new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    // The media modal validates the final value before saving it.
  }
  return { type: isAudio ? "audio" : "video", hostname } as const;
}

function GiftMediaThumbnail({ url, onRemove }: { url: string; onRemove?: () => void }) {
  const preview = getMediaPreview(url);
  return <div className="flex items-center gap-3 rounded-xl border border-[#ead8cc] bg-[#fffaf5] p-2.5"><div className="relative grid h-16 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#174f5b] to-[#d72683] text-white">{preview.type === "audio" ? <Music2 size={24} /> : <Video size={24} />}<span className="absolute inset-0 grid place-items-center bg-black/20"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#174f5b]"><Play size={13} fill="currentColor" /></span></span></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#171a1f]">{preview.type === "audio" ? "Audio attached" : "Video attached"}</p><p className="mt-1 truncate text-[11px] text-[#7b818a]" title={url}>{preview.hostname}</p><p className="mt-1 text-[10px] font-medium text-[#b01869]">QR code added to the printed card</p></div>{onRemove && <button type="button" onClick={onRemove} aria-label="Remove song or video link" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#6d7178] hover:bg-white hover:text-[#b01869]"><X size={15} /></button>}</div>;
}

function GiftMediaModal({ open, value, onClose, onSave }: { open: boolean; value: string; onClose: () => void; onSave: (url: string) => void }) {
  const [draftUrl, setDraftUrl] = useState(value);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDraftUrl(value);
      setError("");
    }
  }, [open, value]);

  if (!open) return null;
  const save = () => {
    const nextUrl = draftUrl.trim();
    if (!nextUrl) {
      setError("Paste a song or video link first.");
      return;
    }
    try {
      const parsed = new URL(nextUrl);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("Unsupported protocol");
    } catch {
      setError("Enter a valid link starting with https://");
      return;
    }
    onSave(nextUrl);
    onClose();
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="gift-media-title" className="store-mobile-sheet-overlay fixed inset-0 z-[150] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={onClose}>
    <section dir="ltr" className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl bg-white text-left shadow-2xl md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <header className="flex items-start justify-between gap-4 border-b border-[#edf0f3] p-5"><div><h2 id="gift-media-title" className="text-xl font-semibold text-[#171a1f]">Add a song or video</h2><p className="mt-1 text-xs text-[#6d7178]">Share a memory that the recipient can open from the printed card.</p></div><button type="button" onClick={onClose} aria-label="Close media link" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3f7ff] text-[#171a1f]"><X size={19} /></button></header>
      <div className="min-h-0 overflow-y-auto bg-[#FAFCFF] p-4 md:p-6"><div className="rounded-2xl bg-white p-5 shadow-sm"><div className="text-left"><p className="text-sm font-semibold text-[#174f5b]">Make your gift more personal</p><p className="mt-2 text-xs leading-6 text-[#5f6872]">Paste a song or video link. We will place a QR code on the greeting card for the recipient to scan.</p><ul className="mt-3 space-y-1 text-xs leading-6 text-[#174f5b]"><li>• Works with songs, playlists, and videos</li><li>• The link stays hidden behind the QR code</li><li>• Free to add</li></ul></div><label className="mt-5 block text-xs font-semibold text-[#555b63]">Song or video link<span className="relative mt-2 block"><Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b01869]" /><input type="url" value={draftUrl} onChange={event => { setDraftUrl(event.target.value); setError(""); }} placeholder="Paste link here" className="h-12 w-full rounded-lg border border-[#dfe4e8] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#b01869]" /></span></label>{error && <p role="alert" className="mt-2 text-xs font-medium text-[#c62828]">{error}</p>}{draftUrl.trim() && !error && <div className="mt-4"><GiftMediaThumbnail url={draftUrl.trim()} /></div>}</div></div>
      <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#edf0f3] bg-white p-4 sm:flex-row sm:justify-between"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-[#dfe4e8] bg-white px-6 text-xs font-semibold text-[#171a1f]">Cancel</button><button type="button" onClick={save} className="h-11 rounded-lg bg-[#174f5b] px-7 text-xs font-semibold text-white">Add to message</button></footer>
    </section>
  </div>;
}

function GiftMediaEditor({ value, onCancel, onSave }: { value: string; onCancel: () => void; onSave: (url: string) => void }) {
  const [draftUrl, setDraftUrl] = useState(value);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftUrl(value);
    setError("");
  }, [value]);

  const save = () => {
    const nextUrl = draftUrl.trim();
    if (!nextUrl) {
      setError("Paste a song or video link first.");
      return;
    }
    try {
      const parsed = new URL(nextUrl);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("Unsupported protocol");
    } catch {
      setError("Enter a valid link starting with https://");
      return;
    }
    onSave(nextUrl);
    onCancel();
  };

  return <div className="mt-4 rounded-xl border border-[#ead8cc] bg-[#fffaf5] p-4">
    <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fce7f3] text-[#cd1a76]"><Link2 size={16} /></span><div><p className="text-[11px] font-semibold text-[#242223]">Add a song or video link</p><p className="mt-1 text-[10px] leading-4 text-[#7b818a]">The link will be stored in the printed card QR code.</p></div></div>
    <label className="mt-4 block text-[10px] font-semibold text-[#3e3b39]">Song or video link<span className="relative mt-2 block"><Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#cd1a76]" /><input type="url" value={draftUrl} onChange={event => { setDraftUrl(event.target.value); setError(""); }} placeholder="Paste link here" className="h-11 w-full rounded-[10px] border border-[#dfdcd8] bg-white pl-10 pr-3 text-[11px] text-[#242223] outline-none transition-colors placeholder:text-[#9a9692] focus:border-[#cd1a76] focus:ring-2 focus:ring-[#cd1a76]/10" /></span></label>
    {error && <p role="alert" className="mt-2 text-[10px] font-medium text-[#c62828]">{error}</p>}
    {draftUrl.trim() && !error && <div className="mt-3"><GiftMediaThumbnail url={draftUrl.trim()} /></div>}
    <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onCancel} className="h-9 rounded-lg border border-[#dfdcd8] bg-white px-3 text-[10px] font-semibold text-[#555b63] transition-colors hover:bg-[#f8f7f5]">Cancel</button><button type="button" onClick={save} className="h-9 rounded-lg bg-[#242223] px-4 text-[10px] font-semibold text-white transition-colors hover:bg-[#090909]">Save link</button></div>
  </div>;
}

function GiftPackagingArtwork({ option, frame }: { option: GiftPackagingOption; frame: number }) {
  const scale = option.artworkScale ?? 1;
  if (option.triptychIndex !== undefined) return <div className="relative h-full w-full overflow-hidden"><img src={option.images[frame]} alt="" className="absolute left-0 top-0 h-full w-[300%] max-w-none object-cover transition-[transform,opacity] duration-500" style={{ transform: `translateX(-${option.triptychIndex * 33.3333}%) scale(${scale})` }} /></div>;
  return <img src={option.images[frame]} alt="" className="h-full w-full object-contain transition-[transform,opacity] duration-500" style={{ transform: `scale(${scale})` }} />;
}

function SignaturePadModal({ open, value, onClose, onSave }: { open: boolean; value: string; onClose: () => void; onSave: (signature: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);
  const mobileDrag = useMobileSheetDrag(onClose);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.4;
    context.strokeStyle = "#5d4b43";
    hasInkRef.current = false;
    if (value.startsWith("data:image/")) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, width, height);
      image.src = value;
      hasInkRef.current = true;
    }
  }, [open, value]);

  if (!open) return null;
  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    drawingRef.current = true;
    hasInkRef.current = true;
  };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };
  const stopDrawing = () => { drawingRef.current = false; };
  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasInkRef.current = false;
  };
  const save = () => {
    const signature = hasInkRef.current && canvasRef.current ? canvasRef.current.toDataURL("image/png") : "";
    onSave(signature);
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="signature-pad-title" className="store-mobile-sheet-overlay fixed inset-0 z-[160] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={onClose}><section style={mobileDrag.dragStyle} className="store-mobile-sheet w-full max-w-[560px] overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl" onClick={event => event.stopPropagation()}><MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} /><header className="flex items-start justify-between gap-4 border-b border-[#edf0f3] p-5"><div><h2 id="signature-pad-title" className="text-lg font-semibold text-[#171a1f]">Add your signature</h2><p className="mt-1 text-xs text-[#6d7178]">Draw your signature with your finger or mouse.</p></div><button type="button" onClick={onClose} aria-label="Close signature pad" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3f7ff] text-[#171a1f]"><X size={18} /></button></header><div className="bg-[#f3f7ff] p-5"><div className="relative overflow-hidden rounded-xl border border-[#ead8cc] bg-[#fffaf5] shadow-inner"><canvas ref={canvasRef} className="block h-48 w-full touch-none cursor-crosshair" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} onPointerLeave={stopDrawing} /><span className="pointer-events-none absolute bottom-3 left-4 right-4 border-b border-[#ead8cc]" /><span className="pointer-events-none absolute bottom-4 right-4 text-[10px] text-[#b59c8d]">Signature</span></div><button type="button" onClick={clear} className="mt-3 text-xs font-semibold text-[#6d7178] underline underline-offset-2">Clear signature</button></div><footer className="flex justify-end gap-3 border-t border-[#edf0f3] bg-white p-4"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-[#dfe4e8] bg-white px-5 text-xs font-semibold text-[#171a1f]">Cancel</button><button type="button" onClick={save} className="h-11 rounded-lg bg-[#171a1f] px-6 text-xs font-semibold text-white">Save signature</button></footer></section></div>;
}

function LegacyGiftCustomizationModal({ open, initial, onClose, onSave }: { open: boolean; initial: GiftCustomization; onClose: () => void; onSave: (customization: GiftCustomization) => void }) {
  const [step, setStep] = useState<"card" | "message" | "packaging">("card");
  const [draft, setDraft] = useState<GiftCustomization>(initial);
  const [frameIndex, setFrameIndex] = useState(0);
  const [packagingFrame, setPackagingFrame] = useState(0);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const mobileDrag = useMobileSheetDrag(onClose);

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setStep("card");
      setFrameIndex(0);
      setMediaOpen(false);
      setPreviewOpen(false);
    }
  }, [initial, open]);

  useEffect(() => {
    if (!open || step !== "card") return;
    const timer = window.setInterval(() => setFrameIndex(current => (current + 1) % 3), 3200);
    return () => window.clearInterval(timer);
  }, [open, step]);

  useEffect(() => {
    if (!open || step !== "packaging") return;
    setPackagingFrame(0);
    const timer = window.setInterval(() => setPackagingFrame(current => (current + 1) % 2), 3800);
    return () => window.clearInterval(timer);
  }, [open, step]);

  if (!open) return null;
  const update = (field: keyof GiftCustomization, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const steps = [{ id: "card" as const, label: "Select card" }, { id: "message" as const, label: "Add a message" }, { id: "packaging" as const, label: "Gift box" }];
  const stepIndex = steps.findIndex(item => item.id === step);
  return <><div role="dialog" aria-modal="true" aria-labelledby="gift-customization-title" className="store-mobile-sheet-overlay fixed inset-0 z-[130] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={onClose}>
    <section style={mobileDrag.dragStyle} className="gift-customization-modal store-mobile-sheet flex max-h-[94vh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-h-[90vh] md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
    <header className="shrink-0 border-b border-[#edf0f3] bg-white px-5 pb-4 pt-5 md:px-7 md:pt-6"><div className="flex items-center justify-between gap-4"><div><h2 id="gift-customization-title" className="text-2xl font-semibold tracking-[-.03em] text-[#171a1f] md:text-3xl">Customize your gift</h2><p className="mt-1 text-xs text-[#6d7178]">Make this order feel personal.</p></div><button type="button" onClick={onClose} aria-label="Close gift customization" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3f7ff] text-[#171a1f] shadow-sm"><X size={20} /></button></div><div className="mt-5 grid grid-cols-3 rounded-xl bg-[#e6efff] p-1">{steps.map((item) => <button key={item.id} type="button" onClick={() => setStep(item.id)} className={`rounded-lg px-2 py-2.5 text-[11px] font-semibold transition-colors md:text-xs ${step === item.id ? "bg-white text-[#171a1f] shadow-sm ring-1 ring-[#6ea8ff]" : "text-[#6d7178]"}`}>{item.label}</button>)}</div></header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f3f7ff] p-5 md:p-7">
        {step === "card" && <div><div className="mb-4 flex items-end justify-between gap-3"><div><h3 className="text-base font-semibold text-[#171a1f]">Choose a card</h3><p className="mt-1 text-xs text-[#6d7178]">Pick a design to include with your order.</p></div><span className="text-[11px] text-[#6d7178]">{giftCardOptions.length} designs</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{giftCardOptions.map((card, cardIndex) => <button key={card.id} type="button" onClick={() => update("cardId", card.id)} aria-pressed={draft.cardId === card.id} className={`group rounded-xl border-2 bg-white p-2 text-left transition-all ${draft.cardId === card.id ? "border-[#6ea8ff] bg-[#f5fbff] ring-1 ring-[#6ea8ff]" : "border-[#edf0f3] hover:border-[#c8d0d9]"}`}><div className="relative overflow-hidden rounded-lg"><GiftTriptychArtwork image={card.image} frame={(frameIndex + cardIndex) % 3} className="w-full" />{draft.cardId === card.id && <span className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-[#d72683] text-white"><Check size={16} /></span>}</div><div className="flex items-start justify-between gap-2 px-1 pb-1 pt-3"><span><strong className="block text-sm text-[#171a1f]">{card.title}</strong><small className="mt-1 block text-xs text-[#6d7178]">{card.note}</small></span><span className="shrink-0 text-xs font-semibold text-[#2c8b4b]">{card.price}</span></div></button>)}</div></div>}
        {step === "message" && <div className="mx-auto max-w-[620px]"><div className="mb-5"><h3 className="text-base font-semibold text-[#171a1f]">Add a personal message</h3><p className="mt-1 text-xs text-[#6d7178]">Tell us who the gift is for and what you would like to say.</p></div><div className="rounded-2xl bg-white p-4 shadow-sm md:p-6"><div className="relative grid min-h-[250px] place-items-center overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf5] p-8 shadow-inner"><span className="absolute inset-4 rounded-lg border border-[#ead8cc]" /><span className="absolute left-8 top-7 text-[10px] font-semibold tracking-[.18em] text-[#b59c8d]">DERAAH</span><div className="relative z-10 max-w-[88%] text-center"><p className={`whitespace-pre-wrap text-xl font-normal leading-8 ${draft.message ? "text-[#5d4b43]" : "text-[#c5b5aa]"}`}>{draft.message || "Your message will appear here"}</p>{draft.signature && (draft.signature.startsWith("data:image/") ? <img src={draft.signature} alt="Handwritten signature" className="mx-auto mt-5 max-h-14 max-w-[190px] object-contain" /> : <p className="mt-5 border-t border-[#ead8cc] pt-3 text-xs font-medium text-[#8d7567]">{draft.signature}</p>)}</div></div><label className="mt-5 block text-xs font-semibold text-[#555b63]">To <span className="font-normal text-[#8a919a]">(optional)</span><input value={draft.recipient} onChange={event => update("recipient", event.target.value)} maxLength={60} placeholder="Recipient name" className="mt-2 h-11 w-full rounded-lg border border-[#dfe4e8] bg-white px-3 text-sm outline-none focus:border-[#d72683]" /></label><label className="mt-4 block text-xs font-semibold text-[#555b63]">Message <span className="font-normal text-[#8a919a]">(optional)</span><textarea value={draft.message} onChange={event => update("message", event.target.value)} maxLength={192} placeholder="Write a warm message..." className="mt-2 min-h-32 w-full resize-y rounded-lg border border-[#dfe4e8] bg-white p-3 text-sm leading-6 outline-none focus:border-[#d72683]" /><span className="mt-1 block text-right text-[11px] text-[#7b818a]">{draft.message.length}/192</span></label><label className="mt-3 block text-xs font-semibold text-[#555b63]">From <span className="font-normal text-[#8a919a]">(optional)</span><span className="relative mt-2 block"><button type="button" onClick={() => setSignaturePadOpen(true)} aria-label="Draw signature" className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#d72683] hover:bg-[#fce7f3]"><PenLine size={16} /></button><input value={draft.signature.startsWith("data:image/") ? "" : draft.signature} onChange={event => update("signature", event.target.value)} maxLength={60} placeholder={draft.signature.startsWith("data:image/") ? "Handwritten signature saved" : "Your name"} className="h-11 w-full rounded-lg border border-[#dfe4e8] bg-white pl-11 pr-28 text-sm outline-none focus:border-[#d72683]" /><button type="button" onClick={() => setSignaturePadOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1.5 text-[10px] font-semibold text-[#d72683] hover:bg-[#fce7f3]">Draw signature</button></span></label><div className="mt-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#555b63]">Song or video</p><p className="mt-1 text-[11px] text-[#8a919a]">Add a memory to the printed card</p></div><button type="button" onClick={() => setMediaOpen(true)} className="text-xs font-semibold text-[#b01869]">{draft.mediaUrl ? "Edit link" : "Add link"}</button></div>{draft.mediaUrl ? <div className="mt-3"><GiftMediaThumbnail url={draft.mediaUrl} onRemove={() => update("mediaUrl", "")} /></div> : <button type="button" onClick={() => setMediaOpen(true)} className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-[#d8c9bf] bg-[#fffaf5] p-3 text-left hover:border-[#b01869]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fce7f3] text-[#b01869]"><Link2 size={17} /></span><span><strong className="block text-xs text-[#171a1f]">Add a song or video link</strong><span className="mt-1 block text-[11px] text-[#7b818a]">A QR code will be printed on the card</span></span></button>}</div></div></div>}
        {step === "packaging" && <div><div className="mb-4 flex items-end justify-between gap-3"><div><h3 className="text-base font-semibold text-[#171a1f]">Choose your gift box</h3><p className="mt-1 text-xs text-[#6d7178]">Select the finishing touch for your gift.</p></div><span className="text-[11px] text-[#6d7178]">{giftPackagingOptions.length} styles</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{giftPackagingOptions.map((box, boxIndex) => <button key={box.id} type="button" onClick={() => update("packagingId", box.id)} aria-pressed={draft.packagingId === box.id} className={`group rounded-xl border-2 bg-white p-2 text-left transition-all ${draft.packagingId === box.id ? "border-[#6ea8ff] bg-[#f5fbff] ring-1 ring-[#6ea8ff]" : "border-[#edf0f3] hover:border-[#c8d0d9]"}`}><div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-[#f5f6f7]"><GiftPackagingArtwork option={box} frame={(packagingFrame + boxIndex) % 2} />{draft.packagingId === box.id && <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#d72683] text-white"><Check size={16} /></span>}</div><div className="flex items-center justify-between gap-2 px-1 pb-1 pt-3"><strong className="text-sm text-[#171a1f]">{box.title}</strong><span className="text-xs font-semibold text-[#2c8b4b]">{box.price}</span></div></button>)}</div></div>}
      </div>
      <footer className="flex shrink-0 flex-row justify-end gap-3 border-t border-[#edf0f3] bg-white p-4 md:px-7"><button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#d7d4d1] bg-white px-4 text-[11px] font-semibold text-[#242223] transition-colors hover:border-[#242223] hover:bg-[#faf9f7]"><Eye size={15} />Preview</button><button type="button" onClick={() => stepIndex < steps.length - 1 ? setStep(steps[stepIndex + 1].id) : onSave(draft)} className="h-11 rounded-[10px] bg-[#242223] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#090909]">{stepIndex < steps.length - 1 ? "Continue" : "Save gift details"}</button></footer>
    </section>
  </div><SignaturePadModal open={signaturePadOpen} value={draft.signature} onClose={() => setSignaturePadOpen(false)} onSave={signature => { update("signature", signature); setSignaturePadOpen(false); }} /><GiftMediaModal open={mediaOpen} value={draft.mediaUrl} onClose={() => setMediaOpen(false)} onSave={mediaUrl => update("mediaUrl", mediaUrl)} />{previewOpen && <GiftPreviewModal customization={draft} onClose={() => setPreviewOpen(false)} />}</>;
}

function GiftMessageStep({ draft, update, setSignaturePadOpen }: { draft: GiftCustomization; update: (field: keyof GiftCustomization, value: string) => void; setSignaturePadOpen: (open: boolean) => void }) {
  const [mediaOpen, setMediaOpen] = useState(false);

  return <div className="mx-auto w-full max-w-[700px]">
    <div className="mb-5"><h3 className="text-lg font-semibold text-[#242223]">Add a personal message</h3><p className="mt-1 text-xs leading-5 text-[#737982]">Tell us who the gift is for and what you would like to say.</p></div>
    <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
      <div className="relative grid min-h-[250px] place-items-center overflow-hidden rounded-xl border border-[#eaded5] bg-[#fffaf5] p-8 shadow-inner"><span className="absolute inset-4 rounded-lg border border-[#ead8cc]" /><span className="absolute left-8 top-7 text-[10px] font-semibold tracking-[.18em] text-[#b59c8d]">DERAAH</span><div className="relative z-10 max-w-[88%] text-center"><p className={`whitespace-pre-wrap text-xl font-normal leading-8 ${draft.message ? "text-[#5d4b43]" : "text-[#c5b5aa]"}`}>{draft.message || "Your message will appear here"}</p>{draft.signature && (draft.signature.startsWith("data:image/") ? <img src={draft.signature} alt="Handwritten signature" className="mx-auto mt-5 max-h-14 max-w-[190px] object-contain" /> : <p className="mt-5 border-t border-[#ead8cc] pt-3 text-xs font-medium text-[#8d7567]">{draft.signature}</p>)}</div></div>
      <div className="grid gap-4">
      <label className="mt-[23px] block text-[12px] font-semibold text-[#3e3b39]">To <span className="font-normal text-[#8a8580]">(optional)</span><input value={draft.recipient} onChange={event => update("recipient", event.target.value)} maxLength={60} placeholder="Recipient name" className="mt-2 h-11 w-full rounded-[10px] border border-[#dfdcd8] bg-white px-3 text-[13px] text-[#242223] outline-none transition-colors placeholder:text-[#9a9692] focus:border-[#cd1a76] focus:ring-2 focus:ring-[#cd1a76]/10" /></label>
      <label className="block text-[12px] font-semibold text-[#3e3b39]">Message <span className="font-normal text-[#8a8580]">(optional)</span><textarea value={draft.message} onChange={event => update("message", event.target.value)} maxLength={192} placeholder="Write a warm message..." className="mt-2 min-h-32 w-full resize-y rounded-[10px] border border-[#dfdcd8] bg-white p-3 text-[13px] leading-5 text-[#242223] outline-none transition-colors placeholder:text-[#9a9692] focus:border-[#cd1a76] focus:ring-2 focus:ring-[#cd1a76]/10" /><span className="mt-1 block text-right text-[11px] font-normal text-[#7b818a]">{draft.message.length}/192</span></label>
      <div className="grid gap-[7px]"><div className="flex items-center justify-between gap-3"><label htmlFor="gift-signature" className="text-[12px] font-semibold text-[#3e3b39]">From <span className="font-normal text-[#8a8580]">(optional)</span></label><button type="button" onClick={() => setSignaturePadOpen(true)} className="text-[11px] font-semibold text-[#cd1a76] hover:underline">Draw signature</button></div><div className="relative"><PenLine size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#cd1a76]" /><input id="gift-signature" value={draft.signature.startsWith("data:image/") ? "" : draft.signature} onChange={event => update("signature", event.target.value)} maxLength={60} placeholder={draft.signature.startsWith("data:image/") ? "Handwritten signature saved" : "Your name"} className="h-11 w-full rounded-[10px] border border-[#dfdcd8] bg-white pl-10 pr-3 text-[13px] text-[#242223] outline-none transition-colors placeholder:text-[#9a9692] focus:border-[#cd1a76] focus:ring-2 focus:ring-[#cd1a76]/10" /></div></div>
      <div className="rounded-2xl border border-[#e5e2df] bg-white p-4">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[13px] font-semibold text-[#3e3b39]">Song or video</p><p className="mt-1 text-[11px] text-[#8a8580]">Add a memory that opens from the printed card.</p></div><button type="button" onClick={() => setMediaOpen(current => !current)} aria-expanded={mediaOpen} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#cd1a76] hover:underline">{mediaOpen ? "Close" : draft.mediaUrl ? "Edit link" : "Add link"}<ChevronDown size={13} className={`transition-transform ${mediaOpen ? "rotate-180" : ""}`} /></button></div>
        {draft.mediaUrl && !mediaOpen && <div className="mt-3"><GiftMediaThumbnail url={draft.mediaUrl} onRemove={() => update("mediaUrl", "")} /></div>}
        {!draft.mediaUrl && !mediaOpen && <button type="button" onClick={() => setMediaOpen(true)} className="mt-3 flex w-full items-center gap-3 rounded-[10px] border border-[#dfdcd8] bg-white p-3 text-left transition-colors hover:border-[#cd1a76]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fce7f3] text-[#cd1a76]"><Link2 size={16} /></span><span><strong className="block text-[12px] text-[#242223]">Add a song or video link</strong><span className="mt-1 block text-[11px] text-[#7b818a]">A QR code will be printed on the card.</span></span></button>}
        {mediaOpen && <GiftMediaEditor value={draft.mediaUrl} onCancel={() => setMediaOpen(false)} onSave={url => update("mediaUrl", url)} />}
      </div>
      </div>
    </div>
  </div>;
}

function GiftCustomizationModal({ open, initial, onClose, onSave }: { open: boolean; initial: GiftCustomization; onClose: () => void; onSave: (customization: GiftCustomization) => void }) {
  const steps = [{ id: "card" as const, label: "Select card", description: "Choose a design" }, { id: "message" as const, label: "Add a message", description: "Personalize it" }, { id: "packaging" as const, label: "Gift box", description: "Finish the gift" }];
  const [step, setStep] = useState<"card" | "message" | "packaging">("card");
  const [draft, setDraft] = useState<GiftCustomization>(initial);
  const [frameIndex, setFrameIndex] = useState(0);
  const [packagingFrame, setPackagingFrame] = useState(0);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cardPreview, setCardPreview] = useState<(typeof giftCardOptions)[number] | null>(null);
  const [packagingPreview, setPackagingPreview] = useState<GiftPackagingOption | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const stepIndex = steps.findIndex(item => item.id === step);
  const hasUnsavedChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial]);
  const requestClose = () => {
    if (hasUnsavedChanges) setExitConfirmOpen(true);
    else onClose();
  };
  const mobileDrag = useMobileSheetDrag(requestClose, { enabled: open && !signaturePadOpen && !previewOpen && !cardPreview && !packagingPreview && !exitConfirmOpen });

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setStep("card");
      setFrameIndex(0);
      setSignaturePadOpen(false);
      setPreviewOpen(false);
      setCardPreview(null);
      setPackagingPreview(null);
      setExitConfirmOpen(false);
    }
  }, [initial, open]);

  useEffect(() => {
    if (!open || step !== "card") return;
    const timer = window.setInterval(() => setFrameIndex(current => (current + 1) % 3), 3200);
    return () => window.clearInterval(timer);
  }, [open, step]);

  useEffect(() => {
    if (!open || step !== "packaging") return;
    setPackagingFrame(0);
    const timer = window.setInterval(() => setPackagingFrame(current => (current + 1) % 2), 3800);
    return () => window.clearInterval(timer);
  }, [open, step]);

  if (!open) return null;
  const update = (field: keyof GiftCustomization, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const goToStep = (nextIndex: number) => {
    setStep(steps[nextIndex].id);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(steps[stepIndex - 1].id);
    else requestClose();
  };
  const continueFlow = () => {
    if (stepIndex < steps.length - 1) setStep(steps[stepIndex + 1].id);
    else onSave(draft);
  };

  return <><div role="dialog" aria-modal="true" aria-labelledby="gift-customization-title" className="store-mobile-sheet-overlay fixed inset-0 z-[130] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={requestClose}>
    <section style={mobileDrag.dragStyle} className="gift-customization-modal store-mobile-sheet flex max-h-[94vh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-h-[90vh] md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <header className="shrink-0 bg-[#FAFCFF] px-5 pb-5 pt-5 md:px-7 md:pt-6">
        <div className="flex items-start justify-between gap-4"><div><h2 id="gift-customization-title" className="text-2xl font-semibold tracking-[-.03em] text-[#171717] md:text-3xl">Customize your gift</h2></div><button type="button" onClick={requestClose} aria-label="Close gift customization" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#555b63] transition-colors hover:bg-[#e9edf1]"><X size={19} /></button></div>
        <nav role="tablist" aria-label="Gift customization steps" className="mt-5 -ml-1 flex w-[calc(100%+6px)] gap-1 rounded-full bg-[#E1EBFF] p-1 md:ml-0 md:w-full">
          {steps.map((item, index) => { const active = index === stepIndex; return <button key={item.id} id={`gift-step-tab-${index}`} type="button" role="tab" aria-selected={active} aria-controls={`gift-step-panel-${item.id}`} tabIndex={active ? 0 : -1} onClick={() => goToStep(index)} onKeyDown={event => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? steps.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + steps.length) % steps.length; goToStep(nextIndex); window.requestAnimationFrame(() => document.getElementById(`gift-step-tab-${nextIndex}`)?.focus()); }} className={`flex min-h-10 min-w-0 items-center justify-center rounded-full px-2 py-2.5 text-center text-[12px] font-semibold transition-colors md:px-3 ${active ? "flex-[1.08] bg-white text-[#171717] shadow-[0_1px_3px_rgba(0,0,0,.07)]" : "flex-1 text-[#56514d] hover:bg-white/70"}`}><span className="whitespace-nowrap">{item.label}</span></button>; })}
        </nav>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAFCFF] p-5 pb-8 md:p-7">
        {step === "card" && <div><div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-[#242223]">Choose the card design</h3></div><span className="flex h-7 w-[81px] items-center justify-center rounded-full bg-white text-center text-[10px] font-semibold text-[#737982]">{giftCardOptions.length} designs</span></div><div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{giftCardOptions.map((card, cardIndex) => <article key={card.id} className={`group relative aspect-[2/3] overflow-hidden rounded-[22px] border bg-[#f5f6f7] text-left shadow-[0_8px_20px_rgba(30,50,80,.08)] transition-all lg:aspect-[4/5] ${draft.cardId === card.id ? "border-[#2c8b4b] ring-2 ring-[#2c8b4b]/25" : "border-white hover:border-[#8dc5a0]"}`}><button type="button" onClick={() => update("cardId", card.id)} aria-pressed={draft.cardId === card.id} className="absolute inset-0 h-full w-full text-left"><GiftTriptychArtwork image={card.image} frame={(frameIndex + cardIndex) % 3} className="!aspect-square h-full w-full" /><div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#111315]/95 via-[#111315]/55 to-transparent" /><div className="pointer-events-none absolute inset-x-3 bottom-3 text-white"><div className="flex items-center gap-1.5"><strong className="min-w-0 flex-1 truncate text-sm font-semibold leading-5 drop-shadow-sm">{card.title}</strong>{draft.cardId === card.id && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2c8b4b] text-white shadow-md"><Check size={14} strokeWidth={3} /></span>}</div><small className="mt-1 block line-clamp-2 text-[11px] leading-4 text-white/80">{card.note}</small><span className="mt-2 inline-flex rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#267b42] shadow-sm">{card.price}</span></div></button><button type="button" onClick={() => setCardPreview(card)} aria-label={`Preview ${card.title}`} className="absolute right-3 top-3 z-30 grid h-[30px] w-[30px] place-items-center rounded-full bg-white/90 text-[#242223] shadow-md ring-1 ring-black/5 transition-colors hover:bg-white"><Eye size={14} /></button></article>)}</div></div>}
        {step === "message" && <GiftMessageStep draft={draft} update={update} setSignaturePadOpen={setSignaturePadOpen} />}
        {step === "packaging" && <div><div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-[#242223]">Choose the gift box</h3></div><span className="flex h-7 w-[81px] items-center justify-center rounded-full bg-white text-center text-[10px] font-semibold text-[#737982]">{giftPackagingOptions.length} styles</span></div><div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">{giftPackagingOptions.map((box, boxIndex) => <article key={box.id} className={`group relative flex flex-col rounded-2xl border bg-white p-2 text-left shadow-[0_4px_12px_rgba(30,50,80,.04)] transition-all ${draft.packagingId === box.id ? "border-[#2c8b4b] bg-[#f7fcf8] ring-2 ring-[#2c8b4b]/20" : "border-[#e5e7eb] hover:border-[#8dc5a0]"}`}><button type="button" onClick={() => update("packagingId", box.id)} aria-pressed={draft.packagingId === box.id} className="flex h-full w-full flex-col text-left"><div className="relative h-[112px] shrink-0 overflow-hidden rounded-xl bg-[#f5f6f7] sm:h-auto sm:aspect-square"><GiftPackagingArtwork option={box} frame={(packagingFrame + boxIndex) % 2} />{draft.packagingId === box.id && <span className="absolute bottom-3 right-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-[#2c8b4b] text-white shadow-sm"><Check size={16} strokeWidth={3} /></span>}</div><div className="flex min-h-[62px] flex-1 flex-col px-1 pb-1 pt-2 sm:pt-3"><strong className="block text-sm leading-5 text-[#242223]">{box.title}</strong><span className="mt-auto block pt-2 text-xs font-semibold text-[#267b42]">{box.price}</span></div></button><button type="button" onClick={() => setPackagingPreview(box)} aria-label={`Preview ${box.title}`} className="absolute right-2 top-2 z-30 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#242223] shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white"><Eye size={15} /></button></article>)}</div></div>}
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-3 bg-[#FAFCFF] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] md:px-7 md:pb-7"><button type="button" onClick={stepIndex === 0 ? requestClose : goBack} className="h-11 rounded-[10px] border border-[#d7d4d1] bg-white px-4 text-[11px] font-semibold text-[#242223] transition-colors hover:border-[#242223] hover:bg-[#faf9f7]">{stepIndex === 0 ? "Cancel" : "Back"}</button><div className="flex items-center gap-3"><button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#d7d4d1] bg-white px-4 text-[11px] font-semibold text-[#242223] transition-colors hover:border-[#242223] hover:bg-[#faf9f7]"><Eye size={15} />Preview</button><button type="button" onClick={continueFlow} className="h-11 w-[132.4px] rounded-[10px] bg-[#242223] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#090909]">{stepIndex === steps.length - 1 ? "Save gift details" : "Continue"}</button></div></footer>
      {cardPreview && <GiftCardImagePreviewModal card={cardPreview} onClose={() => setCardPreview(null)} />}
      {packagingPreview && <GiftPackagingImagePreviewModal option={packagingPreview} frame={packagingFrame} onClose={() => setPackagingPreview(null)} />}
    </section>
  </div><SignaturePadModal open={signaturePadOpen} value={draft.signature} onClose={() => setSignaturePadOpen(false)} onSave={signature => { update("signature", signature); setSignaturePadOpen(false); }} />{previewOpen && <GiftPreviewModal customization={draft} onClose={() => setPreviewOpen(false)} />}{exitConfirmOpen && <div role="dialog" aria-modal="true" aria-labelledby="gift-exit-title" className="store-mobile-sheet-overlay fixed inset-0 z-[180] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5" onClick={() => setExitConfirmOpen(false)}><section className="w-full max-w-[440px] rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl md:p-6" onClick={event => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b42318]">Unsaved changes</p><h2 id="gift-exit-title" className="mt-1 text-lg font-semibold text-[#242223]">Leave gift customization?</h2><p className="mt-2 text-xs leading-5 text-[#737982]">Your changes will be discarded if you leave before saving.</p></div><button type="button" onClick={() => setExitConfirmOpen(false)} aria-label="Keep editing" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#555b63]"><X size={17} /></button></div><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setExitConfirmOpen(false)} className="h-11 rounded-[10px] border border-[#d7d4d1] px-4 text-[11px] font-semibold text-[#242223]">Keep editing</button><button type="button" onClick={() => { setExitConfirmOpen(false); onClose(); }} className="h-11 rounded-[10px] bg-[#b42318] px-4 text-[11px] font-semibold text-white">Discard changes</button></div></section></div>}</>;
}

const starterAddresses: Address[] = [
  { id: "home", label: "Home", recipient: "Primary contact", phone: "05X XXX XXXX", city: "Riyadh", street: "Al Olaya · King Fahd Road", code: "RQSA6774", nationalCode: "RQSA6774", isDefault: true, addressType: "home" },
  { id: "work", label: "Work", recipient: "Primary contact", phone: "05X XXX XXXX", city: "Riyadh", street: "Al Nakheel · Northern Ring Road", code: "RQSA4543", nationalCode: "RQSA4543", addressType: "home" },
];

export function loadAddresses(): Address[] {
  try {
    const value = JSON.parse(window.localStorage.getItem("deraah-addresses") ?? "null");
    const friendAddress: Address = { id: "friend", label: "Friend's address", recipient: "Friend", phone: "05X XXX XXXX", city: "Riyadh", street: "Al Malaz · Salah Al Din Road", nationalCode: "RQSA6544" };
    const validAddresses = Array.isArray(value) ? value.map(address => address?.label === "New address" ? friendAddress : address).filter(address => address?.id && address?.label && address?.city && address?.street).map(address => ({ ...address, addressType: address.addressType === "redbox" ? "redbox" : "home" as const })) : [];
    if (validAddresses.length && JSON.stringify(validAddresses) !== JSON.stringify(value)) window.localStorage.setItem("deraah-addresses", JSON.stringify(validAddresses));
    return validAddresses.length ? validAddresses : starterAddresses;
  } catch {
    return starterAddresses;
  }
}

function loadLastUsedAddressId(addresses: Address[]): string | null {
  try {
    const savedId = window.localStorage.getItem("deraah-last-address-id");
    return savedId && addresses.some(address => address.id === savedId) ? savedId : addresses[0]?.id ?? null;
  } catch {
    return addresses[0]?.id ?? null;
  }
}

type MapLocation = { city: string; district: string; street: string; code: string };

const mapLocationPresets: MapLocation[] = [
  { city: "Riyadh", district: "Al-Jazeera District", street: "Eastern Ring Road, 5100", code: "RQSA6774" },
  { city: "Riyadh", district: "Al Olaya", street: "King Fahd Road", code: "RQSA6381" },
  { city: "Riyadh", district: "Al Salam", street: "Al Kahf Street", code: "RQSA4543" },
  { city: "Riyadh", district: "Al Nakheel", street: "Northern Ring Road", code: "RQSA6544" },
  { city: "Riyadh", district: "Al Malaz", street: "Salah Al Din Road", code: "RQSA7128" },
];

function getInitialMapLocation(draft: Address): MapLocation {
  const parts = draft.street.split(" · ").map(part => part.trim()).filter(Boolean);
  return {
    city: draft.city || "Riyadh",
    district: parts[0] || mapLocationPresets[0].district,
    street: parts.slice(1).join(" · ") || mapLocationPresets[0].street,
    code: draft.nationalCode?.match(/^[A-Za-z]{4}\d{4}$/)?.[0].toUpperCase() || mapLocationPresets[0].code,
  };
}

function getMapLocationFromPoint(x: number, y: number, city: string): MapLocation {
  const normalizedPosition = Math.min(0.999, Math.max(0, (x * 0.6 + y * 0.4) / 100));
  const index = Math.min(mapLocationPresets.length - 1, Math.floor(normalizedPosition * mapLocationPresets.length));
  return { ...mapLocationPresets[index], city: city.trim() || "Riyadh" };
}

function LocationPicker({ draft, onChange, onClose }: { draft: Address; onChange: (field: keyof Address, value: string | boolean) => void; onClose: () => void }) {
  const [city, setCity] = useState(draft.city || "Riyadh");
  const [pin, setPin] = useState({ x: 50, y: 53 });
  const [selection, setSelection] = useState<MapLocation>(() => getInitialMapLocation(draft));
  const [dragging, setDragging] = useState(false);
  const [redboxListOpen, setRedboxListOpen] = useState(false);
  const [selectedRedboxIndex, setSelectedRedboxIndex] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const mobileDrag = useMobileSheetDrag(onClose);
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const isRedbox = draft.addressType === "redbox";
  const locationCopy = isArabic ? {
    dialogLabel: isRedbox ? "اختيار نقطة ريدبوكس" : "اختيار موقع التوصيل",
    searchPlaceholder: isRedbox ? "ابحث عن نقطة ريدبوكس أو العنوان" : "ابحث عن العنوان",
    mapLabel: isRedbox ? "نقاط ريدبوكس" : "OpenStreetMap",
    deliveryHint: isRedbox ? "سيتم استلام طلبك من هذه النقطة" : "سيتم توصيل طلبك إلى هذا الموقع",
    useLocation: "استخدم موقعي",
    selectedTitle: isRedbox ? "نقطة ريدبوكس المحددة" : "التوصيل إلى",
    selectedLabel: isRedbox ? "RedBox · نقطة استلام" : `Saudi – ${selection.city}`,
    selectedDescription: isRedbox ? "نقطة ريدبوكس قريبة من موقعك" : "منطقة الرياض",
    confirm: isRedbox ? "تأكيد نقطة ريدبوكس" : "تأكيد الموقع",
  } : {
    dialogLabel: isRedbox ? "Choose a RedBox point" : "Select delivery location",
    searchPlaceholder: isRedbox ? "Search by RedBox point or address" : "Search for an address",
    mapLabel: isRedbox ? "RedBox points" : "OpenStreetMap",
    deliveryHint: isRedbox ? "Your order will be collected from this point" : "Your order will be delivered to this location.",
    useLocation: "Use my location",
    selectedTitle: isRedbox ? "Selected RedBox point" : "Delivery to",
    selectedLabel: isRedbox ? `RedBox · ${selection.city}` : `Saudi – ${selection.city}`,
    selectedDescription: isRedbox ? "A RedBox point near your location" : `${selection.city} Region`,
    confirm: isRedbox ? "Confirm RedBox point" : "Confirm location",
  };
  const redboxPoints = isArabic ? [
    { name: "RedBox RUH-C-340", type: "نقطة استلام", address: "تميمي سوبرماركت · أم الحمام الشرقي", rating: "4.5", reviews: "279", location: mapLocationPresets[0], position: { x: 52, y: 48 } },
    { name: "RedBox RUH-C-299", type: "نقطة استلام", address: "طريق صلاح الدين · الملز", rating: "4.7", reviews: "184", location: mapLocationPresets[4], position: { x: 30, y: 66 } },
    { name: "RedBox RUH-C-122", type: "نقطة استلام", address: "حي الورود · طريق الملك عبدالعزيز", rating: "4.6", reviews: "112", location: mapLocationPresets[3], position: { x: 72, y: 28 } },
  ] : [
    { name: "RedBox RUH-C-340", type: "Counter", address: "Tamimi Supermarket · Umm Al Hamam Al Sharqi", rating: "4.5", reviews: "279", location: mapLocationPresets[0], position: { x: 52, y: 48 } },
    { name: "RedBox RUH-C-299", type: "Counter", address: "Salah Al Din Road · Al Malaz", rating: "4.7", reviews: "184", location: mapLocationPresets[4], position: { x: 30, y: 66 } },
    { name: "RedBox RUH-C-122", type: "Counter", address: "Al Wuroud · King Abdulaziz Road", rating: "4.6", reviews: "112", location: mapLocationPresets[3], position: { x: 72, y: 28 } },
  ];
  const redboxMarkerPositions = [
    { x: 13, y: 22 }, { x: 25, y: 30 }, { x: 40, y: 17 }, { x: 61, y: 20 }, { x: 81, y: 16 },
    { x: 18, y: 43 }, { x: 34, y: 37 }, { x: 46, y: 32 }, { x: 67, y: 38 }, { x: 87, y: 45 },
    { x: 10, y: 61 }, { x: 23, y: 75 }, { x: 42, y: 68 }, { x: 58, y: 78 }, { x: 78, y: 64 },
    { x: 91, y: 77 }, { x: 37, y: 87 }, { x: 69, y: 91 },
  ];
  const selectedRedboxPoint = redboxPoints[selectedRedboxIndex] ?? redboxPoints[0];

  const setCityValue = (value: string) => {
    setCity(value);
    setSelection(current => ({ ...current, city: value.trim() || "Riyadh" }));
  };

  const chooseRedboxPoint = (index: number) => {
    const point = redboxPoints[index];
    if (!point) return;
    setSelectedRedboxIndex(index);
    setCityValue(point.location.city);
    setSelection(point.location);
    setPin(point.position);
    setRedboxListOpen(false);
  };

  const movePin = (clientX: number, clientY: number) => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(84, Math.max(22, ((clientY - bounds.top) / bounds.height) * 100));
    setPin({ x, y });
    setSelection(getMapLocationFromPoint(x, y, city));
  };

  const handleMapPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    movePin(event.clientX, event.clientY);
  };

  const handleMapPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) movePin(event.clientX, event.clientY);
  };

  const confirmLocation = () => {
    const selectedCity = city.trim() || "Riyadh";
    const street = `${selection.district} · ${selection.street}`;
    onChange("city", selectedCity);
    onChange("street", street);
    onChange("code", `${selectedCity} · ${street}`);
    onChange("nationalCode", selection.code);
    onClose();
  };

  return <div role="dialog" aria-modal="true" aria-label={locationCopy.dialogLabel} className="store-mobile-sheet-overlay fixed inset-0 z-[100] flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-5">
    <div style={mobileDrag.dragStyle} className="checkout-location-picker-sheet checkout-address-modal-surface store-mobile-sheet w-full max-w-[620px] overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div ref={mapRef} role="application" aria-label="Choose delivery location on map" onPointerDown={handleMapPointerDown} onPointerMove={handleMapPointerMove} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)} className={`checkout-location-map relative h-[430px] overflow-hidden bg-[#e5edf0] select-none touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`} style={{ backgroundImage: "linear-gradient(28deg, transparent 45%, rgba(255,255,255,.92) 46%, rgba(255,255,255,.92) 49%, transparent 50%), linear-gradient(112deg, transparent 44%, rgba(255,255,255,.9) 45%, rgba(255,255,255,.9) 48%, transparent 49%), linear-gradient(0deg, rgba(167,211,185,.58) 0 14%, transparent 14% 100%), repeating-linear-gradient(90deg, transparent 0 42px, rgba(180,198,207,.55) 43px 45px), repeating-linear-gradient(0deg, transparent 0 38px, rgba(180,198,207,.55) 39px 41px)" }}>
        <iframe title="Riyadh address map" src={openStreetMapEmbedUrl()} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full border-0" loading="lazy" />
        <button type="button" onPointerDown={event => event.stopPropagation()} onClick={onClose} aria-label={isArabic ? "إغلاق الخريطة" : "Close map"} className="absolute left-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl text-[#30363d] shadow-md">‹</button>
        <div className={`absolute top-4 z-10 flex h-11 gap-2 ${isRedbox ? "inset-x-4" : "inset-x-16"}`} onPointerDown={event => event.stopPropagation()}><div className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-4 shadow-md ${isRedbox ? "ring-1 ring-[#dfe5ea]" : "rounded-full"}`}><Search size={19} className="shrink-0 text-[#8a919a]" /><input value={city} onChange={event => setCityValue(event.target.value)} placeholder={locationCopy.searchPlaceholder} aria-label={locationCopy.searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>{isRedbox && <button type="button" onClick={() => setRedboxListOpen(true)} aria-label={isArabic ? "تصفية نقاط ريدبوكس" : "Filter RedBox points"} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#dfe5ea] bg-white text-[#555b63] shadow-md"><SlidersHorizontal size={18} /></button>}</div>
        <span className={`pointer-events-none absolute right-4 top-[68px] z-10 rounded-full px-3 py-2 text-[10px] font-semibold shadow-sm ${isRedbox ? "bg-[#eaf8ef] text-[#208447]" : "bg-white/95 text-[#555b63]"}`}>{locationCopy.mapLabel}</span>
        <div className={`absolute z-10 -translate-x-1/2 rounded-full px-3 py-[7px] text-center text-[11px] font-medium leading-4 text-white shadow-lg ${isRedbox ? "bg-[#208447]" : "bg-[#171a1f]"}`} style={{ left: `${pin.x}%`, top: `${pin.y}%`, width: "min(268.86px, calc(100% - 48px))", marginTop: "-152px" }}>{locationCopy.deliveryHint}</div>
        {isRedbox && redboxMarkerPositions.map((marker, index) => <button key={`${marker.x}-${marker.y}`} type="button" aria-label={`${redboxPoints[index % redboxPoints.length].name} · ${redboxPoints[index % redboxPoints.length].type}`} onPointerDown={event => event.stopPropagation()} onClick={() => chooseRedboxPoint(index % redboxPoints.length)} className={`absolute z-10 -translate-x-1/2 -translate-y-full text-[#ef3d27] drop-shadow-md transition-transform hover:scale-110 ${index % redboxPoints.length === selectedRedboxIndex ? "scale-125" : ""}`} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}><MapPin size={30} fill="currentColor" strokeWidth={1.8} /></button>)}
        <MapPin className={`absolute z-10 -translate-x-1/2 -translate-y-full drop-shadow-md ${isRedbox ? "text-[#ef3d27]" : "text-[#d72683]"}`} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} size={46} fill={isRedbox ? "#ef3d27" : "#d72683"} />
        <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => { setCityValue("Riyadh"); setPin({ x: 50, y: 53 }); setSelection(mapLocationPresets[0]); }} className="absolute bottom-4 left-4 z-10 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#555b63] shadow-md">{locationCopy.useLocation}</button>
        {isRedbox && <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => setRedboxListOpen(open => !open)} className="absolute bottom-4 left-1/2 z-20 h-11 -translate-x-1/2 rounded-full bg-[#6d7df5] px-12 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]">{redboxListOpen ? (isArabic ? "عرض الخريطة" : "View Map") : (isArabic ? "عرض القائمة" : "View List")}</button>}
        {isRedbox && redboxListOpen && <div className="absolute inset-0 z-30 overflow-y-auto bg-[#f8fafc] p-4 pt-20" onPointerDown={event => event.stopPropagation()}><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#208447]">RedBox</p><h3 className="mt-1 text-lg font-semibold text-[#171a1f]">{isArabic ? "نقاط ريدبوكس القريبة" : "Nearby RedBox points"}</h3></div><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6d7178]">{redboxPoints.length} {isArabic ? "نقاط" : "points"}</span></div><div className="space-y-3">{redboxPoints.map((point, index) => <button key={point.name} type="button" onClick={() => chooseRedboxPoint(index)} className={`block w-full rounded-2xl border bg-white p-4 text-start shadow-sm ${index === selectedRedboxIndex ? "border-[#8fd3a5] ring-2 ring-[#2c8b4b]/10" : "border-[#e1e7ec]"}`}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0ed] text-[#ef3d27]"><MapPin size={19} fill="currentColor" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#171a1f]">{point.name}</strong><span className="mt-1 block text-[11px] text-[#6d7178]">{point.type}</span><span className="mt-2 block text-xs leading-5 text-[#555b63]">{point.address}</span><span className="mt-2 block text-xs font-semibold text-[#e0ad00]">★★★★★ <span className="ms-1 text-[#7a8490]">{point.rating} ({point.reviews})</span></span></span></div></button>)}</div></div>}
      </div>
      <div className="checkout-location-details bg-[#f7f9ff] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
        {isRedbox ? <><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#208447]">RedBox</p><h3 className="mt-1 text-lg font-semibold text-[#171a1f]">{isArabic ? "نقطة ريدبوكس المحددة" : "Selected RedBox point"}</h3></div><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6d7178]">{selection.city}</span></div><div className="mt-3 rounded-2xl border border-[#e1e7ec] bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0ed] text-[#ef3d27]"><MapPin size={20} fill="currentColor" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><strong className="block text-sm leading-5 text-[#25272c]">{selectedRedboxPoint.name} <span className="font-normal text-[#6d7178]">· {selectedRedboxPoint.type}</span></strong><span className="mt-1 block text-xs font-semibold text-[#e0ad00]">★★★★★ <span className="ms-1 text-[#7a8490]">{selectedRedboxPoint.rating} ({selectedRedboxPoint.reviews})</span></span></div><NationalAddressBadge code={selection.code} fallback="RQSA6774" /></div><p className="mt-3 text-xs leading-5 text-[#555b63]">{selectedRedboxPoint.address}</p><button type="button" onClick={() => setRedboxListOpen(true)} className="mt-2 text-xs font-semibold text-[#6d7df5]">{isArabic ? "التفاصيل" : "Details"} <ChevronDown size={13} className="inline-block align-[-2px]" /></button></div></div><div className="mt-4 grid grid-cols-[44px_1fr] gap-2 border-t border-[#edf0f3] pt-3"><button type="button" aria-label={isArabic ? "مشاركة نقطة ريدبوكس" : "Share RedBox point"} className="grid h-11 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63]"><Link2 size={17} /></button><button type="button" onClick={confirmLocation} className="h-11 rounded-xl bg-[#6d7df5] text-sm font-semibold text-white">{isArabic ? "الحصول على الاتجاهات" : "Get directions"}</button></div></div><button type="button" onClick={confirmLocation} className="mt-3 h-12 w-full rounded-xl bg-[#208447] text-sm font-semibold text-white transition-colors hover:bg-[#176b38]">{locationCopy.confirm}</button></> : <><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#7a8490]">Delivery</p><h3 className="mt-1 text-lg font-semibold text-[#171a1f]">{locationCopy.selectedTitle}</h3></div><span className="text-xs font-semibold text-[#6d7178]">{selection.city}</span></div><div className="mt-3 flex items-start gap-3 rounded-2xl border border-[#287cf0] bg-[#f6fcff] p-4 shadow-sm"><span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#287cf0]"><MapPin size={20} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><strong className="text-sm leading-5 text-[#25272c]">{locationCopy.selectedLabel}</strong><NationalAddressBadge code={selection.code} fallback="RQSA6774" /></div><p className="mt-1 text-xs leading-5 text-[#555b63]">{locationCopy.selectedDescription} · {selection.district} · {selection.street}</p></div></div><button type="button" onClick={confirmLocation} className="mt-3 h-12 w-full rounded-xl bg-[#171a1f] text-sm font-semibold text-white hover:bg-[#252525]">{locationCopy.confirm}</button></>}
      </div>
    </div>
  </div>;
}

export function AddressForm({ draft, onChange, onSave, onCancel }: { draft: Address; onChange: (field: keyof Address, value: string | boolean) => void; onSave: () => void; onCancel: () => void }) {
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const formCopy = isArabic ? {
    title: draft.addressType === "redbox" ? "عنوان ريدبوكس جديد" : "إضافة عنوان جديد",
    cancel: "إلغاء",
    addressLocation: "موقع العنوان",
    city: "المدينة",
    selectDistrictAndStreet: "اختر الحي والشارع",
    addressName: "اسم العنوان",
    nationalAddress: "العنوان الوطني",
    nationalPlaceholder: "يُنشأ من الخريطة أو أدخله يدوياً",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phone: "رقم الجوال",
    otherRecipient: "سيستلم الطلب شخص آخر.",
    defaultAddress: "تعيين كعنوان افتراضي",
    saveAddress: "حفظ العنوان",
    mapCity: "الرياض",
    mapArea: "السلام",
  } : {
    title: draft.addressType === "redbox" ? "Add new Redbox address" : "Add new address",
    cancel: "Cancel",
    addressLocation: "Address location",
    city: "City",
    selectDistrictAndStreet: "Select district and street",
    addressName: "Address name",
    nationalAddress: "National address",
    nationalPlaceholder: "Generated from the map or enter manually",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    otherRecipient: "Another person will receive the order.",
    defaultAddress: "Set as default address",
    saveAddress: "Save address",
    mapCity: "Riyadh",
    mapArea: "Al Salam",
  };
  const otherLabel = draft.otherLabel ?? "";
  const [firstName = "", ...lastNameParts] = draft.recipient.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ");
  const updateRecipient = (first: string, last: string) => onChange("recipient", `${first} ${last}`.trim());

  return <div className="checkout-address-form space-y-3.5 px-1 pb-2 md:space-y-4 md:px-0 md:pb-0">
    <div className="checkout-address-form-header relative flex items-center justify-between gap-4 border-b border-[#e8edf1] pb-4"><div className="flex items-center gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f0f8f2] text-[#2c8b4b]"><MapPin size={22} strokeWidth={1.6} /></span><strong className="block text-[20px] font-semibold tracking-[-.04em] text-[#171a1f] md:text-[24px]">{formCopy.title}</strong></div><button type="button" onClick={onCancel} className="absolute left-0 top-0 inline-flex h-10 items-center rounded-xl border border-[#dfe5ea] bg-white px-4 text-xs font-semibold text-[#4e5661] transition-colors hover:bg-[#f8fafc] md:static">{formCopy.cancel}</button></div>
    <div className="checkout-address-location">
      <button type="button" onClick={() => setLocationPickerOpen(true)} aria-label={isArabic ? "تغيير موقع العنوان من الخريطة" : "Change address location on the map"} title={isArabic ? "اضغط لتغيير الموقع" : "Click to change location"} className="group relative block h-24 w-full overflow-hidden rounded-xl border border-[#d5e2e7] bg-[#e5eef1] text-start shadow-inner transition-all hover:border-[#8db9c5] hover:shadow-[0_4px_14px_rgba(38,91,110,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287cf0]/60" style={{ backgroundImage: "linear-gradient(28deg, transparent 45%, rgba(255,255,255,.9) 46%, rgba(255,255,255,.9) 49%, transparent 50%), linear-gradient(112deg, transparent 44%, rgba(255,255,255,.84) 45%, rgba(255,255,255,.84) 48%, transparent 49%), linear-gradient(168deg, transparent 38%, rgba(207,229,218,.72) 39% 52%, transparent 53%), repeating-linear-gradient(90deg, transparent 0 30px, rgba(171,196,205,.58) 31px 33px), repeating-linear-gradient(0deg, transparent 0 24px, rgba(171,196,205,.58) 25px 27px)" }}><span className="pointer-events-none absolute -start-8 top-[-24px] h-20 w-48 rotate-[18deg] rounded-[50%] bg-[#d1e4e8]/70" /><span className="pointer-events-none absolute -end-10 bottom-[-28px] h-16 w-52 -rotate-[12deg] rounded-[50%] bg-[#d1e4e8]/75" /><span className="absolute end-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[#3f4852] shadow-sm transition-colors group-hover:text-[#287cf0]"><PenLine size={14} /></span><img src="/product-assets/icons/mage_location-pin.svg" alt="" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-[58%] drop-shadow-[0_2px_2px_rgba(95,42,74,.18)]" /><span className="pointer-events-none absolute left-3 top-2 text-[10px] font-semibold text-[#607b85]">{formCopy.mapCity}</span><span className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-semibold text-[#607b85]">{formCopy.mapArea}</span></button>
      <div className="mt-2"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#7a8490]">{formCopy.addressLocation}</p><p className="mt-1 text-sm leading-5 text-[#171a1f]">{draft.city || formCopy.city}{draft.street ? ` · ${draft.street}` : ` · ${formCopy.selectDistrictAndStreet}`}</p></div>
    </div>
    <div><p className="mb-2 text-sm font-semibold text-[#25272c]">{formCopy.addressName}</p><div className="grid w-[320px] max-w-full grid-cols-3 gap-2">{["Home", "Work", "Other"].map(label => <button key={label} type="button" onClick={() => onChange("label", label)} className={`h-9 w-full rounded-xl border text-xs font-medium transition-colors ${draft.label === label ? "border-[#287cf0] bg-[#f1f7ff] text-[#1768d4]" : "border-[#dfe4e8] bg-white text-[#555b63] hover:border-[#b8c1ca]"}`}>{label}</button>)}</div></div>
    {draft.label === "Other" && <div className="checkout-floating-field"><input id="address-other-label" value={otherLabel} onChange={event => onChange("otherLabel", event.target.value)} placeholder=" " className="h-12 w-full rounded-xl border border-[#cfd3d9] bg-white px-3 text-sm outline-none focus:border-[#287cf0]" /><label htmlFor="address-other-label">{formCopy.addressName}</label></div>}
    <div className="checkout-floating-field"><input id="address-national-code" value={draft.nationalCode ?? ""} onChange={event => onChange("nationalCode", event.target.value.toUpperCase())} placeholder=" " className="h-12 w-full rounded-xl border border-[#cfd3d9] bg-white px-3 text-sm uppercase outline-none focus:border-[#287cf0]" /><label htmlFor="address-national-code">{formCopy.nationalAddress}</label></div>
    <label className="checkout-address-choice flex min-h-12 items-center gap-3 px-1 py-2.5 text-sm font-medium text-[#25272c]"><input type="checkbox" checked={!!draft.recipientDifferent} onChange={event => onChange("recipientDifferent", event.target.checked)} className="checkout-address-checkbox-input sr-only" /><span aria-hidden="true" className="checkout-address-checkbox"><Check size={11} strokeWidth={3} /></span><span>{formCopy.otherRecipient}</span></label>
    {draft.recipientDifferent && <div className="grid gap-3 sm:grid-cols-2"><div className="checkout-floating-field"><input id="address-first-name" value={firstName} onChange={event => updateRecipient(event.target.value, lastName)} placeholder=" " className="h-12 w-full rounded-xl border border-[#cfd3d9] bg-white px-3 text-sm outline-none focus:border-[#287cf0]" /><label htmlFor="address-first-name">{formCopy.firstName}</label></div><div className="checkout-floating-field"><input id="address-last-name" value={lastName} onChange={event => updateRecipient(firstName, event.target.value)} placeholder=" " className="h-12 w-full rounded-xl border border-[#cfd3d9] bg-white px-3 text-sm outline-none focus:border-[#287cf0]" /><label htmlFor="address-last-name">{formCopy.lastName}</label></div><div className="checkout-floating-field sm:col-span-2"><input id="address-phone" value={draft.phone} onChange={event => onChange("phone", event.target.value)} placeholder=" " className="h-12 w-full rounded-xl border border-[#cfd3d9] bg-white px-3 text-sm outline-none focus:border-[#287cf0]" /><label htmlFor="address-phone">{formCopy.phone}</label></div></div>}
    <label className="checkout-address-choice !-mt-2.5 flex min-h-12 items-center gap-[13px] px-1 py-2.5 text-sm font-medium text-[#25272c]"><input type="checkbox" checked={!!draft.isDefault} onChange={event => onChange("isDefault", event.target.checked)} className="checkout-address-checkbox-input sr-only" /><span aria-hidden="true" className="checkout-address-checkbox"><Check size={11} strokeWidth={3} /></span><span>{formCopy.defaultAddress}</span></label>
    <button type="button" disabled={!draft.city || !draft.street} onClick={onSave} className="h-12 w-full rounded-xl bg-[#171a1f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#252a30] disabled:cursor-not-allowed disabled:bg-[#9aa1ac]">{formCopy.saveAddress}</button>
    {locationPickerOpen && <LocationPicker draft={draft} onChange={onChange} onClose={() => setLocationPickerOpen(false)} />}
  </div>;
}

function NationalAddressBadge({ code, fallback = "RQSA6774", showIcon = true }: { code?: string; fallback?: string; showIcon?: boolean }) {
  const nationalCode = code?.trim().match(/^[A-Za-z]{4}\d{4}$/)?.[0].toUpperCase() || fallback;
  return <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#f7f8fa] px-2 py-1 text-[10px] font-semibold tracking-wide text-[#59616b]">{showIcon && <MapPin size={13} className="text-[#2c8b4b]" />}{nationalCode}</span>;
}

function SavedAddressCard({ address, selected = false, onSelect, onEdit, onRemove }: { address: Address; selected?: boolean; onSelect: () => void; onEdit: () => void; onRemove: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const displayLabel = isArabic ? ({ Home: "المنزل", Work: "العمل", Other: "أخرى" }[address.label] ?? address.label) : address.label;
  const displayRecipient = isArabic && address.recipient === "Primary contact" ? "جهة الاتصال الأساسية" : address.recipient;
  const displayPhone = isArabic && address.id === "home" && address.phone === "05X XXX XXXX" ? "0509195216" : address.phone;
  const addressParts = address.street.split(" · ").map(part => part.trim()).filter(Boolean);
  const AddressIcon = address.label === "Home" ? Home : address.label === "Work" ? Briefcase : MapPin;
  const editAddress = () => { setMenuOpen(false); onEdit(); };
  const removeAddress = () => { setMenuOpen(false); onRemove(); };
  return <article className={`checkout-saved-address-card relative rounded-[18px] border ${selected ? "border-[#8fd3a5] bg-[#f5fcf7]" : "border-[#e3e8ee] bg-white"}`}>
    <button type="button" onClick={onSelect} className="block min-h-[104px] w-full rounded-[18px] p-5 pe-12 text-start"><span className="block"><span className="flex items-start gap-3"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${selected ? "bg-[#dff5e5] text-[#2c8b4b]" : "bg-[#f1f4f7] text-[#75808d]"}`}><AddressIcon size={15} strokeWidth={1.8} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3 pe-10"><strong className="block min-w-0 truncate text-[15px] font-semibold text-[#171a1f]">{displayLabel}</strong><NationalAddressBadge showIcon={false} code={address.nationalCode || address.code} fallback={address.id === "work" ? "RQSA4543" : address.id === "friend" ? "RQSA6544" : "RQSA6774"} /></span></span></span><span className="mt-2 block w-full text-xs leading-5 text-[#4e5661] break-words whitespace-normal"><span className="block break-words whitespace-normal">{address.city}{addressParts[0] ? ` · ${addressParts[0]}` : ""}</span>{addressParts.length > 1 && <span className="block break-words whitespace-normal">{addressParts.slice(1).join(" · ")}</span>}</span><span className="mt-1 block w-full truncate text-[11px] text-[#7a838e]">{isArabic && address.id === "home" ? `جوال المستلم : ${displayPhone}` : `${displayRecipient} · ${displayPhone}`}</span></span></button>
    <button type="button" aria-label={`${isArabic ? "خيارات العنوان لـ" : "Address options for "}${displayLabel}`} aria-expanded={menuOpen} onClick={event => { event.stopPropagation(); setMenuOpen(open => !open); }} className="absolute end-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full text-[#7b8490] transition-colors hover:bg-[#f2f5f7] hover:text-[#252a30]"><MoreVertical size={17} /></button>
    {menuOpen && <div className="absolute end-2 top-11 z-20 min-w-28 rounded-xl border border-[#e3e7eb] bg-white p-1 shadow-lg"><button type="button" onClick={event => { event.stopPropagation(); editAddress(); }} className="block w-full rounded-lg px-3 py-2 text-start text-xs font-medium text-[#3f4852] hover:bg-[#f5f7f8]">Edit</button><button type="button" onClick={event => { event.stopPropagation(); removeAddress(); }} className="block w-full rounded-lg px-3 py-2 text-start text-xs font-medium text-[#b34b55] hover:bg-[#fff2f2]">Remove</button></div>}
  </article>;
}

function MobileDeliveryModeTabs({ active, onChange }: { active: "shipping" | "pickup"; onChange: (method: "shipping" | "pickup") => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  return <div role="tablist" aria-label={isArabic ? "طرق الاستلام" : "Receiving methods"} className="grid grid-cols-2 rounded-xl border border-[#e4e9f0] bg-[#f8fafc] p-1 md:hidden"><button type="button" role="tab" aria-selected={active === "shipping"} onClick={() => onChange("shipping")} className={active === "shipping" ? "flex h-10 items-center justify-center gap-2 rounded-lg bg-white text-xs font-semibold text-[#267b42] shadow-sm" : "flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[#6d7178]"}><Truck size={15} />{isArabic ? "التوصيل إلى العنوان" : "Delivery to address"}</button><button type="button" role="tab" aria-selected={active === "pickup"} onClick={() => onChange("pickup")} className={active === "pickup" ? "flex h-10 items-center justify-center gap-2 rounded-lg bg-white text-xs font-semibold text-[#267b42] shadow-sm" : "flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[#6d7178]"}><MapPin size={15} />{isArabic ? "الاستلام من الفرع" : "Pickup from branch"}</button></div>;
}

function AddressPickerModal({ addresses, selectedAddressId, draft, onSelect, onEdit, onRemove, onAdd, onDraftChange, onSave, onCancel, onClose, onSwitchToPickup }: { addresses: Address[]; selectedAddressId: string | null; draft: Address | null; onSelect: (id: string) => void; onEdit: (address: Address) => void; onRemove: (id: string) => void; onAdd: (addressType: "home" | "redbox") => void; onDraftChange: (field: keyof Address, value: string | boolean) => void; onSave: () => void; onCancel: () => void; onClose: () => void; onSwitchToPickup?: () => void }) {
  const [addressType, setAddressType] = useState<"home" | "redbox">(() => addresses.find(address => address.id === selectedAddressId)?.addressType ?? "home");
  const [pendingAddressId, setPendingAddressId] = useState<string | null>(null);
  const mobileDrag = useMobileSheetDrag(onClose);
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const visibleAddresses = addresses.filter(address => (address.addressType ?? "home") === addressType);
  return <div role="dialog" aria-modal="true" aria-label="Select delivery address" className="store-mobile-sheet-overlay fixed inset-0 z-[90] flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-5">
    <div style={mobileDrag.dragStyle} className="checkout-address-picker-sheet checkout-address-modal-surface store-mobile-sheet relative flex max-h-[min(720px,92vh)] w-full flex-col overflow-hidden rounded-t-3xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 shadow-2xl md:max-w-[680px] md:rounded-3xl md:px-7 md:pb-7 md:pt-6" onClick={event => event.stopPropagation()}>
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      {!draft && <MobileDeliveryModeTabs active="shipping" onChange={method => { if (method === "pickup") onSwitchToPickup?.(); }} />}
      {!draft && <button type="button" onClick={onClose} aria-label={isArabic ? "إغلاق اختيار العنوان" : "Close address picker"} className="absolute end-4 top-3 z-20 grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button>}
        {draft ? <div className="checkout-address-picker-content min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-0.5 pb-2 pt-3"><div className="checkout-address-form-shell rounded-none border-0 bg-transparent p-0 md:rounded-2xl md:border md:border-[#e3e8ee] md:bg-[#f8fafc] md:p-6"><AddressForm draft={draft} onChange={onDraftChange} onSave={onSave} onCancel={onCancel} /></div></div> : <>
          <div className="checkout-address-picker-content min-h-0 flex-1 overflow-y-auto pt-6"><div className="flex items-center justify-between gap-3 border-b border-[#edf0f3] pb-3"><span className="text-[11px] font-semibold text-[#7a8490]">{isArabic ? "نوع العنوان" : "Address type"}</span><div className="flex rounded-xl border border-[#e4e9f0] bg-[#f8fafc] p-1"><button type="button" onClick={() => { setAddressType("home"); setPendingAddressId(null); }} className={`flex h-9 items-center justify-center rounded-lg px-3 text-[11px] font-semibold transition-colors ${addressType === "home" ? "bg-white text-[#267b42] shadow-sm" : "text-[#6d7178] hover:text-[#3f4852]"}`}>{isArabic ? "منزلي" : "Home"}</button><button type="button" onClick={() => { setAddressType("redbox"); setPendingAddressId(null); }} className={`flex h-9 items-center justify-center rounded-lg px-3 text-[11px] font-semibold transition-colors ${addressType === "redbox" ? "bg-white text-[#267b42] shadow-sm" : "text-[#6d7178] hover:text-[#3f4852]"}`}>{isArabic ? "ريدبوكس" : "Redbox"}</button></div></div>
          <button type="button" onClick={() => onAdd(addressType)} className="checkout-address-picker-add mt-4 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[#171a1f] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#2c3036]"><Plus size={16} />{isArabic ? "إضافة عنوان جديد" : "Add new address"}</button>
          <div className="checkout-address-picker-list mt-4 space-y-3">{visibleAddresses.map(address => <SavedAddressCard key={address.id} address={address} selected={address.id === (pendingAddressId ?? selectedAddressId)} onSelect={() => setPendingAddressId(address.id)} onEdit={() => onEdit(address)} onRemove={() => onRemove(address.id)} />)}{!visibleAddresses.length && <div className="rounded-2xl border border-dashed border-[#dfe5ea] bg-white px-4 py-10 text-center text-xs text-[#737c87]">No {addressType === "redbox" ? "Redbox" : "home delivery"} addresses yet.</div>}</div>
          {pendingAddressId && <button type="button" onClick={() => { onSelect(pendingAddressId); onClose(); }} className="checkout-address-picker-confirm mt-4 h-11 w-full rounded-xl bg-[#171a1f] text-sm font-semibold text-white transition-colors hover:bg-[#2c3036]">Confirm address</button>}</div>
        </>}
    </div>
  </div>;
}

type ShippingMethod = "redbox" | "standard";

function ShippingMethods({ method, onChange }: { method: ShippingMethod; onChange: (method: ShippingMethod) => void }) {
  const methods: { id: ShippingMethod; title: string; description: string; price: "free" | number }[] = [
    { id: "redbox", title: "Redbox", description: "Free shipping on orders above 96 SAR", price: "free" },
    { id: "standard", title: "Standard", description: "Shipping fee 20 SAR", price: 20 },
  ];

  return <div className="mt-4">
    <p className="text-sm font-semibold">Shipping method</p>
    <div className="mt-2 space-y-2">
      {methods.map(option => <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${method === option.id ? "border-[#2c8b4b] bg-[#ecfdf1]" : "border-[#dfe4e8] bg-white hover:border-[#b8c1ca]"}`}>
        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${method === option.id ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{method === option.id && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span>
        <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="text-sm">{option.title}</strong><strong className="text-xs text-[#2c8b4b]">{option.price === "free" ? "Free" : <RiyalPrice value={option.price} />}</strong></span><small className="mt-1 block text-xs text-[#6d7178]">{option.description}</small></span>
      </button>)}
    </div>
  </div>;
}

type BranchAvailability = "full" | "partial" | "unavailable";
type StoreBranch = {
  id: string;
  name: string;
  kind?: "locker" | "counter";
  merchant?: string;
  rating?: string;
  reviews?: string;
  area: string;
  address: string;
  distance: string;
  hours: string;
  phone: string;
  availability: BranchAvailability;
  availabilityNote: string;
  latitude: number;
  longitude: number;
  position: { left: string; top: string };
};

const storeBranches: StoreBranch[] = [
  { id: "olaya", name: "Deraah · Al Olaya", area: "Riyadh", address: "King Fahd Road · Al Olaya", distance: "1.8 km", hours: "10:00 AM – 11:00 PM", phone: "9200 12345", availability: "full", availabilityNote: "All products ready for pickup", latitude: 24.7117, longitude: 46.6749, position: { left: "53%", top: "42%" } },
  { id: "nakheel", name: "Deraah · Al Nakheel", area: "Riyadh", address: "Northern Ring Road · Al Nakheel", distance: "4.6 km", hours: "10:00 AM – 11:00 PM", phone: "9200 12345", availability: "partial", availabilityNote: "Some products have limited stock", latitude: 24.7744, longitude: 46.6500, position: { left: "70%", top: "27%" } },
  { id: "malaz", name: "Deraah · Al Malaz", area: "Riyadh", address: "Salah Al Din Road · Al Malaz", distance: "6.2 km", hours: "10:00 AM – 11:00 PM", phone: "9200 12345", availability: "partial", availabilityNote: "Some products are unavailable", latitude: 24.6855, longitude: 46.7248, position: { left: "34%", top: "65%" } },
  { id: "kingdom", name: "Deraah · Kingdom Centre", area: "Riyadh", address: "Olaya Street · Kingdom Centre", distance: "8.9 km", hours: "10:00 AM – 12:00 AM", phone: "9200 12345", availability: "unavailable", availabilityNote: "Pickup is not available for this order", latitude: 24.7111, longitude: 46.6740, position: { left: "27%", top: "31%" } },
];

const redboxBranches: StoreBranch[] = [
  { id: "rb-340", name: "RedBox RUH-9871", kind: "locker", merchant: "SACO Market · Al Faruq", rating: "4.5", reviews: "441", area: "Riyadh", address: "Eastern Ring Branch Road, Al Faruq, Exit 16 · Al Faruq · Riyadh", distance: "264 m", hours: "10:00 AM – 11:00 PM", phone: "9200 12345", availability: "full", availabilityNote: "All products ready for pickup", latitude: 24.7117, longitude: 46.6749, position: { left: "53%", top: "42%" } },
  { id: "rb-299", name: "RedBox RUH-C-1484", kind: "counter", merchant: "Bin Hamoodah · Al Jazirah", rating: "4.5", reviews: "279", area: "Riyadh", address: "Eastern Ring Branch Road, Al Jazirah · Al Jazirah · Riyadh", distance: "693 m", hours: "10:00 AM – 11:00 PM", phone: "9200 12345", availability: "full", availabilityNote: "All products ready for pickup", latitude: 24.6855, longitude: 46.7248, position: { left: "34%", top: "65%" } },
  { id: "rb-122", name: "RedBox RUH-C-12645", kind: "counter", merchant: "Kyan Café · Al Safa", rating: "4.5", reviews: "198", area: "Riyadh", address: "Eastern Ring Branch Road, Al Safa · Al Safa · Riyadh", distance: "1.5 km", hours: "10:00 AM – 11:00 PM", phone: "9200 12345", availability: "partial", availabilityNote: "Some products have limited stock", latitude: 24.7744, longitude: 46.6500, position: { left: "70%", top: "27%" } },
  { id: "rb-088", name: "RedBox RUH-C-10751", kind: "counter", merchant: "Meed Market · Ar Rawabi", rating: "4.4", reviews: "156", area: "Riyadh", address: "Prince Saad Bin Abdulrahman Road · Ar Rawabi · Riyadh", distance: "2.6 km", hours: "10:00 AM – 12:00 AM", phone: "9200 12345", availability: "partial", availabilityNote: "Some products have limited stock", latitude: 24.7111, longitude: 46.6740, position: { left: "27%", top: "31%" } },
];

function loadSelectedBranchId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("deraah-selected-branch");
}

function availabilityCopy(status: BranchAvailability) {
  return status === "full" ? { label: "Available for pickup", tone: "text-[#208447] bg-[#ecfdf1]", icon: CheckCircle2 } : status === "partial" ? { label: "Partially available", tone: "text-[#9a6700] bg-[#fff8df]", icon: AlertCircle } : { label: "Unavailable", tone: "text-[#b42318] bg-[#fff0ef]", icon: AlertCircle };
}

function branchMarkerTone(status: BranchAvailability) {
  return status === "full" ? "bg-[#2c8b4b] text-white" : status === "partial" ? "bg-[#d99a16] text-white" : "bg-[#8b929c] text-white";
}

function branchPickupSummary(status: BranchAvailability) {
  return status === "full" ? "Ready after order confirmation" : status === "partial" ? "Limited stock · confirm availability" : "Unavailable for pickup";
}

function openStreetMapEmbedUrl(branch?: StoreBranch) {
  const bbox = "46.58,24.63,46.80,24.84";
  const marker = branch ? `&marker=${branch.latitude},${branch.longitude}` : "";
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
}

type RedBoxFilterState = { locationType: "all" | "locker" | "counter"; service: "all" | "pickup"; capacity: "any" | "small" | "medium" | "large" };

const defaultRedBoxFilters: RedBoxFilterState = { locationType: "all", service: "all", capacity: "any" };

function RedBoxPointIcon({ kind, size = 18 }: { kind?: "locker" | "counter"; size?: number }) {
  return kind === "locker" ? <PackageOpen size={size} strokeWidth={1.9} /> : <ShoppingCart size={size} strokeWidth={1.9} />;
}

function RedBoxBranchPickerModal({ items, onSelect, onClose }: { items: StoreCartItem[]; onSelect: (branch: StoreBranch) => void; onClose: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const mobileDrag = useMobileSheetDrag(onClose);
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<RedBoxFilterState>(defaultRedBoxFilters);
  const [draftFilters, setDraftFilters] = useState<RedBoxFilterState>(defaultRedBoxFilters);
  const [selectedId, setSelectedId] = useState(redboxBranches[0]?.id ?? null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const searchQuery = query.trim().toLowerCase();
  const visiblePoints = useMemo(() => redboxBranches.filter(point => {
    const matchesQuery = !searchQuery || `${point.name} ${point.merchant ?? ""} ${point.area} ${point.address}`.toLowerCase().includes(searchQuery);
    const matchesType = filters.locationType === "all" || point.kind === filters.locationType;
    return matchesQuery && matchesType;
  }), [filters.locationType, searchQuery]);
  const selectedPoint = visiblePoints.find(point => point.id === selectedId) ?? visiblePoints[0];

  useEffect(() => {
    if (selectedPoint && selectedPoint.id !== selectedId) setSelectedId(selectedPoint.id);
  }, [selectedId, selectedPoint]);

  const text = (english: string, arabic: string) => isArabic ? arabic : english;
  const filterChanged = JSON.stringify(filters) !== JSON.stringify(defaultRedBoxFilters);
  const getPointKind = (point: StoreBranch) => point.kind === "locker" ? text("Locker", "خزانة") : text("Counter", "كاونتر");

  const pointList = visiblePoints.map(point => <button key={point.id} type="button" disabled={point.availability === "unavailable"} onClick={() => { setSelectedId(point.id); onSelect(point); }} className="w-full rounded-2xl border border-[#edf0f3] bg-white p-4 text-start shadow-[0_4px_18px_rgba(34,45,56,.06)] transition hover:-translate-y-0.5 hover:border-[#f05a42] hover:shadow-[0_8px_24px_rgba(34,45,56,.1)] disabled:cursor-not-allowed disabled:opacity-60"><span className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#df2b10] text-white"><RedBoxPointIcon kind={point.kind} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="min-w-0"><strong className="block text-sm font-semibold text-[#171a1f]">{point.name} <span className="font-normal text-[#d9290c]">- {getPointKind(point)}</span></strong><span className="mt-1 block text-xs text-[#3f4852]">{point.merchant}</span></span><span className="flex shrink-0 items-center gap-1 text-[11px] text-[#3f4852]"><Truck size={13} />{point.distance}</span></span><span className="mt-4 block text-sm leading-5 text-[#5f6873]">{point.address}</span><span className="mt-3 flex items-center gap-2 text-[11px] text-[#69727d]"><span className="text-[#ffd000]">★★★★★</span><span>{point.rating ?? "4.5"}</span><span>({point.reviews ?? "279"})</span></span></span></span></button>);

  return <><div role="dialog" aria-modal="true" aria-label={text("Choose a RedBox point", "اختيار نقطة ريدبوكس")} className="store-mobile-sheet-overlay fixed inset-0 z-[100] flex items-end bg-black/40 p-0 backdrop-blur-[3px] md:items-center md:justify-center md:p-5"><section style={mobileDrag.dragStyle} className="relative flex h-[min(780px,94vh)] max-h-[min(780px,94vh)] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl bg-[#fbfcfd] shadow-2xl md:max-w-[760px] md:rounded-3xl" onClick={event => event.stopPropagation()}><MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} /><header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#edf0f3] bg-white px-4 pb-3 pt-4 md:px-6"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#d9290c]">{text("RED BOX PICKUP", "استلام ريدبوكس")}</p><h2 className="mt-1 text-lg font-semibold text-[#171a1f]">{text("Find a RedBox point", "اختر نقطة ريدبوكس")}</h2></div><button type="button" onClick={onClose} aria-label={text("Close RedBox picker", "إغلاق اختيار ريدبوكس")} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63] hover:bg-[#e9edf1]"><X size={18} /></button></header>
      <div className="shrink-0 bg-white px-4 pb-3 pt-3 md:px-6"><div className="flex items-center gap-2"><div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#cfd6dd] bg-white px-3 focus-within:border-[#171a1f] focus-within:ring-2 focus-within:ring-black/5"><Search size={18} className="shrink-0 text-[#363d45]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={text("Search by address...", "ابحث بالعنوان أو المنطقة...")} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><button type="button" onClick={() => { setDraftFilters(filters); setFilterOpen(true); }} aria-label={text("Open RedBox filters", "فتح فلاتر ريدبوكس")} className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors ${filterChanged ? "border-[#171a1f] bg-[#f4f5f6]" : "border-[#cfd6dd] bg-white"}`}><SlidersHorizontal size={18} /></button></div>{view === "list" && <p className="mt-3 text-sm font-semibold text-[#20252b]">{text("Found 192 points within 10km", "تم العثور على 192 نقطة ضمن 10 كم")}</p>}</div>
      {view === "list" ? <div className="min-h-0 flex-1 overflow-y-auto bg-[#fafafa] px-4 pb-3 pt-1 md:px-6"><div className="space-y-3">{pointList}{!visiblePoints.length && <p className="py-12 text-center text-sm text-[#6d7178]">{text("No RedBox points match your search.", "لا توجد نقاط ريدبوكس مطابقة لبحثك.")}</p>}</div><div className="sticky bottom-0 z-20 flex justify-center bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent pb-2 pt-6"><button type="button" onClick={() => setView("map")} className="rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(111,125,255,.28)] transition hover:bg-[#5f6ff2]">{text("View on map", "عرض على الخريطة")}</button></div></div> : <div className="relative min-h-0 flex-1 overflow-hidden bg-[#dfe7e7]"><iframe title="RedBox map" src={openStreetMapEmbedUrl(selectedPoint)} className="absolute inset-0 h-full w-full border-0" loading="lazy" /><div className="absolute inset-0 z-10 pointer-events-none">{visiblePoints.map(point => <button key={point.id} type="button" onClick={() => { setSelectedId(point.id); setDetailsOpen(false); }} aria-label={point.name} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ef3218] p-1.5 text-white shadow-lg transition hover:scale-110 ${point.id === selectedPoint?.id ? "ring-2 ring-[#171a1f] ring-offset-2" : ""}`} style={point.position}><MapPin size={22} fill="currentColor" strokeWidth={1.8} /></button>)}</div>{selectedPoint && <article className="absolute inset-x-3 top-3 z-20 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(29,37,45,.18)]"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#df2b10] text-white"><RedBoxPointIcon kind={selectedPoint.kind} /></span><div className="min-w-0 flex-1"><strong className="block text-sm text-[#171a1f]">{selectedPoint.name} <span className="font-normal text-[#d9290c]">- {getPointKind(selectedPoint)}</span></strong><span className="mt-1 block text-xs text-[#4f5964]">{selectedPoint.merchant}</span></div></div><div className="mt-2 flex items-center gap-2 text-xs"><span className="text-[#ffd000]">★★★★★</span><span>{selectedPoint.rating ?? "4.5"}</span><span className="text-[#87909a]">({selectedPoint.reviews ?? "279"})</span></div><p className="mt-3 text-sm leading-5 text-[#68717b]">{selectedPoint.address}</p>{detailsOpen && <div className="mt-3 rounded-xl bg-[#f7f8fa] p-3 text-xs leading-5 text-[#5d6670]">{selectedPoint.availabilityNote} · {selectedPoint.hours}</div>}<button type="button" onClick={() => setDetailsOpen(value => !value)} className="mt-2 text-xs font-semibold text-[#6678ff] underline underline-offset-2">{detailsOpen ? text("Hide details", "إخفاء التفاصيل") : text("Detail", "التفاصيل")} <ChevronDown size={13} className={`inline transition-transform ${detailsOpen ? "rotate-180" : ""}`} /></button><div className="mt-3 flex gap-2"><button type="button" onClick={() => setDetailsOpen(value => !value)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f5f6f8] text-[#20252b]" aria-label={text("Share", "مشاركة")}><Link2 size={17} /></button><button type="button" onClick={() => onSelect(selectedPoint)} className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#6f7dff] text-sm font-semibold text-white">{text("Select this point", "اختيار هذه النقطة")}</button></div></article>}<button type="button" onClick={() => setView("list")} className="absolute inset-x-0 bottom-4 z-20 mx-auto w-fit rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(111,125,255,.28)]">{text("View list", "عرض القائمة")}</button><span className="absolute bottom-4 end-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white text-[#363d45] shadow-lg"><PackageOpen size={18} /></span></div>}
      {filterOpen && createPortal(<div role="dialog" aria-modal="true" aria-label={text("RedBox filters", "فلاتر ريدبوكس")} className="fixed inset-0 z-[210] flex items-end bg-black/35 backdrop-blur-[2px] md:items-center md:justify-center md:p-5" onClick={() => setFilterOpen(false)}><section className="w-full rounded-t-3xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-2xl md:max-w-[520px] md:rounded-3xl" onClick={event => event.stopPropagation()}><div className="mx-auto h-1 w-10 rounded-full bg-[#d8dde3]" /><header className="flex items-center justify-between gap-3 border-b border-[#edf0f3] py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#d9290c]">{text("FILTERS", "الفلاتر")}</p><h2 className="mt-1 text-lg font-semibold text-[#171a1f]">{text("Refine your search", "تصفية نقاط ريدبوكس")}</h2></div><button type="button" onClick={() => setFilterOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63]"><X size={17} /></button></header><div className="space-y-4 py-4"><label className="block"><span className="mb-2 block text-sm font-medium text-[#454d56]">{text("Location Type", "نوع الموقع")}</span><span className="relative block"><select value={draftFilters.locationType} onChange={event => setDraftFilters(current => ({ ...current, locationType: event.target.value as RedBoxFilterState["locationType"] }))} className="h-11 w-full appearance-none rounded-lg border border-[#cfd6dd] bg-white px-3 text-sm outline-none"><option value="all">{text("All", "الكل")}</option><option value="locker">{text("Locker", "خزانة")}</option><option value="counter">{text("Counter", "كاونتر")}</option></select><ChevronDown size={15} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#68717b]" /></span></label><label className="block"><span className="mb-2 block text-sm font-medium text-[#454d56]">{text("Service Needed", "الخدمة المطلوبة")}</span><span className="relative block"><select value={draftFilters.service} onChange={event => setDraftFilters(current => ({ ...current, service: event.target.value as RedBoxFilterState["service"] }))} className="h-11 w-full appearance-none rounded-lg border border-[#cfd6dd] bg-white px-3 text-sm outline-none"><option value="all">{text("Show All Services", "عرض كل الخدمات")}</option><option value="pickup">{text("Parcel pickup", "استلام الطرود")}</option></select><ChevronDown size={15} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#68717b]" /></span></label><p className="flex items-start gap-2 text-sm font-semibold leading-5 text-[#20252b]"><AlertCircle size={15} className="mt-0.5 shrink-0 text-[#356eff]" />{text("Parcel pickup is supported at all RedBox locations by default", "استلام الطرود مدعوم في جميع مواقع ريدبوكس بشكل افتراضي")}</p><label className="block"><span className="mb-2 block text-sm font-medium text-[#454d56]">{text("Size Capacity", "السعة")}</span><span className="relative block"><select value={draftFilters.capacity} onChange={event => setDraftFilters(current => ({ ...current, capacity: event.target.value as RedBoxFilterState["capacity"] }))} className="h-11 w-full appearance-none rounded-lg border border-[#cfd6dd] bg-white px-3 text-sm outline-none"><option value="any">{text("Any size", "أي سعة")}</option><option value="small">{text("Small", "صغيرة")}</option><option value="medium">{text("Medium", "متوسطة")}</option><option value="large">{text("Large", "كبيرة")}</option></select><ChevronDown size={15} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#68717b]" /></span></label></div><div className="flex gap-3 border-t border-[#dfe4e8] pt-4"><button type="button" onClick={() => setFilterOpen(false)} className="h-11 flex-1 rounded-full border border-[#d9e0e6] bg-white text-sm font-semibold text-[#505862]">{text("Cancel", "إلغاء")}</button><button type="button" disabled={JSON.stringify(draftFilters) === JSON.stringify(filters)} onClick={() => { setFilters(draftFilters); setFilterOpen(false); }} className="h-11 flex-1 rounded-full bg-[#a5a5a8] text-sm font-semibold text-white disabled:cursor-not-allowed">{text("Apply", "تطبيق")}</button></div></section></div>, document.body)}
    </section></div></>;
}

function BranchPickerModal({ items, selectedBranchId, branchType = "deraah", onSelect, onClose, onSwitchToShipping }: { items: StoreCartItem[]; selectedBranchId: string | null; branchType?: "deraah" | "redbox"; onSelect: (branch: StoreBranch) => void; onClose: () => void; onSwitchToShipping?: () => void }) {
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "availability">("nearest");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const mobileDrag = useMobileSheetDrag(onClose);
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const isRedbox = branchType === "redbox";
  const availableBranches = isRedbox ? redboxBranches : storeBranches;
  const filteredBranches = availableBranches.filter(branch => `${branch.name} ${branch.area} ${branch.address}`.toLowerCase().includes(query.toLowerCase().trim()));
  const availabilityRank = { full: 0, partial: 1, unavailable: 2 };
  const visibleBranches = [...filteredBranches].sort((a, b) => sort === "availability" ? availabilityRank[a.availability] - availabilityRank[b.availability] : Number.parseFloat(a.distance) - Number.parseFloat(b.distance));
  const [mapBranchId, setMapBranchId] = useState(selectedBranchId ?? visibleBranches[0]?.id ?? null);
  const mapBranch = visibleBranches.find(branch => branch.id === mapBranchId) ?? visibleBranches[0];
  const orderedMapBranches = mapBranch ? [mapBranch, ...visibleBranches.filter(branch => branch.id !== mapBranch.id)] : visibleBranches;
  const branchCards = visibleBranches.map(branch => {
    const copy = availabilityCopy(branch.availability);
    const StatusIcon = copy.icon;
    return <article key={branch.id} role="button" tabIndex={branch.availability === "unavailable" ? -1 : 0} aria-disabled={branch.availability === "unavailable"} onClick={() => { if (branch.availability !== "unavailable") onSelect(branch); }} onKeyDown={event => { if ((event.key === "Enter" || event.key === " ") && branch.availability !== "unavailable") { event.preventDefault(); onSelect(branch); } }} className={`rounded-xl border bg-white p-3 transition-colors ${branch.id === selectedBranchId ? "border-[#2c8b4b] bg-[#f7fcf8]" : "border-[#e2e7eb]"} ${branch.availability === "unavailable" ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:border-[#8dc5a0]"}`}><div className="flex items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${copy.tone}`}><MapPin size={20} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h4 className="text-sm font-semibold">{branch.name}</h4><p className="mt-1 text-xs text-[#6d7178]">{branch.address}</p></div><div className="flex shrink-0 items-center gap-2"><strong className="text-xs text-[#555b63]">{branch.distance}</strong><span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${branch.id === selectedBranchId ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{branch.id === selectedBranchId && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span></div></div><div className="mt-2 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${copy.tone}`}><StatusIcon size={12} />{copy.label}</span><span className="text-[10px] text-[#6d7178]">{items.length} products checked</span></div><p className="mt-2 text-xs text-[#6d7178]">{branchPickupSummary(branch.availability)}</p><div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[#6d7178]"><span className="inline-flex items-center gap-1"><Clock3 size={12} />{branch.hours}</span><span className="inline-flex items-center gap-1"><Phone size={12} />{branch.phone}</span></div></div></div></article>;
  });
  const sortOptions = [
    { value: "nearest" as const, label: isArabic ? "الأقرب" : "Nearest", description: isArabic ? "عرض الفروع الأقرب لموقعك أولاً" : "Show the closest branches first" },
    { value: "availability" as const, label: isArabic ? "التوفر" : "Availability", description: isArabic ? "عرض الفروع حسب توفر المنتجات" : "Show branches by product availability" },
  ];
  const selectedSort = sortOptions.find(option => option.value === sort) ?? sortOptions[0];

  return <><div role="dialog" aria-modal="true" aria-label={isRedbox ? (isArabic ? "اختيار نقطة ريدبوكس" : "Choose a RedBox point") : (isArabic ? "اختيار فرع درعه" : "Choose a Deraah branch")} className="branch-picker store-mobile-sheet-overlay fixed inset-0 z-[100] flex items-end bg-black/40 p-0 backdrop-blur-[3px] md:items-center md:justify-center md:p-5"><div style={mobileDrag.dragStyle} className="branch-picker-panel checkout-address-modal-surface store-mobile-sheet relative flex max-h-[min(760px,92vh)] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-[760px] md:rounded-3xl" onClick={event => event.stopPropagation()}>
    <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
    {isRedbox ? <header className="border-b border-[#edf0f3] px-5 pb-4 pt-5 md:px-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f8f2] text-[#2c8b4b]"><MapPin size={20} /></span><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#208447]">{isArabic ? "عنوان ريدبوكس" : "RedBox address"}</p><h2 className="mt-1 text-lg font-semibold text-[#171a1f]">{isArabic ? "عنوان ريدبوكس جديد" : "New RedBox address"}</h2></div></div></header> : <div className="px-5 pt-3 md:hidden"><MobileDeliveryModeTabs active="pickup" onChange={method => { if (method === "shipping") onSwitchToShipping?.(); }} /></div>}
    <button type="button" onClick={onClose} aria-label={isArabic ? "إغلاق اختيار الفرع" : "Close branch picker"} className="absolute end-4 top-3 z-20 grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button>
    <div className="branch-picker-controls shrink-0 border-b border-[#e8edf1] bg-white p-5 md:p-7"><div className="flex items-center gap-2 rounded-xl border border-[#dfe5ea] bg-white px-3 transition-colors focus-within:border-[#2c8b4b] focus-within:ring-2 focus-within:ring-[#2c8b4b]/10"><Search size={17} className="shrink-0 text-[#8a919a]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={isRedbox ? (isArabic ? "ابحث حسب المنطقة أو نقطة ريدبوكس" : "Search by area or RedBox point") : (isArabic ? "ابحث حسب المنطقة أو الفرع" : "Search by area or branch")} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><div className="mt-4 flex items-center justify-between gap-3"><div className="flex rounded-xl border border-[#e4e9f0] bg-[#f8fafc] p-1"><button type="button" onClick={() => setView("list")} className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${view === "list" ? "bg-white text-[#267b42] shadow-sm" : "text-[#6d7178]"}`}><List size={15} /> {isArabic ? "قائمة" : "List"}</button><button type="button" onClick={() => setView("map")} className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${view === "map" ? "bg-white text-[#267b42] shadow-sm" : "text-[#6d7178]"}`}><MapIcon size={15} /> {isArabic ? "خريطة" : "Map"}</button></div><label className="flex items-center gap-2 text-xs font-semibold text-[#6d7178]"><span>{isArabic ? "ترتيب" : "Sort"}</span><button type="button" onClick={() => setSortSheetOpen(true)} aria-haspopup="dialog" aria-expanded={sortSheetOpen} className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe5ea] bg-white px-3 text-xs font-semibold text-[#3f4852] md:hidden">{selectedSort.label}<ChevronDown aria-hidden="true" size={13} className="text-[#6d7178]" /></button><span className="relative hidden md:inline-flex"><select aria-label={isArabic ? "ترتيب الفروع" : "Sort branches"} value={sort} onChange={event => setSort(event.target.value as "nearest" | "availability")} className="appearance-none rounded-lg border border-[#dfe5ea] bg-white py-1.5 ps-3 pe-8 text-xs font-semibold text-[#3f4852] outline-none"><option value="nearest">{isArabic ? "الأقرب" : "Nearest"}</option><option value="availability">{isArabic ? "التوفر" : "Availability"}</option></select><ChevronDown aria-hidden="true" size={13} className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[#6d7178]" /></span></label></div></div>
    {view === "map" ? <div className="branch-picker-map branch-map relative min-h-0 flex-1 overflow-hidden bg-[#dfe9ed] md:h-[min(650px,calc(92vh-220px))] md:min-h-[520px]"><iframe title={isRedbox ? "RedBox point map" : "Deraah branch map"} src={openStreetMapEmbedUrl(mapBranch)} className="absolute inset-0 h-full w-full border-0" loading="lazy" /><div className="absolute inset-0 z-10 pointer-events-none">{visibleBranches.map(branch => <button key={branch.id} type="button" aria-label={`${branch.name} · ${availabilityCopy(branch.availability).label}`} onClick={() => setMapBranchId(branch.id)} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white p-1 shadow-lg transition-transform hover:scale-110 ${branchMarkerTone(branch.availability)} ${branch.id === mapBranch?.id ? "ring-2 ring-[#171a1f] ring-offset-2" : ""}`} style={branch.position}><MapPin size={25} fill="currentColor" strokeWidth={1.8} /></button>)}</div><div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-2"><span className="rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-[#555b63] shadow-sm">{isArabic ? `الرياض · ${visibleBranches.length} ${isRedbox ? "نقاط ريدبوكس" : "فروع"}` : `Riyadh · ${visibleBranches.length} ${isRedbox ? "RedBox points" : "branches"}`}</span><span className="rounded-full bg-white/95 px-3 py-2 text-[10px] text-[#555b63] shadow-sm">OpenStreetMap</span></div><div className="absolute inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-20 flex items-end gap-2 overflow-x-auto pb-1">{orderedMapBranches.map(branch => <button key={branch.id} type="button" disabled={branch.availability === "unavailable"} onClick={() => onSelect(branch)} className={`flex min-w-[196px] shrink-0 items-start gap-2 rounded-xl border bg-white p-3 text-left shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-80 ${branch.id === mapBranch?.id ? "border-[#2c8b4b]" : "border-white"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${branch.id === mapBranch?.id ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{branch.id === mapBranch?.id && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span><span className="min-w-0"><strong className="block text-[11px]">{branch.name}</strong><span className="mt-1 block text-[10px] text-[#6d7178]">{branch.distance} · {availabilityCopy(branch.availability).label}</span></span></button>)}</div></div> : <div className="branch-picker-list min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f8fafc] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-5 md:px-7 md:pb-7">{branchCards}{!visibleBranches.length && <p className="py-10 text-center text-sm text-[#6d7178]">{isArabic ? "لا توجد نقاط مطابقة لبحثك." : "No branches match your search."}</p>}</div>}
  </div></div>{sortSheetOpen && createPortal(<div role="dialog" aria-modal="true" aria-labelledby="branch-sort-title" className="fixed inset-0 z-[180] flex items-end bg-black/40 backdrop-blur-[2px] md:hidden" onClick={() => setSortSheetOpen(false)}><section className="w-full rounded-t-3xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-2xl" onClick={event => event.stopPropagation()}><div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#d9dee5]" /><header className="flex items-center justify-between gap-3 border-b border-[#edf0f3] py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8a919a]">{isArabic ? "ترتيب الفروع" : "Branch sorting"}</p><h2 id="branch-sort-title" className="mt-1 text-base font-semibold text-[#171a1f]">{isArabic ? "اختر طريقة الترتيب" : "Choose sorting"}</h2></div><button type="button" onClick={() => setSortSheetOpen(false)} aria-label={isArabic ? "إغلاق الترتيب" : "Close sorting"} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63]"><X size={17} /></button></header><div className="space-y-2 pt-4">{sortOptions.map(option => <button key={option.value} type="button" onClick={() => { setSort(option.value); setSortSheetOpen(false); }} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-start transition-colors ${sort === option.value ? "border-[#8fd3a5] bg-[#f5fcf7]" : "border-[#e3e8ee] bg-white hover:bg-[#f8fafc]"}`}><span className="min-w-0"><strong className="block text-sm font-semibold text-[#171a1f]">{option.label}</strong><span className="mt-1 block text-xs text-[#6d7178]">{option.description}</span></span><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${sort === option.value ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{sort === option.value && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span></button>)}</div></section></div>, document.body)}</>;
}

function DeraahBranchPickerModal({ items, selectedBranchId, onSelect, onClose }: { items: StoreCartItem[]; selectedBranchId: string | null; onSelect: (branch: StoreBranch) => void; onClose: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const mobileDrag = useMobileSheetDrag(onClose);
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "availability">("nearest");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [mapBranchId, setMapBranchId] = useState<string | null>(null);
  const searchQuery = query.trim().toLowerCase();
  const availabilityRank = { full: 0, partial: 1, unavailable: 2 };
  const visibleBranches = useMemo(() => storeBranches.filter(branch => `${branch.name} ${branch.area} ${branch.address}`.toLowerCase().includes(searchQuery)).sort((a, b) => sort === "availability" ? availabilityRank[a.availability] - availabilityRank[b.availability] : Number.parseFloat(a.distance) - Number.parseFloat(b.distance)), [searchQuery, sort]);
  const mapBranch = visibleBranches.find(branch => branch.id === mapBranchId);
  const distanceBranches = [...visibleBranches].sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance));
  const text = (english: string, arabic: string) => isArabic ? arabic : english;
  const sortOptions = [
    { value: "nearest" as const, label: text("Nearest", "الأقرب"), description: text("Show the closest branches first", "عرض الفروع الأقرب لموقعك أولاً") },
    { value: "availability" as const, label: text("Availability", "التوفر"), description: text("Show branches by product availability", "عرض الفروع حسب توفر المنتجات") },
  ];
  const selectedSort = sortOptions.find(option => option.value === sort) ?? sortOptions[0];
  const toggleLabel = view === "list" ? text("View on map", "عرض على الخريطة") : text("View list", "عرض القائمة");
  const branchCards = visibleBranches.map(branch => {
    const copy = availabilityCopy(branch.availability);
    const StatusIcon = copy.icon;
    return <button key={branch.id} type="button" disabled={branch.availability === "unavailable"} onClick={() => onSelect(branch)} className={`w-full rounded-2xl border bg-white p-4 text-start shadow-[0_4px_16px_rgba(34,45,56,.05)] transition hover:-translate-y-0.5 hover:border-[#8dc5a0] disabled:cursor-not-allowed disabled:opacity-70 ${branch.id === selectedBranchId ? "border-[#2c8b4b] bg-[#f7fcf8]" : "border-[#e2e7eb]"}`}><span className="flex items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${copy.tone}`}><MapPin size={19} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="min-w-0"><strong className="block text-sm font-semibold text-[#171a1f]">{branch.name}</strong><span className="mt-1 block text-xs text-[#68717b]">{branch.address}</span></span><span className="shrink-0 text-xs font-semibold text-[#555b63]">{branch.distance}</span></span><span className="mt-3 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${copy.tone}`}><StatusIcon size={12} />{isArabic ? (branch.availability === "full" ? "متاح للاستلام" : branch.availability === "partial" ? "متاح جزئياً" : "غير متاح") : copy.label}</span><span className="text-[10px] text-[#6d7178]">{items.length} {text("products checked", "منتجات تم التحقق منها")}</span></span><span className="mt-2 block text-xs text-[#6d7178]">{isArabic ? (branch.availability === "full" ? "جاهز بعد تأكيد الطلب" : branch.availability === "partial" ? "مخزون محدود · تأكد من التوفر" : "غير متاح للاستلام") : branchPickupSummary(branch.availability)}</span><span className="mt-3 flex flex-wrap gap-3 text-[10px] text-[#6d7178]"><span className="inline-flex items-center gap-1"><Clock3 size={12} />{branch.hours}</span><span className="inline-flex items-center gap-1"><Phone size={12} />{branch.phone}</span></span></span></span></button>;
  });

  return <><div role="dialog" aria-modal="true" aria-label={text("Choose a Deraah branch", "اختيار فرع درعه")} className="store-mobile-sheet-overlay fixed inset-0 z-[100] flex items-end bg-black/40 p-0 backdrop-blur-[3px] md:items-center md:justify-center md:p-5"><section style={mobileDrag.dragStyle} className="relative flex h-[min(760px,92vh)] max-h-[min(760px,92vh)] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl bg-[#fbfcfd] shadow-2xl md:max-w-[760px] md:rounded-3xl" onClick={event => event.stopPropagation()}><MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} /><header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#edf0f3] bg-white px-5 pb-4 pt-5 md:px-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f8f2] text-[#2c8b4b]"><MapPin size={20} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#208447]">{text("DERAAH PICKUP", "استلام من فروع درعه")}</p><h2 className="mt-1 text-lg font-semibold text-[#171a1f]">{text("Choose a pickup branch", "اختر فرعاً للاستلام")}</h2></div></div><button type="button" onClick={onClose} aria-label={text("Close branch picker", "إغلاق اختيار الفرع")} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63] hover:bg-[#e9edf1]"><X size={18} /></button></header><div className="shrink-0 border-b border-[#e8edf1] bg-white p-4 md:p-6"><div className="flex items-center gap-2"><div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#dfe5ea] bg-white px-3 focus-within:border-[#2c8b4b] focus-within:ring-2 focus-within:ring-[#2c8b4b]/10"><Search size={17} className="shrink-0 text-[#8a919a]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={text("Search by area or branch", "ابحث حسب المنطقة أو الفرع")} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><button type="button" onClick={() => setSortSheetOpen(true)} aria-haspopup="dialog" aria-expanded={sortSheetOpen} className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-[#dfe5ea] bg-white px-3 text-xs font-semibold text-[#3f4852] hover:border-[#b8c1ca]">{selectedSort.label}<ChevronDown size={14} className="text-[#6d7178]" /></button></div></div>{view === "list" ? <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-4 pb-2 pt-4 md:px-6"><div className="space-y-3">{branchCards}{!visibleBranches.length && <p className="py-10 text-center text-sm text-[#6d7178]">{text("No branches match your search.", "لا توجد فروع مطابقة لبحثك.")}</p>}</div><div className="sticky bottom-0 z-20 flex justify-center bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent pb-2 pt-6"><button type="button" onClick={() => setView("map")} className="rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(111,125,255,.28)]">{toggleLabel}</button></div></div> : <div className="relative min-h-0 flex-1 overflow-hidden bg-[#dfe9ed]"><iframe title="Deraah branch map" src={openStreetMapEmbedUrl(mapBranch)} className="absolute inset-0 h-full w-full border-0" loading="lazy" /><div className="absolute inset-0 z-10 pointer-events-none">{visibleBranches.map(branch => <button key={branch.id} type="button" aria-label={branch.name} onClick={() => setMapBranchId(branch.id)} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white p-1.5 shadow-lg transition hover:scale-110 ${branchMarkerTone(branch.availability)} ${branch.id === mapBranch?.id ? "ring-2 ring-[#171a1f] ring-offset-2" : ""}`} style={branch.position}><MapPin size={25} fill="currentColor" /></button>)}</div>{mapBranch && <article className="absolute inset-x-3 top-3 z-20 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(29,37,45,.18)]"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f8f2] text-[#2c8b4b]"><MapPin size={20} /></span><div className="min-w-0 flex-1"><strong className="block text-sm text-[#171a1f]">{mapBranch.name}</strong><span className="mt-1 block text-xs text-[#68717b]">{mapBranch.address}</span><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#ecfdf1] px-2 py-1 text-[10px] font-semibold text-[#208447]">{availabilityCopy(mapBranch.availability).label} · {mapBranch.distance}</span></div></div><button type="button" disabled={mapBranch.availability === "unavailable"} onClick={() => onSelect(mapBranch)} className="mt-3 h-11 w-full rounded-xl bg-[#6f7dff] text-sm font-semibold text-white disabled:bg-[#a5aab2]">{text("Select this branch", "اختيار هذا الفرع")}</button></article>}<button type="button" onClick={() => setView("list")} className="absolute inset-x-0 bottom-4 z-20 mx-auto w-fit rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(111,125,255,.28)]">{toggleLabel}</button></div>}</section></div>{sortSheetOpen && createPortal(<div role="dialog" aria-modal="true" aria-labelledby="deraah-sort-title" className="fixed inset-0 z-[180] flex items-end bg-black/40 backdrop-blur-[2px] md:hidden" onClick={() => setSortSheetOpen(false)}><section className="w-full rounded-t-3xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-2xl" onClick={event => event.stopPropagation()}><div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#d9dee5]" /><header className="flex items-center justify-between gap-3 border-b border-[#edf0f3] py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8a919a]">{text("BRANCH SORTING", "ترتيب الفروع")}</p><h2 id="deraah-sort-title" className="mt-1 text-base font-semibold text-[#171a1f]">{text("Choose sorting", "اختر طريقة الترتيب")}</h2></div><button type="button" onClick={() => setSortSheetOpen(false)} aria-label={text("Close sorting", "إغلاق الترتيب")} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63]"><X size={17} /></button></header><div className="space-y-2 pt-4">{sortOptions.map(option => <button key={option.value} type="button" onClick={() => { setSort(option.value); setSortSheetOpen(false); }} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-start ${sort === option.value ? "border-[#8fd3a5] bg-[#f5fcf7]" : "border-[#e3e8ee] bg-white"}`}><span><strong className="block text-sm font-semibold text-[#171a1f]">{option.label}</strong><span className="mt-1 block text-xs text-[#6d7178]">{option.description}</span></span><span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${sort === option.value ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{sort === option.value && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span></button>)}</div></section></div>, document.body)}</>;
}

function DeraahBranchPickerCompactModal({ items, selectedBranchId, onSelect, onClose }: { items: StoreCartItem[]; selectedBranchId: string | null; onSelect: (branch: StoreBranch) => void; onClose: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const mobileDrag = useMobileSheetDrag(onClose);
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "availability">("nearest");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const text = (english: string, arabic: string) => isArabic ? arabic : english;
  const sortOptions = [
    { value: "nearest" as const, label: text("Nearest", "الأقرب"), description: text("Show the closest branches first", "عرض الفروع الأقرب لموقعك أولاً") },
    { value: "availability" as const, label: text("Availability", "التوفر"), description: text("Show branches by product availability", "عرض الفروع حسب توفر المنتجات") },
  ];
  const selectedSort = sortOptions.find(option => option.value === sort) ?? sortOptions[0];
  const rank = { full: 0, partial: 1, unavailable: 2 };
  const visibleBranches = useMemo(() => storeBranches.filter(branch => `${branch.name} ${branch.area} ${branch.address}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "nearest" ? Number.parseFloat(a.distance) - Number.parseFloat(b.distance) : rank[a.availability] - rank[b.availability]), [query, sort]);
  const distanceBranches = useMemo(() => [...visibleBranches].sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance)), [visibleBranches]);
  const selectedMapBranch = visibleBranches.find(branch => branch.id === selectedMapId);
  const statusLabel = (branch: StoreBranch) => isArabic ? branch.availability === "full" ? "متاح" : branch.availability === "partial" ? "متاح جزئياً" : "غير متاح" : availabilityCopy(branch.availability).label;
  const statusTone = (branch: StoreBranch) => availabilityCopy(branch.availability).tone;
  const compactCards = visibleBranches.map(branch => <button key={branch.id} type="button" disabled={branch.availability === "unavailable"} onClick={() => onSelect(branch)} className={`w-full rounded-2xl border bg-white p-4 text-start shadow-[0_4px_16px_rgba(34,45,56,.05)] transition hover:border-[#8dc5a0] disabled:cursor-not-allowed disabled:opacity-70 ${branch.id === selectedBranchId ? "border-[#2c8b4b] bg-[#f7fcf8]" : "border-[#e2e7eb]"}`}><span className="flex items-start gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${availabilityCopy(branch.availability).tone}`}><MapPin size={18} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="min-w-0"><strong className="block text-sm font-semibold text-[#171a1f]">{branch.name}</strong><span className="mt-1 block truncate text-xs text-[#68717b]">{branch.address}</span></span><strong className="shrink-0 text-xs text-[#555b63]">{branch.distance}</strong></span><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone(branch)}`}>{statusLabel(branch)}</span></span></span></button>);

  return <div role="dialog" aria-modal="true" aria-label={text("Choose a Deraah branch", "اختيار فرع درعه")} className="store-mobile-sheet-overlay fixed inset-0 z-[100] flex items-end bg-black/40 p-0 backdrop-blur-[3px] md:items-center md:justify-center md:p-5"><section style={mobileDrag.dragStyle} className="relative flex h-[min(760px,92vh)] max-h-[min(760px,92vh)] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl bg-[#fbfcfd] shadow-2xl md:max-w-[760px] md:rounded-3xl" onClick={event => event.stopPropagation()}><MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} /><header className="flex shrink-0 items-center justify-between border-b border-[#edf0f3] bg-white px-5 pb-4 pt-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f8f2] text-[#2c8b4b]"><MapPin size={20} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#208447]">{text("DERAAH PICKUP", "استلام من فروع درعه")}</p><h2 className="mt-1 text-lg font-semibold text-[#171a1f]">{text("Choose a pickup branch", "اختر فرعاً للاستلام")}</h2></div></div><button type="button" onClick={onClose} aria-label={text("Close branch picker", "إغلاق اختيار الفرع")} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63]"><X size={18} /></button></header><div className="shrink-0 border-b border-[#e8edf1] bg-white p-4"><div className="flex items-center gap-2"><div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#dfe5ea] px-3"><Search size={17} className="shrink-0 text-[#8a919a]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={text("Search by area or branch", "ابحث حسب المنطقة أو الفرع")} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><select value={sort} onChange={event => setSort(event.target.value as "nearest" | "availability")} aria-label={text("Sort branches", "ترتيب الفروع")} className="h-11 w-[92px] rounded-xl border border-[#dfe5ea] bg-white px-2 text-xs font-semibold text-[#3f4852] outline-none"><option value="nearest">{text("Nearest", "الأقرب")}</option><option value="availability">{text("Stock", "التوفر")}</option></select></div></div>{view === "list" ? <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-4 pb-2 pt-4"><div className="space-y-3">{compactCards}{!compactCards.length && <p className="py-10 text-center text-sm text-[#6d7178]">{text("No branches match your search.", "لا توجد فروع مطابقة لبحثك.")}</p>}</div><div className="sticky bottom-0 z-20 flex justify-center bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent pb-2 pt-6"><button type="button" onClick={() => setView("map")} className="rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-lg">{text("View on map", "عرض على الخريطة")}</button></div></div> : <div className="relative min-h-0 flex-1 overflow-hidden bg-[#dfe9ed]"><iframe title="Deraah branch map" src={openStreetMapEmbedUrl(selectedMapBranch)} className="absolute inset-0 h-full w-full border-0" loading="lazy" /><div className="absolute inset-0 z-10 pointer-events-none">{visibleBranches.map(branch => <button key={branch.id} type="button" aria-label={branch.name} onClick={() => setSelectedMapId(branch.id)} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white p-1.5 shadow-lg ${branchMarkerTone(branch.availability)} ${branch.id === selectedMapId ? "ring-2 ring-[#171a1f] ring-offset-2" : ""}`} style={branch.position}><MapPin size={25} fill="currentColor" /></button>)}</div>{selectedMapBranch && <article className="absolute inset-x-3 top-3 z-20 rounded-2xl bg-white p-4 shadow-lg"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block text-sm text-[#171a1f]">{selectedMapBranch.name}</strong><span className="mt-1 block text-xs text-[#68717b]">{selectedMapBranch.address}</span></div><strong className="shrink-0 text-xs text-[#555b63]">{selectedMapBranch.distance}</strong></div><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone(selectedMapBranch)}`}>{statusLabel(selectedMapBranch)}</span><button type="button" disabled={selectedMapBranch.availability === "unavailable"} onClick={() => onSelect(selectedMapBranch)} className="mt-3 h-11 w-full rounded-xl bg-[#6f7dff] text-sm font-semibold text-white disabled:bg-[#a5aab2]">{text("Select this branch", "اختيار هذا الفرع")}</button></article>}<div className="absolute inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 flex gap-2 overflow-x-auto pb-1">{distanceBranches.map(branch => <button key={branch.id} type="button" onClick={() => setSelectedMapId(branch.id)} className={`min-w-[178px] shrink-0 rounded-xl border bg-white p-3 text-start shadow-md ${branch.id === selectedMapId ? "border-[#2c8b4b] ring-2 ring-[#2c8b4b]/10" : "border-white"}`}><span className="flex items-start justify-between gap-2"><strong className="truncate text-[11px] text-[#171a1f]">{branch.name}</strong><span className="text-[10px] font-semibold text-[#555b63]">{branch.distance}</span></span><span className="mt-1 block truncate text-[10px] text-[#6d7178]">{branch.address}</span><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone(branch)}`}>{statusLabel(branch)}</span></button>)}</div><button type="button" onClick={() => setView("list")} className="absolute inset-x-0 bottom-4 z-20 mx-auto w-fit rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-lg">{text("View list", "عرض القائمة")}</button></div>}</section></div>;
}

function DeraahBranchPickerBottomSheetModal({ items, selectedBranchId, onSelect, onClose }: { items: StoreCartItem[]; selectedBranchId: string | null; onSelect: (branch: StoreBranch) => void; onClose: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const mobileDrag = useMobileSheetDrag(onClose);
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "availability">("nearest");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const text = (english: string, arabic: string) => isArabic ? arabic : english;
  const sortOptions = [
    { value: "nearest" as const, label: text("Nearest", "الأقرب"), description: text("Show the closest branches first", "عرض الفروع الأقرب لموقعك أولاً") },
    { value: "availability" as const, label: text("Availability", "التوفر"), description: text("Show branches by product availability", "عرض الفروع حسب توفر المنتجات") },
  ];
  const selectedSort = sortOptions.find(option => option.value === sort) ?? sortOptions[0];
  const branches = useMemo(() => storeBranches.filter(branch => `${branch.name} ${branch.area} ${branch.address}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "nearest" ? Number.parseFloat(a.distance) - Number.parseFloat(b.distance) : ({ full: 0, partial: 1, unavailable: 2 }[a.availability] - { full: 0, partial: 1, unavailable: 2 }[b.availability])), [query, sort]);
  const distanceBranches = useMemo(() => [...branches].sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance)), [branches]);
  const selectedMapBranch = branches.find(branch => branch.id === selectedMapId);
  const statusLabel = (branch: StoreBranch) => isArabic ? branch.availability === "full" ? "متاح" : branch.availability === "partial" ? "متاح جزئياً" : "غير متاح" : availabilityCopy(branch.availability).label;
  const statusTone = (branch: StoreBranch) => availabilityCopy(branch.availability).tone;
  const renderBranchCard = (branch: StoreBranch) => <button key={branch.id} type="button" disabled={branch.availability === "unavailable"} onClick={() => onSelect(branch)} className={`w-full rounded-2xl border bg-white p-4 text-start shadow-[0_4px_16px_rgba(34,45,56,.05)] transition hover:border-[#8dc5a0] disabled:cursor-not-allowed disabled:opacity-70 ${branch.id === selectedBranchId ? "border-[#2c8b4b] bg-[#f7fcf8]" : "border-[#e2e7eb]"}`}><span className="flex items-start gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${statusTone(branch)}`}><MapPin size={18} /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="min-w-0"><strong className="block text-sm font-semibold text-[#171a1f]">{branch.name}</strong><span className="mt-1 block truncate text-xs text-[#68717b]">{branch.address}</span></span><strong className="shrink-0 text-xs text-[#555b63]">{branch.distance}</strong></span><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone(branch)}`}>{statusLabel(branch)}</span></span></span></button>;

  return <>
    <div role="dialog" aria-modal="true" aria-label={text("Choose a Deraah branch", "اختيار فرع درعه")} className="store-mobile-sheet-overlay fixed inset-0 z-[100] flex items-end bg-black/40 p-0 backdrop-blur-[3px] md:items-center md:justify-center md:p-5">
      <section style={mobileDrag.dragStyle} className="relative flex h-[min(760px,92vh)] max-h-[min(760px,92vh)] w-full min-h-0 flex-col overflow-hidden rounded-t-3xl bg-[#fbfcfd] shadow-2xl md:max-w-[760px] md:rounded-3xl" onClick={event => event.stopPropagation()}>
        <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
        <header className="flex shrink-0 items-center justify-between border-b border-[#edf0f3] bg-white px-5 pb-4 pt-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f8f2] text-[#2c8b4b]"><MapPin size={20} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#208447]">{text("DERAAH PICKUP", "استلام من فروع درعه")}</p><h2 className="mt-1 text-lg font-semibold text-[#171a1f]">{text("Choose a pickup branch", "اختر فرعاً للاستلام")}</h2></div></div><button type="button" onClick={onClose} aria-label={text("Close branch picker", "إغلاق اختيار الفرع")} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63]"><X size={18} /></button></header>
        <div className="shrink-0 border-b border-[#e8edf1] bg-white p-4"><div className="flex items-center gap-2"><div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#dfe5ea] bg-white px-3"><Search size={17} className="shrink-0 text-[#8a919a]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={text("Search by area or branch", "ابحث حسب المنطقة أو الفرع")} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><button type="button" onClick={() => setSortSheetOpen(true)} aria-haspopup="dialog" aria-expanded={sortSheetOpen} className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#dfe5ea] bg-white px-3 text-xs font-semibold text-[#3f4852] md:hidden">{selectedSort.label}<ChevronDown size={14} className="text-[#6d7178]" /></button><span className="relative hidden md:block"><select value={sort} onChange={event => setSort(event.target.value as "nearest" | "availability")} aria-label={text("Sort branches", "ترتيب الفروع")} className="h-11 w-[112px] appearance-none rounded-xl border border-[#dfe5ea] bg-white py-2 ps-3 pe-10 text-xs font-semibold text-[#3f4852] outline-none"><option value="nearest">{text("Nearest", "الأقرب")}</option><option value="availability">{text("Stock", "التوفر")}</option></select><ChevronDown size={14} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#6d7178]" /></span></div></div>
        {view === "list" ? <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc] px-4 pb-2 pt-4"><div className="space-y-3">{branches.map(renderBranchCard)}{!branches.length && <p className="py-10 text-center text-sm text-[#6d7178]">{text("No branches match your search.", "لا توجد فروع مطابقة لبحثك.")}</p>}</div><div className="sticky bottom-0 z-20 flex justify-center bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent pb-2 pt-6"><button type="button" onClick={() => setView("map")} className="rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-lg">{text("View on map", "عرض على الخريطة")}</button></div></div> : <div className="relative min-h-0 flex-1 overflow-hidden bg-[#dfe9ed]"><iframe title="Deraah branch map" src={openStreetMapEmbedUrl(selectedMapBranch)} className="absolute inset-0 h-full w-full border-0" loading="lazy" /><div className="absolute inset-0 z-10 pointer-events-none">{branches.map(branch => <button key={branch.id} type="button" aria-label={branch.name} onClick={() => setSelectedMapId(branch.id)} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white p-1.5 shadow-lg ${branchMarkerTone(branch.availability)} ${branch.id === selectedMapId ? "ring-2 ring-[#171a1f] ring-offset-2" : ""}`} style={branch.position}><MapPin size={25} fill="currentColor" /></button>)}</div>{selectedMapBranch && <article className="absolute inset-x-3 top-3 z-20 rounded-2xl bg-white p-4 shadow-lg"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block text-sm text-[#171a1f]">{selectedMapBranch.name}</strong><span className="mt-1 block text-xs text-[#68717b]">{selectedMapBranch.address}</span></div><strong className="shrink-0 text-xs text-[#555b63]">{selectedMapBranch.distance}</strong></div><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone(selectedMapBranch)}`}>{statusLabel(selectedMapBranch)}</span><button type="button" disabled={selectedMapBranch.availability === "unavailable"} onClick={() => onSelect(selectedMapBranch)} className="mt-3 h-11 w-full rounded-xl bg-[#6f7dff] text-sm font-semibold text-white disabled:bg-[#a5aab2]">{text("Select this branch", "اختيار هذا الفرع")}</button></article>}<div className="absolute inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 flex gap-2 overflow-x-auto pb-1">{distanceBranches.map(branch => <button key={branch.id} type="button" onClick={() => setSelectedMapId(branch.id)} className={`min-w-[178px] shrink-0 rounded-xl border bg-white p-3 text-start shadow-md ${branch.id === selectedMapId ? "border-[#2c8b4b] ring-2 ring-[#2c8b4b]/10" : "border-white"}`}><span className="flex items-start justify-between gap-2"><strong className="truncate text-[11px] text-[#171a1f]">{branch.name}</strong><span className="text-[10px] font-semibold text-[#555b63]">{branch.distance}</span></span><span className="mt-1 block truncate text-[10px] text-[#6d7178]">{branch.address}</span><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone(branch)}`}>{statusLabel(branch)}</span></button>)}</div><button type="button" onClick={() => setView("list")} className="absolute inset-x-0 bottom-4 z-20 mx-auto w-fit rounded-full bg-[#6f7dff] px-9 py-3 text-sm font-semibold text-white shadow-lg">{text("View list", "عرض القائمة")}</button></div>}
      </section>
    </div>
    {sortSheetOpen && createPortal(<div role="dialog" aria-modal="true" aria-labelledby="deraah-sort-title" className="fixed inset-0 z-[180] flex items-end bg-black/40 backdrop-blur-[2px] md:hidden" onClick={() => setSortSheetOpen(false)}><section className="w-full rounded-t-3xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-2xl" onClick={event => event.stopPropagation()}><div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#d9dee5]" /><header className="flex items-center justify-between gap-3 border-b border-[#edf0f3] py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8a919a]">{text("BRANCH SORTING", "ترتيب الفروع")}</p><h2 id="deraah-sort-title" className="mt-1 text-base font-semibold text-[#171a1f]">{text("Choose sorting", "اختر طريقة الترتيب")}</h2></div><button type="button" onClick={() => setSortSheetOpen(false)} aria-label={text("Close sorting", "إغلاق الترتيب")} className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4f6f8] text-[#555b63]"><X size={17} /></button></header><div className="space-y-2 pt-4">{sortOptions.map(option => <button key={option.value} type="button" onClick={() => { setSort(option.value); setSortSheetOpen(false); }} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-start ${sort === option.value ? "border-[#8fd3a5] bg-[#f5fcf7]" : "border-[#e3e8ee] bg-white"}`}><span><strong className="block text-sm font-semibold text-[#171a1f]">{option.label}</strong><span className="mt-1 block text-xs text-[#6d7178]">{option.description}</span></span><span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${sort === option.value ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{sort === option.value && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span></button>)}</div></section></div>, document.body)}
  </>;
}

function CheckoutGiftOrderCard({ isGiftOrder, giftCustomization, onToggle, onOpenCustomization, onClear }: { isGiftOrder: boolean; giftCustomization: GiftCustomization; onToggle: (checked: boolean) => void; onOpenCustomization: () => void; onClear: () => void }) {
  return <div onClick={event => { if ((event.target as HTMLElement).closest("input,button")) return; if (isGiftOrder) onOpenCustomization(); }} className={`checkout-gift-option-card rounded-xl border p-4 shadow-[0_4px_16px_rgba(30,50,80,.04)] ${isGiftOrder ? "cursor-pointer border-[#b9d2ff] bg-[#f5fbff] hover:border-[#6ea8ff] hover:shadow-[0_6px_20px_rgba(110,168,255,.14)]" : "border-[#edf0f3] bg-white"}`}><label className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left"><span className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6efff] text-[#6ea8ff]"><Gift size={20} /></span><span className="min-w-0"><strong className="block text-sm text-[#171a1f]">Send this order as a gift</strong><small className="mt-1 block text-xs leading-4 text-[#6d7178]">Choose a card, message and gift box</small></span></span><input type="checkbox" checked={isGiftOrder} onChange={event => { const checked = event.target.checked; onToggle(checked); if (!checked) onClear(); }} className="peer sr-only" /><span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#6ea8ff]/40 ${isGiftOrder ? "border-[#6ea8ff] bg-[#6ea8ff] text-white" : "border-[#c8d0d9] bg-white text-transparent"}`}><Check size={15} strokeWidth={3} /></span></label>{isGiftOrder && <><button type="button" onClick={onOpenCustomization} aria-label="Edit gift details" title="Edit gift details" className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#b9d2ff] bg-white px-3 text-left text-xs font-semibold text-[#5689d8] transition-colors hover:border-[#6ea8ff] hover:bg-[#f3f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff]/40"><span className="flex min-w-0 items-center gap-2"><PackageOpen size={17} /><span className="truncate">{giftCustomization.recipient ? `Gift for ${giftCustomization.recipient}` : "Customize your gift details"}</span></span><ChevronRight size={16} /></button><p className="mt-2 truncate px-1 text-[11px] text-[#6d7178]">{giftSelectionSummary(giftCustomization)}</p></>}</div>;
}

function DeliveryAddressSummary({ address, shipping }: { address: Address; shipping: number }) {
  return <article className="checkout-address-card rounded-[18px] border border-[#8fd3a5] bg-[#f5fcf7] p-5">
    <div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dff5e5] text-[#2c8b4b]"><MapPin size={21} strokeWidth={1.7} /></span><span className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><strong className="block text-[15px] font-semibold text-[#171a1f]">{address.label}</strong><span className="mt-1 block text-[11px] text-[#7a838e]">{address.recipient} · {address.phone}</span></div><NationalAddressBadge code={address.nationalCode || address.code} fallback="RQSA6774" /></div><span className="mt-3 block text-xs leading-5 text-[#4e5661]">{address.city} · {address.street}</span><span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#cfe9d7] pt-3 text-xs"><span><strong>{address.addressType === "redbox" ? "Redbox" : "Home delivery"}</strong></span><span><span className="text-[#6d7178]">Fee: </span><strong className="text-[#2c8b4b]">{shipping === 0 ? "Free" : <RiyalPrice value={money(shipping)} />}</strong></span></span></span></div>
  </article>;
}

function CheckoutProductsSummary({ items, orderItemCount, subtotal, onEdit, onShare }: { items: StoreCartItem[]; orderItemCount: number; subtotal: number; onEdit: () => void; onShare?: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  return <section className="checkout-payment-order-details rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[18px] font-semibold md:text-xl">Order details</h2>
        <p className="mt-1 text-xs text-[#6d7178]">{items.length} {items.length === 1 ? "product" : "products"} in your order</p>
      </div>
      <div className="flex shrink-0 items-center gap-1"><button type="button" onClick={onShare} aria-label={isArabic ? "مشاركة السلة" : "Share cart"} title={isArabic ? "مشاركة السلة" : "Share cart"} className="grid h-9 w-9 place-items-center rounded-lg border border-[#b9d2ff] bg-[#f5fbff] text-[#287cf0] transition-colors hover:bg-[#eef7ff]"><Share2 size={15} /></button><button type="button" onClick={onEdit} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#2c8b4b] transition-colors hover:bg-[#f0fbf4]">Edit</button></div>
    </div>
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#edf0f3] bg-[#f8fafc] p-3">
      <div className="flex min-w-0 items-center justify-center gap-1.5 md:justify-start">
        {items.slice(0, 3).map(item => <span key={item.id} className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white"><img src={item.image} alt="" className="h-9 w-9 object-contain" /></span>)}
        {items.length > 3 && <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-xs font-semibold text-[#6d7178]">+{items.length - 3}</span>}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-3 md:justify-start">
        <span className="min-w-0 flex-1 whitespace-nowrap text-center text-xs text-[#6d7178] md:text-start">
          <span className="md:hidden">{isArabic ? `${orderItemCount} منتج` : `${orderItemCount} ${orderItemCount === 1 ? "product" : "products"}`}</span>
          <span className="hidden md:inline">{orderItemCount} items in your cart</span>
        </span>
        <RiyalPrice value={money(subtotal)} className="hidden shrink-0 text-sm font-semibold md:inline-flex" />
      </div>
    </div>
  </section>;
}

const samples = [
  { name: "Small deraah art packaging set RED", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw3c159d0c/images/10211221053000-2006-1.png?q=50&sh=920&sw=920" },
  { name: "Medium Deraah Art Packaging Set Blue", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dwb3d3decf/images/10211221053000-2008-1.png?sh=920&sw=920" },
  { name: "Small Deraah art packaging set Green", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw4aff568a/images/10211221053000-2012-1.png?q=50&sh=920&sw=920" },
];

const money = (value: number) => value.toLocaleString("en-US");

type LoyaltyProviderId = "yogift" | "qitaf" | "mokafaa" | "mobily";
type LoyaltyProvider = { id: LoyaltyProviderId; label: string; title: string; tone: string; background: string; asset: string };

const loyaltyProviders: LoyaltyProvider[] = [
  { id: "yogift", label: "Yo GotaGift", title: "Yo GotaGift", tone: "text-[#c000c8]", background: "bg-[#fff1ff]", asset: "/product-assets/payment-logos/loyalty-yogift.webp?v=1" },
  { id: "qitaf", label: "قطاف", title: "Qitaf points", tone: "text-[#9d55c7]", background: "bg-[#fbf1ff]", asset: "/product-assets/payment-logos/loyalty-qitaf.svg?v=4" },
  { id: "mokafaa", label: "مكافأة", title: "Mokafaa points", tone: "text-[#1590c7]", background: "bg-[#eefaff]", asset: "/product-assets/payment-logos/loyalty-mokafaa.svg?v=4" },
  { id: "mobily", label: "موبايلي", title: "Mobily points", tone: "text-[#2f63e8]", background: "bg-[#f0f4ff]", asset: "/product-assets/payment-logos/loyalty-mobily.svg?v=4" },
];

function readMukafaatiBalance() {
  if (typeof window === "undefined") return 49;
  const raw = window.localStorage.getItem("deraah-mukafaati-balance");
  const saved = raw === null ? Number.NaN : Number(raw);
  return Number.isFinite(saved) && saved >= 0 ? saved : 49;
}

function LoyaltyProviderMark({ provider, compact = false, square = false }: { provider: LoyaltyProvider; compact?: boolean; square?: boolean }) {
  // Keep the established visual scale for the existing providers; Yo GotaGift
  // has different asset proportions and keeps its own dedicated treatment.
  const logoScale = compact || square ? provider.id === "yogift" ? "scale-[1.05]" : "scale-[1.3]" : "";
  const compactLogoWidth = provider.id === "qitaf" ? "w-[68px]" : provider.id === "mokafaa" ? "w-[80px]" : provider.id === "mobily" ? "w-[89px]" : "w-full";
  const markSize = square && provider.id === "yogift" ? "mt-[1px] mr-[8px] h-[29px] w-[42.25px] ml-[5px] pl-[6px]" : compact ? `h-full ${compactLogoWidth}` : "h-full w-full";
  return <span className={`grid shrink-0 place-items-center ${square ? "h-10 w-14" : compact ? "h-14 w-16 sm:h-16 sm:w-24" : "h-10 w-12"}`}><img src={provider.asset} alt={provider.title} className={`${markSize} object-contain mix-blend-multiply ${logoScale}`} /></span>;
}

function MukafaatiPointsModal({ open, initialProviderId = "yogift", onClose, onPointsAdded }: { open: boolean; initialProviderId?: LoyaltyProviderId; onClose: () => void; onPointsAdded: (amount: number, provider: LoyaltyProvider) => void }) {
  const { direction, language } = useStoreLocale();
  const isArabic = language === "العربية";
  const copy = (english: string, arabic: string) => isArabic ? arabic : english;
  const [step, setStep] = useState<"choose" | "verify" | "amount">("choose");
  const [providerId, setProviderId] = useState<LoyaltyProviderId>("yogift");
  const [mobileNumber, setMobileNumber] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [amount, setAmount] = useState("20");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const mobileDrag = useMobileSheetDrag(onClose);
  const provider = loyaltyProviders.find(item => item.id === providerId) ?? loyaltyProviders[0];
  const localizedProviderLabel = isArabic && provider.id === "yogift" ? "يو غوتا غيفت" : isArabic ? provider.label : provider.title;
  const availableAmount = 20;

  useEffect(() => {
    if (!open) return;
    setStep("choose");
    setProviderId(initialProviderId);
    setMobileNumber("");
    setCardCode("");
    setAmount(String(availableAmount));
    setOtp(["", "", "", ""]);
    setError("");
  }, [open, initialProviderId]);

  if (!open) return null;

  const continueToVerification = () => {
    if (mobileNumber.replace(/\D/g, "").length < 9) {
      setError("Enter a valid mobile number to continue.");
      return;
    }
    setError("");
    setStep("verify");
  };

  const continueToCardBalance = () => {
    const normalizedCode = cardCode.replace(/[^a-zA-Z0-9]/g, "");
    if (normalizedCode.length < 6) {
      setError(copy("Enter a valid card number or code to continue.", "أدخل رقم بطاقة أو رمزاً صالحاً للمتابعة."));
      return;
    }
    setError("");
    setAmount(String(availableAmount));
    setStep("amount");
  };

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    setOtp(current => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < otp.length - 1) otpRefs.current[index + 1]?.focus();
  };

  const continueToAmount = () => {
    if (otp.join("").length !== 4) {
      setError(copy("Enter the 4-digit verification code.", "أدخل رمز التحقق المكون من 4 أرقام."));
      return;
    }
    setError("");
    setStep("amount");
  };

  const confirmPoints = () => {
    const points = Number(amount);
    if (!Number.isFinite(points) || points < 1 || points > availableAmount) {
      setError(copy(`Enter an amount between 1 and ${availableAmount} SAR.`, `أدخل مبلغاً بين 1 و${availableAmount} ر.س.`));
      return;
    }
    onPointsAdded(points, provider);
  };

  return createPortal(<div dir={direction} role="dialog" aria-modal="true" aria-labelledby="mukafaati-points-title" className="store-side-overlay fixed inset-0 z-[140] flex justify-end bg-black/35 backdrop-blur-[3px] max-md:items-end" onClick={onClose}>
    <section onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className="store-mobile-sheet store-auth-panel store-side-panel-right flex h-dvh w-full max-w-[440px] flex-col overflow-y-auto bg-white px-7 pb-7 pt-5 text-start shadow-2xl max-md:h-[min(92dvh,760px)] max-md:max-w-none max-md:rounded-t-[28px] max-md:px-5">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="flex shrink-0 items-center justify-between gap-4"><span className="inline-flex items-center gap-2 text-[11px] text-[#9a9da3]"><Gift size={17} /> {copy("Mukafaati", "مكافآتي")}</span><button type="button" onClick={onClose} aria-label={copy("Close Mukafaati points", "إغلاق نقاط مكافآتي")} className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button></div>
      <div className="mx-auto flex min-h-0 w-full max-w-[420px] flex-1 flex-col justify-start py-8">
        {step === "choose" ? <>
          <div className="text-center"><h3 id="mukafaati-points-title" className="text-lg font-semibold text-[#171a1f]">{copy("Add points from", "إضافة نقاط من")}</h3><p className="mt-1 text-xs leading-5 text-[#7b818a]">{copy("Convert your points to Mukafaati points and use them to pay.", "حوّل رصيدك إلى نقاط مكافآتي واستخدمها للدفع.")}</p></div>
          <div className="mx-auto mt-5 grid w-full max-w-[360px] grid-cols-4 gap-2">
            {loyaltyProviders.map(item => <button key={item.id} type="button" onClick={() => { setProviderId(item.id); setError(""); }} aria-label={copy(`Choose ${item.title}`, `اختيار ${item.label}`)} aria-pressed={providerId === item.id} className={`flex aspect-square w-full max-w-[82px] min-h-0 items-center justify-center justify-self-center rounded-xl border p-1 transition-colors ${providerId === item.id ? "border-[#287cf0] bg-[#f5f8ff]" : "border-[#e5e9ee] bg-white hover:border-[#b9d2ff]"}`}><LoyaltyProviderMark provider={item} square={item.id === "yogift"} compact={item.id !== "yogift"} /></button>)}
          </div>
          <p className="mt-5 text-center text-xs text-[#555b63]">{isArabic ? `استخدم رصيد ${localizedProviderLabel} وأضفه إلى محفظة مكافآتي.` : `Use your ${localizedProviderLabel} balance and add it to your Mukafaati wallet.`}</p>
          {providerId === "yogift" ? <label className="mt-4 block text-[11px] font-semibold text-[#4c5560]">{copy("Enter card number or code", "أدخل رقم البطاقة أو رمزها")}<input aria-label={copy("Card number or code", "رقم البطاقة أو رمزها")} type="text" value={cardCode} onChange={event => { setCardCode(event.target.value.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 32)); setError(""); }} placeholder={copy("Card number or code", "رقم البطاقة أو رمزها")} inputMode="text" autoCapitalize="characters" autoComplete="off" dir="ltr" className="mt-2 h-12 w-full rounded-xl border border-[#dfe4e8] px-4 text-sm tracking-[.08em] outline-none transition-colors focus:border-[#287cf0]" /></label> : <label className="mt-4 block text-[11px] font-semibold text-[#4c5560]">{copy("Enter mobile number", "أدخل رقم الجوال")}<input aria-label={copy("Mobile number", "رقم الجوال")} type="tel" value={mobileNumber} onChange={event => { setMobileNumber(event.target.value.replace(/[^0-9+ ]/g, "").slice(0, 16)); setError(""); }} placeholder="05xxxxxxxx" inputMode="tel" autoComplete="tel" className="mt-2 h-12 w-full rounded-xl border border-[#dfe4e8] px-4 text-sm outline-none transition-colors focus:border-[#287cf0]" /></label>}
          {error && <p role="alert" className="mt-3 text-xs font-semibold text-[#b42318]">{error}</p>}
          <button type="button" onClick={providerId === "yogift" ? continueToCardBalance : continueToVerification} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#287cf0] text-sm font-semibold text-white transition-colors hover:bg-[#1768d4]">{providerId === "yogift" ? copy("Check card balance", "تحقق من رصيد البطاقة") : copy("Send verification code", "إرسال رمز التحقق")} <ChevronRight size={17} /></button>
          <p className="mt-4 text-center text-[10px] leading-4 text-[#9aa1ac]">{providerId === "yogift" ? copy("Your available card balance will appear next.", "سيظهر رصيد بطاقتك المتاح في الخطوة التالية.") : copy("We’ll send a verification code to this mobile number.", "سنرسل رمز التحقق إلى رقم الجوال هذا.")}</p>
        </> : step === "verify" ? <>
          <button type="button" onClick={() => { setStep("choose"); setError(""); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6d7178] hover:text-[#171a1f]"><ArrowLeft size={15} /> {copy("Back", "رجوع")}</button>
          <div className="mx-auto mt-5 max-w-[320px] text-center"><LoyaltyProviderMark provider={provider} square /><div className="mt-4"><h3 className="text-base font-semibold text-[#171a1f]">{copy("Verify your mobile number", "تحقق من رقم جوالك")}</h3><p className="mx-auto mt-1 max-w-[280px] text-xs leading-5 text-[#7b818a]">{isArabic ? `تم إرسال رمز تحقق من 4 أرقام إلى ${mobileNumber}.` : `A 4-digit verification code was sent to ${mobileNumber}.`}</p></div></div>
          <div className="mt-5 text-center"><p className="text-xs text-[#6d7178]">{copy("Enter the code to view your available balance.", "أدخل الرمز لعرض رصيدك المتاح.")}</p><div className="mt-4 flex justify-center gap-2">{otp.map((digit, index) => <input key={index} ref={element => { otpRefs.current[index] = element; }} value={digit} onChange={event => updateOtp(index, event.target.value)} onKeyDown={event => { if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus(); }} aria-label={isArabic ? `رقم التحقق ${index + 1}` : `Verification digit ${index + 1}`} inputMode="numeric" maxLength={1} className="h-12 w-12 rounded-lg border border-[#dfe4e8] text-center text-lg font-semibold outline-none focus:border-[#287cf0]" />)}</div><button type="button" className="mt-3 text-[10px] font-semibold text-[#287cf0]">{copy("Resend code · 55:00", "إعادة إرسال الرمز · 55:00")}</button></div>
          {error && <p role="alert" className="mt-3 text-center text-xs font-semibold text-[#b42318]">{error}</p>}
          <button type="button" onClick={continueToAmount} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#287cf0] text-sm font-semibold text-white transition-colors hover:bg-[#1768d4]">{copy("Verify code and continue", "التحقق من الرمز والمتابعة")} <ChevronRight size={17} /></button>
        </> : <>
          <button type="button" onClick={() => { setStep(providerId === "yogift" ? "choose" : "verify"); setError(""); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6d7178] hover:text-[#171a1f]"><ArrowLeft size={15} /> {copy("Back", "رجوع")}</button>
          <div className="mt-5 rounded-2xl bg-[#f4f8ff] p-4"><div className="text-center"><p className="text-xs font-semibold text-[#6d7178]">{isArabic ? `الرصيد المتاح من ${localizedProviderLabel}` : `Available ${localizedProviderLabel} balance`}</p><strong className="mt-1 block text-3xl font-bold text-[#287cf0]">{availableAmount} SAR</strong></div><div className="mt-4 rounded-xl bg-white/75 p-3"><p className="text-xs leading-5 text-[#555b63]">{isArabic ? `تم تحديد رصيدك الكامل افتراضياً. غيّر المبلغ أدناه إذا أردت استخدام جزء فقط من رصيد ${availableAmount} ر.س.` : `Your full balance is selected by default. Change the amount below if you want to use only part of your ${availableAmount} SAR balance.`}</p><label className="mt-3 block text-[11px] font-semibold text-[#4c5560]">{copy("Amount to withdraw", "المبلغ المراد استخدامه")}<div className="mt-2 flex items-center gap-2 rounded-lg border border-[#287cf0] bg-white px-3"><input aria-label={copy("Amount to withdraw", "المبلغ المراد استخدامه")} value={amount} onChange={event => { setAmount(event.target.value.replace(/[^0-9]/g, "").slice(0, 2)); setError(""); }} inputMode="numeric" className="h-11 min-w-0 flex-1 bg-transparent text-center text-lg font-semibold outline-none" /><span className="text-xs font-semibold text-[#6d7178]">SAR</span></div></label></div>{error && <p role="alert" className="mt-3 text-center text-xs font-semibold text-[#b42318]">{error}</p>}<button type="button" onClick={confirmPoints} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#287cf0] text-sm font-semibold text-white transition-colors hover:bg-[#1768d4]">{copy("Withdraw points", "استخدام النقاط")} <Check size={17} /></button></div>
        </>}
      </div>
    </section>
  </div>, document.body);
}

function loadSelectedSample() {
  const fallback = samples[0];
  if (typeof window === "undefined") return fallback;
  const savedValue = window.localStorage.getItem("deraah-selected-sample");
  try {
    const savedSample = JSON.parse(savedValue ?? "null") as { name?: string; image?: string } | null;
    const savedIndex = samples.findIndex(sample => sample.name === savedSample?.name);
    if (savedIndex >= 0) return samples[savedIndex];
    const legacyColorIndex = savedSample?.name?.toLowerCase().includes("blue") ? 1 : savedSample?.name?.toLowerCase().includes("green") ? 2 : savedSample?.name?.toLowerCase().includes("red") ? 0 : -1;
    if (legacyColorIndex >= 0) return samples[legacyColorIndex];
  } catch {
    // Fall back to the legacy index format below.
  }
  const savedIndex = Number(savedValue);
  return Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < samples.length ? samples[savedIndex] : fallback;
}

function AvailableCouponsDrawer({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (code: string) => void }) {
  const [copied, setCopied] = useState("");
  const [expandedCoupon, setExpandedCoupon] = useState("");
  const coupons = [
    ["5% Discount", "Get 5% off on orders of 149 or more.", "GET5", ["02", "10", "50"]],
    ["35 Discount", "Get 35 off on orders of 399 or more.", "OFF35", ["05", "18", "32"]],
    ["50 Discount", "Get 50 off on orders of 499 or more.", "OFF50", ["01", "08", "24"]],
    ["70 Discount", "Get 70 off on orders of 799 or more.", "OFF70", undefined],
  ] as const;
  if (!open) return null;
  const copyCode = async (code: string) => {
    try { await navigator.clipboard?.writeText(code); } catch { /* Clipboard may be unavailable in preview. */ }
    setCopied(code);
    window.setTimeout(() => setCopied(current => current === code ? "" : current), 1600);
  };
  return <div role="dialog" aria-modal="true" aria-labelledby="checkout-coupon-title" className="fixed inset-0 z-[120] flex justify-end bg-black/35" onClick={onClose}><section className="relative flex h-full w-full max-w-[500px] flex-col overflow-y-auto rounded-l-[24px] bg-white px-5 pb-5 pt-6 text-left shadow-2xl md:px-6 md:pt-7" onClick={event => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div><h2 id="checkout-coupon-title" className="text-xl font-bold tracking-[-.02em] text-[#202126] md:text-2xl">Available Coupons</h2><p className="mt-1 text-xs text-[#7b818a]">Choose a coupon and apply it to your order.</p></div><button type="button" onClick={onClose} aria-label="Close coupons" className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-xl text-[#555b63] transition-colors hover:bg-[#e8edf3]">×</button></div><div className="grid gap-3.5">{coupons.map(([title, description, code, endsIn]) => { const isExpanded = expandedCoupon === code; return <article key={code} className={`relative overflow-hidden rounded-2xl border border-[#dbe6f4] ${code === "GET5" ? "bg-[#fafcff]" : "bg-[#eef5ff]"} px-4 py-4 md:px-5`}><h3 className="flex min-w-0 items-center gap-2 text-sm font-bold leading-5 text-[#202126] md:text-base"><TicketPercent className="h-5 w-5 shrink-0 text-[#27b99a]" strokeWidth={2} />{title}</h3><p className="mt-1.5 text-xs leading-4 text-[#687386]">{description}</p><div className="mt-3 flex min-h-10 items-center justify-between gap-3 rounded-md border border-dashed border-[#9fc4f4] bg-white/70 px-3 py-1.5"><button type="button" onClick={() => onUse(code)} className="text-sm font-bold tracking-wide text-[#4a5568] underline decoration-dotted underline-offset-4">{code}</button><button type="button" onClick={() => copyCode(code)} className={`flex h-[35px] w-[78px] shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors ${copied === code ? "bg-[#e9f8ee] text-[#208447]" : "bg-[#287cf0] text-white hover:bg-[#1768d4]"}`}><Copy className="h-3.5 w-3.5" strokeWidth={1.8} />{copied === code ? "Copied ✓" : "Copy"}</button></div>{endsIn && <div className="mt-3 flex items-center justify-between gap-3"><span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#687386]"><Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />Ends in</span><div className="flex items-end gap-1.5">{endsIn.map((value, index) => <span key={`${code}-${value}`} className="min-w-[30px] text-center"><strong className="block rounded-md bg-[#d51678] px-1.5 py-[9px] text-xs font-bold text-white">{value}</strong><small className="mt-1 block text-[9px] text-[#8a95a5]">{["Days", "Hours", "Minutes"][index]}</small></span>)}</div></div>}<div className="mt-2.5 border-t border-[#dbe6f4] pt-2.5"><button type="button" onClick={() => setExpandedCoupon(isExpanded ? "" : code)} aria-expanded={isExpanded} className="flex w-full items-center justify-between text-left text-[11px] text-[#8a95a5] transition-colors hover:text-[#687386]"><span>Details, Terms and Conditions</span><ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} strokeWidth={1.7} /></button>{isExpanded && <div className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-[10px] leading-4 text-[#687386]">Valid on eligible orders that meet the minimum spend. One coupon per order. Cannot be combined with other offers.</div>}</div></article>; })}</div></section></div>;
}

function MobileCheckoutDeliveryBar({ delivery, address, branch, onChange }: { delivery: "shipping" | "pickup" | null; address: Address | null; branch: StoreBranch | null; onChange: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const isPickup = delivery === "pickup";
  const addressLabel = address ? isArabic ? ({ Home: "المنزل", Work: "العمل", Other: address.otherLabel || "أخرى" }[address.label] ?? address.label) : (address.label === "Other" ? address.otherLabel || "Other" : address.label) : "";
  const location = !delivery
    ? (isArabic ? "اختر التوصيل أو الاستلام من الفرع" : "Choose delivery or pickup")
    : isPickup
    ? branch ? `${branch.name} · ${branch.address}` : (isArabic ? "اختر الفرع" : "Choose a branch")
    : address ? `${address.city} · ${address.street}${address.nationalCode || address.code ? ` · ${address.nationalCode || address.code}` : ""}` : (isArabic ? "اختر عنوان التوصيل" : "Choose delivery address");
  const title = !delivery ? (isArabic ? "طريقة الاستلام" : "Receiving method") : isPickup ? (isArabic ? "الاستلام من" : "Pickup from") : `${isArabic ? "التوصيل إلى" : "Delivery to"}${addressLabel ? ` ${addressLabel}` : ""}`;
  const actionLabel = isArabic ? "تغيير" : "Change";
  return <section className="checkout-mobile-delivery-bar rounded-2xl border-b border-[#e6ebef] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(30,50,80,.05)] md:hidden"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ecfdf1] text-[#2c8b4b]">{isPickup ? <MapPin size={19} /> : <Truck size={19} />}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-[#2c8b4b]">{title}</p><strong className="mt-0.5 block truncate text-xs font-semibold text-[#171a1f]">{location}</strong></div><button type="button" onClick={onChange} className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-[#2c8b4b] transition-colors hover:bg-[#f0fbf4]">{actionLabel}</button></div></section>;
}


type SharedCartPayload = {
  version: 1;
  items: StoreCartItem[];
  giftSelections: StoreGiftSelections;
};

function parseSharedCartPayload(rawValue: string): SharedCartPayload | null {
  try {
    const parsed = JSON.parse(rawValue) as { items?: unknown; giftSelections?: unknown };
    if (!Array.isArray(parsed.items) || !parsed.items.length) return null;
    const items = parsed.items.filter(item => {
      const candidate = item as Partial<StoreCartItem> | null;
      return Boolean(candidate && typeof candidate.id === "string" && typeof candidate.name === "string" && typeof candidate.brand === "string" && typeof candidate.image === "string" && Number.isFinite(Number(candidate.quantity)) && Number(candidate.quantity) > 0);
    }).map(item => {
      const candidate = item as StoreCartItem;
      return { ...candidate, price: String(candidate.price ?? "0"), quantity: Math.max(1, Math.floor(Number(candidate.quantity))) };
    });
    if (!items.length) return null;
    const selections = parsed.giftSelections && typeof parsed.giftSelections === "object" && !Array.isArray(parsed.giftSelections) ? Object.fromEntries(Object.entries(parsed.giftSelections).filter(([itemId, giftIds]) => items.some(item => item.id === itemId) && Array.isArray(giftIds)).map(([itemId, giftIds]) => [itemId, [...new Set((giftIds as unknown[]).filter(giftId => typeof giftId === "string"))]])) : {};
    return { version: 1, items, giftSelections: selections };
  } catch {
    return null;
  }
}

function createSharedCartUrl(items: StoreCartItem[], giftSelections: StoreGiftSelections, language: string) {
  if (typeof window === "undefined" || !items.length) return "";
  const url = new URL("/checkout", window.location.origin);
  url.searchParams.set("sharedCart", JSON.stringify({ version: 1, items, giftSelections } satisfies SharedCartPayload));
  if (language === "العربية") url.searchParams.set("language", "ar");
  return url.toString();
}

export default function CheckoutPage({ step = "cart" }: { step?: "cart" | "shipping" }) {
  const { direction, language } = useStoreLocale();
  const isArabic = language === "العربية";
  const text = (english: string, arabic: string) => isArabic ? arabic : english;
  const { cartItems: items, addToCart, updateQuantity, removeItem, replaceCart, giftSelections, setGiftSelections } = useStoreCart();
  const { addOrder } = useStoreOrders();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shouldEditAddress = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "address";
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>(() => step === "shipping" ? "payment" : "cart");
  const stageTransitionTimer = useRef<number | null>(null);
  const [stageLoading, setStageLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [sharedCartNotice, setSharedCartNotice] = useState("");
  const sharedCartHandled = useRef(false);
  useEffect(() => () => {
    if (stageTransitionTimer.current !== null) window.clearTimeout(stageTransitionTimer.current);
  }, []);
  useEffect(() => {
    if (sharedCartHandled.current || typeof window === "undefined") return;
    sharedCartHandled.current = true;
    const sharedCartValue = new URLSearchParams(window.location.search).get("sharedCart");
    if (!sharedCartValue) return;
    const sharedCart = parseSharedCartPayload(sharedCartValue);
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("sharedCart");
    window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    if (!sharedCart) {
      setSharedCartNotice(isArabic ? "رابط السلة المشتركة غير صالح أو منتهي." : "This shared cart link is no longer valid.");
      return;
    }
    replaceCart(sharedCart.items, sharedCart.giftSelections);
    setSharedCartNotice(isArabic ? "تم تحميل السلة المشتركة. راجع المنتجات وأكمل الدفع ببياناتك." : "The shared cart is ready. Review it and complete payment with your details.");
  }, [replaceCart, isArabic]);
  const [delivery, setDelivery] = useState<"shipping" | "pickup" | null>(() => shouldEditAddress ? "shipping" : null);
  const [deliveryPanelOpen, setDeliveryPanelOpen] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(() => {
    const initialAddresses = loadAddresses();
    const initialSelectedId = loadLastUsedAddressId(initialAddresses);
    return initialAddresses.find(address => address.id === initialSelectedId)?.addressType === "redbox" ? "redbox" : "standard";
  });
  const [payment, setPayment] = useState<CheckoutPaymentId>("cod");
  const [cardDetails, setCardDetails] = useState<CardDetails>({ holder: "", number: "", expiry: "", cvv: "" });
  const [deraahGiftDetails, setDeraahGiftDetails] = useState<DeraahGiftDetails>({ number: "", pin: "" });
  const [deraahGiftBalance, setDeraahGiftBalance] = useState<number | null>(null);
  const [deraahGiftApplied, setDeraahGiftApplied] = useState(false);
  const [deraahGiftFeedback, setDeraahGiftFeedback] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>(() => loadAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => loadLastUsedAddressId(loadAddresses()));
  const [addressDraft, setAddressDraft] = useState<Address | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(shouldEditAddress);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [branchPickerMode, setBranchPickerMode] = useState<"deraah" | "redbox" | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(() => loadSelectedBranchId());
  const [selectedSample] = useState(loadSelectedSample);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState("");
  const [couponsOpen, setCouponsOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [loyaltyBalance, setLoyaltyBalance] = useState(readMukafaatiBalance);
  const [useLoyaltyBalance, setUseLoyaltyBalance] = useState(false);
  const [selectedLoyaltyProviderId, setSelectedLoyaltyProviderId] = useState<LoyaltyProviderId>("yogift");
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [loyaltyFeedback, setLoyaltyFeedback] = useState("");
  const [isGiftOrder, setIsGiftOrder] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem(GIFT_ORDER_KEY) === "true") return true;
    return items.some(isGiftCustomizationItem);
  });
  const [giftCustomization, setGiftCustomization] = useState<GiftCustomization>(readGiftCustomization);
  const [giftCustomizationOpen, setGiftCustomizationOpen] = useState(false);
  const [giftPickerItem, setGiftPickerItem] = useState<string | null>(null);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price.replace(/[^0-9]/g, "")) * item.quantity, 0), [items]);
  const freeUnitsByItem = useMemo(() => getFreeUnitsByItem(items), [items]);
  const promotionDiscount = useMemo(() => items.reduce((sum, item) => sum + (freeUnitsByItem.get(item.id) ?? 0) * Number(item.price.replace(/[^0-9]/g, "")), 0), [items, freeUnitsByItem]);
  const discountedSubtotal = subtotal - promotionDiscount;
  const activeCouponOffer = checkoutCouponOffers.find(offer => offer.code === coupon.trim().toUpperCase()) ?? null;
  const couponDiscount = couponApplied && activeCouponOffer
    ? activeCouponOffer.discountType === "percent"
      ? Math.round(discountedSubtotal * (activeCouponOffer.discountValue / 100))
      : activeCouponOffer.discountValue
    : 0;
  const shipping = delivery === "shipping" ? shippingMethod === "redbox" ? (discountedSubtotal >= 96 ? 0 : 25) : 20 : 0;
  const beforeLoyaltyTotal = discountedSubtotal - couponDiscount + shipping;
  const loyaltyCoversTotal = beforeLoyaltyTotal > 0 && loyaltyBalance >= beforeLoyaltyTotal;
  const walletEnabled = useLoyaltyBalance || loyaltyCoversTotal;
  const loyaltyDiscount = walletEnabled ? Math.min(loyaltyBalance, beforeLoyaltyTotal) : 0;
  const afterLoyaltyTotal = beforeLoyaltyTotal - loyaltyDiscount;
  const deraahGiftAppliedAmount = payment === "deraah-gift" && deraahGiftApplied && deraahGiftBalance !== null ? Math.min(deraahGiftBalance, afterLoyaltyTotal) : 0;
  const total = afterLoyaltyTotal - deraahGiftAppliedAmount;
  const shareUrl = useMemo(() => createSharedCartUrl(items, giftSelections, language), [items, giftSelections, language]);
  const openShareCart = () => {
    setShareFeedback(shareUrl ? "" : text("Add products to your cart before sharing.", "أضف منتجات إلى السلة قبل مشاركتها."));
    setShareOpen(true);
  };
  const copyShareUrl = async () => {
    if (!shareUrl) return;
    if (!navigator.clipboard?.writeText) {
      setShareFeedback(text("Copy the link from the field above.", "انسخ الرابط من الحقل أعلاه."));
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback(text("Cart link copied.", "تم نسخ رابط السلة."));
    } catch {
      setShareFeedback(text("Copy the link from the field above.", "انسخ الرابط من الحقل أعلاه."));
    }
  };
  const shareCart = async () => {
    if (!shareUrl) return;
    if (!navigator.share) {
      await copyShareUrl();
      return;
    }
    try {
      await navigator.share({ title: text("Deraah shared cart", "سلة درعه المشتركة"), text: text("Review this cart and complete the payment.", "راجع هذه السلة وأكمل الدفع."), url: shareUrl });
      setShareFeedback(text("The cart was shared.", "تمت مشاركة السلة."));
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "AbortError") setShareFeedback(text("You can copy the link and send it manually.", "يمكنك نسخ الرابط وإرساله يدويًا."));
    }
  };
  const selectedBranch = storeBranches.find(branch => branch.id === selectedBranchId) ?? null;
  const currentAddress = addresses.find(address => address.id === selectedAddressId) ?? null;
  const giftPickerCartItem = giftPickerItem ? items.find(item => item.id === giftPickerItem) ?? null : null;
  const giftPickerOffer = giftPickerCartItem ? getGiftOfferForProduct(giftPickerCartItem.name) : null;
  const syncGiftCustomizationCart = (customization: GiftCustomization) => {
    items.filter(isGiftCustomizationItem).forEach(item => removeItem(item.id));
    getGiftCustomizationPaidItems(customization).forEach(item => addToCart(item));
    window.localStorage.setItem(GIFT_CUSTOMIZATION_KEY, JSON.stringify(customization));
    window.localStorage.setItem(GIFT_ORDER_KEY, "true");
  };
  const clearGiftCustomization = () => {
    items.filter(isGiftCustomizationItem).forEach(item => removeItem(item.id));
    window.localStorage.removeItem(GIFT_CUSTOMIZATION_KEY);
    window.localStorage.setItem(GIFT_ORDER_KEY, "false");
    setGiftCustomization(defaultGiftCustomization);
  };
  const addLoyaltyPoints = (amount: number, provider: LoyaltyProvider) => {
    setLoyaltyBalance(current => {
      const nextBalance = current + amount;
      window.localStorage.setItem("deraah-mukafaati-balance", String(nextBalance));
      return nextBalance;
    });
    setSelectedLoyaltyProviderId(provider.id);
    setLoyaltyFeedback(`${amount} SAR added from ${provider.title} to your Mukafaati wallet.`);
    setPointsModalOpen(false);
  };
  useEffect(() => {
    if (loyaltyCoversTotal) setUseLoyaltyBalance(true);
  }, [loyaltyCoversTotal]);
  const toggleGift = (item: StoreCartItem, giftId: string) => {
    const offer = getGiftOfferForProduct(item.name);
    if (!offer) return;
    const current = giftSelections[item.id] ?? [];
    const selectionLimit = getGiftSelectionLimit(item);
    const next = selectionLimit === 1
      ? current.includes(giftId) ? current : [giftId]
      : current.includes(giftId)
        ? current.filter(id => id !== giftId)
        : current.length < selectionLimit ? [...current, giftId] : current;
    setGiftSelections(item.id, next);
  };
  const isCartStage = checkoutStage === "cart";
  const isPaymentStage = checkoutStage === "payment";
  const isShippingStep = isPaymentStage;
  const cardReady = cardDetails.holder.trim().length > 1 && cardDetails.number.replace(/\s/g, "").length >= 12 && cardDetails.expiry.length >= 4 && cardDetails.cvv.length >= 3;
  const paymentReady = payment === "deraah-gift" ? deraahGiftApplied && deraahGiftBalance !== null : walletEnabled || payment !== "card" || cardReady;
  const deliveryReady = delivery === "shipping" ? Boolean(selectedAddressId) : delivery === "pickup" && Boolean(selectedBranch);
  const canContinue = Boolean(items.length) && (isCartStage ? deliveryReady : paymentReady);
  const effectivePayment = loyaltyCoversTotal ? "mukafaati" : payment;
  const paymentActionLabel = isPaymentStage
    ? effectivePayment === "apple" ? text("Continue with Apple Pay", "المتابعة باستخدام Apple Pay") : effectivePayment === "tamara" ? text("Continue with Tamara", "المتابعة باستخدام تمارا") : effectivePayment === "tabby" ? text("Continue with Tabby", "المتابعة باستخدام تابي") : effectivePayment === "deraah-gift" ? text("Pay with Deraah Gift", "الدفع باستخدام درعه جيفت") : text("Place order", "تأكيد الطلب")
    : text("Place order", "تأكيد الطلب");
  const continueLabel = isCartStage ? text("Continue to payment", "المتابعة إلى الدفع") : paymentActionLabel;
  const lastUsedCardHint = "Visa •••• 4242";
  const paymentMethods: Array<[CheckoutPaymentId, string, string]> = [["card", "Credit or debit card", "Visa, Mastercard and Mada"], ["apple", "Apple Pay", "Easy and secure way to pay"], ["cod", "Cash on delivery", "Pay when your order arrives"], ["tamara", "Tamara", `Pay 4 installments of SAR ${money(Math.ceil(total / 4))}`], ["tabby", "Tabby", `Pay 4 installments of SAR ${money(Math.ceil(total / 4))}`], ["deraah-gift", text("Deraah Gift", "درعه جيفت"), text("Pay securely with your Deraah Gift balance", "ادفع بأمان باستخدام رصيد درعه جيفت")]];
  const transitionToStage = (nextStage: CheckoutStage) => {
    if (checkoutStage === nextStage) return;
    if (stageTransitionTimer.current !== null) window.clearTimeout(stageTransitionTimer.current);
    setPaymentError("");
    setStageLoading(true);
    stageTransitionTimer.current = window.setTimeout(() => {
      setCheckoutStage(nextStage);
      setStageLoading(false);
      stageTransitionTimer.current = null;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 180);
  };
  const continueToShipping = () => {
    if (!items.length) {
      setPaymentError("Your cart is empty.");
      return;
    }
    if (isCartStage) {
      if (!deliveryReady) {
        setPaymentError("Select a delivery method and destination to continue.");
        return;
      }
      transitionToStage("payment");
      return;
    }
    if (isPaymentStage && !paymentReady) {
      setPaymentError(payment === "deraah-gift" ? text("Verify and apply your Deraah Gift card to continue.", "تحقق من بطاقة درعه جيفت وطبّقها للمتابعة.") : text("Enter your card details to continue securely.", "أدخل بيانات البطاقة للمتابعة بأمان."));
      return;
    }
    if (isPaymentStage) {
      const selectedAddress = addresses.find(address => address.id === selectedAddressId) ?? null;
      const orderId = `DRH-${String(Date.now()).slice(-8)}`;
      const orderSnapshot = { id: orderId, placedAt: new Date().toISOString(), status: "Confirmed" as const, items, giftSelections: Object.fromEntries(Object.entries(giftSelections).filter(([, giftIds]) => giftIds.length > 0).map(([itemId, giftIds]) => [itemId, [...giftIds]])), freeSample: selectedSample, subtotal, promotionDiscount, couponDiscount, loyaltyDiscount, useLoyaltyBalance: walletEnabled, shipping, total, payment: effectivePayment, delivery, shippingMethod, address: selectedAddress, branch: selectedBranch, isGiftOrder, giftCustomization: isGiftOrder ? giftCustomization : null };
      window.localStorage.setItem("deraah-last-order", JSON.stringify(orderSnapshot));
      addOrder(orderSnapshot);
      window.location.assign("/payment-summary");
      return;
    }
  };
  const selectPayment = (nextPayment: CheckoutPaymentId) => {
    if (loyaltyCoversTotal) return;
    setPayment(nextPayment);
    setDeraahGiftApplied(false);
    setDeraahGiftFeedback("");
    if (nextPayment === "deraah-gift") setUseLoyaltyBalance(false);
    setPaymentError("");
  };
  const updateCardDetails = (field: keyof CardDetails, value: string) => {
    setCardDetails(current => ({ ...current, [field]: value }));
    setPaymentError("");
  };
  const updateDeraahGiftDetails = (field: keyof DeraahGiftDetails, value: string) => {
    setDeraahGiftDetails(current => ({ ...current, [field]: value }));
    setDeraahGiftBalance(null);
    setDeraahGiftApplied(false);
    setDeraahGiftFeedback("");
    setPaymentError("");
  };
  const verifyDeraahGift = () => {
    if (deraahGiftDetails.number.replace(/\s/g, "").length < 8 || deraahGiftDetails.pin.length < 4) return;
    setDeraahGiftBalance(Math.max(beforeLoyaltyTotal, 500));
    setDeraahGiftApplied(false);
    setDeraahGiftFeedback(text("Card verified. Review the available balance, then apply it.", "تم التحقق من البطاقة. راجع الرصيد المتاح ثم طبّقه."));
    setPaymentError("");
  };
  const applyDeraahGift = () => {
    if (deraahGiftBalance === null) return;
    setDeraahGiftApplied(true);
    setDeraahGiftFeedback(text("Deraah Gift has been applied to this order.", "تم تطبيق درعه جيفت على هذا الطلب."));
    setPaymentError("");
  };
  const removeDeraahGift = () => {
    setDeraahGiftApplied(false);
    setDeraahGiftBalance(null);
    setDeraahGiftFeedback("");
  };
  const orderItemCount = items.reduce((sum, item) => sum + item.quantity, 0) + (items.length ? 1 : 0);
  const updateAddressDraft = (field: keyof Address, value: string | boolean) => setAddressDraft(draft => draft ? { ...draft, [field]: value } : draft);
  const selectAddress = (id: string, addressOverride?: Address) => {
    setSelectedAddressId(id);
    const address = addressOverride ?? addresses.find(item => item.id === id);
    setShippingMethod(address?.addressType === "redbox" ? "redbox" : "standard");
    setAddressPickerOpen(false);
    window.localStorage.setItem("deraah-last-address-id", id);
  };
  const startNewAddress = (addressType: "home" | "redbox" = "home") => {
    if (addressType === "redbox") {
      setBranchPickerMode("redbox");
      setAddressDraft(null);
      setAddressPickerOpen(false);
      setBranchPickerOpen(true);
      return;
    }
    setBranchPickerMode(null);
    setAddressDraft({ id: "", label: "Home", recipient: "", phone: "", city: "", street: "", code: "", nationalCode: "", otherLabel: "", recipientDifferent: false, isDefault: false, addressType });
  };
  const startEditAddress = (address: Address) => setAddressDraft({ ...address, label: ["Home", "Work", "Other"].includes(address.label) ? address.label : "Other", otherLabel: address.otherLabel ?? (["Home", "Work", "Other"].includes(address.label) ? "" : address.label) });
  const saveAddress = () => {
    if (!addressDraft) return;
    const recipient = addressDraft.recipient.trim() || "Primary contact";
    const phone = addressDraft.phone.trim() || "05X XXX XXXX";
    const validPhone = phone.replace(/\D/g, "").length >= 8;
    if (!addressDraft.city.trim() || !addressDraft.street.trim() || (addressDraft.recipientDifferent && (!addressDraft.recipient.trim() || !validPhone)) || (addressDraft.label === "Other" && !addressDraft.otherLabel?.trim())) return;
    const id = addressDraft.id || `address-${Date.now()}`;
    const savedAddress = {
      ...addressDraft,
      id,
      label: addressDraft.label === "Other" && addressDraft.otherLabel?.trim() ? addressDraft.otherLabel.trim() : addressDraft.label,
      recipient,
      phone,
      city: addressDraft.city.trim(),
      street: addressDraft.street.trim(),
      nationalCode: addressDraft.nationalCode?.trim().toUpperCase() || undefined,
    };
    const next = addressDraft.id ? addresses.map(address => address.id === addressDraft.id ? savedAddress : address) : [...addresses, savedAddress];
    const normalized = savedAddress.isDefault ? next.map(address => address.id === id ? address : { ...address, isDefault: false }) : next;
    setAddresses(normalized);
    selectAddress(id, savedAddress);
    setAddressDraft(null);
    setAddressPickerOpen(false);
    window.localStorage.setItem("deraah-addresses", JSON.stringify(normalized));
  };
  const removeAddress = (id: string) => {
    const next = addresses.filter(address => address.id !== id);
    setAddresses(next);
    const nextSelectedId = selectedAddressId === id ? next[0]?.id ?? null : selectedAddressId;
    setSelectedAddressId(nextSelectedId);
    if (nextSelectedId) window.localStorage.setItem("deraah-last-address-id", nextSelectedId);
    else window.localStorage.removeItem("deraah-last-address-id");
    window.localStorage.setItem("deraah-addresses", JSON.stringify(next));
  };
  const selectBranch = (branch: StoreBranch) => {
    const isRedboxSelection = branchPickerMode === "redbox";
    if (isRedboxSelection) {
      setSelectedBranchId(null);
    } else {
      setSelectedBranchId(branch.id);
      window.localStorage.setItem("deraah-selected-branch", branch.id);
    }
    setBranchPickerOpen(false);
    setBranchPickerMode(null);
    if (isRedboxSelection) {
      const redboxAddress: Address = {
        id: `redbox-${branch.id}`,
        label: branch.name,
        recipient: "Primary contact",
        phone: branch.phone,
        city: branch.area,
        street: branch.address,
        addressType: "redbox",
      };
      const next = [...addresses.filter(address => address.id !== redboxAddress.id), redboxAddress];
      setAddresses(next);
      setSelectedAddressId(redboxAddress.id);
      setDelivery("shipping");
      setShippingMethod("redbox");
      setAddressPickerOpen(true);
      window.localStorage.setItem("deraah-addresses", JSON.stringify(next));
      window.localStorage.setItem("deraah-last-address-id", redboxAddress.id);
    }
  };
  const closeBranchPicker = () => {
    setBranchPickerOpen(false);
    setBranchPickerMode(null);
  };
  const openMobileDeliveryPicker = (method: "shipping" | "pickup") => {
    setDelivery(method);
    setDeliveryPanelOpen(true);
    setBranchPickerMode(method === "pickup" ? "deraah" : null);
    if (method === "shipping") {
      setBranchPickerOpen(false);
      setAddressPickerOpen(true);
    } else {
      setAddressPickerOpen(false);
      setBranchPickerOpen(true);
    }
  };
  const applyCouponCode = (code: string) => {
    const normalizedCoupon = code.trim().toUpperCase().replace(/[\s_%-]/g, "");
    const offer = checkoutCouponOffers.find(item => item.code === normalizedCoupon);
    setCoupon(normalizedCoupon);
    if (!offer) {
      setCouponApplied(false);
      setCouponFeedback("Use a valid coupon code");
      return false;
    }
    if (discountedSubtotal < offer.minimum) {
      setCouponApplied(false);
      setCouponFeedback(`This coupon applies to orders of ${offer.minimum} or more`);
      return false;
    }
    setCouponApplied(true);
    setCouponFeedback(`${offer.title} applied`);
    return true;
  };
  const applyCoupon = () => {
    applyCouponCode(coupon);
  };
  const removeCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
    setCouponFeedback("");
  };
  return <div dir={direction} className={`checkout-page checkout-unified-flow checkout-flow-stage-${checkoutStage} checkout-step-${isCartStage ? "cart" : "shipping"} min-h-screen bg-[#EEF3FB] text-[#171a1f]`}>
    <div className="hidden md:block"><StoreHeader /></div>
    <MobileCheckoutDeliveryBar delivery={delivery} address={currentAddress} branch={selectedBranch} onChange={() => openMobileDeliveryPicker(delivery ?? "shipping")} />
    <main className="mx-auto max-w-[1240px] px-5 py-6 md:px-8 md:py-8">
    <div className="mb-6"><button type="button" onClick={() => { if (isCartStage) { if (window.history.length > 1) window.history.back(); else window.location.assign("/product-details#details"); } else transitionToStage("cart"); }} className="flex items-center gap-2 text-sm font-medium text-[#555b63]"><ArrowLeft size={18} /> {isCartStage ? "Back to cart" : "Back"}</button></div>
      {placed && <div role="status" className="mb-6 flex items-center gap-3 rounded-xl bg-[#ecfdf1] px-4 py-4 text-sm font-medium text-[#208447]"><Check size={19} /> Order received. We will confirm the delivery details shortly.</div>}
      {sharedCartNotice && <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-[#b9d2ff] bg-[#f5fbff] px-4 py-3 text-sm text-[#315b92]"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#287cf0]" /><span className="min-w-0 flex-1">{sharedCartNotice}</span><button type="button" onClick={() => setSharedCartNotice("")} aria-label={text("Dismiss shared cart notice", "إغلاق تنبيه السلة المشتركة")} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#6d7df5] hover:bg-white"><X size={15} /></button></div>}
      <div className="checkout-layout grid gap-5 lg:grid-cols-2">
        <div className="checkout-flow-column space-y-5">
          <div className="relative checkout-flow-stage-panel">
            {stageLoading && <div className="checkout-stage-loader" role="status" aria-live="polite"><span className="checkout-stage-spinner" aria-hidden="true" /><span>Loading…</span></div>}
            {paymentError && !isPaymentStage && <p role="alert" className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#b42318]"><AlertCircle size={15} />{paymentError}</p>}
          {isCartStage && <div className="checkout-products-stack">
          {items.length > 0 && <CartBundleProgress items={items} compact className="w-full" />}
          <section className="checkout-products-card rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-[18px] font-semibold md:text-xl">{text("Your products", "منتجاتك")}</h2><p className="mt-1 text-xs text-[#6d7178]">{orderItemCount} {text("items in your order", "منتج في طلبك")}</p></div><button type="button" onClick={openShareCart} aria-label={text("Share cart", "مشاركة السلة")} title={text("Share cart", "مشاركة السلة")} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#b9d2ff] bg-[#f5fbff] px-3 text-xs font-semibold text-[#287cf0] transition-colors hover:border-[#6ea8ff] hover:bg-[#eef7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff]/35"><Share2 size={16} /><span className="hidden sm:inline">{text("Share cart", "مشاركة السلة")}</span></button></div>
            <div className="mt-5">{items.length ? <>
              {items.map(item => {
                const isLeaderProduct = item.name === "Leader Perfume for Men 100 ml";
                const unitPrice = Number(item.price.replace(/[^0-9]/g, ""));
                const originalPrice = getCartItemOriginalPrice(item);
                const freeUnits = freeUnitsByItem.get(item.id) ?? 0;
                const lineTotal = unitPrice * Math.max(0, item.quantity - freeUnits);
                const giftOffer = getGiftOfferForProduct(item.name);
                const selectedGiftIds = giftSelections[item.id] ?? [];
                return <Fragment key={item.id}>
                  <article className="checkout-product-row rounded-none border-b border-[#dfe4e8] bg-transparent p-3 last:border-b-0">
                    <div className="checkout-product-row-content flex items-start gap-3">
                      <div className={`checkout-product-image grid min-h-[112px] w-[84px] shrink-0 md:w-[96px] self-stretch place-items-center overflow-hidden rounded-lg ${isLeaderProduct ? "bg-transparent" : "bg-[#F5F6F7]"}`}>
                        {isGiftCustomizationItem(item) ? <img src={item.image} alt={item.name} className={`checkout-product-image-asset block h-auto w-auto object-contain ${isLeaderProduct ? "h-[75px] max-h-none max-w-[72px]" : "max-h-[75px] max-w-[72px]"} md:max-w-[84px]`} /> : <a href={`/product-details?product=${encodeURIComponent(item.name)}#details`} aria-label={`View ${item.name}`} className="grid h-full w-full place-items-center transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c8b4b]">
                          <img src={item.image} alt={item.name} className={`checkout-product-image-asset block h-auto w-auto object-contain ${isLeaderProduct ? "h-[75px] max-h-none max-w-[72px]" : "max-h-[75px] max-w-[72px]"} md:max-w-[84px]`} />
                        </a>}
                      </div>
                      <div className="checkout-product-info min-w-0 flex-1">
                        <div className="checkout-product-main flex items-start gap-2">
                          <div className="checkout-product-main-content min-w-0 flex-1">
                            {freeUnits > 0 && <span className="checkout-product-free-label-desktop mb-1 block text-[11px] font-semibold text-[#2c8b4b]">{freeUnits === item.quantity ? "Free with 1+2 Free" : `${freeUnits} free item${freeUnits > 1 ? "s" : ""} with 1+2 Free`}</span>}
                            <h3 className="checkout-product-title min-w-0 text-[14px] font-semibold leading-5">{item.name}</h3>
                            <div className="checkout-product-price mt-2 flex items-baseline gap-2">
                              <strong className="text-[16px] font-medium"><RiyalPrice value={money(lineTotal)} /></strong>
                              {originalPrice > unitPrice && <s className="text-[11px] text-[#8a8f98] line-through"><RiyalPrice value={money(originalPrice)} /></s>}
                            </div>
                            <div className="checkout-product-quantity mt-3 flex h-8 w-[96px] items-center justify-between rounded-full bg-[#f5f5f5] px-[7px]"><button type="button" onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)} aria-label={item.quantity <= 1 ? `Remove ${item.name}` : "Decrease product quantity"} className="grid h-7 w-7 place-items-center rounded-full text-xl leading-none text-[#6d7178] transition-colors hover:text-[#c1262f]">{item.quantity <= 1 ? <Trash2 size={15} strokeWidth={1.8} /> : "−"}</button><span className="min-w-4 text-center text-[14px] font-medium">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase product quantity" className="grid h-7 w-7 place-items-center rounded-full text-xl leading-none">+</button></div>
                            {(freeUnits > 0 || giftOffer) && <div className="checkout-product-mobile-offer-row">
                              {freeUnits > 0 && <span className="checkout-product-free-label-mobile" title="1+2 Free"><span>1+2 Free</span></span>}
                              {giftOffer && <div className="checkout-product-gift checkout-product-gift-mobile inline-flex shrink-0 items-center gap-1 rounded-md bg-[#edf9f0] px-2 py-1 text-[10px] font-semibold text-[#287a43]"><Gift size={12} strokeWidth={1.8} /><span>Gift available</span><span className="mx-0.5 h-3 w-px bg-[#b7d6bf]" /><button type="button" onClick={() => setGiftPickerItem(item.id)} aria-label={selectedGiftIds.length ? "Edit gifts" : "Choose a gift"} title={selectedGiftIds.length ? "Edit gifts" : "Choose a gift"} className="grid h-5 w-5 place-items-center rounded-md text-[#287a43] transition-colors hover:bg-white"><span className="sr-only">{selectedGiftIds.length ? "Edit gifts" : "Choose a gift"}</span>{selectedGiftIds.length ? <PenLine size={12} strokeWidth={2} /> : <Plus size={13} strokeWidth={2} />}</button>{selectedGiftIds.length > 0 && <button type="button" onClick={() => setGiftSelections(item.id, [])} aria-label="Remove selected gifts" title="Remove selected gifts" className="grid h-5 w-5 place-items-center rounded-md text-[#b14a4a] transition-colors hover:bg-white"><span className="sr-only">Remove selected gifts</span><Trash2 size={12} strokeWidth={1.8} /></button>}</div>}
                            </div>}
                          <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="checkout-product-remove ml-auto mb-1 grid h-8 w-8 shrink-0 self-end place-items-center bg-transparent pt-3 text-[#9a9da3] transition-colors hover:text-[#c1262f]"><Trash2 size={15} strokeWidth={1.7} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Fragment>;
              })}
            </> : <p className="py-8 text-sm text-[#6d7178]">Your cart is empty.</p>}</div>
          </section>
          {items.length > 0 && <section className="checkout-sample-card rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold md:text-xl">Free sample</h2>
              </div>
              <span className="shrink-0 rounded-full bg-[#ecfdf1] px-3 py-1.5 text-[11px] font-semibold text-[#208447]">FREE</span>
            </div>
            <article className="mt-4 flex items-start gap-3 border-t border-[#edf0f3] pt-4">
              <span className="grid h-[112px] w-[84px] shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7] md:w-[96px]">
                <img src={selectedSample.image} alt={selectedSample.name} className="h-auto w-auto max-h-[75px] max-w-[72px] object-contain md:max-w-[84px]" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-semibold leading-5">{selectedSample.name}</h3>
                <p className="mt-1 truncate whitespace-nowrap text-[12px] text-[#6d7178]">Free sample from the 1+2 Free offer</p>
              </div>
              <div className="flex shrink-0 flex-col items-end justify-between self-stretch gap-3">
                <span className="inline-flex rounded-full bg-[#EDF9F0] px-3 py-1 text-[10px] font-semibold text-[#208447]">Gift</span>
                <strong className="text-[14px] font-medium text-[#208447]"><RiyalPrice value="0" /></strong>
              </div>
            </article>
          </section>}
          <GiftCustomizationFreeItems customization={giftCustomization} enabled={isGiftOrder} />
          <SelectedGiftsCard items={items} giftSelections={giftSelections} />
          </div>}
          {isPaymentStage && <div className="checkout-payment-context space-y-3">
            <CheckoutProductsSummary items={items} orderItemCount={orderItemCount} subtotal={discountedSubtotal} onEdit={() => transitionToStage("cart")} onShare={openShareCart} />
            <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-semibold md:text-xl">Delivery details</h2>
                </div>
                <button type="button" onClick={() => transitionToStage("cart")} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#2c8b4b] transition-colors hover:bg-[#f0fbf4]">Change</button>
              </div>
              <div className="mt-4">
                {delivery === "shipping" && addresses.filter(address => address.id === selectedAddressId).map(address => <div key={address.id} className="flex items-center gap-3 rounded-xl border border-[#cfe9d7] bg-[#ecfdf1]/60 p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#2c8b4b]"><MapPin size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-normal">{address.label}</strong><span className="mt-1 block truncate text-xs text-[#6d7178]">{address.city} · {address.street}</span></span><span className="shrink-0 text-right text-[11px]"><strong className="block">Home delivery</strong><span className="mt-1 block text-[#2c8b4b]">{shipping === 0 ? "Free" : <RiyalPrice value={money(shipping)} />}</span></span></div>)}
                {delivery === "shipping" && !selectedAddressId && <p className="rounded-xl border border-dashed border-[#dfe4e8] bg-[#f8fafc] px-3 py-4 text-sm text-[#6d7178]">No delivery address selected.</p>}
                {delivery === "pickup" && selectedBranch && <div className="flex items-center gap-3 rounded-xl border border-[#cfe9d7] bg-[#ecfdf1]/60 p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#2c8b4b]"><MapPin size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{selectedBranch.name}</strong><span className="mt-1 block truncate text-xs text-[#6d7178]">{selectedBranch.address}</span></span><span className="shrink-0 text-right text-[11px]"><strong className="block">Pickup</strong><span className="mt-1 block text-[#2c8b4b]">{selectedBranch.distance}</span></span></div>}
                {!delivery && <p className="rounded-xl border border-dashed border-[#dfe4e8] bg-[#f8fafc] px-3 py-4 text-sm text-[#6d7178]">No delivery method selected.</p>}
              </div>
            </section>
          </div>}
          {isPaymentStage && <section className="checkout-payment-section rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
            <h2 className="text-[18px] font-semibold md:text-xl">Payment method</h2>
            <div className="mt-5 space-y-3">
              <div>
                <PaymentMethodOption id="mukafaati" title="Mukafaati" description="Use Mukafaati points to pay" balance={loyaltyBalance} selected={walletEnabled} onSelect={() => { if (!loyaltyCoversTotal) setUseLoyaltyBalance(enabled => !enabled); }} onToggleWallet={enabled => { if (!loyaltyCoversTotal) setUseLoyaltyBalance(enabled); }} />
                {walletEnabled && <div className="mt-3"><MukafaatiPaymentPanel feedback={loyaltyFeedback} onSelectProvider={provider => { setSelectedLoyaltyProviderId(provider.id); setLoyaltyFeedback(""); setPointsModalOpen(true); }} /></div>}
              </div>
              {paymentMethods.map(([id, title, description]) => <div key={id}><PaymentMethodOption id={id} title={title} description={description} cardDescription={id === "card" ? lastUsedCardHint : undefined} selected={payment === id && !loyaltyCoversTotal} disabled={loyaltyCoversTotal} onSelect={() => selectPayment(id)} />{payment === id && (id === "card" || id === "deraah-gift") && !loyaltyCoversTotal && <div className="mt-3"><PaymentDetailsPanel payment={id} cardDetails={cardDetails} onCardChange={updateCardDetails} deraahGiftDetails={deraahGiftDetails} deraahGiftBalance={deraahGiftBalance} deraahGiftApplied={deraahGiftApplied} deraahGiftFeedback={deraahGiftFeedback} onDeraahGiftChange={updateDeraahGiftDetails} onVerifyDeraahGift={verifyDeraahGift} onApplyDeraahGift={applyDeraahGift} onRemoveDeraahGift={removeDeraahGift} /></div>}</div>)}
            </div>
            {paymentError && isPaymentStage && <p role="alert" className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#b42318]"><AlertCircle size={15} />{paymentError}</p>}
          </section>}
        </div></div>
        <div className="checkout-side-column">
        {isPaymentStage && <div className="checkout-payment-order-details-side"><CheckoutProductsSummary items={items} orderItemCount={orderItemCount} subtotal={discountedSubtotal} onEdit={() => transitionToStage("cart")} onShare={openShareCart} /></div>}
        {isCartStage && <section className="checkout-delivery-section hidden rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-5 lg:block">
          <button type="button" aria-expanded={deliveryPanelOpen} onClick={() => setDeliveryPanelOpen(open => !open)} className="flex w-full items-center justify-between gap-3 text-left">
            <h2 className="text-[19px] font-semibold md:text-xl">Order delivery</h2>
            <ChevronDown className={`h-5 w-5 shrink-0 text-[#6d7178] transition-transform ${deliveryPanelOpen ? "rotate-180" : ""}`} />
          </button>
          {!deliveryPanelOpen && delivery && <div className="mt-3 flex min-h-14 items-center justify-between gap-3 rounded-xl border border-[#dfe4e8] bg-[#f8fafc] px-3">
            <span className="min-w-0">
              <strong className="block truncate text-sm">{delivery === "shipping" ? "delivery" : selectedBranch?.name ?? "Pickup"}</strong>
              <small className="mt-1 block truncate text-xs text-[#6d7178]">{delivery === "shipping" ? "To your address" : selectedBranch ? `${selectedBranch.distance} · ${availabilityCopy(selectedBranch.availability).label}` : "from branch"}</small>
            </span>
            <ChevronRight size={17} className="shrink-0 text-[#6d7178]" />
          </div>}
          {deliveryPanelOpen && <>
          <div className="mt-3 grid grid-cols-2 gap-3 md:mt-5">
            <button type="button" aria-pressed={delivery === "shipping"} onClick={() => { setDelivery("shipping"); setDeliveryPanelOpen(true); }} className={`delivery-method-option flex min-h-[76px] min-w-0 items-center gap-3 rounded-xl p-3 text-left transition-colors md:min-h-[84px] ${delivery === "shipping" ? "bg-[#ecfdf1] ring-2 ring-[#2c8b4b]" : "bg-[#f8fafc]"}`}>
              <Truck className="h-5 w-5 shrink-0 text-[#2c8b4b]" size={20} />
              <div className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold leading-tight">delivery</strong><span className="mt-1 block truncate text-[10px] leading-tight text-[#6d7178]">To your address</span></div>
            </button>
            <button type="button" aria-pressed={delivery === "pickup"} onClick={() => { setDelivery("pickup"); setDeliveryPanelOpen(true); setBranchPickerOpen(true); }} className={`delivery-method-option flex min-h-[76px] min-w-0 items-center gap-3 rounded-xl p-3 text-left transition-colors md:min-h-[84px] ${delivery === "pickup" ? "bg-[#ecfdf1] ring-2 ring-[#2c8b4b]" : "bg-[#f8fafc]"}`}>
              <MapPin className="h-5 w-5 shrink-0 text-[#2c8b4b]" size={20} />
              <div className="min-w-0 flex-1"><strong className="block truncate text-sm leading-tight">Pickup</strong><span className="mt-1 block truncate text-[10px] leading-tight text-[#6d7178]">from branch</span></div>
            </button>
          </div>
          {delivery === "shipping" && <div className="mt-4 space-y-3"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Delivery address</h3>{selectedAddressId && <button type="button" onClick={() => setAddressPickerOpen(true)} className="min-h-10 rounded-lg px-2 text-xs font-semibold text-[#2c8b4b] hover:bg-[#f0fbf4]">Change</button>}</div>{addresses.filter(address => address.id === selectedAddressId).map(address => <DeliveryAddressSummary key={address.id} address={address} shipping={shipping} />)}{!selectedAddressId && <button type="button" onClick={() => setAddressPickerOpen(true)} className="flex min-h-14 w-full items-center justify-between rounded-xl border border-dashed border-[#2c8b4b] bg-[#f7fcf8] px-4 text-left text-sm font-semibold text-[#208447]">Choose a delivery address <ChevronRight size={17} /></button>}
            <div onClick={event => { if ((event.target as HTMLElement).closest("input,button")) return; if (isGiftOrder) setGiftCustomizationOpen(true); }} className={`checkout-gift-option-card rounded-xl border p-4 shadow-[0_4px_16px_rgba(30,50,80,.04)] ${isGiftOrder ? "cursor-pointer border-[#b9d2ff] bg-[#f5fbff] hover:border-[#6ea8ff] hover:shadow-[0_6px_20px_rgba(110,168,255,.14)]" : "border-[#edf0f3] bg-white"}`}><label className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left"><span className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6efff] text-[#6ea8ff]"><Gift size={20} /></span><span className="min-w-0"><strong className="block text-sm text-[#171a1f]">Send this order as a gift</strong><small className="mt-1 block text-xs leading-4 text-[#6d7178]">Choose a card, message and gift box</small></span></span><input type="checkbox" checked={isGiftOrder} onChange={event => { const checked = event.target.checked; setIsGiftOrder(checked); if (checked) { window.localStorage.setItem(GIFT_ORDER_KEY, "true"); setGiftCustomizationOpen(true); } else clearGiftCustomization(); }} className="peer sr-only" /><span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#6ea8ff]/40 ${isGiftOrder ? "border-[#6ea8ff] bg-[#6ea8ff] text-white" : "border-[#c8d0d9] bg-white text-transparent"}`}><Check size={15} strokeWidth={3} /></span></label>{isGiftOrder && <><button type="button" onClick={() => setGiftCustomizationOpen(true)} aria-label="Edit gift details" title="Edit gift details" className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#b9d2ff] bg-white px-3 text-left text-xs font-semibold text-[#5689d8] transition-colors hover:border-[#6ea8ff] hover:bg-[#f3f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff]/40"><span className="flex min-w-0 items-center gap-2"><PackageOpen size={17} /><span className="truncate">{giftCustomization.recipient ? `Gift for ${giftCustomization.recipient}` : "Customize your gift details"}</span></span><ChevronRight size={16} /></button><p className="mt-2 truncate px-1 text-[11px] text-[#6d7178]">{giftSelectionSummary(giftCustomization)}</p></>}</div>
          </div>}
          {delivery === "pickup" && <button type="button" onClick={() => setBranchPickerOpen(true)} className="mt-4 flex min-h-14 w-full items-center justify-between rounded-lg border border-[#dfe4e8] px-3 text-left"><span className="min-w-0"><strong className="block truncate text-sm">{selectedBranch?.name ?? "Choose a Deraah branch"}</strong><small className="mt-1 block truncate text-xs text-[#6d7178]">{selectedBranch ? `${selectedBranch.distance} · ${availabilityCopy(selectedBranch.availability).label}` : "Select a branch to see availability"}</small></span><ChevronRight size={17} className="shrink-0 text-[#6d7178]" /></button>}
          </>}
        </section>}
        {isCartStage && <div className="checkout-mobile-gift-card mb-4 lg:hidden"><CheckoutGiftOrderCard isGiftOrder={isGiftOrder} giftCustomization={giftCustomization} onToggle={checked => { setIsGiftOrder(checked); if (checked) { window.localStorage.setItem(GIFT_ORDER_KEY, "true"); setGiftCustomizationOpen(true); } }} onOpenCustomization={() => setGiftCustomizationOpen(true)} onClear={clearGiftCustomization} /></div>}
        <aside className="checkout-order-summary h-fit rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.07)] lg:sticky lg:top-6"><div className="mb-5 border-b border-[#edf0f3] pb-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f8ef] text-[#2c8b4b]"><Tag size={21} /></span><div className="min-w-0 flex-1"><strong className="block whitespace-nowrap text-[13px] font-semibold sm:text-sm">Do you have a discount coupon?</strong><button type="button" onClick={() => setCouponsOpen(true)} className="mt-1 inline-flex whitespace-nowrap items-center gap-0 text-[11px] font-semibold text-[#2c8b4b] hover:underline sm:text-xs"><span>View available discount coupons</span><ChevronDown size={16} /></button></div></div><div className="mt-3 flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[#dfe4e8] bg-white px-2"><input value={coupon} disabled={couponApplied} onChange={event => { setCoupon(event.target.value); setCouponApplied(false); setCouponFeedback(""); }} onKeyDown={event => { if (event.key === "Enter") applyCoupon(); }} placeholder="Enter coupon code" className={`min-w-0 flex-1 bg-transparent px-2 text-xs outline-none ${couponApplied ? "cursor-not-allowed text-[#6d7178]" : ""}`} /><button type="button" onClick={couponApplied ? removeCoupon : applyCoupon} className={`h-8 shrink-0 rounded-md px-3 text-[11px] font-semibold text-white ${couponApplied ? "bg-[#687386] hover:bg-[#4d5869]" : "bg-[#171a1f] hover:bg-[#252525]"}`}>{couponApplied ? "Remove" : "Apply"}</button></div>{couponFeedback && <p className={`mt-2 text-xs font-medium ${couponApplied ? "text-[#2c8b4b]" : "text-[#b42318]"}`}>{couponFeedback}</p>}</div><h2 className="mb-4 text-[18px] font-semibold md:text-xl">Order summary</h2><div className="space-y-3 border-b border-[#edf0f3] pb-5 text-sm"><div className="flex justify-between"><span className="text-[#6d7178]">Subtotal</span><RiyalPrice value={money(subtotal)} /></div>{promotionDiscount > 0 && <div className="flex justify-between text-[#2c8b4b]"><span>1+2 Free</span><span>- <RiyalPrice value={money(promotionDiscount)} /></span></div>}{couponApplied && activeCouponOffer && <div className="flex justify-between text-[#2c8b4b]"><span>{activeCouponOffer.code} · {activeCouponOffer.discountType === "percent" ? `${activeCouponOffer.discountValue}% off` : `${activeCouponOffer.discountValue} off`}</span><span>- <RiyalPrice value={money(couponDiscount)} /></span></div>}{loyaltyDiscount > 0 && <div className="flex justify-between text-[#2c8b4b]"><span>Mukafaati points</span><span>- <RiyalPrice value={money(loyaltyDiscount)} /></span></div>}{deraahGiftAppliedAmount > 0 && <div className="flex justify-between text-[#b01869]"><span>{text("Deraah Gift", "درعه جيفت")}</span><span>- <RiyalPrice value={money(deraahGiftAppliedAmount)} /></span></div>}<div className="flex justify-between"><span className="text-[#6d7178]">Shipping</span><span className={shipping === 0 ? "font-semibold text-[#2c8b4b]" : ""}>{shipping ? <RiyalPrice value={money(shipping)} /> : "Free"}</span></div><div className="flex justify-between"><span className="text-[#6d7178]">Free sample</span><span className="font-semibold text-[#2c8b4b]">Free</span></div></div><div className="mt-5 flex justify-between text-lg font-semibold"><span>Total</span><RiyalPrice value={money(total)} /></div>{effectivePayment === "apple" ? <ApplePayActionButton disabled={!canContinue} onClick={continueToShipping} className={`${isShippingStep ? "shipping-place-order " : ""}mt-6 w-full`} /> : <button type="button" disabled={!canContinue} onClick={continueToShipping} className={`${isShippingStep ? "shipping-place-order " : ""}mt-6 flex h-12 w-full items-center justify-between gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-[#252525] disabled:cursor-not-allowed disabled:bg-[#9aa1ac] shadow-none`}><span className="flex items-center gap-2"><Check size={17} /> {continueLabel}</span><RiyalPrice value={money(total)} light /></button>}</aside>
        </div>
      </div>
      {shareOpen && <div role="dialog" aria-modal="true" aria-labelledby="share-cart-title" className="fixed inset-0 z-[130] flex items-center justify-center bg-black/35 p-4" onClick={() => setShareOpen(false)}>
        <section className="w-full max-w-[520px] rounded-2xl bg-white p-5 shadow-2xl md:p-6" onClick={event => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f2ff] text-[#287cf0]"><Share2 size={19} /></span><div><h2 id="share-cart-title" className="text-lg font-semibold text-[#171a1f]">{text("Share your cart", "مشاركة السلة")}</h2><p className="mt-1 text-xs leading-5 text-[#6d7178]">{text("Let someone else review this cart and pay for it.", "أرسل السلة لشخص آخر ليراجعها ويدفع قيمتها.")}</p></div></div><button type="button" onClick={() => setShareOpen(false)} aria-label={text("Close share cart", "إغلاق مشاركة السلة")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#555b63] hover:bg-[#e8edf3]"><X size={17} /></button></div>
          {shareUrl ? <>
            <div className="mt-5 rounded-xl border border-[#d9e7fb] bg-[#f7fbff] p-3"><div className="flex items-start gap-2"><Link2 size={16} className="mt-0.5 shrink-0 text-[#287cf0]" /><p className="text-xs leading-5 text-[#49617f]">{text("The link includes products, quantities and selected gifts only. Payment and address details stay with the person who opens it.", "الرابط يتضمن المنتجات والكميات والهدايا المختارة فقط، بينما تبقى بيانات الدفع والعنوان لدى الشخص الذي يفتحه.")}</p></div></div>
            <label className="mt-4 block text-xs font-semibold text-[#4c5560]">{text("Share link", "رابط المشاركة")}<div className="mt-2 flex items-center gap-2 rounded-xl border border-[#dfe4e8] bg-white p-1.5"><input readOnly value={shareUrl} aria-label={text("Shared cart link", "رابط السلة المشتركة")} dir="ltr" className="min-w-0 flex-1 bg-transparent px-2 text-[11px] text-[#5f6872] outline-none" /><button type="button" onClick={copyShareUrl} aria-label={text("Copy cart link", "نسخ رابط السلة")} title={text("Copy cart link", "نسخ رابط السلة")} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#171a1f] text-white hover:bg-[#2c3035]"><Copy size={15} /></button></div></label>
            <button type="button" onClick={shareCart} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#287cf0] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1768d4]"><Share2 size={17} />{text("Share now", "مشاركة الآن")}</button>
            {shareFeedback && <p role="status" className="mt-3 text-center text-xs font-semibold text-[#208447]">{shareFeedback}</p>}
          </> : <p className="mt-5 rounded-xl bg-[#fff8ed] px-3 py-3 text-xs text-[#8b5d20]">{shareFeedback}</p>}
        </section>
      </div>}
      <CouponOffersDrawer open={couponsOpen} onClose={() => setCouponsOpen(false)} onUse={code => { applyCouponCode(code); setCouponsOpen(false); }} />
      {addressPickerOpen && <AddressPickerModal addresses={addresses} selectedAddressId={selectedAddressId} draft={addressDraft} onSelect={selectAddress} onEdit={startEditAddress} onRemove={removeAddress} onAdd={startNewAddress} onDraftChange={updateAddressDraft} onSave={saveAddress} onCancel={() => setAddressDraft(null)} onClose={() => setAddressPickerOpen(false)} onSwitchToPickup={() => openMobileDeliveryPicker("pickup")} />}
      {branchPickerOpen && branchPickerMode === "redbox" && <RedBoxBranchPickerModal items={items} onSelect={selectBranch} onClose={closeBranchPicker} />}
      {branchPickerOpen && branchPickerMode !== "redbox" && <DeraahBranchPickerBottomSheetModal items={items} selectedBranchId={selectedBranchId} onSelect={selectBranch} onClose={closeBranchPicker} />}
      <GiftCustomizationModal open={giftCustomizationOpen} initial={giftCustomization} onClose={() => setGiftCustomizationOpen(false)} onSave={customization => { syncGiftCustomizationCart(customization); setGiftCustomization(customization); setIsGiftOrder(true); setGiftCustomizationOpen(false); }} />
      {giftPickerCartItem && giftPickerOffer && <StoreGiftPicker item={giftPickerCartItem} offer={giftPickerOffer} selectedGiftIds={giftSelections[giftPickerCartItem.id] ?? []} onToggle={giftId => toggleGift(giftPickerCartItem, giftId)} onClose={() => setGiftPickerItem(null)} />}
      <MukafaatiPointsModal open={pointsModalOpen} initialProviderId={selectedLoyaltyProviderId} onClose={() => setPointsModalOpen(false)} onPointsAdded={addLoyaltyPoints} />
    </main>
    <div className="md:hidden"><StoreMobileNav collapsed={false} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
  </div>;
}
