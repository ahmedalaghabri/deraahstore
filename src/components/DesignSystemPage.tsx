import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Copy,
  CreditCard,
  Gift,
  Globe2,
  Grid2X2,
  Heart,
  Home,
  ImagePlus,
  Info,
  List,
  Loader2,
  MapPin,
  MoreHorizontal,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  TicketPercent,
  Trash2,
  Truck,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import { useMobileSheetDrag } from "./MobileSheet";
import { ProductCard, type Product } from "./ProductDetailsPage";
import { useStoreCart } from "./StoreCartContext";
import { designSystemTokens } from "../designSystemTokens";
import "./DesignSystemPage.css";

type PreviewMode = "responsive" | "desktop" | "mobile";

const collectionTabs = ["Bestsellers", "New in", "Under SAR 300"];

const sections = [
  { id: "foundations", label: "Foundations" },
  { id: "type-layout", label: "Type & layout" },
  { id: "buttons", label: "Buttons" },
  { id: "forms", label: "Form controls" },
  { id: "core-components", label: "Core components" },
  { id: "navigation", label: "Navigation" },
  { id: "commerce", label: "Product & cart" },
  { id: "feedback", label: "Feedback" },
  { id: "overlays", label: "Overlays" },
  { id: "accessibility", label: "Accessibility" },
];

const iconSamples = [
  [Search, "Search"], [Heart, "Favorite"], [ShoppingBag, "Bag"], [Bell, "Notify"],
  [UserRound, "Account"], [Grid2X2, "Categories"], [Gift, "Rewards"], [Truck, "Delivery"],
  [MapPin, "Location"], [CreditCard, "Payment"], [TicketPercent, "Coupon"], [HelpCircle, "Help"],
  [Globe2, "Locale"], [Home, "Home"], [Star, "Rating"],
] as const;

function SectionHeading({ index, eyebrow, title, description }: { index: string; eyebrow: string; title: string; description: string }) {
  return <div className="ds-section-heading"><div className="ds-section-index">{index}</div><div><p className="ds-eyebrow">{eyebrow}</p><h2>{title}</h2><p className="ds-section-description">{description}</p></div></div>;
}

function Section({ id, index, eyebrow, title, description, children }: { id: string; index: string; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <section id={id} className="ds-section"><SectionHeading index={index} eyebrow={eyebrow} title={title} description={description} />{children}</section>;
}

function PreviewCanvas({ mode, children, className = "" }: { mode: PreviewMode; children: ReactNode; className?: string }) {
  return <div className={`ds-canvas ${mode === "mobile" ? "ds-canvas--mobile" : mode === "desktop" ? "ds-canvas--desktop" : "ds-canvas--responsive"} ${className}`}><div className="ds-canvas__content">{children}</div></div>;
}

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };
  return <button type="button" onClick={copy} aria-label={`Copy ${value}`} className="ds-copy-button">{copied ? <Check size={13} /> : <Copy size={13} />}<span aria-live="polite">{copied ? "Copied" : value}</span></button>;
}

function QuantityControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="ds-quantity-control" aria-label="Product quantity"><button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={14} /></button><span aria-live="polite">{value}</span><button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus size={15} /></button></div>;
}

type DocumentationProduct = { name: string; brand: string; price: string; oldPrice?: string; image: string; offer?: string; stock: string; rating: string };

const documentationProducts: DocumentationProduct[] = [
  { name: "Green Woods Eau de Parfum", brand: "LINK", price: "SAR 258", oldPrice: "SAR 600", image: "/product-assets/real-products/green-woods.png", offer: "1+2 Free", stock: "In stock", rating: "4.8" },
  { name: "Black Woods Eau de Toilette", brand: "LINK", price: "SAR 208", oldPrice: "SAR 500", image: "/product-assets/real-products/black-woods.png", stock: "In stock", rating: "4.7" },
  { name: "Maroon Perfume by Link 200ml", brand: "LINK", price: "SAR 308", oldPrice: "SAR 420", image: "/product-assets/real-products/maroon.png", offer: "1+2 Free", stock: "Out of stock", rating: "4.6" },
  { name: "Silver Woods Eau de Parfum", brand: "LINK", price: "SAR 208", oldPrice: "SAR 500", image: "/product-assets/real-products/silver-woods.png", stock: "In stock", rating: "4.9" },
];

const documentationStoreProducts: Product[] = documentationProducts.map(product => ({
  name: product.name,
  brand: product.brand,
  price: product.price,
  oldPrice: product.oldPrice ?? product.price,
  image: product.image,
  offer: product.offer,
  views: "",
  outOfStock: product.stock === "Out of stock",
}));

function DocumentationHeader() {
  return <header className="ds-doc-header"><a href="/" className="ds-doc-header__brand" aria-label="Deraah home"><img src="/product-assets/deraah-wordmark.svg" alt="DERAAH" /></a><nav aria-label="Documentation shortcuts"><a href="#foundations">Foundations</a><a href="#core-components">Components</a><a href="#commerce">Commerce</a></nav><div className="ds-doc-header__actions"><button type="button" className="ds-button ds-button--icon ds-button--small ds-button--clear" aria-label="Search documentation"><Search size={16} /></button><button type="button" className="ds-button ds-button--icon ds-button--small ds-button--clear" aria-label="Documentation menu"><Grid2X2 size={16} /></button></div></header>;
}

function DocumentationFooter() {
  return <footer className="ds-doc-footer"><div><img src="/product-assets/deraah-wordmark.svg" alt="DERAAH" /><p>Component contracts, tokens and responsive patterns for the Deraah Store.</p></div><div className="ds-doc-footer__links"><a href="#accessibility">Accessibility</a><a href="#foundations">Tokens</a><a href="#buttons">Components</a></div><span>Design system · 2026</span></footer>;
}

