import { useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, Check, CheckCircle2, Clock3, CreditCard, Gift, MapPin, MoreVertical, PackageCheck, ShoppingBag, Store, Truck, XCircle } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart } from "./StoreCartContext";
import { canCancelStoreOrder, useStoreOrders, type StoreOrderStatus } from "./StoreOrdersContext";
import { useStoreLocale } from "./StoreLocaleContext";
import { getFreeUnitsByItem, getGiftOfferForProduct } from "./storeCartData";

type SummaryItem = { id: string; name: string; image: string; price: string; quantity: number };
type OrderSnapshot = {
  id: string;
  placedAt: string;
  items: SummaryItem[];
  giftSelections?: Record<string, string[]>;
  freeSample?: { name: string; image: string };
  subtotal: number;
  promotionDiscount: number;
  couponDiscount: number;
  shipping: number;
  total: number;
  payment: string;
  delivery: "shipping" | "pickup" | null;
  shippingMethod: string;
  address?: { label: string; recipient: string; phone: string; city: string; street: string } | null;
  branch?: { name: string; address: string; distance: string; hours: string } | null;
  status?: StoreOrderStatus;
  deliveryDate?: string;
};

function loadOrder(orderId?: string | null): OrderSnapshot | null {
  try {
    const value = JSON.parse(window.localStorage.getItem("deraah-last-order") ?? "null");
    if (!value?.id || !Array.isArray(value.items)) return null;
    return !orderId || value.id === orderId ? value : null;
  } catch {
    return null;
  }
}

const paymentLabels: Record<string, string> = {
  card: "Credit or debit card",
  apple: "Apple Pay",
  cod: "Cash on delivery",
  tamara: "Tamara",
  tabby: "Tabby",
  "deraah-gift": "Deraah Gift",
};

