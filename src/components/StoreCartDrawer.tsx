import { createPortal } from "react-dom";
import { Fragment, useState } from "react";
import { ArrowLeft, Gift, PenLine, Plus, TicketPercent, Trash2, X } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import { useStoreCart } from "./StoreCartContext";
import { cartRewardStages, formatPrice, freeSampleOptions, getCartItemOriginalPrice, getCartItemSize, getGiftOfferForProduct, getGiftSelectionLimit } from "./storeCartData";
import StoreGiftPicker, { SelectedGiftsCard } from "./StoreGiftPicker";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";

type StoreCartDrawerProps = {
  mode?: "drawer" | "page";
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
};

function CartCoupon({ code, applied, onChange, onApply, insideCard = false }: { code: string; applied: boolean; onChange: (value: string) => void; onApply: () => void; insideCard?: boolean }) {
  return <section className={insideCard ? "border-b border-[#edf0f3] pb-4" : "border-b border-[#e5e9ee] py-5"}><h3 className="text-[17px] font-semibold text-[#171a1f]">Discount code</h3><div className="mt-3 flex h-11 items-center gap-2 rounded-lg border border-[#dfe4e8] bg-white px-2"><TicketPercent size={17} strokeWidth={1.7} className="shrink-0 text-[#2c8b4b]" /><input value={code} onChange={event => onChange(event.target.value)} aria-label="Coupon code" placeholder="Enter coupon code" className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-[#171a1f] outline-none placeholder:text-[#9aa1ac]" /><button type="button" onClick={onApply} disabled={!code.trim()} className="h-8 shrink-0 rounded-md bg-[#171a1f] px-4 text-[11px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35">Apply</button></div>{applied && <p className="mt-2 text-[11px] font-medium text-[#2c8b4b]">Coupon code added.</p>}</section>;
}

export default function StoreCartDrawer({ mode = "drawer", open, onClose, onBack }: StoreCartDrawerProps) {
  const { cartItems: items, cartItemCount: itemCount, subtotal, updateQuantity, removeItem, giftSelections, setGiftSelections } = useStoreCart();
  const [selectedSample, setSelectedSample] = useState(() => {
    if (typeof window === "undefined") return 0;
    const savedValue = window.localStorage.getItem("deraah-selected-sample");
    try {
      const savedSample = JSON.parse(savedValue ?? "null") as { name?: string } | null;
      const savedIndex = freeSampleOptions.findIndex(sample => sample.name === savedSample?.name);
      if (savedIndex >= 0) return savedIndex;
      const legacyColorIndex = savedSample?.name?.toLowerCase().includes("blue") ? 1 : savedSample?.name?.toLowerCase().includes("green") ? 2 : savedSample?.name?.toLowerCase().includes("red") ? 0 : -1;
      if (legacyColorIndex >= 0) return legacyColorIndex;
    } catch {
      // Fall back to the legacy index format below.
    }
    const savedIndex = Number(savedValue);
    return Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < freeSampleOptions.length ? savedIndex : 0;
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedReward, setSelectedReward] = useState(0);
  const [giftPickerItem, setGiftPickerItem] = useState<string | null>(null);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const pageMode = mode === "page";
  const mobileDrag = useMobileSheetDrag(onClose, { enabled: !pageMode });
  const shippingRemaining = Math.max(0, 300 - subtotal);
  const finalRewardThreshold = cartRewardStages[cartRewardStages.length - 1].threshold;
  const rewardProgress = Math.min(100, Math.round((subtotal / finalRewardThreshold) * 100));
  const unlockedRewards = cartRewardStages.filter(stage => subtotal >= stage.threshold).length;
  const nextReward = cartRewardStages.find(stage => subtotal < stage.threshold);
  const giftPickerCartItem = giftPickerItem ? items.find(item => item.id === giftPickerItem) ?? null : null;
  const giftPickerOffer = giftPickerCartItem ? getGiftOfferForProduct(giftPickerCartItem.name) : null;
  const toggleGift = (item: typeof items[number], giftId: string) => {
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

  if (!open) return null;

  return createPortal(<div dir="ltr" role={pageMode ? undefined : "dialog"} aria-modal={pageMode ? undefined : true} aria-labelledby="shopping-cart-title" className={pageMode ? "min-h-screen bg-white" : "cart-drawer-overlay store-mobile-sheet-overlay fixed inset-0 z-[140] flex justify-end bg-black/35 backdrop-blur-[3px] max-md:items-end"} onClick={pageMode ? undefined : onClose}>
    <aside onClick={event => event.stopPropagation()} style={!pageMode ? mobileDrag.dragStyle : undefined} className={pageMode ? "cart-page-content mx-auto flex min-h-screen w-full max-w-[760px] flex-col overflow-y-auto bg-[#F3F7FF] px-8 pb-8 pt-7 text-left max-md:px-5 max-md:pt-5" : "cart-drawer-panel store-mobile-sheet flex h-full w-full max-w-[500px] flex-col overflow-hidden rounded-l-[24px] border-l border-[#e5e9ee] bg-[#FAFCFF] px-8 pb-8 pt-7 text-left shadow-[-16px_0_50px_rgba(15,23,42,.14)] max-md:max-w-none max-md:rounded-l-none max-md:rounded-t-[24px] max-md:border-l-0 max-md:border-t max-md:px-4 max-md:pt-5"}>
      {!pageMode && <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />}
      <div className="flex shrink-0 items-center justify-between border-b border-[#e5e9ee] pb-3"><div><h2 id="shopping-cart-title" className="text-[22px] font-semibold text-[#171a1f]">{pageMode ? "Cart" : "Mini cart"}</h2><p className="mt-1 text-[14px] text-[#6d7178]">{itemCount} {itemCount === 1 ? "item" : "items"}</p></div><button type="button" onClick={pageMode ? (onBack ?? onClose) : onClose} aria-label={pageMode ? "Back to shopping" : "Close mini cart"} className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]">{pageMode ? <ArrowLeft size={18} strokeWidth={1.8} /> : <X size={18} strokeWidth={1.8} />}</button></div>
      <div className={pageMode ? "contents" : "cart-drawer-content min-h-0 flex-1 overflow-y-auto"}>
      <div className="cart-drawer-reward-card mb-4 overflow-hidden rounded-2xl border border-[#e5e9ee] bg-white p-4 shadow-[0_8px_30px_rgba(30,50,80,.05)]"><div className="flex items-center justify-between text-[12px] text-[#202124]"><span>{nextReward ? <>Spend {formatPrice(Math.max(0, nextReward.threshold - subtotal))} more to unlock {nextReward.title}</> : "All rewards unlocked"}</span><span className="font-semibold text-[#2c8b4b]">{unlockedRewards}/4</span></div><div className="relative mx-2 mt-6 h-2 rounded-full bg-[#e5eee8]"><span className="block h-full rounded-full bg-[#2c8b4b] transition-[width] duration-300" style={{ width: `${rewardProgress}%` }} />{cartRewardStages.map((stage, index) => <button key={stage.threshold} type="button" onClick={() => setSelectedReward(index)} aria-label={`${stage.title} reward at ${formatPrice(stage.threshold)}`} aria-pressed={selectedReward === index} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-1" style={{ left: `${(stage.threshold / finalRewardThreshold) * 100}%` }}><span className={`block h-4 w-4 rounded-full border-2 border-white shadow-sm ${subtotal >= stage.threshold ? "" : "bg-white"}`} style={subtotal >= stage.threshold ? { backgroundColor: stage.color } : undefined} /></button>)}</div><div className="mt-3 grid grid-cols-4 gap-1 text-center">{cartRewardStages.map((stage, index) => <button key={`label-${stage.threshold}`} type="button" onClick={() => setSelectedReward(index)} className={`rounded-md px-1 py-1 text-[12px] leading-3 transition-colors ${selectedReward === index ? "font-semibold" : "text-[#6d7178]"}`} style={selectedReward === index ? { backgroundColor: stage.softColor, color: stage.color } : undefined}><span className="block font-semibold">{formatPrice(stage.threshold)}</span><span className="block text-[11px] font-normal">{stage.title}</span></button>)}</div></div>
      {items.length === 0 ? <div className="flex flex-1 flex-col items-center py-8 text-center"><img src="/product-assets/cart/empty-cart-bag-reference.png" alt="Empty shopping cart" className="mb-8 block h-auto w-[283px] max-w-full object-contain max-md:me-[115px] max-md:h-[196.95px] max-md:w-[280px] max-md:max-w-none" /><h3 className="text-[20px] font-semibold text-[#1f2024]">Your Shopping Cart is Empty.</h3><p className="mt-2 max-w-[320px] text-[10px] leading-5 text-[#585858]">Discover our collection and find your next signature scent.</p></div> : <>
        <section className="cart-drawer-products-card mb-4 rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(30,50,80,.05)]"><div className="flex items-center justify-between"><h3 className="text-[17px] font-semibold text-[#171a1f]">Your items</h3><span className="text-[11px] text-[#6d7178]">{itemCount} total</span></div><div className="cart-drawer-products-list mt-4">{items.map(item => { const unitPrice = Number(item.price.replace(/[^0-9]/g, "")); const originalPrice = getCartItemOriginalPrice(item); const isSquareProductImage = item.image === "/product-assets/gallery/secondary-4.png"; const giftOffer = getGiftOfferForProduct(item.name); const selectedGiftIds = giftSelections[item.id] ?? []; return <Fragment key={item.id}><article key={item.id} className="cart-drawer-product-row rounded-none border-b border-[#dfe4e8] bg-transparent p-3 last:border-b-0"><div className="cart-drawer-product-row-content flex items-start gap-3"><div className="cart-drawer-product-image grid min-h-[112px] w-[84px] shrink-0 self-stretch place-items-center overflow-hidden rounded-lg bg-[#F5F6F7] md:w-[96px]"><img src={item.image} alt={item.name} className={`cart-drawer-product-image-asset block h-auto w-auto max-h-[75px] max-w-[72px] origin-center object-contain md:max-w-[84px] ${isSquareProductImage ? "scale-[1.4]" : ""}`} /></div><div className="cart-drawer-product-info min-w-0 flex-1"><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><>{pageMode && giftOffer && <div className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#edf9f0] px-2 py-1 text-[10px] font-semibold text-[#287a43]"><Gift size={12} strokeWidth={1.8} /><span>Gift available</span><span className="mx-0.5 h-3 w-px bg-[#b7d6bf]" /><button type="button" onClick={() => setGiftPickerItem(item.id)} aria-label={selectedGiftIds.length ? "Edit gifts" : "Choose a gift"} title={selectedGiftIds.length ? "Edit gifts" : "Choose a gift"} className="grid h-5 w-5 place-items-center rounded-md text-[#287a43] transition-colors hover:bg-white"><span className="sr-only">{selectedGiftIds.length ? "Edit gifts" : "Choose a gift"}</span>{selectedGiftIds.length ? <PenLine size={12} strokeWidth={2} /> : <Plus size={13} strokeWidth={2} />}</button>{selectedGiftIds.length > 0 && <button type="button" onClick={() => setGiftSelections(item.id, [])} aria-label="Remove selected gifts" title="Remove selected gifts" className="grid h-5 w-5 place-items-center rounded-md text-[#b14a4a] transition-colors hover:bg-white"><span className="sr-only">Remove selected gifts</span><Trash2 size={12} strokeWidth={1.8} /></button>}</div>}<h4 className="cart-drawer-product-title min-w-0 flex-1 text-[14px] font-semibold leading-5 text-[#171a1f]">{item.name}</h4></></div><p className="mt-1 text-[12px] text-[#8a8f98]">{getCartItemSize(item)}</p><div className="cart-drawer-product-price mt-2 flex items-baseline gap-2"><strong className="text-[16px] font-medium text-[#171a1f]"><RiyalPrice value={formatPrice(unitPrice)} /></strong>{originalPrice > unitPrice && <s className="text-[11px] text-[#8a8f98] line-through"><RiyalPrice value={formatPrice(originalPrice)} /></s>}</div><div className="cart-drawer-product-quantity mt-3 flex h-8 w-[96px] items-center justify-between rounded-full bg-[#f5f5f5] px-[7px]"><button type="button" onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)} aria-label={item.quantity <= 1 ? `Remove ${item.name}` : "Decrease product quantity"} className="grid h-7 w-7 place-items-center rounded-full text-xl leading-none text-[#6d7178] transition-colors hover:text-[#c1262f]">{item.quantity <= 1 ? <Trash2 size={15} strokeWidth={1.8} /> : "−"}</button><span className="min-w-4 text-center text-[14px] font-medium">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase product quantity" className="grid h-7 w-7 place-items-center rounded-full text-xl leading-none text-[#6d7178] transition-colors hover:text-[#171a1f]">+</button></div></div></div></div></div></article></Fragment>; })}</div></section>
        <SelectedGiftsCard items={items} giftSelections={giftSelections} />
        <section className="cart-drawer-sample-card mb-4 rounded-2xl border border-[#e5e9ee] bg-white p-4 shadow-[0_8px_30px_rgba(30,50,80,.05)]"><div className="flex items-start justify-between gap-4"><div><h3 className="text-[17px] font-semibold text-[#171a1f]">Choose a free sample</h3><p className="mt-1 text-[11px] leading-5 text-[#666b73]">Select one gift sample to include with your order.</p></div><span className="shrink-0 rounded-full bg-[#edf7ef] px-2.5 py-1 text-[10px] font-semibold text-[#2c8b4b]">FREE</span></div><div className="mt-4 space-y-2.5">{freeSampleOptions.map((sample, index) => <button key={sample.name} type="button" onClick={() => { setSelectedSample(index); window.localStorage.setItem("deraah-selected-sample", JSON.stringify(sample)); }} aria-pressed={selectedSample === index} className={`flex w-full items-center gap-3 rounded-xl border border-[#edf0f3] p-2.5 text-left transition-colors ${selectedSample === index ? "bg-[#f8fafc] shadow-sm" : "bg-white hover:bg-[#f8fafc]"}`}><span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${selectedSample === index ? "border-[#171a1f]" : "border-[#c8d0d9]"}`}><span className={`h-2 w-2 rounded-full ${selectedSample === index ? "bg-[#171a1f]" : "bg-transparent"}`} /></span><span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f3f4f6]"><img src={sample.image} alt="" className="h-10 w-10 object-contain mix-blend-multiply" /></span><span className="min-w-0 flex-1 text-[12px] font-medium leading-4 text-[#24272c]">{sample.name}</span><span className="text-[11px] font-semibold text-[#2c8b4b]">Free</span></button>)}</div></section>
        <div className="cart-order-summary-card mb-4 rounded-2xl border border-[#e5e9ee] bg-white p-4 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-5">
          <CartCoupon insideCard code={couponCode} applied={couponApplied} onChange={value => { setCouponCode(value); setCouponApplied(false); }} onApply={() => setCouponApplied(true)} />
          <section className="pt-4"><h3 className="text-[17px] font-semibold text-[#171a1f]">Order summary</h3><div className="mt-4 space-y-2 text-[12px] text-[#4f555d]"><div className="flex justify-between"><span>Subtotal</span><RiyalPrice value={formatPrice(subtotal)} /></div><div className="flex justify-between"><span>Free sample</span><span className="font-semibold text-[#2c8b4b]">Free</span></div><div className="flex justify-between"><span>Shipping</span><span className={shippingRemaining === 0 ? "font-semibold text-[#2c8b4b]" : "text-[#6d7178]"}>{shippingRemaining === 0 ? "Free" : "Calculated at checkout"}</span></div><div className="flex justify-between border-t border-[#e5e9ee] pt-3 text-[15px] font-semibold text-[#171a1f]"><span>Total</span><RiyalPrice value={formatPrice(subtotal)} /></div></div></section>
        </div>
        <div className={`cart-drawer-footer sticky bottom-0 -mx-8 -mb-8 mt-auto border-t border-[#e5e9ee] px-8 pb-8 pt-4 backdrop-blur max-md:-mx-4 max-md:px-4 ${pageMode ? "bg-[#F3F7FF]" : "bg-[#FAFCFF]"}`}><a href={pageMode ? "/shipping-payment" : "/checkout"} onClick={() => setCheckoutStarted(true)} className="cart-drawer-footer-action flex h-12 w-full items-center justify-between rounded-[10px] bg-[#171a1f] px-4 text-[16px] font-semibold text-white no-underline transition-colors hover:bg-[#252525]"><span>{pageMode ? "Next: shipping & payment" : "View cart"}</span><RiyalPrice value={formatPrice(subtotal)} light className="text-[16px]" /></a>{checkoutStarted && <p role="status" className="mt-2 text-center text-[10px] text-[#2c8b4b]">Your cart is ready for checkout.</p>}</div>
      </>}
      </div>
    </aside>
    {pageMode && giftPickerCartItem && giftPickerOffer && <StoreGiftPicker item={giftPickerCartItem} offer={giftPickerOffer} selectedGiftIds={giftSelections[giftPickerCartItem.id] ?? []} onToggle={giftId => toggleGift(giftPickerCartItem, giftId)} onClose={() => setGiftPickerItem(null)} />}
  </div>, document.body);
}
