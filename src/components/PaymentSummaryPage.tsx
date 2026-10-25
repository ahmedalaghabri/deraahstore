import { useMemo } from "react";
import { ArrowLeft, Check, CheckCircle2, Clock3, CreditCard, Gift, MapPin, PackageCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart } from "./StoreCartContext";
import { useStoreOrders } from "./StoreOrdersContext";
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
};

export default function PaymentSummaryPage() {
  const { direction } = useStoreLocale();
  const requestedOrderId = useMemo(() => new URLSearchParams(window.location.search).get("order"), []);
  const savedOrder = useMemo(() => loadOrder(requestedOrderId), [requestedOrderId]);
  const { orders } = useStoreOrders();
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
  const selectedOrderDetails: OrderSnapshot | null = selectedOrder ? { id: selectedOrder.id, placedAt: selectedOrder.placedAt, items: selectedOrder.items, giftSelections: selectedOrder.giftSelections, freeSample: selectedOrder.freeSample, subtotal: selectedOrder.total, promotionDiscount: 0, couponDiscount: 0, shipping: 0, total: selectedOrder.total, payment: "card", delivery: "shipping", shippingMethod: "standard", address: null, branch: null } : null;
  const details = savedOrder ?? selectedOrderDetails ?? fallback;
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
      <section className="rounded-2xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-10"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ecfdf1] text-[#2c8b4b]"><Check size={32} strokeWidth={2.5} /></span><h1 className="mt-5 text-2xl font-semibold md:text-3xl">Payment confirmed</h1><p className="mx-auto mt-2 whitespace-nowrap text-sm text-[#6d7178]">Payment received successfully.</p><div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full bg-[#f7f9fb] px-4 py-2 text-xs text-[#555b63]"><span>Order number <strong className="text-[#171a1f]">{details.id}</strong></span><span>Placed {placedDate}</span></div></section>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.85fr)]">
        <div className="payment-summary-main-column flex flex-col space-y-6">
          <section className="payment-summary-status rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ecfdf1] text-[#2c8b4b]"><PackageCheck size={21} /></span><div><h2 className="text-lg font-semibold">Order status</h2><p className="mt-1 text-xs text-[#6d7178]">We will update you as your order progresses.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-4">{[[CheckCircle2, "Order confirmed", "Payment received"], [PackageCheck, "Preparing order", "In progress"], [Truck, details.delivery === "pickup" ? "Ready for pickup" : "On the way", "Next step"], [Check, details.delivery === "pickup" ? "Collected" : "Delivered", "Pending"]].map(([Icon, title, subtitle], index) => <div key={String(title)} className="relative flex gap-3 sm:block sm:text-center"><span className={`mx-0 grid h-10 w-10 shrink-0 place-items-center rounded-full sm:mx-auto ${index === 0 ? "bg-[#2c8b4b] text-white" : "bg-[#f1f4f6] text-[#9aa1ac]"}`}><Icon size={18} /></span><span className="block min-w-0"><strong className="mt-1 block text-xs font-semibold">{title}</strong><small className="mt-1 block text-[10px] text-[#7b818a]">{subtitle}</small></span></div>)}</div></section>
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