function OrderOptionsMenu({ isArabic, canCancel, onChangeDate, onChangeAddress, onCancel }: { isArabic: boolean; canCancel: boolean; onChangeDate: () => void; onChangeAddress: () => void; onCancel: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="relative"><button type="button" aria-label={isArabic ? "خيارات الطلب" : "Order options"} aria-expanded={isOpen} onClick={() => setIsOpen(open => !open)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1e6eb] bg-white text-[#737c87] transition-colors hover:bg-[#f8fafc] hover:text-[#4e5661]"><MoreVertical size={17} /></button>{isOpen && <div role="menu" className="absolute end-0 top-11 z-20 min-w-[190px] rounded-xl border border-[#e1e6eb] bg-white p-1.5 text-start shadow-[0_12px_28px_rgba(30,50,80,.14)]"><button type="button" role="menuitem" onClick={() => { setIsOpen(false); onChangeDate(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[#4e5661] transition-colors hover:bg-[#f8fafc]"><CalendarClock size={14} />{isArabic ? "تغيير موعد الاستلام" : "Change receiving time"}</button><button type="button" role="menuitem" onClick={() => { setIsOpen(false); onChangeAddress(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[#4e5661] transition-colors hover:bg-[#f8fafc]"><MapPin size={14} />{isArabic ? "تغيير عنوان الاستلام" : "Change receiving address"}</button>{canCancel && <button type="button" role="menuitem" onClick={() => { setIsOpen(false); onCancel(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[#b42318] transition-colors hover:bg-[#fff7f6]"><XCircle size={14} />{isArabic ? "إلغاء الطلب" : "Cancel order"}</button>}</div>}</div>;
}

export default function PaymentSummaryPage() {
  const { direction, language } = useStoreLocale();
  const isArabic = language === "العربية";
  const requestedOrderId = useMemo(() => new URLSearchParams(window.location.search).get("order"), []);
  const savedOrder = useMemo(() => loadOrder(requestedOrderId), [requestedOrderId]);
  const { orders, cancelOrder, updateOrder } = useStoreOrders();
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
  const requestedEdit = useMemo(() => new URLSearchParams(window.location.search).get("edit"), []);
  const [isDeliveryDatePickerOpen, setIsDeliveryDatePickerOpen] = useState(requestedEdit === "date");
  const { cartItems } = useStoreCart();
  const fallback: OrderSnapshot = {
    id: "DRH-000000",
    placedAt: new Date().toISOString(),
    items: [],
    subtotal: 0,
    promotionDiscount: 0,
    couponDiscount: 0,
    shipping: 0,
    total: 0,
    payment: "card",
    delivery: "shipping",
    shippingMethod: "standard",
    address: null,
    branch: null,
  };
  const selectedOrder = requestedOrderId ? orders.find(order => order.id === requestedOrderId) : null;
  const selectedOrderDetails: OrderSnapshot | null = selectedOrder ? { id: selectedOrder.id, placedAt: selectedOrder.placedAt, status: selectedOrder.status, deliveryDate: selectedOrder.deliveryDate, items: selectedOrder.items, giftSelections: selectedOrder.giftSelections, freeSample: selectedOrder.freeSample, subtotal: selectedOrder.total, promotionDiscount: 0, couponDiscount: 0, shipping: 0, total: selectedOrder.total, payment: "card", delivery: "shipping", shippingMethod: "standard", address: null, branch: null } : null;
  const details = savedOrder ?? selectedOrderDetails ?? fallback;
  const hasOrderSnapshot = Boolean(savedOrder || selectedOrder);
  const currentOrder = orders.find(order => order.id === details.id);
  const orderStatus = currentOrder?.status ?? details.status ?? (hasOrderSnapshot ? "On the way" : undefined);
  const canCancel = Boolean(hasOrderSnapshot && orderStatus && canCancelStoreOrder(orderStatus));
  const isCancelled = orderStatus === "Cancelled";
  const canManageOrder = Boolean(hasOrderSnapshot && !isCancelled);
  const orderStage = orderStatus === "Confirmed" ? 0 : orderStatus === "Preparing" ? 1 : orderStatus === "On the way" ? 2 : orderStatus === "Delivered" ? 3 : -1;
  const deliveryDateOptions = [1, 2, 3].map(offset => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return { value: date.toISOString(), label: date.toLocaleDateString(isArabic ? "ar-SA" : "en-GB", { weekday: "long", day: "numeric", month: "long" }) };
  });
  const selectedDeliveryDate = currentOrder?.deliveryDate ?? details.deliveryDate ?? null;
  const freeUnitsByItem = getFreeUnitsByItem(details.items);
  const confirmedItems = details.items.map(item => ({ item, freeUnits: freeUnitsByItem.get(item.id) ?? 0 }));
  const selectedGifts = details.items.flatMap(item => {
    const offer = getGiftOfferForProduct(item.name);
    const giftIds = details.giftSelections?.[item.id] ?? [];
    return giftIds.flatMap(giftId => {
      const gift = offer?.gifts.find(option => option.id === giftId);
      return gift ? [{ id: `${item.id}-${gift.id}`, name: gift.name, image: gift.image, parentName: item.name }] : [];
    });
  });
  const hasComplimentaryItems = selectedGifts.length > 0 || Boolean(details.freeSample);
  const placedDate = new Date(details.placedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const deliveryLabel = details.delivery === "pickup" ? "Pickup from branch" : "Delivery to your address";

  return <div dir={direction} className="payment-summary-page min-h-screen overflow-x-hidden bg-[#F3F7FF] text-[#171a1f]">
    <StoreHeader />
    <main className="mx-auto max-w-[1100px] px-5 py-8 md:px-8 md:py-12">
      <div className="mb-6"><button type="button" onClick={() => window.location.assign("/shipping-payment")} className="flex items-center gap-2 text-sm font-medium text-[#555b63]"><ArrowLeft size={18} /> Back to checkout</button></div>
      <section className="relative rounded-2xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-10"><span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${isCancelled ? "bg-[#fff0ef] text-[#b42318]" : "bg-[#ecfdf1] text-[#2c8b4b]"}`}>{isCancelled ? <XCircle size={32} strokeWidth={2.2} /> : <Check size={32} strokeWidth={2.5} />}</span><h1 className="mt-5 text-2xl font-semibold md:text-3xl">{isCancelled ? (isArabic ? "تم إلغاء الطلب" : "Order cancelled") : "Payment confirmed"}</h1><p className="mx-auto mt-2 text-sm text-[#6d7178]">{isCancelled ? (isArabic ? "تم تحديث حالة الطلب بنجاح." : "The order status has been updated.") : "Payment received successfully."}</p><div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-3"><div className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full bg-[#f7f9fb] px-4 py-2 text-xs text-[#555b63]"><span>Order number <strong className="text-[#171a1f]">{details.id}</strong></span><span>Placed {placedDate}</span></div>{canManageOrder && !isCancelConfirmationOpen && <OrderOptionsMenu isArabic={isArabic} canCancel={canCancel} onChangeDate={() => setIsDeliveryDatePickerOpen(true)} onChangeAddress={() => window.location.assign("/shipping-payment?edit=address")} onCancel={() => setIsCancelConfirmationOpen(true)} />}</div>{canCancel && isCancelConfirmationOpen && <div className="mx-auto mt-5 max-w-[440px] rounded-xl border border-[#f0c5c1] bg-[#fff8f7] p-4 text-left"><p className="text-xs font-semibold text-[#7f241d]">{isArabic ? "هل تريد إلغاء هذا الطلب؟" : "Do you want to cancel this order?"}</p><p className="mt-1 text-[11px] leading-5 text-[#94544d]">{isArabic ? "يمكن الإلغاء قبل بدء الشحن فقط." : "Cancellation is available before shipping starts."}</p><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setIsCancelConfirmationOpen(false)} className="h-9 rounded-lg border border-[#e1c9c6] bg-white px-3 text-[11px] font-semibold text-[#6d7178]">{isArabic ? "إبقاء الطلب" : "Keep order"}</button><button type="button" onClick={() => { cancelOrder(details.id); setIsCancelConfirmationOpen(false); }} className="h-9 rounded-lg bg-[#b42318] px-3 text-[11px] font-semibold text-white hover:bg-[#941d14]">{isArabic ? "تأكيد الإلغاء" : "Confirm cancellation"}</button></div></div>}{isDeliveryDatePickerOpen && <div role="dialog" aria-modal="true" aria-labelledby="delivery-date-title" className="fixed inset-0 z-[130] flex items-center justify-center bg-black/35 p-5" onClick={() => setIsDeliveryDatePickerOpen(false)}><section className="w-full max-w-[430px] rounded-2xl bg-white p-5 text-start shadow-2xl md:p-6" onClick={event => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#2c8b4b]">{isArabic ? "استلام الطلب" : "Order receiving"}</p><h2 id="delivery-date-title" className="mt-2 text-lg font-semibold">{isArabic ? "تغيير موعد الاستلام" : "Change receiving time"}</h2><p className="mt-1 text-xs leading-5 text-[#6d7178]">{isArabic ? "اختر اليوم الأنسب لاستلام طلبك." : "Choose the day that works best for your order."}</p></div><button type="button" aria-label={isArabic ? "إغلاق" : "Close"} onClick={() => setIsDeliveryDatePickerOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f6f8] text-[#555b63]">×</button></div><div className="mt-5 space-y-2">{deliveryDateOptions.map(option => <button key={option.value} type="button" onClick={() => { updateOrder(details.id, { deliveryDate: option.value }); setIsDeliveryDatePickerOpen(false); }} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start transition-colors ${selectedDeliveryDate?.slice(0, 10) === option.value.slice(0, 10) ? "border-[#2c8b4b] bg-[#f2fbf4]" : "border-[#e1e6eb] hover:bg-[#f8fafc]"}`}><span className="flex items-center gap-2 text-sm font-medium"><CalendarClock size={16} className="text-[#2c8b4b]" />{option.label}</span><span className="text-[11px] text-[#6d7178]">{isArabic ? "09:00 ص – 01:00 م" : "09:00 – 13:00"}</span></button>)}</div></section></div>}</section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.85fr)]">
        <div className="payment-summary-main-column flex flex-col space-y-6">
          <section className="payment-summary-status rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${isCancelled ? "bg-[#fff0ef] text-[#b42318]" : "bg-[#ecfdf1] text-[#2c8b4b]"}`}>{isCancelled ? <XCircle size={21} /> : <PackageCheck size={21} />}</span><div><h2 className="text-lg font-semibold">{isCancelled ? (isArabic ? "الطلب ملغى" : "Order cancelled") : "Order status"}</h2><p className="mt-1 text-xs text-[#6d7178]">{isCancelled ? (isArabic ? "لن تتم متابعة تجهيز هذا الطلب." : "This order will not continue to fulfillment.") : "We will update you as your order progresses."}</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-4">{[[CheckCircle2, "Order confirmed", "Payment received"], [PackageCheck, "Preparing order", "In progress"], [Truck, details.delivery === "pickup" ? "Ready for pickup" : "On the way", "Next step"], [Check, details.delivery === "pickup" ? "Collected" : "Delivered", "Pending"]].map(([Icon, title, subtitle], index) => <div key={String(title)} className="relative flex gap-3 sm:block sm:text-center"><span className={`mx-0 grid h-10 w-10 shrink-0 place-items-center rounded-full sm:mx-auto ${!isCancelled && index <= orderStage ? "bg-[#2c8b4b] text-white" : "bg-[#f1f4f6] text-[#9aa1ac]"}`}><Icon size={18} /></span><span className="block min-w-0"><strong className="mt-1 block text-xs font-semibold">{title}</strong><small className="mt-1 block text-[10px] text-[#7b818a]">{subtitle}</small></span></div>)}</div></section>
          <section className="payment-summary-receiving rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7f9fb] text-[#2c8b4b]">{details.delivery === "pickup" ? <Store size={21} /> : <Truck size={21} />}</span><div><h2 className="text-lg font-semibold">receiving details</h2><p className="mt-1 text-xs text-[#6d7178]">{deliveryLabel}</p></div></div>{details.delivery === "pickup" ? <div className="mt-5 rounded-xl border border-[#dfe4e8] bg-[#f8fafc] p-4"><strong className="block text-sm">{details.branch?.name ?? "Selected branch"}</strong><p className="mt-1 text-xs text-[#6d7178]">{details.branch?.address ?? "Branch details will be confirmed shortly."}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-[#6d7178]"><span className="inline-flex items-center gap-1"><MapPin size={14} />{details.branch?.distance ?? "Riyadh"}</span><span className="inline-flex items-center gap-1"><Clock3 size={14} />{details.branch?.hours ?? "Branch opening hours"}</span></div></div> : <div className="mt-5 rounded-xl border border-[#2c8b4b] bg-[#ecfdf1]/60 p-4"><strong className="block text-sm">{details.address?.label ?? "Delivery address"}</strong><p className="mt-1 text-xs text-[#6d7178]">{details.address?.recipient ?? "Primary contact"} · {details.address?.phone ?? "05X XXX XXXX"}</p><p className="mt-1 text-xs text-[#6d7178]">{details.address ? `${details.address.city} · ${details.address.street}` : "Your saved address"}</p></div>}</section>
          <section className="payment-summary-order-details rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6">
            <div className="flex items-center gap-3"><ShoppingBag className="text-[#2c8b4b]" size={21} /><h2 className="text-lg font-semibold">Order details</h2></div>
            <div className="mt-5 divide-y divide-[#edf0f3]">
              {confirmedItems.length ? confirmedItems.map(({ item, freeUnits }) => <article key={item.id} className="payment-summary-item flex min-w-0 items-center gap-3 py-4 first:pt-0 last:pb-0">
                <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f5f6f7]"><img src={item.image} alt="" className="h-12 w-12 object-contain" /></span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.name}</strong><span className="mt-1 block text-xs text-[#6d7178]">Quantity: {item.quantity}</span>{freeUnits > 0 && <span className="mt-1 inline-flex rounded-full bg-[#edf9f0] px-2 py-1 text-[10px] font-semibold text-[#287a43]">{freeUnits === item.quantity ? "Free with 1+2 Free" : `${freeUnits} free item${freeUnits > 1 ? "s" : ""} with 1+2 Free`}</span>}</span>
                <RiyalPrice value={Number(item.price.replace(/[^0-9]/g, "")) * item.quantity} className="shrink-0 text-sm font-semibold" />
              </article>) : <p className="py-4 text-sm text-[#6d7178]">Order items are available in your cart.</p>}
            </div>
            {hasComplimentaryItems && <div className="mt-5 border-t border-[#edf0f3] pt-5"><div className="flex items-center gap-2"><Gift className="text-[#2c8b4b]" size={18} /><h3 className="text-sm font-semibold">Free gifts</h3></div><div className="mt-3 divide-y divide-[#edf0f3]">{selectedGifts.map(gift => <article key={gift.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7]"><img src={gift.image} alt={gift.name} className="h-10 w-10 object-contain" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{gift.name}</strong><span className="mt-1 block text-xs text-[#6d7178]">Gift with {gift.parentName}</span></span><span className="shrink-0 rounded-full bg-[#d8f4df] px-2 py-1 text-[10px] font-semibold text-[#208447]">FREE</span></article>)}{details.freeSample && <article className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7]"><img src={details.freeSample.image} alt={details.freeSample.name} className="h-10 w-10 object-contain" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{details.freeSample.name}</strong><span className="mt-1 block text-xs text-[#6d7178]">Free sample from the 1+2 Free offer</span></span><span className="shrink-0 rounded-full bg-[#d8f4df] px-2 py-1 text-[10px] font-semibold text-[#208447]">FREE</span></article>}</div></div>}
          </section>
        </div>
        <aside className="h-fit space-y-6 lg:sticky lg:top-6"><section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6"><h2 className="text-lg font-semibold">Payment details</h2><div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4"><span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#2c8b4b]"><CreditCard size={20} /></span><span><strong className="block text-sm">{paymentLabels[details.payment] ?? "Payment method"}</strong><small className="mt-1 block text-xs text-[#6d7178]">Payment confirmed securely</small></span></div><div className="mt-4 space-y-2 border-t border-[#edf0f3] pt-4 text-sm"><div className="flex justify-between gap-4"><span className="text-[#6d7178]">Payment Method</span><strong className="text-right">{details.payment === "card" ? "Bank Card" : paymentLabels[details.payment] ?? "Payment method"}</strong></div>{details.payment === "card" && <><div className="flex justify-between gap-4"><span className="text-[#6d7178]">Card Number</span><strong className="text-right">***94</strong></div><div className="flex justify-between gap-4"><span className="text-[#6d7178]">Type</span><strong className="text-right">Mada</strong></div></>}</div><div className="mt-5 space-y-3 border-t border-[#edf0f3] pt-5 text-sm"><div className="flex justify-between"><span className="text-[#6d7178]">Subtotal</span><RiyalPrice value={details.subtotal} /></div>{details.promotionDiscount > 0 && <div className="flex justify-between text-[#2c8b4b]"><span>1+2 Free</span><span>- <RiyalPrice value={details.promotionDiscount} /></span></div>}{details.couponDiscount > 0 && <div className="flex justify-between text-[#2c8b4b]"><span>Coupon discount</span><span>- <RiyalPrice value={details.couponDiscount} /></span></div>}<div className="flex justify-between"><span className="text-[#6d7178]">Shipping</span><span className={details.shipping ? "" : "font-semibold text-[#2c8b4b]"}>{details.shipping ? <RiyalPrice value={details.shipping} /> : "Free"}</span></div><div className="flex justify-between border-t border-[#edf0f3] pt-4 text-lg font-semibold"><span>Total paid</span><RiyalPrice value={details.total} /></div></div><button type="button" onClick={() => window.location.assign("/")} className="payment-summary-shopping-button mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171a1f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2a2e34]"><ShoppingBag size={17} /> Continue shopping</button></section><section className="rounded-2xl bg-[#171a1f] p-5 text-white shadow-[0_8px_30px_rgba(30,50,80,.12)] md:p-6"><h3 className="font-semibold">Need help?</h3><p className="mt-2 text-xs leading-5 text-white/70">Our support team is available if you have any questions about your order.</p><button type="button" className="mt-4 h-10 rounded-lg bg-white px-4 text-xs font-semibold text-[#171a1f]">Contact support</button></section></aside>
      </div>
    </main>
    <div className="md:hidden"><StoreMobileNav collapsed={false} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} /></div>
  </div>;
}
