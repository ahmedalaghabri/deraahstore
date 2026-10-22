import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { StoreOrderItem } from "./StoreOrdersContext";

type PreviewImageProps = {
  item: StoreOrderItem;
  className: string;
  padding: string;
};

const containedImageStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
};

function getOrderPreviewImage(src: string) {
  return src.startsWith("/product-assets/real-products/") && src.endsWith(".png")
    ? src.replace(/\.png$/i, ".jpg")
    : src;
}

function PreviewImage({ item, className, padding }: PreviewImageProps) {
  return (
    <span className={`order-items-preview__image grid shrink-0 place-items-center overflow-hidden rounded-lg bg-white ${className} ${padding}`}>
      <img
        src={getOrderPreviewImage(item.image)}
        alt={item.name}
        draggable={false}
        className="order-items-preview__image-asset block h-full w-full object-contain mix-blend-multiply"
        style={containedImageStyle}
      />
    </span>
  );
}

function MoreProducts({ count, className }: { count: number; className: string }) {
  return (
    <span
      className={`grid min-w-0 shrink-0 place-items-center rounded-full border border-[#e1e6eb] bg-white p-0 text-center text-xs font-semibold text-[#20252b] ${className}`}
      title={`${count} more products`}
      aria-label={`${count} more products`}
    >
      <span className="inline-flex items-center gap-1">
        +{count}
        <ArrowRight size={13} strokeWidth={1.8} />
      </span>
    </span>
  );
}

export default function OrderItemsPreview({ items, compact = false }: { items: StoreOrderItem[]; compact?: boolean }) {
  if (!items.length) return null;

  const firstItem = items[0];
  const featureImageClass = compact ? "h-20 w-20" : "h-24 w-24";
  const thumbnailClass = compact ? "h-16 w-16" : "h-20 w-20";

  if (items.length > 2) {
    const visibleItems = items.slice(1, 4);
    const remainingCount = Math.max(0, items.length - 4);
    return (
      <div className="order-items-preview min-w-0 rounded-xl bg-[#f8fafc] p-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <PreviewImage item={firstItem} className={featureImageClass} padding="p-1.5" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#20252b]">{firstItem.name}</p>
            <p className="mt-1 text-[10px] text-[#8a939e]">Quantity: {firstItem.quantity}</p>
          </div>
        </div>

        <div
          className="mt-2 flex min-w-0 items-center justify-between gap-2 overflow-hidden border-t border-[#e8edf1] pt-2"
          aria-label="Other products in this order"
        >
          {visibleItems.map(item => (
            <PreviewImage key={item.id} item={item} className={thumbnailClass} padding="p-1" />
          ))}
          {remainingCount > 0 && <MoreProducts count={remainingCount} className={compact ? "h-8 w-8" : thumbnailClass} />}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-2">
      {items.map(item => (
        <div key={item.id} className="flex min-w-0 items-center gap-3 rounded-xl bg-[#f8fafc] p-2.5">
          <PreviewImage item={item} className={featureImageClass} padding="p-1.5" />
          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#20252b]">{item.name}</p>
            <p className="mt-1 text-[10px] text-[#8a939e]">Quantity: {item.quantity}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
