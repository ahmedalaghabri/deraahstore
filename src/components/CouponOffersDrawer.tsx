import { useState } from "react";
import { Check, ChevronDown, Clock3, Copy, TicketPercent } from "lucide-react";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";

export type Coupon = {
  title: string;
  description: string;
  code: string;
  minimum: number;
  discountType: "fixed" | "percent";
  discountValue: number;
  endsIn?: readonly [string, string, string];
};

export const couponOffers: Coupon[] = [
  { title: "70 Discount", description: "Get 70 off on orders of 799 or more.", code: "OFF70", minimum: 799, discountType: "fixed", discountValue: 70 },
  { title: "5% Discount", description: "Get 5% off on orders of 149 or more.", code: "GET5", minimum: 149, discountType: "percent", discountValue: 5, endsIn: ["02", "10", "50"] },
  { title: "35 Discount", description: "Get 35 off on orders of 399 or more.", code: "OFF35", minimum: 399, discountType: "fixed", discountValue: 35, endsIn: ["05", "18", "32"] },
  { title: "50 Discount", description: "Get 50 off on orders of 499 or more.", code: "OFF50", minimum: 499, discountType: "fixed", discountValue: 50, endsIn: ["01", "08", "24"] },
];

type CouponOffersDrawerProps = {
  open: boolean;
  onClose: () => void;
  onUse?: (code: string) => void;
};

export default function CouponOffersDrawer({ open, onClose, onUse }: CouponOffersDrawerProps) {
  const [copied, setCopied] = useState("");
  const [expandedCoupon, setExpandedCoupon] = useState("");
  const mobileDrag = useMobileSheetDrag(onClose);

  if (!open) return null;

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      // Clipboard access can be unavailable in preview environments.
    }
    setCopied(code);
    window.setTimeout(() => setCopied(current => current === code ? "" : current), 1600);
  };

  const handleCodeAction = (code: string) => {
    if (onUse) {
      onUse(code);
      return;
    }
    void copyCode(code);
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="deraah-coupon-drawer-title" className="store-mobile-sheet-overlay fixed inset-0 z-[120] flex items-end justify-end bg-black/35 md:items-stretch" onClick={onClose}>
    <section style={mobileDrag.dragStyle} className="store-mobile-sheet coupon-offers-drawer relative flex max-h-[calc(100dvh-16px)] w-full max-w-[500px] flex-col overflow-y-auto rounded-t-[24px] bg-white px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5 text-left shadow-2xl md:h-full md:max-h-none md:rounded-l-[24px] md:rounded-t-none md:px-6 md:pb-6 md:pt-7" onClick={event => event.stopPropagation()}>
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 id="deraah-coupon-drawer-title" className="text-[18px] font-bold leading-6 tracking-[-.02em] text-[#171717] md:text-xl">Available Coupons</h2>
          <p className="mt-1 text-xs text-[#7b818a]">Choose a coupon and apply it to your order.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close coupons" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e1e6eb] bg-[#f6f7f8] text-xl leading-none text-[#39414a] transition-colors hover:bg-[#e8edf3]">×</button>
      </div>
      <div className="grid gap-4">
        {couponOffers.map(coupon => {
          const isExpanded = expandedCoupon === coupon.code;
          return <article key={coupon.code} className={`coupon-design-card ${isExpanded ? "is-expanded" : ""}`}>
            <div className="coupon-design-card__heading">
              <span className="coupon-design-card__icon"><TicketPercent size={17} strokeWidth={2} /></span>
              <div><h3>{coupon.title}</h3><p>{coupon.description}</p></div>
            </div>
            <div className="coupon-design-card__code-row">
              {onUse ? <button type="button" onClick={() => onUse(coupon.code)} className="coupon-design-card__code">{coupon.code}</button> : <span className="coupon-design-card__code">{coupon.code}</span>}
              <button type="button" onClick={() => handleCodeAction(coupon.code)} className={`coupon-design-card__copy ${copied === coupon.code ? "is-copied" : ""}`}>{onUse ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.8} />}{onUse ? "Apply" : copied === coupon.code ? "Copied ✓" : "Copy"}</button>
            </div>
            {coupon.endsIn && <div className="coupon-design-card__expiry"><span><Clock3 size={14} strokeWidth={1.8} />Ends in</span><div>{coupon.endsIn.map((value, index) => <span key={`${coupon.code}-${value}`}><strong>{value}</strong><small>{["Days", "Hours", "Minutes"][index]}</small></span>)}</div></div>}
            <button type="button" onClick={() => setExpandedCoupon(isExpanded ? "" : coupon.code)} aria-expanded={isExpanded} className="coupon-design-card__details"><span>Details, Terms and Conditions</span><ChevronDown size={15} className={isExpanded ? "is-open" : ""} strokeWidth={1.7} /></button>
            {isExpanded && <div className="coupon-design-card__terms">Valid on eligible orders that meet the minimum spend. One coupon per order. Cannot be combined with other offers.</div>}
          </article>;
        })}
      </div>
    </section>
  </div>;
}