function DocumentationMobileNav({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const items = [{ label: "Home", icon: Home, href: "#foundations" }, { label: "Components", icon: Grid2X2, href: "#core-components" }, { label: "Commerce", icon: ShoppingBag, href: "#commerce" }, { label: "Access", icon: ShieldCheck, href: "#accessibility" }];
  return <nav className={`ds-doc-mobile-nav ${collapsed ? "is-collapsed" : ""}`} aria-label="Documentation navigation"><button type="button" className="ds-doc-mobile-nav__toggle" onClick={onToggle} aria-label={collapsed ? "Show documentation navigation" : "Hide documentation navigation"}>{collapsed ? <ArrowUpRight size={14} /> : <ArrowDown size={14} />}</button>{items.map(({ label, icon: Icon, href }) => <a key={label} href={href} aria-label={label}><Icon size={16} /><span>{label}</span></a>)}</nav>;
}

function DocumentationToast({ onClose }: { onClose: () => void }) {
  return <div role="status" className="ds-demo-toast"><span className="ds-demo-toast__icon"><CheckCircle2 size={18} /></span><div><strong>Added to your bag</strong><small>Green Woods Eau de Parfum</small></div><button type="button" onClick={onClose} className="ds-demo-toast__action">Undo</button><button type="button" onClick={onClose} aria-label="Close notification" className="ds-demo-toast__close"><X size={14} /></button></div>;
}

function CoreComponentsExamples() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [step, setStep] = useState(2);

  return <div className="ds-core-grid">
    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Badge & chip</p><h3>Short signals with a clear purpose</h3></div><span>Selected · neutral · status</span></div>
      <div className="ds-component-stack">
        <span className="ds-demo-badge ds-demo-badge--brand">New arrival</span>
        <span className="ds-demo-badge ds-demo-badge--success"><CheckCircle2 size={13} /> In stock</span>
        <span className="ds-demo-badge ds-demo-badge--sale"><Gift size={13} /> Gift available</span>
        <span className="ds-demo-badge ds-demo-badge--danger">Out of stock</span>
        <button type="button" className="ds-filter-chip is-selected">All perfumes <X size={12} /></button>
        <button type="button" className="ds-filter-chip">Women perfumes</button>
      </div>
      <p className="ds-component-note">Badges explain state; chips represent a filter or a removable selection. Do not use a badge as a button.</p>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Checkbox · radio · toggle</p><h3>State is visible before interaction</h3></div><span>Default · focus · selected · disabled</span></div>
      <div className="ds-control-matrix" aria-label="Selection control states">
        <div className="ds-control-matrix__head"><span>Control</span><span>Default</span><span>Hover</span><span>Focus</span><span>Selected</span><span>Disabled</span></div>
        <div className="ds-control-matrix__row"><strong>Checkbox</strong><span className="ds-checkbox-visual" /><span className="ds-checkbox-visual is-hover" /><span className="ds-checkbox-visual is-focus" /><span className="ds-checkbox-visual is-selected"><Check size={11} /></span><span className="ds-checkbox-visual is-disabled" /></div>
        <div className="ds-control-matrix__row"><strong>Radio</strong><span className="ds-radio-visual" /><span className="ds-radio-visual is-hover" /><span className="ds-radio-visual is-focus" /><span className="ds-radio-visual is-selected" /><span className="ds-radio-visual is-disabled" /></div>
        <div className="ds-control-matrix__row"><strong>Toggle</strong><span className="ds-toggle-visual" /><span className="ds-toggle-visual is-hover" /><span className="ds-toggle-visual is-focus" /><span className="ds-toggle-visual is-selected" /><span className="ds-toggle-visual is-disabled" /></div>
      </div>
      <p className="ds-component-note">The selected state uses both shape and colour. The live controls in Form controls below remain keyboard and screen-reader friendly.</p>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Avatar</p><h3>People, service and ownership</h3></div><span>Initials · image · group</span></div>
      <div className="ds-avatar-row">
        <span className="ds-avatar ds-avatar--large">DA</span>
        <span className="ds-avatar ds-avatar--pink">SA</span>
        <span className="ds-avatar ds-avatar--image"><UserRound size={18} /></span>
        <span className="ds-avatar-group"><span className="ds-avatar ds-avatar--small">DA</span><span className="ds-avatar ds-avatar--small ds-avatar--green">AM</span><span className="ds-avatar ds-avatar--small ds-avatar--pink">+4</span></span>
      </div>
      <div className="ds-list-item ds-list-item--compact"><span className="ds-avatar ds-avatar--small ds-avatar--green"><Check size={13} /></span><span><strong>Order support</strong><small>Available today · 9:00–22:00</small></span><ChevronRight size={16} /></div>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Alert & inline feedback</p><h3>Explain what changed</h3></div><span>Default · success · info · warning · error</span></div>
      <div className="ds-alert ds-alert--default"><Info size={17} /><span><strong>Helpful context</strong><small>Supporting information stays close to the decision.</small></span></div>
      <div className="ds-alert ds-alert--info"><Info size={17} /><span><strong>Delivery information</strong><small>Free delivery is available on qualifying orders.</small></span><button type="button" aria-label="Dismiss information"><X size={14} /></button></div>
      <div className="ds-alert ds-alert--success"><CheckCircle2 size={17} /><span><strong>Saved successfully</strong><small>Your gift preferences are ready.</small></span></div>
      <div className="ds-alert ds-alert--warning"><Clock size={17} /><span><strong>Limited availability</strong><small>Only a few items remain in this size.</small></span></div>
      <div className="ds-alert ds-alert--error"><Info size={17} /><span><strong>Payment needs attention</strong><small>Check your card details and try again.</small></span><button type="button" aria-label="Dismiss payment error"><X size={14} /></button></div>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Button group</p><h3>Related actions stay together</h3></div><span>Single choice</span></div>
      <div className="ds-button-group" role="group" aria-label="View type"><button type="button" className="is-selected"><List size={15} /> List</button><button type="button"><Grid2X2 size={15} /> Grid</button><button type="button"><SlidersHorizontal size={15} /> Filters</button></div>
      <div className="ds-button-group ds-button-group--segmented" role="group" aria-label="Sort options"><button type="button" className="is-selected">Recommended</button><button type="button">Newest</button><button type="button">Price</button></div>
      <div className="ds-button-group-states" aria-label="Button group item states"><span>States</span><button type="button">Default</button><button type="button" className="is-hover">Hover</button><button type="button" className="is-focus">Focus</button><button type="button" className="is-pressed">Press</button><button type="button" className="is-selected">Selected</button><button type="button" disabled>Disabled</button></div>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Dropdown & context menu</p><h3>Menus with clear ownership</h3></div><span>Open · closed</span></div>
      <div className="ds-menu-row">
        <div className="ds-dropdown-wrap"><button type="button" className="ds-dropdown-trigger" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>Recommended <ChevronDown size={15} /></button>{menuOpen && <div className="ds-dropdown-menu" role="menu"><button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>Recommended</button><button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>Newest first</button><button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>Price: low to high</button></div>}</div>
        <div className="ds-context-wrap"><button type="button" className="ds-icon-button" aria-label="More actions" aria-expanded={contextOpen} onClick={() => setContextOpen(value => !value)}><MoreHorizontal size={17} /></button>{contextOpen && <div className="ds-context-menu" role="menu"><button type="button" role="menuitem" onClick={() => setContextOpen(false)}>View details</button><button type="button" role="menuitem" onClick={() => setContextOpen(false)}>Save for later</button><button type="button" role="menuitem" onClick={() => setContextOpen(false)}>Remove</button></div>}</div>
      </div>
      <p className="ds-component-note">Use a dropdown for a known set of choices. Use a context menu for actions on one nearby object.</p>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Tooltip & loader</p><h3>Reveal detail without adding noise</h3></div><span>Hover · loading</span></div>
      <div className="ds-tooltip-row"><span className="ds-tooltip-wrap"><button type="button" className="ds-icon-button" aria-label="Help"><HelpCircle size={17} /></button><span className="ds-tooltip" role="tooltip">What happens next?</span></span><span className="ds-loader-ring" aria-label="Loading" /><span className="ds-loader-dots" aria-label="Loading"><i /><i /><i /></span><div className="ds-skeleton-stack" aria-label="Loading content"><span /><span /><span /></div></div>
      <div className="ds-tooltip-positions" aria-label="Tooltip positions"><span>Top</span><span>Bottom</span><span>Left</span><span>Right</span></div>
      <p className="ds-component-note">Tooltips are supplementary and never contain the only explanation. Loading states reserve the final layout.</p>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Progress & stepper</p><h3>Show where the customer is</h3></div><span>Checkout · rewards</span></div>
      <div className="ds-progress-label"><span>Gift customization</span><strong>{step} of 3</strong></div>
      <div className="ds-progress"><span style={{ width: `${(step / 3) * 100}%` }} /></div>
      <div className="ds-stepper" aria-label="Gift customization steps">{["Select card", "Add a message", "Gift box"].map((label, index) => { const value = index + 1; return <button key={label} type="button" className={value === step ? "is-current" : value < step ? "is-complete" : ""} onClick={() => setStep(value)}><span>{value < step ? <Check size={13} /> : value}</span><small>{label}</small></button>; })}</div>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Empty, upload & media</p><h3>Give the next action a home</h3></div><span>Recovery state</span></div>
      <div className="ds-empty-state"><span className="ds-pattern-icon"><ImagePlus size={18} /></span><strong>No saved gifts yet</strong><small>Choose a card and add a personal message to start.</small><button type="button" className="ds-button ds-button--secondary ds-button--compact">Create a gift</button></div>
      <div className="ds-upload"><UploadCloud size={19} /><span><strong>Drop an image here</strong><small>PNG or JPG · up to 5 MB</small></span><button type="button" className="ds-button ds-button--quiet ds-button--compact">Browse</button></div>
    </article>

    <article className="ds-info-panel ds-info-panel--wide">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Navigation & list</p><h3>Store chrome should be predictable</h3></div><span>Top nav · bottom nav · list row</span></div>
      <div className="ds-nav-preview"><div className="ds-top-nav-preview"><span className="ds-wordmark">DERAAH</span><nav><a href="#core-components">Shop</a><a href="#commerce">Gifts</a><a href="#feedback">Offers</a></nav><button type="button" className="ds-icon-button" aria-label="Open search"><Search size={16} /></button><button type="button" className="ds-icon-button" aria-label="Open bag"><ShoppingBag size={16} /></button></div><div className="ds-bottom-nav-preview"><a href="#foundations" className="is-active"><Home size={16} /><span>Home</span></a><a href="#commerce"><Grid2X2 size={16} /><span>Categories</span></a><a href="#feedback"><Gift size={16} /><span>Rewards</span></a><a href="#accessibility"><UserRound size={16} /><span>Account</span></a></div></div>
      <div className="ds-list-item"><span className="ds-list-icon"><Truck size={17} /></span><span><strong>Free delivery</strong><small>Available on qualifying orders</small></span><span className="ds-list-meta">Details <ChevronRight size={14} /></span></div>
    </article>

    <article className="ds-info-panel ds-info-panel--wide">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Card anatomy</p><h3>One container, one decision</h3></div><span>Media · content · action</span></div>
      <div className="ds-card-contract"><div className="ds-card-contract__media"><Gift size={23} /><span>Gift ready</span></div><div className="ds-card-contract__body"><div><span className="ds-demo-badge ds-demo-badge--brand">Featured</span><h4>Make the moment personal</h4><p>A reusable card structure keeps media, title, supporting copy and the main action in the same rhythm.</p></div><div className="ds-card-contract__footer"><strong>SAR 15</strong><button type="button" className="ds-button ds-button--small ds-button--primary">Explore <ArrowRight size={12} /></button></div></div></div>
      <p className="ds-component-note">Use this generic card contract for content cards. Product cards may add media controls and pricing, but should keep the same inset, radius and action hierarchy.</p>
    </article>
  </div>;
}

