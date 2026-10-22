import { createPortal } from "react-dom";
import { Check, Gift, X } from "lucide-react";
import type { StoreCartItem, StoreGiftSelections } from "./StoreCartContext";
import { getGiftOfferForProduct, getGiftSelectionLimit, type StoreGiftOffer } from "./storeCartData";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";

export function GiftEligibilityBadge({ className = "" }: { className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#edf9f0] px-2.5 py-1 text-[10px] font-semibold text-[#287a43] ${className}`}><Gift size={12} strokeWidth={1.8} />Gift available</span>;
}

export function SelectedGiftLineItems({ offer, selectedGiftIds }: { offer: StoreGiftOffer; selectedGiftIds: string[] }) {
  const selectedGifts = selectedGiftIds.map(id => offer.gifts.find(gift => gift.id === id)).filter(Boolean);
  if (!selectedGifts.length) return null;

  return <div className="divide-y divide-[#dfe4e8]" aria-label="Selected complimentary gifts">{selectedGifts.map(gift => <article key={gift!.id} className="flex items-center gap-3 px-3 py-4"><span className="grid h-[92px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f5f6f7] md:h-[112px] md:w-[96px]"><img src={gift!.image} alt={gift!.name} className="h-auto w-auto max-h-[68px] max-w-[58px] object-contain md:max-h-[75px] md:max-w-[84px]" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-[14px] font-semibold leading-5 text-[#171a1f]">{gift!.name}</strong><p className="mt-1 text-[12px] text-[#6d7178]">Complimentary gift</p></div><span className="shrink-0 rounded-full bg-[#d8f4df] px-2 py-1 text-[10px] font-semibold text-[#208447]">FREE Gift</span></article>)}</div>;
}

export function SelectedGiftsCard({ items, giftSelections }: { items: StoreCartItem[]; giftSelections: StoreGiftSelections }) {
  const selectedOffers = items.map(item => ({ item, offer: getGiftOfferForProduct(item.name), selectedGiftIds: giftSelections[item.id] ?? [] })).filter(entry => entry.offer && entry.selectedGiftIds.length > 0) as Array<{ item: StoreCartItem; offer: StoreGiftOffer; selectedGiftIds: string[] }>;
  if (!selectedOffers.length) return null;

  return <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(30,50,80,.05)] md:p-6"><div><h2 className="text-[18px] font-semibold md:text-xl">Free gifts</h2></div><div className="mt-4 divide-y divide-[#dfe4e8]">{selectedOffers.map(({ item, offer, selectedGiftIds }) => <div key={item.id} className="py-2 first:pt-0 last:pb-0"><p className="px-3 text-[11px] font-semibold text-[#6d7178]">Gift with {item.name}</p><SelectedGiftLineItems offer={offer} selectedGiftIds={selectedGiftIds} /></div>)}</div></section>;
}

type StoreGiftPickerProps = {
  item: StoreCartItem;
  offer: StoreGiftOffer;
  selectedGiftIds: string[];
  onToggle: (giftId: string) => void;
  onClose: () => void;
};

export default function StoreGiftPicker({ item, offer, selectedGiftIds, onToggle, onClose }: StoreGiftPickerProps) {
  const selectionLimit = getGiftSelectionLimit(item);
  const selectionComplete = selectedGiftIds.length >= selectionLimit;
  const mobileDrag = useMobileSheetDrag(onClose);

  return createPortal(<div role="dialog" aria-modal="true" aria-labelledby="gift-picker-title" className="store-mobile-sheet-overlay fixed inset-0 z-[220] flex justify-end bg-black/40 backdrop-blur-[2px] max-md:items-end" onClick={onClose}>
    <aside onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className="store-mobile-sheet flex h-full w-full max-w-[500px] flex-col overflow-hidden rounded-l-[26px] bg-[#fbfcff] text-left shadow-[-16px_0_50px_rgba(15,23,42,.18)] max-md:h-auto max-md:max-h-[92dvh] max-md:max-w-none max-md:rounded-l-none max-md:rounded-t-[26px]">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <header className="shrink-0 border-b border-[#e7ebef] bg-white px-5 pb-5 pt-6 md:px-7 md:pt-7"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2 text-[#287a43]"><Gift size={19} /><span className="text-[11px] font-semibold uppercase tracking-[.12em]">Complimentary gift</span></div><h2 id="gift-picker-title" className="mt-2 text-[22px] font-semibold tracking-[-.03em] text-[#171a1f]">Choose your gift</h2><p className="mt-1 text-xs leading-5 text-[#6d7178]">{offer.subtitle}</p></div><button type="button" onClick={onClose} aria-label="Close gift picker" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3f5f7] text-[#171a1f] transition-colors hover:bg-[#e9edf0]"><X size={19} /></button></div><div className="mt-5 flex items-center gap-3 rounded-xl bg-[#edf9f0] p-3"><span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white"><img src={item.image} alt="" className="h-10 w-10 object-contain" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#171a1f]">{item.name}</strong><span className="mt-1 block text-[11px] text-[#52725d]">{item.quantity > 1 ? `${item.quantity} units in your cart` : "This product qualifies for a gift"}</span></div><span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#287a43]">{selectedGiftIds.length}/{selectionLimit}</span></div></header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7"><div className="mb-4 flex items-end justify-between gap-3"><div><h3 className="text-sm font-semibold text-[#171a1f]">Available gifts</h3><p className="mt-1 text-[11px] text-[#6d7178]">{offer.title}</p></div><span className="text-[11px] font-medium text-[#6d7178]">{selectionComplete ? "Offer complete" : `${selectionLimit - selectedGiftIds.length} left to choose`}</span></div><div role={selectionLimit === 1 ? "radiogroup" : undefined} aria-label={selectionLimit === 1 ? "Choose one complimentary gift" : undefined} className="grid grid-cols-3 gap-2.5">{offer.gifts.map(gift => { const selected = selectedGiftIds.includes(gift.id); const unavailable = selectionLimit > 1 && !selected && selectionComplete; return <button key={gift.id} type="button" onClick={() => onToggle(gift.id)} role={selectionLimit === 1 ? "radio" : undefined} aria-checked={selectionLimit === 1 ? selected : undefined} aria-pressed={selectionLimit > 1 ? selected : undefined} disabled={unavailable} className={`group block h-fit min-w-0 overflow-hidden rounded-xl border bg-white text-left transition ${selected ? "border-[#2c8b4b] ring-1 ring-[#2c8b4b]" : unavailable ? "cursor-not-allowed border-[#edf0f2] opacity-45" : "border-[#edf0f2] hover:-translate-y-0.5 hover:border-[#d9dfe5] hover:shadow-[0_12px_28px_rgba(15,23,42,.08)]"}`}><span className="relative isolate block aspect-square overflow-hidden bg-[#f5f4f2]"><span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-white/95 px-1.5 py-0.5 text-[7px] font-semibold text-[#5e6670] shadow-sm">FREE GIFT</span><img src={gift.image} alt="" className="h-full w-full object-contain p-5 mix-blend-multiply transition duration-300 group-hover:scale-[1.035]" />{selectionLimit === 1 ? <span aria-hidden="true" className={`absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full border-2 bg-white/95 shadow-sm ${selected ? "border-[#2c8b4b]" : "border-[#c7ced5]"}`}>{selected && <span className="h-2.5 w-2.5 rounded-full bg-[#2c8b4b]" />}</span> : selected ? <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#2c8b4b] text-white shadow-sm"><Check size={15} strokeWidth={3} /></span> : null}</span><span className="block h-[79px] min-w-0 px-[9px] py-2"><span className="block text-[10px] font-medium uppercase tracking-[.1em] text-[#9ca2aa]">{gift.brand ?? "LABEAUTE"}</span><strong className="mt-0 block min-h-[32px] line-clamp-2 pt-[3px] text-[12px] font-semibold leading-4 text-[#20242a]">{gift.name}</strong></span></button>; })}</div></div>
      <footer className="shrink-0 border-t border-[#e7ebef] bg-white p-4 md:px-7"><button type="button" onClick={onClose} className="flex h-11 w-full items-center justify-center rounded-lg bg-[#171a1f] text-sm font-semibold text-white transition-colors hover:bg-[#2c3035]">Done</button></footer>
    </aside>
  </div>, document.body);
}
