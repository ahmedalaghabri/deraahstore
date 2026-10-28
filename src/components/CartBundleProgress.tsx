import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { StoreCartItem } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";

export default function CartBundleProgress({ items, compact = false, className = "", showAddProducts = true }: { items: StoreCartItem[]; compact?: boolean; className?: string; showAddProducts?: boolean }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const itemCount = items.reduce((total, cartItem) => total + cartItem.quantity, 0);
  const remainder = itemCount % 3;
  const itemsUntilOffer = remainder === 0 ? 0 : 3 - remainder;
  const offerComplete = itemCount > 0 && remainder === 0;
  const itemLabel = isArabic
    ? itemsUntilOffer === 1 ? "منتجاً واحداً" : itemsUntilOffer === 2 ? "منتجين" : `${itemsUntilOffer} منتجات`
    : `${itemsUntilOffer === 1 ? "item" : "items"}`;
  const message = offerComplete
    ? isArabic ? "اكتمل عرضك المجاني" : "Your 1+2 Free offer is ready"
    : isArabic ? `أضف ${itemLabel} للوصول إلى عرض 1+2 مجاناً` : `Add ${itemsUntilOffer} more ${itemLabel} to unlock 1+2 Free`;
  const cardTone = offerComplete ? "border-[#bfe8ca] bg-gradient-to-br from-[#f2fff5] to-[#e6f9ed]" : "border-[#e1e7e3] bg-white";
  const headingTone = offerComplete ? "text-[#185c31]" : "text-[#263b2e]";
  const copyTone = offerComplete ? "text-[#3d694b]" : "text-[#66736b]";
  const DirectionIcon = isArabic ? ArrowLeft : ArrowRight;

  return <div className={`cart-bundle-progress ${className ? "" : "mt-5"} shrink-0 overflow-hidden rounded-2xl border ${cardTone} ${compact ? "px-3 py-3" : "px-4 py-4"} ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2c8b4b] text-[9px] font-bold leading-[10px] text-white shadow-sm"><span>1+2<br />FREE</span></span>
        <div className="min-w-0 pt-0.5"><strong className={`block text-[12px] font-semibold ${headingTone}`}>{isArabic ? "أضف منتجاتك المجانية" : "Unlock your free items"}</strong><p className={`mt-1 text-[11px] leading-4 ${copyTone}`}>{message}</p></div>
      </div>
      <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-[#2c8b4b]">{offerComplete ? (isArabic ? "مكتمل" : "Unlocked") : `${remainder}/3`}</span>
    </div>
    <div className="mt-3 flex items-center gap-1.5" aria-label={isArabic ? `تمت إضافة ${remainder} من 3 منتجات ضمن عرض 1+2 مجاناً` : `${remainder} of 3 items added toward the 1+2 Free offer`}>
      {[0, 1, 2].map(step => <span key={step} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${offerComplete || step < remainder ? "bg-[#2c8b4b]" : "bg-[#e1e7e3]"}`} />)}
    </div>
    <div className={`mt-2 flex min-w-0 items-center justify-between gap-3 text-[10px] ${copyTone}`}><span className="min-w-0 flex-1">{offerComplete ? <span className="inline-flex items-center gap-1 font-semibold text-[#2c8b4b]"><Check size={12} /> {isArabic ? "اكتمل العرض" : "Offer completed"}</span> : (isArabic ? "واصل التسوق لإكمال العرض" : "Keep shopping to complete your offer")}</span>{showAddProducts && <button type="button" onClick={() => window.location.assign("/store-home#shop")} className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#185c31] underline underline-offset-2 transition-colors hover:text-[#0e3d20]">{isArabic ? "عودة للتسوق" : "Add products"} <DirectionIcon size={12} /></button>}</div>
  </div>;
}