function CheckoutPatternsExamples() {
  return <div className="ds-checkout-patterns">
    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Coupon card</p><h3>Offer discovery and apply</h3></div><span>Available · applied</span></div>
      <div className="ds-coupon-card"><div className="ds-coupon-icon"><TicketPercent size={17} /></div><div><strong>70 Discount</strong><small>Get 70 off on orders of 799 or more.</small></div><span className="ds-coupon-code">OFF70</span><button type="button" className="ds-button ds-button--primary ds-button--compact">Copy</button></div>
      <button type="button" className="ds-details-row"><span>Details, Terms and Conditions</span><ChevronDown size={15} /></button>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Address card</p><h3>Confirm delivery destination</h3></div><span>Selected</span></div>
      <div className="ds-address-card"><span className="ds-list-icon"><MapPin size={17} /></span><span><strong>Home</strong><small>King Fahd Road, Riyadh 12345</small></span><span className="ds-address-check"><Check size={13} /></span></div>
      <button type="button" className="ds-button ds-button--secondary ds-button--compact ds-full-width-button">Add another address</button>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Shipping method</p><h3>Compare delivery promises</h3></div><span>Radio selection</span></div>
      <label className="ds-method-row is-selected"><span className="ds-radio-dot" /><span><strong>Standard delivery</strong><small>Arrives in 2–4 business days</small></span><strong className="ds-method-price">Free</strong></label>
      <label className="ds-method-row"><span className="ds-radio-dot" /><span><strong>Express delivery</strong><small>Arrives tomorrow before 21:00</small></span><strong className="ds-method-price">SAR 25</strong></label>
    </article>

    <article className="ds-info-panel">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Payment method</p><h3>Make trust visible</h3></div><span>Saved · new</span></div>
      <div className="ds-payment-card"><span className="ds-payment-logo"><CreditCard size={18} /></span><span><strong>Visa ending in 4242</strong><small>Expires 08/28</small></span><button type="button" className="ds-icon-button" aria-label="Change payment method"><ChevronRight size={16} /></button></div>
      <div className="ds-payment-card ds-payment-card--muted"><span className="ds-payment-logo"><Plus size={18} /></span><span><strong>Add a new card</strong><small>Secure checkout via payment provider</small></span></div>
    </article>

    <article className="ds-info-panel ds-info-panel--wide">
      <div className="ds-demo-label"><div><p className="ds-eyebrow">Gift journey & order summary</p><h3>Keep the final decision compact</h3></div><span>Checkout surface</span></div>
      <div className="ds-checkout-summary-grid"><div className="ds-gift-journey"><div className="ds-gift-tabs"><span className="is-done">Select card</span><span className="is-current">Add a message</span><span>Gift box</span></div><div className="ds-gift-card-preview"><span>DERAAH</span><strong>Your message will appear here</strong><small>Final QR preview available anytime</small></div></div><div className="ds-order-summary"><div><span>Green Woods Eau de Parfum × 1</span><strong>SAR 258</strong></div><div><span>Delivery</span><strong>Free</strong></div><div className="ds-order-total"><span>Total</span><strong>SAR 258</strong></div><button type="button" className="ds-button ds-button--primary ds-full-width-button">Place order <ArrowRight size={14} /></button></div></div>
    </article>
  </div>;
}

