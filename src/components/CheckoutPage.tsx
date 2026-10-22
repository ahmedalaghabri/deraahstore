import { Fragment, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Banknote, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Copy, CreditCard, Eye, Gift, Link2, List, Map as MapIcon, MapPin, MoreVertical, Music2, PackageOpen, PenLine, Phone, Play, Plus, Search, ShieldCheck, ShoppingCart, Tag, TicketPercent, Trash2, Truck, UserRound, Video, X } from "lucide-react";
import QRCode from "qrcode";
import { RiyalPrice } from "./RiyalPrice";
import CouponOffersDrawer, { couponOffers } from "./CouponOffersDrawer";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { isGiftCustomizationItem, STORE_GIFT_CUSTOMIZATION_PREFIX, useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreOrders } from "./StoreOrdersContext";
import CartBundleProgress from "./CartBundleProgress";
import { getCartItemOriginalPrice, getGiftOfferForProduct, getGiftSelectionLimit } from "./storeCartData";
import StoreGiftPicker, { SelectedGiftsCard } from "./StoreGiftPicker";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";

const checkoutCouponOffers = [
  ...couponOffers,
  { title: "10% Discount", description: "10% off on your order.", code: "APP10", minimum: 0, discountType: "percent" as const, discountValue: 10 },
];

export type Address = { id: string; label: string; recipient: string; phone: string; city: string; street: string; code?: string; nationalCode?: string; latitude?: number; longitude?: number; otherLabel?: string; recipientDifferent?: boolean; isDefault?: boolean; addressType?: "home" | "redbox" };
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
  let mark = <CreditCard size={32} className="text-[#171a1f]" aria-hidden="true" />;
  if (id === "apple") mark = <img src="/product-assets/payment-logos/Apple-Pay.svg" alt="Apple Pay" className="h-6 w-11 origin-center scale-[3] object-fill" />;
  if (id === "cod") mark = <Banknote size={32} className="text-[#171a1f]" aria-hidden="true" />;
  if (id === "tamara") mark = <span className="grid h-8 w-14 place-items-center rounded-md bg-gradient-to-br from-[#ffc4b7] via-[#e8d1ef] to-[#a9ddff] px-1"><img src="/product-assets/payment-logos/Tamara-custom.svg" alt="Tamara" className="h-5 w-12 object-contain" /></span>;
  if (id === "tabby") mark = <span className="grid h-8 w-14 place-items-center rounded-md bg-[#37eda4] px-1 text-[11px] font-extrabold tracking-[-.04em] text-[#171a1f]">tabby</span>;
  if (id === "mukafaati") mark = <Gift size={large ? 24 : 21} className="text-[#d51678]" aria-hidden="true" />;
  const iconSize = id === "mukafaati" ? "h-6 w-6" : id === "card" || id === "cod" ? "h-8 w-8" : "h-7 w-12";
  return <span className={`flex shrink-0 items-center justify-center overflow-visible ${iconSize}`} aria-hidden={id !== "apple" && id !== "tamara" && id !== "tabby"}>{mark}</span>;
}

function PaymentMethodOption({ id, title, description, selected, balance, onSelect, onToggleWallet }: { id: string; title: string; description: string; selected: boolean; balance?: number; onSelect: () => void; onToggleWallet?: (enabled: boolean) => void }) {
  const descriptionSize = id === "mukafaati" ? "text-[11px]" : id === "tamara" ? "text-[10px] sm:text-xs" : id === "tabby" ? "text-[11px] sm:text-xs" : "text-xs";
  const displayDescription = id === "card" ? "Last used card" : description;
  const isWallet = id === "mukafaati";
  const iconFrame = isWallet ? "flex h-12 w-16 rounded-lg border-0 bg-transparent shadow-none hover:bg-transparent" : "flex h-12 w-16 rounded-lg border border-[#e3e7ec] bg-white transition-colors hover:bg-[#fbfcfd]";
  return <div className={`checkout-payment-option relative grid w-full min-w-0 grid-cols-[20px_64px_minmax(0,1fr)] items-center gap-x-3 rounded-xl p-4 text-left transition-colors ${selected ? "bg-[#ecfdf1] ring-2 ring-[#2c8b4b]" : "bg-[#f8fafc]"}`}>
    {isWallet ? <button type="button" role="checkbox" aria-checked={selected} aria-label={`${selected ? "Disable" : "Enable"} ${title}`} onClick={() => onToggleWallet?.(!selected)} className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c8b4b]/35 ${selected ? "border-[#2c8b4b] bg-[#2c8b4b] text-white" : "border-[#c8d0d9] bg-white text-transparent"}`}>{selected && <Check size={13} strokeWidth={3} />}</button> : <button type="button" onClick={onSelect} aria-label={`Select ${title}`} aria-pressed={selected} className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{selected && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</button>}
    <button type="button" onClick={onSelect} aria-label={`Select ${title} icon`} className={`${iconFrame} shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff]/50`}><PaymentMethodIcon id={id} large={isWallet} /></button>
    <button type="button" onClick={onSelect} className={`min-w-0 flex-1 text-left ${isWallet ? "max-w-[159px]" : ""}`}><strong className="block text-sm">{title}</strong><small className={`mt-1 block leading-4 text-[#6d7178] ${descriptionSize}`}>{displayDescription}</small></button>
    {isWallet && <div className="pointer-events-none absolute right-4 top-3"><RiyalPrice value={money(balance ?? 0)} className="text-[18px] font-bold leading-5 text-[#208447]" /></div>}
  </div>;
}

type PaymentId = "card" | "apple" | "cod" | "tamara" | "tabby" | "mukafaati";
type CardDetails = { holder: string; number: string; expiry: string; cvv: string };

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

