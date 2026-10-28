import { StoreCartProvider } from "./components/StoreCartContext";
import { StoreFavoritesProvider } from "./components/StoreFavoritesContext";
import { StoreOrdersProvider } from "./components/StoreOrdersContext";
import { StoreLocaleProvider } from "./components/StoreLocaleContext";
import CategoryListingPage from "./components/CategoryListingPageV2";
import CheckoutPage from "./components/CheckoutPage";
import EnjoyLandingPage from "./components/EnjoyLandingPage";
import GiftCLPPage from "./components/GiftCLPPage";
import PaymentSummaryPage from "./components/PaymentSummaryPage";
import ProductDetailsPage from "./components/ProductDetailsPage";
import StoreAccountPage from "./components/StoreAccountPage";
import StoreHomePage from "./components/StoreHomePage";
import StoreBlogPage from "./components/StoreBlogPage";
import StoreBlogArticlePage from "./components/StoreBlogArticlePage";
import MukafaatiPage from "./components/MukafaatiPage";
import DesignSystemPage from "./components/DesignSystemPage";
import UserFlowPage from "./components/UserFlowPage";
import WorkProjectsPage from "./components/WorkProjectsPage";

function getStorePage() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(window.location.search);

  if (pathname === "/user-flow" || pathname === "/user-tracking") {
    return <UserFlowPage />;
  }

  if (pathname === "/design-system") {
    return <DesignSystemPage />;
  }

  if (pathname === "/work-projects" || pathname === "/projects") {
    return <WorkProjectsPage />;
  }

  if (pathname === "/enjoy" || pathname === "/enjoy-landing") {
    return <EnjoyLandingPage internal />;
  }

  if (pathname === "/checkout" || pathname === "/cart") {
    return <CheckoutPage step="cart" />;
  }

  if (pathname === "/shipping-payment") {
    return <CheckoutPage step="shipping" />;
  }

  if (pathname === "/payment-summary") {
    return <PaymentSummaryPage />;
  }

  if (pathname === "/gifts") {
    return <GiftCLPPage />;
  }

  if (pathname.startsWith("/blog/") || pathname.startsWith("/journal/")) {
    const slug = pathname.split("/").filter(Boolean).slice(1).join("/");
    return <StoreBlogArticlePage slug={slug} />;
  }

  if (pathname === "/blog" || pathname === "/journal") {
    return <StoreBlogPage />;
  }

  if (pathname === "/mukafaati" || pathname === "/rewards") {
    return <MukafaatiPage />;
  }

  if (pathname === "/category" || pathname === "/clp") {
    return <CategoryListingPage />;
  }

  if (pathname === "/account" || pathname === "/my-account") {
    return <StoreAccountPage />;
  }

  if (pathname === "/product-details" || params.get("screen") === "product-details") {
    return <ProductDetailsPage />;
  }

  return <StoreHomePage />;
}

export default function App() {
  return (
    <StoreLocaleProvider>
      <StoreCartProvider>
        <StoreFavoritesProvider>
          <StoreOrdersProvider>{getStorePage()}</StoreOrdersProvider>
        </StoreFavoritesProvider>
      </StoreCartProvider>
    </StoreLocaleProvider>
  );
}