function OverlayExamples() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetDrag = useMobileSheetDrag(() => setSheetOpen(false), { enabled: sheetOpen });
  useEffect(() => {
    if (!sheetOpen && !modalOpen) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSheetOpen(false);
        setModalOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>("[data-ds-demo-dialog]");
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyboard);
      if (trigger?.isConnected) trigger.focus();
    };
  }, [modalOpen, sheetOpen]);
  return <>
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="ds-pattern-card"><span className="ds-pattern-icon"><ArrowDown size={17} /></span><p className="ds-eyebrow">Bottom sheet</p><h3>Mobile-first surface</h3><p>Rounded top corners, clear handle, comfortable side gutters and content-driven height.</p><button type="button" onClick={event => { triggerRef.current = event.currentTarget; setSheetOpen(true); }} className="ds-button ds-button--primary mt-5">Open sheet <ArrowUpRight size={15} /></button></article>
      <article className="ds-pattern-card"><span className="ds-pattern-icon"><Info size={17} /></span><p className="ds-eyebrow">Dialog</p><h3>Focused decision</h3><p>Use a centered dialog on desktop and a bottom sheet when the content is better suited to mobile.</p><button type="button" onClick={event => { triggerRef.current = event.currentTarget; setModalOpen(true); }} className="ds-button ds-button--secondary mt-5">Preview dialog</button></article>
    </div>
    {sheetOpen && <div className="ds-overlay" onClick={() => setSheetOpen(false)}><section data-ds-demo-dialog tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="ds-sheet-title" onClick={event => event.stopPropagation()} style={sheetDrag.dragStyle} className="ds-demo-sheet"><div {...sheetDrag.dragHandlers} className="ds-demo-sheet-handle" aria-hidden="true"><span /></div><div className="flex items-center justify-between"><span className="ds-eyebrow">Your selection</span><button autoFocus type="button" onClick={() => setSheetOpen(false)} aria-label="Close sheet" className="ds-icon-button"><X size={17} /></button></div><h2 id="ds-sheet-title" className="mt-5 text-xl font-semibold">A sheet that moves with you</h2><p className="mt-2 text-sm leading-6 text-[#737982]">Drag the handle down to close, or use the close action. The page settles before dismissing.</p><div className="mt-5 rounded-xl bg-[#f5f6f7] p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#2c8b4b]"><PackageCheck size={20} /></span><div><strong className="text-sm">Free delivery</strong><p className="mt-1 text-xs text-[#737982]">Available on qualifying orders</p></div></div></div><button type="button" onClick={() => setSheetOpen(false)} className="ds-button ds-button--primary mt-6 w-full">Done</button></section></div>}
    {modalOpen && <div className="ds-overlay ds-overlay--center" onClick={() => setModalOpen(false)}><section data-ds-demo-dialog tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="ds-modal-title" onClick={event => event.stopPropagation()} className="ds-demo-modal"><div className="flex items-start justify-between gap-4"><span className="ds-pattern-icon"><ShieldCheck size={19} /></span><button autoFocus type="button" onClick={() => setModalOpen(false)} aria-label="Close dialog" className="ds-icon-button"><X size={17} /></button></div><h2 id="ds-modal-title" className="mt-5 text-xl font-semibold">Confirm your choice</h2><p className="mt-2 text-sm leading-6 text-[#737982]">A concise message explains the consequence before a high-impact action.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="ds-button ds-button--secondary">Cancel</button><button type="button" onClick={() => setModalOpen(false)} className="ds-button ds-button--primary">Confirm</button></div></section></div>}
  </>;
}