function InstallmentPaymentPanel({ provider, total }: { provider: "tamara" | "tabby"; total: number }) {
  const name = provider === "tamara" ? "Tamara" : "Tabby";
  const parts = provider === "tamara" ? 4 : 4;
  return <div role="region" aria-label={`${name} installment widget`} className="checkout-installment-panel rounded-xl border border-[#d7e4f8] bg-[#f5f8ff] p-4">
    <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white"><PaymentMethodIcon id={provider} /></span><div className="min-w-0"><strong className="block text-sm">Pay with {name}</strong><p className="mt-1 text-xs text-[#6d7178]">Your order will be split into {parts} interest-free payments.</p></div></div>
    <div className="checkout-installment-summary mt-4 rounded-lg border border-[#dfe8f5] bg-white p-3"><div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-[#4c5560]">Today</span><RiyalPrice value={Math.ceil(total / parts)} className="font-semibold" /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-[#7b818a]"><span className="rounded-md bg-[#f5f8ff] px-2 py-2">Today</span><span className="rounded-md bg-[#f5f8ff] px-2 py-2">In 30 days</span><span className="rounded-md bg-[#f5f8ff] px-2 py-2">In 60 days</span></div><p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#2c8b4b]"><ShieldCheck size={14} /> No interest or hidden fees</p></div>
  </div>;
}

function MukafaatiPaymentPanel({ balance, feedback, selectedProviderId, onSelectProvider, onAddPoints }: { balance: number; feedback: string; selectedProviderId: LoyaltyProviderId; onSelectProvider: (providerId: LoyaltyProviderId) => void; onAddPoints: () => void }) {
  const [addPointsOpen, setAddPointsOpen] = useState(false);
  const selectedProvider = loyaltyProviders.find(provider => provider.id === selectedProviderId) ?? loyaltyProviders[0];
  return <div role="region" aria-label="Mukafaati wallet" className="checkout-mukafaati-panel rounded-xl border border-[#dfe4e8] bg-[#f8fafc] p-3">
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white p-3"><span className="min-w-0"><strong className="block truncate text-[13px] font-semibold">Mukafaati balance</strong><small className="mt-0.5 block truncate text-[11px] text-[#6d7178]">Applied to this order when the wallet is enabled</small></span><RiyalPrice value={money(balance)} className="shrink-0 text-sm font-semibold text-[#208447]" /></div>
    <button type="button" aria-expanded={addPointsOpen} onClick={() => setAddPointsOpen(open => !open)} className="mt-3 flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-[#eef4ff] px-3 text-left transition-colors hover:bg-[#e7efff]"><span className="flex min-w-0 items-center gap-2"><AlertCircle size={16} className="shrink-0 text-[#555b63]" /><span className="text-xs font-medium text-[#555b63]">You can add credit via</span></span><span className="flex shrink-0 items-center gap-1.5"><LoyaltyProviderMark provider={loyaltyProviders[0]} compact /><LoyaltyProviderMark provider={loyaltyProviders[2]} compact /><ChevronDown size={16} className={`ml-1 text-[#6d7178] transition-transform ${addPointsOpen ? "rotate-180" : ""}`} /></span></button>
    {addPointsOpen && <div className="mt-3 rounded-xl border border-[#dfe4e8] bg-white p-3"><p className="text-[11px] font-semibold text-[#4c5560]">Choose a loyalty program</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{loyaltyProviders.map(provider => <button key={provider.id} type="button" onClick={() => onSelectProvider(provider.id)} aria-pressed={selectedProviderId === provider.id} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 transition-colors ${selectedProviderId === provider.id ? "border-[#2c8b4b] bg-[#ecfdf1]" : "border-[#e5e9ee] bg-white hover:border-[#b9d2c0]"}`}><LoyaltyProviderMark provider={provider} compact /><span className="truncate text-[9px] font-semibold text-[#555b63]">{provider.title}</span></button>)}</div><button type="button" onClick={onAddPoints} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#171a1f] text-[11px] font-semibold text-white transition-colors hover:bg-[#252525]"><Plus size={15} /> Add points from {selectedProvider.title}</button></div>}
    {feedback && <p role="status" className="mt-3 rounded-lg bg-[#ecfdf1] px-3 py-2 text-[11px] font-medium text-[#208447]">{feedback}</p>}
  </div>;
}

function PaymentDetailsPanel({ payment, total, cardDetails, onCardChange, loyaltyBalance, loyaltyFeedback, selectedLoyaltyProviderId, onSelectLoyaltyProvider, onAddMukafaatiPoints }: { payment: PaymentId; total: number; cardDetails: CardDetails; onCardChange: (field: keyof CardDetails, value: string) => void; loyaltyBalance: number; loyaltyFeedback: string; selectedLoyaltyProviderId: LoyaltyProviderId; onSelectLoyaltyProvider: (providerId: LoyaltyProviderId) => void; onAddMukafaatiPoints: () => void }) {
  if (payment === "card") return <CardPaymentPanel details={cardDetails} onChange={onCardChange} />;
  if (payment === "tamara" || payment === "tabby") return <InstallmentPaymentPanel provider={payment} total={total} />;
  if (payment === "mukafaati") return <MukafaatiPaymentPanel balance={loyaltyBalance} feedback={loyaltyFeedback} selectedProviderId={selectedLoyaltyProviderId} onSelectProvider={onSelectLoyaltyProvider} onAddPoints={onAddMukafaatiPoints} />;
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mobileDrag = useMobileSheetDrag(onClose);

  const setCityValue = (value: string) => {
    setCity(value);
    setSelection(current => ({ ...current, city: value.trim() || "Riyadh" }));
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

  return <div role="dialog" aria-modal="true" aria-label="Select delivery location" className="store-mobile-sheet-overlay fixed inset-0 z-[100] flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-5">
    <div style={mobileDrag.dragStyle} className="checkout-location-picker-sheet store-mobile-sheet w-full max-w-[620px] overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl" onClick={event => event.stopPropagation()}>
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div ref={mapRef} role="application" aria-label="Choose delivery location on map" onPointerDown={handleMapPointerDown} onPointerMove={handleMapPointerMove} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)} className={`checkout-location-map relative h-[430px] overflow-hidden bg-[#e5edf0] select-none touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`} style={{ backgroundImage: "linear-gradient(28deg, transparent 45%, rgba(255,255,255,.92) 46%, rgba(255,255,255,.92) 49%, transparent 50%), linear-gradient(112deg, transparent 44%, rgba(255,255,255,.9) 45%, rgba(255,255,255,.9) 48%, transparent 49%), linear-gradient(0deg, rgba(167,211,185,.58) 0 14%, transparent 14% 100%), repeating-linear-gradient(90deg, transparent 0 42px, rgba(180,198,207,.55) 43px 45px), repeating-linear-gradient(0deg, transparent 0 38px, rgba(180,198,207,.55) 39px 41px)" }}>
        <iframe title="Riyadh address map" src={openStreetMapEmbedUrl()} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full border-0" loading="lazy" />
        <button type="button" onPointerDown={event => event.stopPropagation()} onClick={onClose} aria-label="Close map" className="absolute left-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl text-[#30363d] shadow-md">‹</button>
        <div className="absolute inset-x-16 top-4 z-10 flex h-11 items-center gap-2 rounded-full bg-white px-4 shadow-md" onPointerDown={event => event.stopPropagation()}><Search size={19} className="shrink-0 text-[#8a919a]" /><input value={city} onChange={event => setCityValue(event.target.value)} placeholder="Search for an address" aria-label="Search for an address" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>
        <span className="pointer-events-none absolute right-4 top-[68px] z-10 rounded-full bg-white/95 px-3 py-2 text-[10px] font-medium text-[#555b63] shadow-sm">OpenStreetMap</span>
        <div className="absolute z-10 -translate-x-1/2 rounded-full bg-[#171a1f] px-3 py-[7px] text-center text-[11px] font-medium leading-4 text-white shadow-lg" style={{ left: `${pin.x}%`, top: `${pin.y}%`, width: "min(268.86px, calc(100% - 48px))", marginTop: "-152px" }}>Your order will be delivered to this location.</div>
        <MapPin className="absolute z-10 -translate-x-1/2 -translate-y-full text-[#d72683] drop-shadow-md" style={{ left: `${pin.x}%`, top: `${pin.y}%` }} size={46} fill="#d72683" />
        <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => { setCityValue("Riyadh"); setPin({ x: 50, y: 53 }); setSelection(mapLocationPresets[0]); }} className="absolute bottom-4 left-4 z-10 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#555b63] shadow-md">Use my location</button>
      </div>
      <div className="checkout-location-details bg-[#f7f9ff] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
        <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-[#171a1f]">Delivery to</h3><span className="text-xs font-semibold text-[#6d7178]">{selection.city}</span></div>
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[#287cf0] bg-[#f6fcff] p-4 shadow-sm"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[#287cf0]"><span className="h-2.5 w-2.5 rounded-full bg-[#287cf0]" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><strong className="text-sm leading-5 text-[#25272c]">Saudi – {selection.city}</strong><NationalAddressBadge code={selection.code} fallback="RQSA6774" /></div><p className="mt-1 text-xs leading-5 text-[#555b63]">{selection.city} Region · {selection.district.endsWith("District") ? selection.district : `${selection.district} District`} · {selection.street}</p></div></div>
        <button type="button" onClick={confirmLocation} className="mt-3 h-12 w-full rounded-xl bg-[#171a1f] text-sm font-semibold text-white">Confirm location</button>
      </div>
    </div>
  </div>;
}

export function AddressForm({ draft, onChange, onSave, onCancel }: { draft: Address; onChange: (field: keyof Address, value: string | boolean) => void; onSave: () => void; onCancel: () => void }) {
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const otherLabel = draft.otherLabel ?? "";
  const [firstName = "", ...lastNameParts] = draft.recipient.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ");
  const updateRecipient = (first: string, last: string) => onChange("recipient", `${first} ${last}`.trim());

  return <div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><strong className="block text-base font-semibold tracking-[-.01em] text-[#171a1f]">Add new address</strong><p className="mt-1 text-xs leading-5 text-[#6d7178]">Add a reliable contact and delivery location.</p></div><button type="button" onClick={onCancel} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#555b63] transition-colors hover:bg-[#f0f3f6]">Cancel</button></div>
    <section className="rounded-2xl border border-[#e1e7ee] bg-white p-3">
      <div className="relative mb-3 h-24 overflow-hidden rounded-xl bg-[#dfe8ec]" style={{ backgroundImage: "linear-gradient(28deg, transparent 45%, rgba(255,255,255,.85) 46%, rgba(255,255,255,.85) 49%, transparent 50%), linear-gradient(112deg, transparent 44%, rgba(255,255,255,.8) 45%, rgba(255,255,255,.8) 48%, transparent 49%), repeating-linear-gradient(90deg, transparent 0 30px, rgba(180,198,207,.55) 31px 33px), repeating-linear-gradient(0deg, transparent 0 24px, rgba(180,198,207,.55) 25px 27px)" }}><MapPin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-[#d72683] drop-shadow-sm" size={30} fill="#d72683" /><span className="absolute left-3 top-2 text-[10px] font-semibold text-[#6c7d86]">Riyadh</span><span className="absolute bottom-2 right-3 text-[10px] font-semibold text-[#6c7d86]">Al Salam</span></div>
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#7a8490]">Address location</p><p className="mt-1 text-sm leading-5 text-[#171a1f]">{draft.city || "City"}{draft.street ? ` · ${draft.street}` : " · Select district and street"}</p></div><button type="button" onClick={() => setLocationPickerOpen(true)} className="h-10 shrink-0 rounded-xl border border-[#dfe4e8] px-3 text-xs font-semibold text-[#3f4852] transition-colors hover:border-[#287cf0] hover:text-[#1768d4]">Change</button></div>
    </section>
    <div><p className="mb-2 text-sm font-semibold text-[#25272c]">Address name</p><div className="grid grid-cols-3 gap-2">{["Home", "Work", "Other"].map(label => <button key={label} type="button" onClick={() => onChange("label", label)} className={`h-11 rounded-xl border text-sm font-medium transition-colors ${draft.label === label ? "border-[#287cf0] bg-[#f1f7ff] text-[#1768d4]" : "border-[#dfe4e8] bg-white text-[#555b63] hover:border-[#b8c1ca]"}`}>{label}</button>)}</div></div>
    {draft.label === "Other" && <input value={otherLabel} onChange={event => onChange("otherLabel", event.target.value)} placeholder="Address name" className="h-12 w-full rounded-xl border border-[#dfe4e8] bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#9aa4b2] focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" />}
    <div><label className="mb-2 block text-sm font-semibold text-[#25272c]" htmlFor="address-national-code">National address</label><input id="address-national-code" value={draft.nationalCode ?? ""} onChange={event => onChange("nationalCode", event.target.value.toUpperCase())} placeholder="Generated from the map or enter manually" className="h-12 w-full rounded-xl border border-[#dfe4e8] bg-white px-3 text-sm uppercase outline-none transition-colors placeholder:normal-case placeholder:text-[#9aa4b2] focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" /></div>
    <label className="flex min-h-12 items-center gap-3 px-1 py-2.5 text-sm font-medium text-[#25272c]"><input type="checkbox" checked={!!draft.recipientDifferent} onChange={event => onChange("recipientDifferent", event.target.checked)} className="h-5 w-5 shrink-0 accent-[#287cf0]" /><span>Another person will receive the order.</span></label>
    {draft.recipientDifferent && <div className="grid gap-3 sm:grid-cols-2"><input value={firstName} onChange={event => updateRecipient(event.target.value, lastName)} placeholder="First name" className="h-12 rounded-xl border border-[#dfe4e8] bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#9aa4b2] focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" /><input value={lastName} onChange={event => updateRecipient(firstName, event.target.value)} placeholder="Last name" className="h-12 rounded-xl border border-[#dfe4e8] bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#9aa4b2] focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" /><input value={draft.phone} onChange={event => onChange("phone", event.target.value)} placeholder="+966 5X XXX XXXX" className="h-12 rounded-xl border border-[#dfe4e8] bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#9aa4b2] focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10 sm:col-span-2" /></div>}
    <label className="flex min-h-12 items-center gap-3 px-1 py-2.5 text-sm font-medium text-[#25272c]"><input type="checkbox" checked={!!draft.isDefault} onChange={event => onChange("isDefault", event.target.checked)} className="h-5 w-5 shrink-0 accent-[#287cf0]" /><span>Set as default address</span></label>
    <button type="button" disabled={!draft.city || !draft.street} onClick={onSave} className="h-12 w-full rounded-xl bg-[#171a1f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#252a30] disabled:cursor-not-allowed disabled:bg-[#9aa1ac]">Save address</button>
    {locationPickerOpen && <LocationPicker draft={draft} onChange={onChange} onClose={() => setLocationPickerOpen(false)} />}
  </div>;
}

function NationalAddressBadge({ code, fallback = "RQSA6774" }: { code?: string; fallback?: string }) {
  const nationalCode = code?.trim().match(/^[A-Za-z]{4}\d{4}$/)?.[0].toUpperCase() || fallback;
  return <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#f7f8fa] px-2 py-1 text-[10px] font-semibold tracking-wide text-[#59616b]"><MapPin size={13} className="text-[#2c8b4b]" />{nationalCode}</span>;
}

function SavedAddressCard({ address, selected = false, onSelect, onEdit, onRemove }: { address: Address; selected?: boolean; onSelect: () => void; onEdit: () => void; onRemove: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <article className={`checkout-saved-address-card relative rounded-xl border ${selected ? "border-[#006ffd] bg-[#f6fcff]" : "border-[#dfe4e8] bg-white"}`}>
    <button type="button" onClick={onSelect} className="block min-h-[88px] w-full rounded-xl p-3 pr-12 text-left">
      <span className="flex items-start justify-between gap-3"><strong className="block text-sm">{address.label}</strong><NationalAddressBadge code={address.nationalCode || address.code} fallback={address.id === "work" ? "RQSA4543" : address.id === "friend" ? "RQSA6544" : "RQSA6774"} /></span><span className="mt-1 block text-xs text-[#6d7178]">{address.recipient} · {address.phone}</span><span className="mt-1 block text-xs text-[#6d7178]">{address.city} · {address.street}</span>
    </button>
    <button type="button" aria-label={`Address options for ${address.label}`} onClick={() => setMenuOpen(open => !open)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-[#7b8490] transition-colors hover:bg-[#f2f5f7] hover:text-[#252a30]"><MoreVertical size={17} /></button>
    {menuOpen && <div className="absolute right-2 top-10 z-10 min-w-24 rounded-lg border border-[#e3e7eb] bg-white p-1 shadow-lg"><button type="button" onClick={() => { setMenuOpen(false); onEdit(); }} className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-[#3f4852] hover:bg-[#f5f7f8]">Edit</button><button type="button" onClick={() => { setMenuOpen(false); onRemove(); }} className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-[#c1262f] hover:bg-[#fff2f2]">Remove</button></div>}
  </article>;
}

function AddressPickerModal({ addresses, selectedAddressId, draft, onSelect, onEdit, onRemove, onAdd, onDraftChange, onSave, onCancel, onClose }: { addresses: Address[]; selectedAddressId: string | null; draft: Address | null; onSelect: (id: string) => void; onEdit: (address: Address) => void; onRemove: (id: string) => void; onAdd: (addressType: "home" | "redbox") => void; onDraftChange: (field: keyof Address, value: string | boolean) => void; onSave: () => void; onCancel: () => void; onClose: () => void }) {
  const [addressType, setAddressType] = useState<"home" | "redbox">(() => addresses.find(address => address.id === selectedAddressId)?.addressType ?? "home");
  const [pendingAddressId, setPendingAddressId] = useState<string | null>(null);
  const mobileDrag = useMobileSheetDrag(onClose);
  const visibleAddresses = addresses.filter(address => (address.addressType ?? "home") === addressType);
  return <div role="dialog" aria-modal="true" aria-label="Select delivery address" className="store-mobile-sheet-overlay fixed inset-0 z-[90] flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-5">
    <div style={mobileDrag.dragStyle} className="checkout-address-picker-sheet store-mobile-sheet max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 shadow-2xl md:max-w-[560px] md:rounded-3xl md:px-5 md:pb-5 md:pt-5" onClick={event => event.stopPropagation()}>
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
        {draft ? <AddressForm draft={draft} onChange={onDraftChange} onSave={onSave} onCancel={onCancel} /> : <>
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Select address</h2><p className="mt-1 text-xs text-[#6d7178]">Choose where you want your order delivered.</p></div><button type="button" onClick={onClose} aria-label="Close address picker" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#555b63]"><X size={18} /></button></div>
          <div className="mt-4 grid grid-cols-2 rounded-xl bg-[#f4f6f8] p-1"><button type="button" onClick={() => { setAddressType("home"); setPendingAddressId(null); }} className={`h-10 rounded-lg text-xs font-semibold transition-colors ${addressType === "home" ? "bg-white text-[#171a1f] shadow-sm" : "text-[#6d7178]"}`}>Home delivery</button><button type="button" onClick={() => { setAddressType("redbox"); setPendingAddressId(null); }} className={`h-10 rounded-lg text-xs font-semibold transition-colors ${addressType === "redbox" ? "bg-white text-[#171a1f] shadow-sm" : "text-[#6d7178]"}`}>Redbox addresses</button></div>
          <button type="button" onClick={() => onAdd(addressType)} className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-[#2c8b4b] text-sm font-semibold text-[#2c8b4b]">+ Add new address</button>
          <div className="mt-3 space-y-2">{visibleAddresses.map(address => <SavedAddressCard key={address.id} address={address} selected={address.id === (pendingAddressId ?? selectedAddressId)} onSelect={() => setPendingAddressId(address.id)} onEdit={() => onEdit(address)} onRemove={() => onRemove(address.id)} />)}{!visibleAddresses.length && <div className="rounded-xl border border-dashed border-[#dfe4e8] px-4 py-8 text-center text-xs text-[#6d7178]">No {addressType === "redbox" ? "Redbox" : "home delivery"} addresses yet.</div>}</div>
          {pendingAddressId && <button type="button" onClick={() => { onSelect(pendingAddressId); onClose(); }} className="mt-4 h-11 w-full rounded-xl bg-[#171a1f] text-sm font-semibold text-white">Confirm address</button>}
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

function BranchPickerModal({ items, selectedBranchId, onSelect, onClose }: { items: StoreCartItem[]; selectedBranchId: string | null; onSelect: (branch: StoreBranch) => void; onClose: () => void }) {
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "availability">("nearest");
  const filteredBranches = storeBranches.filter(branch => `${branch.name} ${branch.area} ${branch.address}`.toLowerCase().includes(query.toLowerCase().trim()));
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

  return <div role="dialog" aria-modal="true" aria-label="Choose a Deraah branch" className="branch-picker fixed inset-0 z-[100] flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-5"><div className="branch-picker-panel flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-[720px] md:rounded-3xl">
    <div className="flex items-start justify-between gap-4 border-b border-[#edf0f3] p-4 md:p-5"><div><h3 className="text-lg font-semibold">Choose a Deraah branch</h3><p className="mt-1 text-xs text-[#6d7178]">Check stock and choose where you want to collect your order.</p></div><button type="button" onClick={onClose} aria-label="Close branch picker" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#555b63]"><X size={18} /></button></div>
    <div className="border-b border-[#edf0f3] p-4 md:p-5"><div className="flex items-center gap-2 rounded-xl border border-[#dfe4e8] px-3"><Search size={17} className="shrink-0 text-[#8a919a]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by area or branch" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><div className="mt-3 flex items-center justify-between gap-3"><div className="flex rounded-lg bg-[#f5f7f9] p-1"><button type="button" onClick={() => setView("list")} className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${view === "list" ? "bg-white text-[#171a1f] shadow-sm" : "text-[#6d7178]"}`}><List size={15} /> List</button><button type="button" onClick={() => setView("map")} className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ${view === "map" ? "bg-white text-[#171a1f] shadow-sm" : "text-[#6d7178]"}`}><MapIcon size={15} /> Map</button></div><label className="flex items-center gap-2 text-xs text-[#6d7178]">Sort<select value={sort} onChange={event => setSort(event.target.value as "nearest" | "availability")} className="rounded-md border border-[#dfe4e8] bg-white px-2 py-1.5 text-xs font-semibold text-[#3f4852] outline-none"><option value="nearest">Nearest</option><option value="availability">Availability</option></select></label></div></div>
    {view === "map" ? <div className="branch-map relative min-h-0 flex-1 overflow-hidden bg-[#dfe9ed] md:h-[min(650px,calc(92vh-220px))] md:min-h-[520px]"><iframe title="Deraah branch map" src={openStreetMapEmbedUrl(mapBranch)} className="absolute inset-0 h-full w-full border-0" loading="lazy" /><div className="absolute inset-0 z-10 pointer-events-none">{visibleBranches.map(branch => <button key={branch.id} type="button" aria-label={`${branch.name} · ${availabilityCopy(branch.availability).label}`} onClick={() => setMapBranchId(branch.id)} className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white p-1 shadow-lg transition-transform hover:scale-110 ${branchMarkerTone(branch.availability)} ${branch.id === mapBranch?.id ? "ring-2 ring-[#171a1f] ring-offset-2" : ""}`} style={branch.position}><MapPin size={25} fill="currentColor" strokeWidth={1.8} /></button>)}</div><div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-2"><span className="rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-[#555b63] shadow-sm">Riyadh · {visibleBranches.length} branches</span><span className="rounded-full bg-white/95 px-3 py-2 text-[10px] text-[#555b63] shadow-sm">OpenStreetMap</span></div><div className="absolute inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-20 flex items-end gap-2 overflow-x-auto pb-1">{orderedMapBranches.map(branch => <button key={branch.id} type="button" disabled={branch.availability === "unavailable"} onClick={() => onSelect(branch)} className={`flex min-w-[196px] shrink-0 items-start gap-2 rounded-xl border bg-white p-3 text-left shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-80 ${branch.id === mapBranch?.id ? "border-[#2c8b4b]" : "border-white"}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${branch.id === mapBranch?.id ? "border-[#2c8b4b]" : "border-[#c8d0d9]"}`}>{branch.id === mapBranch?.id && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span><span className="min-w-0"><strong className="block text-[11px]">{branch.name}</strong><span className="mt-1 block text-[10px] text-[#6d7178]">{branch.distance} · {availabilityCopy(branch.availability).label}</span></span></button>)}</div></div> : <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f7f9ff] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 md:px-5 md:pb-5 md:pt-5">{selectedBranchId && storeBranches.find(branch => branch.id === selectedBranchId) && <div className="rounded-xl border border-[#2c8b4b] bg-[#ecfdf1] p-3 text-xs text-[#206b39]"><strong>Saved branch</strong><p className="mt-1">{storeBranches.find(branch => branch.id === selectedBranchId)?.name} · {storeBranches.find(branch => branch.id === selectedBranchId)?.distance}</p></div>}{branchCards}{!visibleBranches.length && <p className="py-10 text-center text-sm text-[#6d7178]">No branches match your search.</p>}</div>}
  </div></div>;
}

function DeliveryAddressSummary({ address, shipping }: { address: Address; shipping: number }) {
  return <article className="checkout-address-card rounded-[12px] border border-[#2c8b4b] bg-[#ecfdf1]/60 p-3">
    <div className="flex items-start gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[#2c8b4b]"><span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{address.label}</strong><span className="mt-1 block text-xs text-[#6d7178]">{address.recipient} · {address.phone}</span><span className="mt-1 block text-xs text-[#6d7178]">{address.city} · {address.street}</span><span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#cfe9d7] pt-2 text-xs"><span><strong>{address.addressType === "redbox" ? "Redbox" : "Home delivery"}</strong></span><span><span className="text-[#6d7178]">Fee: </span><strong className="text-[#2c8b4b]">{shipping === 0 ? "Free" : <RiyalPrice value={money(shipping)} />}</strong></span></span></span></div>
  </article>;
}

const samples = [
  { name: "Small deraah art packaging set RED", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw3c159d0c/images/10211221053000-2006-1.png?q=50&sh=920&sw=920" },
  { name: "Medium Deraah Art Packaging Set Blue", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dwb3d3decf/images/10211221053000-2008-1.png?sh=920&sw=920" },
  { name: "Small Deraah art packaging set Green", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw4aff568a/images/10211221053000-2012-1.png?q=50&sh=920&sw=920" },
];

const money = (value: number) => value.toLocaleString("en-US");

type LoyaltyProviderId = "resal" | "qitaf" | "mokafaa" | "mobily";
type LoyaltyProvider = { id: LoyaltyProviderId; label: string; title: string; tone: string; background: string };

const loyaltyProviders: LoyaltyProvider[] = [
  { id: "resal", label: "resal", title: "Resal Card", tone: "text-[#2056f5]", background: "bg-[#eef3ff]" },
  { id: "qitaf", label: "قطاف", title: "Qitaf points", tone: "text-[#9d55c7]", background: "bg-[#fbf1ff]" },
  { id: "mokafaa", label: "مكافأة", title: "Mokafaa points", tone: "text-[#1590c7]", background: "bg-[#eefaff]" },
  { id: "mobily", label: "موبايلي", title: "Mobily points", tone: "text-[#2f63e8]", background: "bg-[#f0f4ff]" },
];

function readMukafaatiBalance() {
  if (typeof window === "undefined") return 49;
  const raw = window.localStorage.getItem("deraah-mukafaati-balance");
  const saved = raw === null ? Number.NaN : Number(raw);
  return Number.isFinite(saved) && saved >= 0 ? saved : 49;
}

function LoyaltyProviderMark({ provider, compact = false }: { provider: LoyaltyProvider; compact?: boolean }) {
  return <span className={`grid shrink-0 place-items-center rounded-lg ${compact ? "h-8 w-10" : "h-10 w-10"} ${provider.background} ${provider.tone}`}><strong className={`${compact ? "text-[8px]" : "text-[9px]"} font-bold leading-3`}>{provider.label}</strong></span>;
}

function MukafaatiPointsModal({ open, initialProviderId = "resal", onClose, onPointsAdded }: { open: boolean; initialProviderId?: LoyaltyProviderId; onClose: () => void; onPointsAdded: (amount: number, provider: LoyaltyProvider) => void }) {
  const [step, setStep] = useState<"choose" | "verify">("choose");
  const [providerId, setProviderId] = useState<LoyaltyProviderId>("resal");
  const [cardNumber, setCardNumber] = useState("");
  const [amount, setAmount] = useState("20");
  const [useAll, setUseAll] = useState(true);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const provider = loyaltyProviders.find(item => item.id === providerId) ?? loyaltyProviders[0];
  const availableAmount = 20;

  useEffect(() => {
    if (!open) return;
    setStep("choose");
    setProviderId(initialProviderId);
    setCardNumber("");
    setAmount(String(availableAmount));
    setUseAll(true);
    setOtp(["", "", "", ""]);
    setError("");
  }, [open, initialProviderId]);

  if (!open) return null;

  const continueToVerification = () => {
    if (cardNumber.replace(/\s/g, "").length < 6) {
      setError(`Enter your ${provider.title} number to continue.`);
      return;
    }
    setError("");
    setStep("verify");
  };

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    setOtp(current => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < otp.length - 1) otpRefs.current[index + 1]?.focus();
  };

  const confirmPoints = () => {
    if (otp.join("").length !== 4) {
      setError("Enter the 4-digit verification code.");
      return;
    }
    const points = Math.min(availableAmount, Math.max(1, Number(amount) || availableAmount));
    onPointsAdded(points, provider);
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="mukafaati-points-title" className="fixed inset-0 z-[145] flex items-end justify-center bg-[#0f172a]/35 p-0 md:items-center md:p-6" onClick={onClose}>
    <section className="flex max-h-[calc(100dvh-16px)] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[28px] bg-white md:max-h-[min(720px,calc(100dvh-48px))] md:rounded-[24px]" onClick={event => event.stopPropagation()}>
      <header className="flex shrink-0 items-center justify-between gap-4 bg-[#d51678] px-5 py-4 text-white md:px-6">
        <div className="flex min-w-0 items-center gap-2"><Gift size={18} /><div><h2 id="mukafaati-points-title" className="text-sm font-semibold">Mukafaati</h2><p className="mt-0.5 text-[10px] text-white/80">Add points from another loyalty program</p></div></div>
        <button type="button" onClick={onClose} aria-label="Close Mukafaati points" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15"><X size={16} /></button>
      </header>
      <div className="min-h-0 overflow-y-auto p-5 md:p-6">
        {step === "choose" ? <>
          <div className="text-center"><h3 className="text-lg font-semibold text-[#171a1f]">Add points from</h3><p className="mt-1 text-xs leading-5 text-[#7b818a]">Convert your points to Mukafaati points and use them to pay.</p></div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {loyaltyProviders.map(item => <button key={item.id} type="button" onClick={() => { setProviderId(item.id); setError(""); }} aria-pressed={providerId === item.id} className={`flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-xl border px-1.5 py-2 transition-colors ${providerId === item.id ? "border-[#287cf0] bg-[#f5f8ff]" : "border-[#e5e9ee] bg-white hover:border-[#b9d2ff]"}`}><LoyaltyProviderMark provider={item} /><span className="truncate text-[9px] font-semibold text-[#555b63]">{item.title}</span></button>)}
          </div>
          <p className="mt-5 text-center text-xs text-[#555b63]">Use your {provider.title} balance and add it to your Mukafaati wallet.</p>
          <label className="mt-4 block text-[11px] font-semibold text-[#4c5560]">Enter {provider.title} number<input value={cardNumber} onChange={event => { setCardNumber(event.target.value); setError(""); }} placeholder="Enter card number" inputMode="numeric" className="mt-2 h-12 w-full rounded-xl border border-[#dfe4e8] px-4 text-sm outline-none transition-colors focus:border-[#287cf0]" /></label>
          {error && <p role="alert" className="mt-3 text-xs font-semibold text-[#b42318]">{error}</p>}
          <button type="button" onClick={continueToVerification} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#287cf0] text-sm font-semibold text-white transition-colors hover:bg-[#1768d4]">Continue <ChevronRight size={17} /></button>
          <p className="mt-4 text-center text-[10px] leading-4 text-[#9aa1ac]">Your loyalty card details are used only to verify the points transfer.</p>
        </> : <>
          <button type="button" onClick={() => { setStep("choose"); setError(""); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6d7178] hover:text-[#171a1f]"><ArrowLeft size={15} /> Back</button>
          <div className="mt-5 flex items-center gap-3"><LoyaltyProviderMark provider={provider} /><div><h3 className="text-base font-semibold text-[#171a1f]">{provider.label} balance found</h3><p className="mt-1 text-xs text-[#7b818a]">You have {availableAmount} SAR available to transfer.</p></div></div>
          <div className="mt-5 rounded-xl border border-[#dfe4e8] bg-[#fbfcfd] p-4"><div className="flex items-center justify-between gap-3"><label className="text-[11px] font-semibold text-[#4c5560]">Points to add<input value={amount} onChange={event => { setAmount(event.target.value.replace(/[^0-9]/g, "").slice(0, 2)); setUseAll(false); }} inputMode="numeric" className="mt-2 h-11 w-[150px] rounded-lg border border-[#dfe4e8] bg-white px-3 text-center text-lg font-semibold outline-none focus:border-[#287cf0]" /></label><button type="button" onClick={() => { setAmount(String(availableAmount)); setUseAll(true); }} aria-pressed={useAll} className={`mt-5 h-8 rounded-full px-3 text-[10px] font-semibold transition-colors ${useAll ? "bg-[#ecfdf1] text-[#208447]" : "bg-[#f1f3f5] text-[#6d7178]"}`}>Use all points</button></div><p className="mt-3 text-[10px] text-[#9aa1ac]">1 SAR = 1 Mukafaati point value in this preview.</p></div>
          <div className="mt-5 text-center"><p className="text-xs text-[#6d7178]">A 4-digit code was sent to the mobile linked to this card.</p><div className="mt-4 flex justify-center gap-2">{otp.map((digit, index) => <input key={index} ref={element => { otpRefs.current[index] = element; }} value={digit} onChange={event => updateOtp(index, event.target.value)} onKeyDown={event => { if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus(); }} aria-label={`Verification digit ${index + 1}`} inputMode="numeric" maxLength={1} className="h-12 w-12 rounded-lg border border-[#dfe4e8] text-center text-lg font-semibold outline-none focus:border-[#287cf0]" />)}</div><button type="button" className="mt-3 text-[10px] font-semibold text-[#287cf0]">Resend code · 55:00</button></div>
          {error && <p role="alert" className="mt-3 text-center text-xs font-semibold text-[#b42318]">{error}</p>}
          <button type="button" onClick={confirmPoints} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#287cf0] text-sm font-semibold text-white transition-colors hover:bg-[#1768d4]">Use now <Check size={17} /></button>
        </>}
      </div>
    </section>
  </div>;
}

function getFreeUnitsByItem(items: StoreCartItem[]) {
  const units = items.filter(item => !isGiftCustomizationItem(item)).flatMap(item => Array.from({ length: item.quantity }, () => ({ id: item.id, price: Number(item.price.replace(/[^0-9]/g, "")) })));
  const freeUnits = new Map<string, number>();
  units.sort((a, b) => b.price - a.price);
  for (let index = 0; index + 2 < units.length; index += 3) {
    for (const unit of [units[index + 1], units[index + 2]]) freeUnits.set(unit.id, (freeUnits.get(unit.id) ?? 0) + 1);
  }
  return freeUnits;
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

export default function CheckoutPage({ step = "cart" }: { step?: "cart" | "shipping" }) {
  const { cartItems: items, addToCart, updateQuantity, removeItem, giftSelections, setGiftSelections } = useStoreCart();
  const { addOrder } = useStoreOrders();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [delivery, setDelivery] = useState<"shipping" | "pickup" | null>(() => loadLastUsedAddressId(loadAddresses()) ? "shipping" : null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(() => {
    const initialAddresses = loadAddresses();
    const initialSelectedId = loadLastUsedAddressId(initialAddresses);
    return initialAddresses.find(address => address.id === initialSelectedId)?.addressType === "redbox" ? "redbox" : "standard";
  });
  const [payment, setPayment] = useState<PaymentId>("card");
  const [cardDetails, setCardDetails] = useState<CardDetails>({ holder: "", number: "", expiry: "", cvv: "" });
  const [paymentError, setPaymentError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>(() => loadAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => loadLastUsedAddressId(loadAddresses()));
  const [addressDraft, setAddressDraft] = useState<Address | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(() => loadSelectedBranchId());
  const [selectedSample] = useState(loadSelectedSample);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState("");
  const [couponsOpen, setCouponsOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [loyaltyBalance, setLoyaltyBalance] = useState(readMukafaatiBalance);
  const [selectedLoyaltyProviderId, setSelectedLoyaltyProviderId] = useState<LoyaltyProviderId>("resal");
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
  const loyaltyDiscount = payment === "mukafaati" ? Math.min(loyaltyBalance, beforeLoyaltyTotal) : 0;
  const total = beforeLoyaltyTotal - loyaltyDiscount;
  const selectedBranch = storeBranches.find(branch => branch.id === selectedBranchId) ?? null;
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
    setPayment("mukafaati");
    setSelectedLoyaltyProviderId(provider.id);
    setLoyaltyFeedback(`${amount} SAR added from ${provider.title} to your Mukafaati wallet.`);
    setPointsModalOpen(false);
  };
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
  const isShippingStep = step === "shipping";
  const cardReady = cardDetails.holder.trim().length > 1 && cardDetails.number.replace(/\s/g, "").length >= 12 && cardDetails.expiry.length >= 4 && cardDetails.cvv.length >= 3;
  const paymentReady = (payment !== "card" || cardReady) && (payment !== "mukafaati" || loyaltyBalance > 0);
  const deliveryReady = delivery === "shipping" ? Boolean(selectedAddressId) : delivery === "pickup" && Boolean(selectedBranch);
  const canContinue = Boolean(items.length) && (isShippingStep ? paymentReady : deliveryReady);
  const continueLabel = isShippingStep
    ? payment === "apple" ? "Pay with Apple Pay" : payment === "mukafaati" ? "Pay with Mukafaati" : payment === "tamara" ? "Continue with Tamara" : payment === "tabby" ? "Continue with Tabby" : "Place order"
    : payment === "apple" ? "Continue to Apple Pay" : payment === "mukafaati" ? "Continue with Mukafaati" : payment === "tamara" ? "Continue with Tamara" : payment === "tabby" ? "Continue with Tabby" : "Continue to payment";
  const paymentMethods: Array<[PaymentId, string, string]> = [["card", "Credit or debit card", "Visa, Mastercard and Mada"], ["apple", "Apple Pay", "Fast and secure payment"], ["cod", "Cash on delivery", "Pay when your order arrives"], ["tamara", "Tamara", "Split your purchase into 4 payments"], ["tabby", "Tabby", "Pay in 4 interest-free payments"], ["mukafaati", "Mukafaati", "Pay with your loyalty wallet"]];
  const continueToShipping = () => {
    if (!isShippingStep && !deliveryReady) {
      setPaymentError("Select a delivery method and destination to continue.");
      return;
    }
    if (isShippingStep && !paymentReady) {
      setPaymentError("Enter your card details to continue securely.");
      return;
    }
    if (isShippingStep) {
      const selectedAddress = addresses.find(address => address.id === selectedAddressId) ?? null;
      const orderId = `DRH-${String(Date.now()).slice(-8)}`;
      const orderSnapshot = { id: orderId, placedAt: new Date().toISOString(), items, subtotal, promotionDiscount, couponDiscount, shipping, total, payment, delivery, shippingMethod, address: selectedAddress, branch: selectedBranch, isGiftOrder, giftCustomization: isGiftOrder ? giftCustomization : null };
      window.localStorage.setItem("deraah-last-order", JSON.stringify(orderSnapshot));
      addOrder(orderSnapshot);
      window.location.assign("/payment-summary");
      return;
    }
    window.location.assign("/shipping-payment");
  };
  const selectPayment = (nextPayment: PaymentId) => {
    setPayment(nextPayment);
    setPaymentError("");
  };
  const updateCardDetails = (field: keyof CardDetails, value: string) => {
    setCardDetails(current => ({ ...current, [field]: value }));
    setPaymentError("");
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
  const startNewAddress = (addressType: "home" | "redbox" = "home") => setAddressDraft({ id: "", label: "Home", recipient: "", phone: "", city: "", street: "", code: "", nationalCode: "", otherLabel: "", recipientDifferent: false, isDefault: false, addressType });
  const startEditAddress = (address: Address) => setAddressDraft({ ...address, label: ["Home", "Work", "Other"].includes(address.label) ? address.label : "Other", otherLabel: address.otherLabel ?? (["Home", "Work", "Other"].includes(address.label) ? "" : address.label) });
  const saveAddress = () => {
    if (!addressDraft) return;
    const validPhone = addressDraft.phone.replace(/\D/g, "").length >= 8;
    if (!addressDraft.city.trim() || !addressDraft.street.trim() || !addressDraft.recipient.trim() || !validPhone || (addressDraft.label === "Other" && !addressDraft.otherLabel?.trim())) return;
    const id = addressDraft.id || `address-${Date.now()}`;
    const savedAddress = {
      ...addressDraft,
      id,
      label: addressDraft.label === "Other" && addressDraft.otherLabel?.trim() ? addressDraft.otherLabel.trim() : addressDraft.label,
      recipient: addressDraft.recipient.trim(),
      phone: addressDraft.phone.trim(),
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
    setSelectedBranchId(branch.id);
    window.localStorage.setItem("deraah-selected-branch", branch.id);
    setBranchPickerOpen(false);
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
  return <div dir="ltr" className={`checkout-page checkout-step-${step} min-h-screen bg-[#F3F7FF] text-[#171a1f]`}>
    <StoreHeader />
    <main className="mx-auto max-w-[1240px] px-5 py-7 md:px-8 md:py-10">
    <div className="mb-6"><button type="button" onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.assign("/product-details#details"); }} className="flex items-center gap-2 text-sm font-medium text-[#555b63]"><ArrowLeft size={18} /> Back to cart</button></div>
      {placed && <div role="status" className="mb-6 flex items-center gap-3 rounded-xl bg-[#ecfdf1] px-4 py-4 text-sm font-medium text-[#208447]"><Check size={19} /> Order received. We will confirm the delivery details shortly.</div>}
      <div className="checkout-layout grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {isShippingStep && <div className="shipping-cart-summary rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6"><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="text-xl leading-none text-[#171a1f]">▸</span><div><h2 className="text-[18px] font-semibold">Order details</h2><p className="mt-1 text-xs text-[#6d7178]">Review your products before payment</p></div></div><button type="button" onClick={() => window.location.assign("/checkout")} aria-label="Edit cart details" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#dfe4e8] text-lg text-[#171a1f] transition-colors hover:bg-[#f5f7f8]">✎</button></div><div className="mt-5 flex items-center gap-3"><div className="flex min-w-0 items-center gap-1.5">{items.slice(0, 3).map(item => <span key={item.id} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7]"><img src={item.image} alt="" className="h-8 w-8 object-contain" /></span>)}{items.length > 3 && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f5f6f7] text-xs font-semibold text-[#6d7178]">+{items.length - 3}</span>}</div><span className="min-w-0 flex-1 text-sm text-[#6d7178]">{orderItemCount} items in your cart</span><RiyalPrice value={money(subtotal)} className="shrink-0 text-base font-semibold" /></div><button type="button" onClick={() => window.location.assign("/checkout")} className="mt-4 text-xs font-semibold text-[#2c8b4b]">Edit cart details</button></div>}
          <div className="checkout-products-stack">
          {items.length > 0 && <CartBundleProgress items={items} compact className="w-full" />}
          <section className="checkout-products-card rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-[18px] font-semibold md:text-xl">Your products</h2><p className="mt-1 text-xs text-[#6d7178]">{orderItemCount} items in your order</p></div></div>
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
                        <img src={item.image} alt={item.name} className={`checkout-product-image-asset block h-auto w-auto object-contain ${isLeaderProduct ? "h-[75px] max-h-none max-w-[72px]" : "max-h-[75px] max-w-[72px]"} md:max-w-[84px]`} />
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
                <span className="inline-flex rounded-full bg-[#d8f4df] px-2 py-1 text-[10px] font-semibold text-[#208447]">Gift</span>
                <strong className="text-[14px] font-medium text-[#208447]"><RiyalPrice value="0" /></strong>
              </div>
            </article>
          </section>}
          <GiftCustomizationFreeItems customization={giftCustomization} enabled={isGiftOrder} />
          <SelectedGiftsCard items={items} giftSelections={giftSelections} />
          </div>
          {!isShippingStep && <section className="checkout-delivery-section rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
            <h2 className="text-[19px] font-semibold md:text-xl">Order delivery</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:mt-5">
              <button type="button" aria-pressed={delivery === "shipping"} onClick={() => setDelivery("shipping")} className={`delivery-method-option flex min-h-[76px] min-w-0 items-center gap-3 rounded-xl p-3 text-left transition-colors md:min-h-[84px] ${delivery === "shipping" ? "bg-[#ecfdf1] ring-2 ring-[#2c8b4b]" : "bg-[#f8fafc]"}`}>
                <Truck className="h-5 w-5 shrink-0 text-[#2c8b4b]" size={20} />
                <div className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold leading-tight">delivery</strong><span className="mt-1 block truncate text-[10px] leading-tight text-[#6d7178]">To your address</span></div>
              </button>
              <button type="button" aria-pressed={delivery === "pickup"} onClick={() => { setDelivery("pickup"); setBranchPickerOpen(true); }} className={`delivery-method-option flex min-h-[76px] min-w-0 items-center gap-3 rounded-xl p-3 text-left transition-colors md:min-h-[84px] ${delivery === "pickup" ? "bg-[#ecfdf1] ring-2 ring-[#2c8b4b]" : "bg-[#f8fafc]"}`}>
                <MapPin className="h-5 w-5 shrink-0 text-[#2c8b4b]" size={20} />
                <div className="min-w-0 flex-1"><strong className="block truncate text-sm leading-tight">Pickup</strong><span className="mt-1 block truncate text-[10px] leading-tight text-[#6d7178]">from branch</span></div>
              </button>
            </div>
            {delivery === "shipping" && <div className="mt-4 space-y-3"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Delivery address</h3>{selectedAddressId && <button type="button" onClick={() => setAddressPickerOpen(true)} className="min-h-10 rounded-lg px-2 text-xs font-semibold text-[#2c8b4b] hover:bg-[#f0fbf4]">Change</button>}</div>{addresses.filter(address => address.id === selectedAddressId).map(address => <DeliveryAddressSummary key={address.id} address={address} shipping={shipping} />)}{!selectedAddressId && <button type="button" onClick={() => setAddressPickerOpen(true)} className="flex min-h-14 w-full items-center justify-between rounded-xl border border-dashed border-[#2c8b4b] bg-[#f7fcf8] px-4 text-left text-sm font-semibold text-[#208447]">Choose a delivery address <ChevronRight size={17} /></button>}
              <div onClick={event => { if ((event.target as HTMLElement).closest("input,button")) return; if (isGiftOrder) setGiftCustomizationOpen(true); }} className={`checkout-gift-option-card rounded-xl border p-4 shadow-[0_4px_16px_rgba(30,50,80,.04)] ${isGiftOrder ? "cursor-pointer border-[#b9d2ff] bg-[#f5fbff] hover:border-[#6ea8ff] hover:shadow-[0_6px_20px_rgba(110,168,255,.14)]" : "border-[#edf0f3] bg-white"}`}><label className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left"><span className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e6efff] text-[#6ea8ff]"><Gift size={20} /></span><span className="min-w-0"><strong className="block text-sm text-[#171a1f]">Send this order as a gift</strong><small className="mt-1 block text-xs leading-4 text-[#6d7178]">Choose a card, message and gift box</small></span></span><input type="checkbox" checked={isGiftOrder} onChange={event => { const checked = event.target.checked; setIsGiftOrder(checked); if (checked) { window.localStorage.setItem(GIFT_ORDER_KEY, "true"); setGiftCustomizationOpen(true); } else clearGiftCustomization(); }} className="peer sr-only" /><span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#6ea8ff]/40 ${isGiftOrder ? "border-[#6ea8ff] bg-[#6ea8ff] text-white" : "border-[#c8d0d9] bg-white text-transparent"}`}><Check size={15} strokeWidth={3} /></span></label>{isGiftOrder && <><button type="button" onClick={() => setGiftCustomizationOpen(true)} aria-label="Edit gift details" title="Edit gift details" className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#b9d2ff] bg-white px-3 text-left text-xs font-semibold text-[#5689d8] transition-colors hover:border-[#6ea8ff] hover:bg-[#f3f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ea8ff]/40"><span className="flex min-w-0 items-center gap-2"><PackageOpen size={17} /><span className="truncate">{giftCustomization.recipient ? `Gift for ${giftCustomization.recipient}` : "Customize your gift details"}</span></span><ChevronRight size={16} /></button><p className="mt-2 truncate px-1 text-[11px] text-[#6d7178]">{giftSelectionSummary(giftCustomization)}</p></>}</div>
            </div>}
            {delivery === "pickup" && <button type="button" onClick={() => setBranchPickerOpen(true)} className="mt-4 flex min-h-14 w-full items-center justify-between rounded-lg border border-[#dfe4e8] px-3 text-left"><span className="min-w-0"><strong className="block truncate text-sm">{selectedBranch?.name ?? "Choose a Deraah branch"}</strong><small className="mt-1 block truncate text-xs text-[#6d7178]">{selectedBranch ? `${selectedBranch.distance} · ${availabilityCopy(selectedBranch.availability).label}` : "Select a branch to see availability"}</small></span><ChevronRight size={17} className="shrink-0 text-[#6d7178]" /></button>}
          </section>}
          <section className="checkout-payment-section rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6"><h2 className="text-[18px] font-semibold md:text-xl">Payment method</h2><div className="mt-5 space-y-3">{paymentMethods.map(([id, title, description]) => <div key={id}><PaymentMethodOption id={id} title={title} description={description} balance={id === "mukafaati" ? loyaltyBalance : undefined} selected={payment === id} onSelect={() => selectPayment(id)} onToggleWallet={id === "mukafaati" ? enabled => { if (enabled) selectPayment(id); else { setPayment("card"); setLoyaltyFeedback(""); } } : undefined} />{payment === id && <div className="mt-3"><PaymentDetailsPanel payment={id} total={total} cardDetails={cardDetails} onCardChange={updateCardDetails} loyaltyBalance={loyaltyBalance} loyaltyFeedback={loyaltyFeedback} selectedLoyaltyProviderId={selectedLoyaltyProviderId} onSelectLoyaltyProvider={setSelectedLoyaltyProviderId} onAddMukafaatiPoints={() => { setLoyaltyFeedback(""); setPointsModalOpen(true); }} /></div>}</div>)}</div>{paymentError && <p role="alert" className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#b42318]"><AlertCircle size={15} />{paymentError}</p>}</section>
        </div>
        {isShippingStep && <ShippingCartSummary items={items} orderItemCount={orderItemCount} subtotal={discountedSubtotal} className="desktop-shipping-cart-summary" />}
        <aside className="h-fit rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.07)] lg:sticky lg:top-6"><div className="mb-5 border-b border-[#edf0f3] pb-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f8ef] text-[#2c8b4b]"><Tag size={21} /></span><div className="min-w-0 flex-1"><strong className="block whitespace-nowrap text-[13px] font-semibold sm:text-sm">Do you have a discount coupon?</strong><button type="button" onClick={() => setCouponsOpen(true)} className="mt-1 inline-flex whitespace-nowrap items-center gap-0 text-[11px] font-semibold text-[#2c8b4b] hover:underline sm:text-xs"><span>View available discount coupons</span><ChevronDown size={16} /></button></div></div><div className="mt-3 flex h-11 min-w-0 items-center gap-2 rounded-lg border border-[#dfe4e8] bg-white px-2"><input value={coupon} disabled={couponApplied} onChange={event => { setCoupon(event.target.value); setCouponApplied(false); setCouponFeedback(""); }} onKeyDown={event => { if (event.key === "Enter") applyCoupon(); }} placeholder="Enter coupon code" className={`min-w-0 flex-1 bg-transparent px-2 text-xs outline-none ${couponApplied ? "cursor-not-allowed text-[#6d7178]" : ""}`} /><button type="button" onClick={couponApplied ? removeCoupon : applyCoupon} className={`h-8 shrink-0 rounded-md px-3 text-[11px] font-semibold text-white ${couponApplied ? "bg-[#687386] hover:bg-[#4d5869]" : "bg-[#171a1f] hover:bg-[#252525]"}`}>{couponApplied ? "Remove" : "Apply"}</button></div>{couponFeedback && <p className={`mt-2 text-xs font-medium ${couponApplied ? "text-[#2c8b4b]" : "text-[#b42318]"}`}>{couponFeedback}</p>}</div><h2 className="mb-4 text-[18px] font-semibold md:text-xl">Order summary</h2><div className="space-y-3 border-b border-[#edf0f3] pb-5 text-sm"><div className="flex justify-between"><span className="text-[#6d7178]">Subtotal</span><RiyalPrice value={money(subtotal)} /></div>{promotionDiscount > 0 && <div className="flex justify-between text-[#2c8b4b]"><span>1+2 Free</span><span>- <RiyalPrice value={money(promotionDiscount)} /></span></div>}{couponApplied && activeCouponOffer && <div className="flex justify-between text-[#2c8b4b]"><span>{activeCouponOffer.code} · {activeCouponOffer.discountType === "percent" ? `${activeCouponOffer.discountValue}% off` : `${activeCouponOffer.discountValue} off`}</span><span>- <RiyalPrice value={money(couponDiscount)} /></span></div>}{loyaltyDiscount > 0 && <div className="flex justify-between text-[#2c8b4b]"><span>Mukafaati points</span><span>- <RiyalPrice value={money(loyaltyDiscount)} /></span></div>}<div className="flex justify-between"><span className="text-[#6d7178]">Shipping</span><span className={shipping === 0 ? "font-semibold text-[#2c8b4b]" : ""}>{shipping ? <RiyalPrice value={money(shipping)} /> : "Free"}</span></div><div className="flex justify-between"><span className="text-[#6d7178]">Free sample</span><span className="font-semibold text-[#2c8b4b]">Free</span></div></div><div className="mt-5 flex justify-between text-lg font-semibold"><span>Total</span><RiyalPrice value={money(total)} /></div><button type="button" disabled={!canContinue} onClick={continueToShipping} className={`${isShippingStep ? "shipping-place-order " : ""}mt-6 flex h-12 w-full items-center justify-between gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-[#252525] disabled:cursor-not-allowed disabled:bg-[#9aa1ac]`}><span className="flex items-center gap-2"><Check size={17} /> {continueLabel}</span><RiyalPrice value={money(total)} light /></button><p className="mt-4 text-center text-[11px] leading-5 text-[#7b818a]">By placing your order, you agree to our terms and privacy policy.</p><div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#2c8b4b]"><ShieldCheck size={16} /> Secure and protected checkout</div></aside>
      </div>
      <CouponOffersDrawer open={couponsOpen} onClose={() => setCouponsOpen(false)} onUse={code => { applyCouponCode(code); setCouponsOpen(false); }} />
      {addressPickerOpen && <AddressPickerModal addresses={addresses} selectedAddressId={selectedAddressId} draft={addressDraft} onSelect={selectAddress} onEdit={startEditAddress} onRemove={removeAddress} onAdd={startNewAddress} onDraftChange={updateAddressDraft} onSave={saveAddress} onCancel={() => setAddressDraft(null)} onClose={() => setAddressPickerOpen(false)} />}
      {branchPickerOpen && <BranchPickerModal items={items} selectedBranchId={selectedBranchId} onSelect={selectBranch} onClose={() => setBranchPickerOpen(false)} />}
      <GiftCustomizationModal open={giftCustomizationOpen} initial={giftCustomization} onClose={() => setGiftCustomizationOpen(false)} onSave={customization => { syncGiftCustomizationCart(customization); setGiftCustomization(customization); setIsGiftOrder(true); setGiftCustomizationOpen(false); }} />
      {giftPickerCartItem && giftPickerOffer && <StoreGiftPicker item={giftPickerCartItem} offer={giftPickerOffer} selectedGiftIds={giftSelections[giftPickerCartItem.id] ?? []} onToggle={giftId => toggleGift(giftPickerCartItem, giftId)} onClose={() => setGiftPickerItem(null)} />}
      <MukafaatiPointsModal open={pointsModalOpen} initialProviderId={selectedLoyaltyProviderId} onClose={() => setPointsModalOpen(false)} onPointsAdded={addLoyaltyPoints} />
    </main>
    <div className="md:hidden"><StoreMobileNav collapsed={false} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
  </div>;
}
