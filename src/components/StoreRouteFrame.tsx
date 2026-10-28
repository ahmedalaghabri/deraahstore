import { useState, type ReactNode } from "react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart } from "./StoreCartContext";

export default function StoreRouteFrame({ children, mainClassName = "" }: { children: ReactNode; mainClassName?: string }) {
  const { cartItemCount } = useStoreCart();
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  return <div className="min-h-screen bg-[#f6f7f8] text-[#20242a]">
    <StoreHeader />
    <main className={mainClassName}>{children}</main>
    <StoreFooter />
    <div className="md:hidden"><StoreMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(current => !current)} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.location.assign("/mukafaati")} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
  </div>;
}