export default function DesignSystemPage() {
  const { addToCart } = useStoreCart();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("responsive");
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Bestsellers");
  const [selectedChip, setSelectedChip] = useState("All perfumes");
  const [search, setSearch] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(["Men", "SAR 100–300"]);
  const [sort, setSort] = useState("Recommended");
  const [checked, setChecked] = useState(true);
  const [radio, setRadio] = useState("Men");
  const [switchOn, setSwitchOn] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [demoFavoriteNames, setDemoFavoriteNames] = useState<string[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [formError, setFormError] = useState(false);
  const [primaryActionDone, setPrimaryActionDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartItemVisible, setCartItemVisible] = useState(true);

  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    if (!targetId) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleFavorite = (name: string) => setDemoFavoriteNames(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  const handleDemoAdd = (product: Product, quantity: number, variant?: string) => {
    const item = { id: `${product.name}-${variant ?? "default"}`, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image, quantity, variant };
    addToCart(item);
  };

  return <div dir="ltr" className="design-system-page min-h-screen bg-[#faf9f7] text-[#171717]">
    <DocumentationHeader />
    <main aria-labelledby="ds-page-title">
      <section className="ds-hero">
        <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-9 sm:px-8 sm:pb-14 lg:px-12 lg:pt-14">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl"><div className="ds-hero-kicker"><Sparkles size={14} /> Deraah / Product design language</div><h1 id="ds-page-title">Design system<span>.</span></h1><p className="ds-hero-copy">A living reference for the components, decisions and responsive patterns behind Deraah Store. Explore the system, try each state and use these examples as the starting point for future work.</p><div className="mt-6 flex flex-wrap gap-2"><span className="ds-meta-pill"><BadgeCheck size={14} /> Living component library</span><span className="ds-meta-pill">Desktop + mobile patterns</span><span className="ds-meta-pill">Interactive examples</span></div></div>
            <div className="ds-preview-switch" aria-label="Preview width"><span>Preview canvas</span><div role="group" aria-label="Choose preview mode">{(["responsive", "desktop", "mobile"] as const).map(mode => <button key={mode} type="button" aria-pressed={previewMode === mode} onClick={() => setPreviewMode(mode)}>{mode === "responsive" ? "Responsive" : mode === "desktop" ? "Desktop" : "Mobile"}</button>)}</div></div>
          </div>
          <div className="ds-hero-summary"><div><strong>01</strong><span>Foundations</span></div><div><strong>02</strong><span>Core components</span></div><div><strong>03</strong><span>Commerce patterns</span></div><div><strong>04</strong><span>Responsive behavior</span></div></div>
        </div>
      </section>

      <div className="ds-page-layout mx-auto grid max-w-[1440px] gap-8 px-5 py-9 sm:px-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:py-14">
        <nav aria-label="Design system sections" className="ds-section-nav"><p className="ds-eyebrow">On this page</p><div>{sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.label}</a>)}</div><a href="/user-flow" className="ds-nav-secondary">User journey <ArrowRight size={13} /></a></nav>

        <div className="min-w-0">
          <Section id="foundations" index="01" eyebrow="Foundations" title="A consistent visual language" description="The system separates raw palette values from semantic roles. Components consume the semantic tokens so a state can change without creating a new one-off colour or spacing value." >
            <div className="ds-token-grid">{designSystemTokens.colors.map(color => <article key={color.name} className="ds-color-token"><span className="ds-color-swatch" style={{ backgroundColor: color.value }} /><div className="min-w-0"><strong>{color.name}</strong><p>{color.role}</p><CopyValue value={color.value} /></div></article>)}</div>
            <article className="ds-info-panel ds-palette-panel"><div className="flex items-start justify-between gap-5"><div><p className="ds-eyebrow">Palette families</p><h3>One source for every component state</h3></div><span className="hidden text-xs text-[#737982] sm:block">Base → surface → tint</span></div><div className="ds-palette-grid">{designSystemTokens.palette.map(palette => <div key={palette.name} className="ds-palette-row"><div><strong>{palette.name}</strong><small>{palette.role}</small></div><div className="ds-palette-swatches">{palette.values.map(value => <div key={value} className="ds-palette-swatch"><span style={{ backgroundColor: value }} /><CopyValue value={value} /></div>)}</div></div>)}</div></article>
            <div className="mt-5 grid gap-4 lg:grid-cols-2"><article className="ds-info-panel"><div className="flex items-center justify-between"><div><p className="ds-eyebrow">Elevation</p><h3>Quiet, purposeful depth</h3></div><span className="ds-pattern-icon"><Grid2X2 size={17} /></span></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{designSystemTokens.shadows.map(shadow => <div key={shadow.name} className="ds-shadow-sample" style={{ boxShadow: shadow.value }}><strong>{shadow.name}</strong><code>{shadow.value}</code></div>)}</div></article><article className="ds-info-panel"><p className="ds-eyebrow">Shape language</p><h3>Soft edges, clear hierarchy</h3><div className="mt-5 flex flex-wrap items-end gap-3">{designSystemTokens.radii.map((radius, index) => <div key={radius.name} className="ds-radius-sample"><span style={{ borderRadius: [8, 14, 20, 28, 999][index] }} /><strong>{radius.name}</strong><small>{radius.value}</small></div>)}</div></article></div>
          </Section>

          <Section id="type-layout" index="02" eyebrow="Typography & layout" title="Readable at every scale" description="The type ramp follows the Figma system’s H / S / B / C hierarchy while preserving Poppins as Deraah’s product font. Use the named style instead of inventing a new size for each screen." >
            <div className="ds-info-panel"><div className="grid gap-0 divide-y divide-[#ece9e6]">{designSystemTokens.typography.map(item => { const [fontSize, lineHeight] = item.size.split("/").map(value => Number.parseInt(value, 10)); const minFontSize = Math.min(fontSize, Math.max(10, fontSize - 8)); return <div key={item.name} className="ds-type-row"><div><span className="ds-eyebrow">{item.name}</span><p>{item.use}</p></div><strong style={{ fontSize: `clamp(${minFontSize}px, ${Math.max(1, fontSize / 12)}vw, ${fontSize}px)`, lineHeight: `${lineHeight}px`, fontWeight: Number.parseInt(item.weight, 10) }}>{item.sample}</strong><code>{item.size} · {item.weight}</code></div>; })}</div></div>
            <div className="mt-5 ds-info-panel"><div className="flex items-start justify-between gap-5"><div><p className="ds-eyebrow">Spacing scale</p><h3>Comfortable rhythm, predictable gaps</h3></div><span className="hidden text-xs text-[#737982] sm:block">Base unit · 4 px</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{designSystemTokens.spacing.map(space => <div key={space} className="ds-space-row"><code>{space}px</code><span style={{ width: `${space}px` }} /><small>{space === 16 ? "Default card inset" : space === 24 ? "Section content" : space === 12 ? "Control gap" : "Spacing token"}</small></div>)}</div><div className="mt-6 border-t border-[#ece9e6] pt-5"><p className="ds-eyebrow">Responsive breakpoints</p><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{designSystemTokens.breakpoints.map(item => <div key={item.name} className="ds-breakpoint"><strong>{item.value}</strong><span>{item.name}</span><small>{item.note}</small></div>)}</div></div></div>
          </Section>

          <Section id="buttons" index="03" eyebrow="Actions" title="Buttons that communicate priority" description="Use one clear primary action per surface. Secondary actions use a quiet border; destructive actions use red and require confirmation when the effect is difficult to reverse." >
            <PreviewCanvas mode={previewMode}>
              <div className="ds-demo-label"><div><p className="ds-eyebrow">Button system</p><h3>Three styles, five sizes, five states</h3></div><span>Figma-aligned structure · Deraah tokens</span></div>
              <div className="ds-button-matrix" aria-label="Button style and state matrix">
                <div className="ds-button-matrix__head"><span>Style</span><span>Default</span><span>Hover</span><span>Focus</span><span>Press</span><span>Disabled</span></div>
                <div className="ds-button-matrix__row"><strong>Filled</strong><button type="button" className="ds-button ds-button--medium ds-button--primary">Add to cart</button><button type="button" className="ds-button ds-button--medium ds-button--primary ds-button--state-hover">Add to cart</button><button type="button" className="ds-button ds-button--medium ds-button--primary ds-button--state-focus">Add to cart</button><button type="button" className="ds-button ds-button--medium ds-button--primary ds-button--state-press">Add to cart</button><button type="button" disabled className="ds-button ds-button--medium ds-button--primary">Add to cart</button></div>
                <div className="ds-button-matrix__row"><strong>Outline</strong><button type="button" className="ds-button ds-button--medium ds-button--outline">View details</button><button type="button" className="ds-button ds-button--medium ds-button--outline ds-button--state-hover">View details</button><button type="button" className="ds-button ds-button--medium ds-button--outline ds-button--state-focus">View details</button><button type="button" className="ds-button ds-button--medium ds-button--outline ds-button--state-press">View details</button><button type="button" disabled className="ds-button ds-button--medium ds-button--outline">View details</button></div>
                <div className="ds-button-matrix__row"><strong>Clear</strong><button type="button" className="ds-button ds-button--medium ds-button--clear">Cancel</button><button type="button" className="ds-button ds-button--medium ds-button--clear ds-button--state-hover">Cancel</button><button type="button" className="ds-button ds-button--medium ds-button--clear ds-button--state-focus">Cancel</button><button type="button" className="ds-button ds-button--medium ds-button--clear ds-button--state-press">Cancel</button><button type="button" disabled className="ds-button ds-button--medium ds-button--clear">Cancel</button></div>
              </div>
              <div className="ds-button-scale"><div className="ds-demo-label"><div><p className="ds-eyebrow">Size scale</p><h3>Use the smallest size that preserves hierarchy</h3></div><span>Height includes the control border</span></div><div className="ds-button-scale__row">{designSystemTokens.buttonSizes.map(size => <div key={size.name} className="ds-button-scale__item"><span>{size.name}<small>{size.height} px · {size.size}</small></span><button type="button" className={`ds-button ds-button--${size.name.toLowerCase()} ds-button--primary`}>Continue <ArrowRight size={size.name === "Tiny" ? 11 : 13} /></button></div>)}</div><div className="ds-button-icon-row"><span>Icon only</span>{designSystemTokens.buttonSizes.map(size => <button key={size.name} type="button" aria-label={`${size.name} icon button`} className={`ds-button ds-button--icon ds-button--${size.name.toLowerCase()} ds-button--outline`}><Bell size={size.name === "Tiny" ? 11 : 15} /></button>)}</div></div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#ece9e6] pt-5"><button type="button" onClick={() => { setPrimaryActionDone(true); window.setTimeout(() => setPrimaryActionDone(false), 1800); }} className="ds-button ds-button--primary">{primaryActionDone ? <><Check size={15} /> Added</> : <>Add to cart <ShoppingBag size={15} /></>}</button><button type="button" disabled={loading} onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 1200); }} className="ds-button ds-button--outline">{loading ? <><Loader2 className="ds-spinner" size={15} /> Saving…</> : <>Save changes <Check size={15} /></>}</button><button type="button" className="ds-button ds-button--brand">Explore Deraah <Sparkles size={14} /></button><button type="button" className="ds-button ds-button--danger"><Trash2 size={14} /> Remove</button></div>
            </PreviewCanvas>
          </Section>

          <Section id="forms" index="04" eyebrow="Form controls" title="Input patterns with clear states" description="Labels stay visible when a field contains a value. Focus is always visible, errors sit next to the field, and native semantics remain available to assistive technology." >
            <PreviewCanvas mode={previewMode}>
              <div className="grid gap-6 lg:grid-cols-2"><div className="grid gap-4"><div><label htmlFor="ds-search" className="ds-field-label">Search products</label><form className="ds-search-field" onSubmit={event => { event.preventDefault(); setSearchSubmitted(true); }}><Search size={17} /><input id="ds-search" value={search} onChange={event => { setSearch(event.target.value); setSearchSubmitted(false); }} placeholder="Search products, brands, or categories" /><button type={search ? "button" : "submit"} onClick={search ? () => { setSearch(""); setSearchSubmitted(false); } : undefined} aria-label={search ? "Clear search" : "Submit search"}>{search ? <X size={15} /> : <ArrowRight size={15} />}</button></form>{searchSubmitted && <span role="status" className="ds-search-feedback">{search.trim() ? `Showing matches for “${search.trim()}”` : "Enter a product, brand, or category to search."}</span>}</div><label className="ds-field-label">Sort by<select value={sort} onChange={event => setSort(event.target.value)} className="ds-select"><option>Recommended</option><option>Newest</option><option>Price: low to high</option><option>Price: high to low</option></select></label><label className="ds-field-label">Email address<input className={`ds-input ${formError ? "ds-input--error" : ""}`} type="email" placeholder="name@example.com" onBlur={event => setFormError(Boolean(event.currentTarget.value) && !event.currentTarget.validity.valid)} onChange={event => setFormError(Boolean(event.currentTarget.value) && !event.currentTarget.validity.valid)} />{formError && <span role="alert" className="ds-field-error">Enter a valid email address.</span>}</label><label className="ds-field-label ds-disabled-field">Unavailable option<input className="ds-input" disabled placeholder="Not available" /></label></div><div><p className="ds-eyebrow">Selection controls</p><div className="mt-3 space-y-3 rounded-xl border border-[#e9e7e4] bg-white p-4"><label className="ds-check-row"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} /><span>Gift wrapping available</span><span className="ms-auto text-xs text-[#737982]">Optional</span></label>{["Men", "Women", "Unisex"].map(value => <label key={value} className="ds-check-row"><input type="radio" name="ds-gender" value={value} checked={radio === value} onChange={() => setRadio(value)} /><span>{value}</span></label>)}<div className="flex items-center justify-between border-t border-[#ece9e6] pt-4"><div><strong className="block text-sm">In stock alerts</strong><span className="mt-1 block text-xs text-[#737982]">Notify me when available</span></div><button type="button" role="switch" aria-checked={switchOn} onClick={() => setSwitchOn(value => !value)} className={`ds-switch ${switchOn ? "is-on" : ""}`}><span /></button></div></div></div></div>
            </PreviewCanvas>
            <div className="ds-info-panel ds-input-state-panel"><div className="ds-demo-label"><div><p className="ds-eyebrow">Input state contract</p><h3>One field, predictable feedback</h3></div><span>Default · hover · focus · error · disabled</span></div><div className="ds-input-state-grid"><label className="ds-field-label">Default<input className="ds-input" placeholder="Recipient name" /></label><label className="ds-field-label ds-input-state-hover">Hover<input className="ds-input" value="Green Woods" readOnly aria-label="Hover input example" /></label><label className="ds-field-label ds-input-state-focus">Focus<input className="ds-input" value="Add a warm message" readOnly aria-label="Focus input example" /></label><label className="ds-field-label ds-input-state-error">Error<input className="ds-input ds-input--error" value="not-an-email" readOnly aria-label="Error input example" /><span className="ds-field-error">Enter a valid email address.</span></label><label className="ds-field-label ds-input-state-disabled">Disabled<input className="ds-input" disabled placeholder="Not available" /></label></div></div>
          </Section>

          <Section id="core-components" index="05" eyebrow="Core components" title="The missing building blocks" description="These patterns complete the store language around the existing buttons and form controls: status, menus, loading, identity, progress, recovery and navigation chrome." >
            <CoreComponentsExamples />
          </Section>

          <Section id="navigation" index="06" eyebrow="Navigation" title="Make location and selection obvious" description="Use compact tabs for peer views, chips for applied filters and breadcrumbs when a page sits deeper in the catalogue. Selected states are high contrast and keyboard accessible." >
            <PreviewCanvas mode={previewMode}>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="ds-eyebrow">Tabs</p>
                  <div role="tablist" aria-label="Product collections" className="ds-tab-list">
                    {collectionTabs.map((tab, index) => <button key={tab} id={`ds-tab-${index}`} type="button" role="tab" aria-controls="ds-tab-panel" tabIndex={selectedTab === tab ? 0 : -1} aria-selected={selectedTab === tab} onClick={() => setSelectedTab(tab)} onKeyDown={event => {
                      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                      event.preventDefault();
                      const currentIndex = collectionTabs.indexOf(selectedTab);
                      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? collectionTabs.length - 1 : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + collectionTabs.length) % collectionTabs.length;
                      setSelectedTab(collectionTabs[nextIndex]);
                      document.getElementById(`ds-tab-${nextIndex}`)?.focus();
                    }}>{tab}</button>)}
                  </div>
                  <p id="ds-tab-panel" role="tabpanel" aria-labelledby={`ds-tab-${collectionTabs.indexOf(selectedTab)}`} tabIndex={0} className="mt-3 text-xs text-[#737982]" aria-live="polite">Showing: {selectedTab}</p>
                  <div className="ds-tab-states" aria-label="Tab states"><span>States</span><button type="button">Default</button><button type="button" className="is-hover">Hover</button><button type="button" className="is-focus">Focus</button><button type="button" className="is-selected">Selected</button><button type="button" disabled>Disabled</button></div>
                </div>
                <div>
                  <p className="ds-eyebrow">Filter chips</p>
                  <div className="mt-3 flex flex-wrap gap-2">{["All perfumes", "Niche perfumes", "Men perfumes", "Women perfumes"].map(chip => <button key={chip} type="button" aria-pressed={selectedChip === chip} onClick={() => setSelectedChip(chip)} className={`ds-filter-chip ${selectedChip === chip ? "is-selected" : ""}`}>{chip}</button>)}</div>
                  <div className="mt-3 flex flex-wrap gap-2">{appliedFilters.map(filter => <span key={filter} className="ds-applied-chip">{filter} <button type="button" onClick={() => setAppliedFilters(filters => filters.filter(item => item !== filter))} aria-label={`Remove ${filter} filter`}><X size={12} /></button></span>)}{!appliedFilters.length && <button type="button" onClick={() => setAppliedFilters(["Men", "SAR 100–300"])} className="text-xs font-medium text-[#737982] underline">Restore example filters</button>}</div>
                </div>
                <div>
                  <p className="ds-eyebrow">Breadcrumbs & pagination</p>
                  <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#737982]"><a href="/" className="hover:text-[#171717]">Home</a><ChevronRight size={13} /><a href="/category?category=Perfumes" className="hover:text-[#171717]">Perfumes</a><ChevronRight size={13} /><span className="font-medium text-[#171717]">Unisex perfumes</span></nav>
                  <div className="mt-4 flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} className="ds-page-button" aria-label="Previous page"><ChevronLeft size={15} /></button>{[1, 2, 3].map(page => <button key={page} type="button" aria-current={currentPage === page ? "page" : undefined} onClick={() => setCurrentPage(page)} className={`ds-page-button ${currentPage === page ? "is-current" : ""}`}>{page}</button>)}<button type="button" onClick={() => setCurrentPage(page => Math.min(3, page + 1))} className="ds-page-button" aria-label="Next page"><ChevronRight size={15} /></button><span className="ms-2 text-xs text-[#737982]">Page {currentPage} of 3</span></div>
                  <div className="ds-page-control" aria-label="Carousel page control"><button type="button" className="is-active" aria-label="Show page 1" /><button type="button" aria-label="Show page 2" /><button type="button" aria-label="Show page 3" /><span>Featured collection</span></div>
                </div>
              </div>
            </PreviewCanvas>
          </Section>

          <Section id="commerce" index="07" eyebrow="Commerce components" title="The shopping journey, component by component" description="Real product cards from the store, plus the matching cart row and loyalty progress pattern. Try wishlist, size selection, quantity and product actions." >
            <PreviewCanvas mode={previewMode} className="ds-commerce-canvas">
              <div className="ds-demo-label"><div><p className="ds-eyebrow">Product listing</p><h3>Offer, stock and rating states</h3></div><span>Canonical component · Product card</span></div>
              <div className="ds-product-grid">{documentationStoreProducts.map(product => <ProductCard key={product.name} product={product} layout="grid" onAddToCart={handleDemoAdd} favorite={demoFavoriteNames.includes(product.name)} onFavorite={() => toggleFavorite(product.name)} />)}</div>
              <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><div><div className="ds-demo-label"><div><p className="ds-eyebrow">Cart line item</p><h3>One reusable row pattern</h3></div><span>Mobile · Desktop</span></div>{cartItemVisible ? <div className="ds-cart-row"><div className="ds-product-thumb"><img src={documentationProducts[0].image} alt="Green Woods Eau de Parfum" /></div><div className="min-w-0 flex-1"><strong>Green Woods Eau de Parfum</strong><span className="block text-xs text-[#737982]">100 ml</span><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2"><strong className="ds-cart-price">SAR 258</strong><QuantityControl value={quantity} onChange={setQuantity} /></div><span className="ds-gift-badge mt-2"><Gift size={12} /> Gift available</span></div><button type="button" onClick={() => setCartItemVisible(false)} aria-label="Remove item" className="ds-remove-button"><Trash2 size={15} /></button></div> : <button type="button" onClick={() => setCartItemVisible(true)} className="ds-button ds-button--secondary mt-3">Undo remove</button>}</div><div><div className="ds-demo-label"><div><p className="ds-eyebrow">Loyalty progress</p><h3>Reward milestones</h3></div><span>Progressive</span></div><div className="ds-reward-card"><div className="flex items-center justify-between gap-3"><div><span className="ds-eyebrow">Mukafaati</span><h4>Free rewards</h4></div><span className="ds-reward-status">1 / 4 unlocked</span></div><div className="ds-reward-track"><span style={{ width: "29%" }} /><i style={{ left: "25%" }} /><i style={{ left: "50%" }} /><i style={{ left: "75%" }} /><i style={{ left: "100%" }} /></div><div className="grid grid-cols-4 gap-1 text-center">{["Free shipping", "5% off", "Free sample", "10% off"].map((label, index) => <div key={label} className={`rounded-lg px-1 py-2 ${index === 0 ? "bg-[#e8f7ed] text-[#2c8b4b]" : "text-[#737982]"}`}><strong className="block text-[10px]">SAR {300 * (index + 1)}</strong><span className="mt-1 block text-[9px] leading-3">{label}</span></div>)}</div><a href="/category?category=Perfumes" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#2c8b4b]">Add products <ArrowRight size={13} /></a></div></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><span className="ds-status-badge ds-status-badge--success"><CheckCircle2 size={13} /> In stock</span><span className="ds-status-badge ds-status-badge--gift"><Gift size={13} /> Gift available</span><span className="ds-status-badge ds-status-badge--sale"><TicketPercent size={13} /> 1+2 Free</span><span className="ds-status-badge ds-status-badge--error"><Info size={13} /> Out of stock</span></div>
              <div className="mt-8"><CheckoutPatternsExamples /></div>
            </PreviewCanvas>
          </Section>

          <Section id="feedback" index="08" eyebrow="Feedback & status" title="Tell people what just happened" description="Confirmation is timely and calm; validation is local to the field; badges are short and never rely on color alone." >
            <PreviewCanvas mode={previewMode}>
              <div className="grid gap-4 md:grid-cols-2"><div className="ds-pattern-card"><p className="ds-eyebrow">Toast · success</p><h3>Dismissible confirmation</h3><p>Use for reversible, lightweight actions such as add to cart or copied to clipboard.</p><button type="button" onClick={() => setToastOpen(true)} className="ds-button ds-button--primary mt-5">Show toast <CheckCircle2 size={15} /></button><div className="mt-4">{toastOpen && <DocumentationToast onClose={() => setToastOpen(false)} />}</div></div><div className="ds-pattern-card"><p className="ds-eyebrow">Inline states</p><h3>Useful status messages</h3><div role="status" className="ds-inline-alert ds-inline-alert--success"><CheckCircle2 size={18} /><span><strong>Saved successfully</strong><small>Your changes are ready.</small></span></div><div role="alert" className="ds-inline-alert ds-inline-alert--error"><Info size={18} /><span><strong>Payment needs attention</strong><small>Check your card details and try again.</small></span></div><div className="mt-4 flex items-center gap-2"><span className="ds-count-badge ds-count-badge--inline">3</span><span className="text-xs text-[#737982]">Unread notifications</span></div></div></div>
            </PreviewCanvas>
          </Section>

          <Section id="overlays" index="09" eyebrow="Overlays" title="Sheets and dialogs with a clear exit" description="The mobile sheet follows the account-panel pattern: one visible drag handle, rounded top corners, and a close action. Try dragging the sheet handle downward." >
            <PreviewCanvas mode={previewMode}><OverlayExamples /></PreviewCanvas>
          </Section>

          <Section id="accessibility" index="10" eyebrow="Accessibility & states" title="Polish includes the details you cannot see at first glance" description="Use the checklist while creating or reviewing a page. The goal is a component that remains understandable with touch, keyboard and assistive technology." >
            <div className="grid gap-4 md:grid-cols-2"><article className="ds-info-panel"><p className="ds-eyebrow">Interaction checklist</p><h3>Every control has a clear state</h3><ul className="ds-checklist"><li><CheckCircle2 size={16} /> Visible keyboard focus ring</li><li><CheckCircle2 size={16} /> Hover, pressed, selected and disabled variants</li><li><CheckCircle2 size={16} /> Labels and accessible names for icon-only actions</li><li><CheckCircle2 size={16} /> Validation messages placed next to the field</li><li><CheckCircle2 size={16} /> Touch targets aim for 44 × 44 px</li><li><CheckCircle2 size={16} /> Motion respects reduced-motion preferences</li></ul></article><article className="ds-info-panel"><p className="ds-eyebrow">Iconography</p><h3>One stroke language</h3><div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">{iconSamples.map(([Icon, label]) => <div key={label} className="ds-icon-sample"><Icon size={19} strokeWidth={1.7} /><span>{label}</span></div>)}</div><div className="mt-5 rounded-xl bg-[#f5f6f7] p-3 text-xs leading-5 text-[#737982]">Use Lucide icons already included in the project. Keep stroke weights consistent; do not mix filled and outline styles without a state reason.</div></article></div>
            <article className="ds-release-note mt-4"><div className="ds-pattern-icon"><ShieldCheck size={18} /></div><div><strong>Design-system contract</strong><p>Use the tokens in <code>src/designSystemTokens.ts</code> and <code>src/designSystemTokens.css</code> as the canonical starting point. When an existing page differs, update the pattern here and migrate the page deliberately rather than introducing a near-duplicate.</p></div></article>
          </Section>

          <div className="ds-end-note"><img className="ds-brand-mark" src="/product-assets/deraah-wordmark.svg" alt="DERAAH" /><div><strong>Build with intent.</strong><p>Start with a proven pattern, keep states visible, and let the content set the component’s height.</p></div><a href="#top" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top <ArrowUpRight size={14} /></a></div>
        </div>
      </div>
    </main>
    <DocumentationFooter />
    <div className="md:hidden"><DocumentationMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(value => !value)} /></div>
  </div>;
}
