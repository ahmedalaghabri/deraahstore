import { useState } from "react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";
import { DeraahBlogSection } from "./StoreHomePage";

export default function StoreBlogPage() {
  const { direction } = useStoreLocale();
  const { cartItemCount } = useStoreCart();
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);

  return (
    <div dir={direction} className="store-home min-h-screen bg-white font-sans text-start text-[#161616]">
      <StoreHeader />
      <main className="bg-white pt-4 sm:pt-8">
        <DeraahBlogSection />
      </main>
      <StoreFooter />
      <div className="md:hidden">
        <StoreMobileNav
          collapsed={mobileNavCollapsed}
          onToggle={() => setMobileNavCollapsed(collapsed => !collapsed)}
          onOpenCategories={() => { window.dispatchEvent(new Event("store:open-menu")); setMobileNavCollapsed(false); }}
          onOpenCart={() => { window.dispatchEvent(new Event("store:open-cart")); setMobileNavCollapsed(false); }}
          onOpenAccount={() => { window.dispatchEvent(new Event("store:open-mobile-account")); setMobileNavCollapsed(false); }}
          onOpenRewards={() => { window.location.assign("/mukafaati"); setMobileNavCollapsed(false); }}
          onOpenHome={() => { window.location.assign("/"); setMobileNavCollapsed(false); }}
          cartItemCount={cartItemCount}
        />
      </div>
    </div>
  );
}
