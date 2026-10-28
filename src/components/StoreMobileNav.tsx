import { ChevronDown, ChevronUp } from "lucide-react";
import type { MouseEvent } from "react";

type StoreMobileNavProps = {
  collapsed: boolean;
  onToggle?: () => void;
  onOpenCategories: () => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenRewards?: () => void;
  onOpenHome?: () => void;
  cartItemCount: number;
};

export default function StoreMobileNav({ collapsed, onToggle, onOpenCategories, onOpenCart, onOpenAccount, onOpenRewards, onOpenHome, cartItemCount }: StoreMobileNavProps) {
  const items = [
    { src: "/product-assets/icons/mobile-nav/account.svg", label: "Account", key: "account" },
    { src: "/product-assets/icons/mobile-nav/cart.svg", label: "Cart", key: "cart" },
    { src: "/product-assets/icons/mobile-nav/gift.svg", label: "Mukafaati", key: "rewards" },
    { src: "/product-assets/icons/mobile-nav/category.svg", label: "Categories", key: "categories" },
    { src: "/product-assets/icons/mobile-nav/home.svg", label: "Home", key: "home" },
  ] as const;
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const activeItem = pathname === "/account" || pathname === "/my-account"
    ? "account"
    : pathname === "/cart" || pathname === "/checkout"
      ? "cart"
      : pathname === "/category" || pathname === "/clp" || pathname === "/gifts"
        ? "categories"
        : pathname === "/mukafaati" || pathname === "/rewards"
          ? "rewards"
          : pathname === "/" || pathname === "/index.html" || pathname === "/store-home"
            ? "home"
            : null;
  const openRewards = onOpenRewards ?? (() => window.location.assign("/mukafaati"));
  const openHome = onOpenHome ?? (() => window.location.assign("/"));
  const handleCategoryOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onOpenCategories();
  };
  const handleItemClick = (key: (typeof items)[number]["key"], event: MouseEvent<HTMLButtonElement>) => {
    if (key === "categories") return handleCategoryOpen(event);
    if (key === "cart") return onOpenCart();
    if (key === "account") return onOpenAccount();
    if (key === "rewards") return openRewards();
    return openHome();
  };

  return <>
    <nav aria-label="Store navigation" className={`fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[78px] w-full max-w-[430px] items-center justify-between gap-0 border-t border-[#eeeeee] bg-white px-1.5 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_rgba(0,0,0,.08)] outline-none transition-transform duration-300 ease-in-out sm:px-2 ${collapsed ? "translate-y-full" : "translate-y-0"}`}>
      {onToggle && <button type="button" onClick={onToggle} aria-label="Collapse navigation" aria-expanded={!collapsed} className="absolute right-1 top-0 z-10 grid h-5 w-5 place-items-center border-0 bg-transparent p-0 text-[#777]">
        <ChevronDown size={14} />
      </button>}
      {items.map(({ src, label, key }) => { const isActive = activeItem === key; return <button key={label} type="button" onClick={event => handleItemClick(key, event)} aria-label={label} aria-current={isActive ? "page" : undefined} className={`flex min-w-0 flex-1 basis-0 flex-col items-center gap-1 border-0 bg-transparent px-0.5 py-1 text-[10px] font-medium shadow-none outline-none transition-colors focus:outline-none sm:text-[11px] ${isActive ? "text-[#cd1a76]" : "text-[#100f0f]"}`}><span className="relative grid h-7 w-7 place-items-center"><img src={src} alt="" className="block max-w-none shrink-0" />{label === "Cart" && cartItemCount > 0 && <span aria-label={`${cartItemCount} items in cart`} className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#cd1a76] px-1 text-[9px] font-bold leading-none text-white">{cartItemCount}</span>}</span><span className="whitespace-nowrap">{label}</span></button>; })}
    </nav>
    {onToggle && <button type="button" onClick={onToggle} aria-label="Show navigation" className={`fixed bottom-[68px] right-2 z-40 grid h-8 w-8 place-items-center rounded-full border border-[#e5e5e5] bg-white p-0 text-[#555] shadow-[0_4px_12px_rgba(0,0,0,.12)] outline-none transition-opacity duration-300 ease-in-out ${collapsed ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <ChevronUp size={16} />
    </button>}
  </>;
}
