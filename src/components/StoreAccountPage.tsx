import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  HelpCircle,
  Heart,
  Globe2,
  Info,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Plus,
  Pencil,
  ReceiptText,
  Share2,
  ShieldCheck,
  Store,
  TicketPercent,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useStoreCart } from "./StoreCartContext";
import { useStoreFavorites } from "./StoreFavoritesContext";
import { useStoreOrders } from "./StoreOrdersContext";
import { AddressForm, loadAddresses, type Address } from "./CheckoutPage";
import OrderItemsPreview from "./OrderItemsPreview";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";

type AccountView = "profile" | "addresses" | "cards" | "orders" | "favorites" | "coupons" | "refer" | "notifications" | "locale" | "stores" | "about" | "policies" | "faq";

const accountViewNames: AccountView[] = ["profile", "addresses", "cards", "orders", "favorites", "coupons", "refer", "notifications", "locale", "stores", "about", "policies", "faq"];

function getAccountViewFromUrl(): AccountView | null {
  if (typeof window === "undefined") return null;
  const requestedView = new URLSearchParams(window.location.search).get("view");
  return accountViewNames.includes(requestedView as AccountView) ? requestedView as AccountView : null;
}

type AccountAction = {
  label: string;
  icon: typeof UserRound;
  view?: AccountView;
  href?: string;
  onClick?: () => void;
};

const ACCOUNT_ACTIONS: AccountAction[] = [
  { label: "My Profile", icon: UserRound, view: "profile", href: "#profile" },
  { label: "My Address Book", icon: MapPin, view: "addresses", href: "/checkout" },
  { label: "My Payment Cards", icon: ReceiptText, view: "cards", href: "/payment-summary" },
];

const DESKTOP_ACCOUNT_ACTIONS: AccountAction[] = [
  ...ACCOUNT_ACTIONS,
  { label: "My Orders", icon: PackageCheck, view: "orders", href: "/payment-summary" },
  { label: "Favorites", icon: Heart, view: "favorites", href: "/#favorites" },
  { label: "My Coupons", icon: TicketPercent, view: "coupons", href: "/#offers" },
  { label: "Refer & Earn", icon: Share2, view: "refer", href: "/#refer" },
];

const SETTINGS_ACTIONS: AccountAction[] = [
  { label: "Notifications", icon: Bell, view: "notifications", onClick: () => window.dispatchEvent(new Event("store:open-notifications")) },
  { label: "Language / Country", icon: Globe2, view: "locale", onClick: () => window.dispatchEvent(new Event("store:open-country")) },
];

const SUPPORT_ACTIONS: AccountAction[] = [
  { label: "Stores / Nearest Store", icon: Store, view: "stores", href: "/checkout" },
  { label: "About Deraah", icon: Info, view: "about", href: "/#about" },
  { label: "Policies and Regulations", icon: ShieldCheck, view: "policies", href: "/#privacy" },
  { label: "FAQ", icon: HelpCircle, view: "faq", href: "/#faqs" },
  { label: "Sign Out", icon: LogOut, onClick: () => { window.localStorage.removeItem("deraah-store-auth"); window.location.assign("/"); } },
];

function AccountListSection({ title, actions, onChange }: { title: string; actions: AccountAction[]; onChange: (view: AccountView) => void }) {
  return (
    <section dir="ltr" aria-labelledby={`${title.toLowerCase().replace(/\s+/g, "-")}-title`} className="px-[23px]">
      <h2 id={`${title.toLowerCase().replace(/\s+/g, "-")}-title`} className="mb-3 text-left text-[18px] font-bold tracking-[-.02em] text-[#1f2024]">{title}</h2>
      <div className="border-t border-[#e7e9ec]">
        {actions.map(({ label, icon: Icon, href, view, onClick }) => {
          const content = (
            <>
              <span className="flex min-w-0 flex-1 items-center justify-start gap-4">
                <Icon aria-hidden="true" className="h-6 w-6 shrink-0 text-[#1f2024]" strokeWidth={1.45} />
                <span className="truncate text-left text-[14px] leading-[23px] text-[#1f2024]">{label}</span>
              </span>
              <ChevronRight aria-hidden="true" className="h-[14px] w-[14px] shrink-0 text-[#9298a1]" strokeWidth={1.7} />
            </>
          );
          if (view) return <button key={label} type="button" onClick={() => onChange(view)} className="flex min-h-[61px] w-full items-center gap-4 border-b border-[#e7e9ec] text-start transition-colors active:bg-[#f3f5f7]">{content}</button>;
          return href ? <a key={label} href={href} className="flex min-h-[61px] items-center gap-4 border-b border-[#e7e9ec] no-underline transition-colors active:bg-[#f3f5f7]">{content}</a> : <button key={label} type="button" onClick={onClick} className="flex min-h-[61px] w-full items-center gap-4 border-b border-[#e7e9ec] text-start transition-colors active:bg-[#f3f5f7]">{content}</button>;
        })}
      </div>
    </section>
  );
}

function SupportCard() {
  const items = [
    { label: "Email", sublabel: "Message Us Now", icon: MessageCircle, href: "mailto:support@deraahstore.com" },
    { label: "WhatsApp", sublabel: "Quick Response", icon: MessageCircle, href: "https://wa.me/966509195216" },
    { label: "Direct Phone", sublabel: "Call Us", icon: Phone, href: "tel:8001186666" },
    { label: "Contact Us", sublabel: "Customer Service", icon: HelpCircle, href: "#contact" },
  ];
  return (
    <section className="mx-[8px] min-h-[191px] rounded-[10px] border border-[#f0f1f3] bg-white px-3 py-6 shadow-[0_5px_14px_rgba(8,15,52,.05)]">
      <p className="text-center text-[9px] font-semibold leading-[13px] text-[#1f2024]">Customer Service at Your Service | All Day<br />From: 9:00 AM - 9:00 PM</p>
      <div className="mt-9 grid grid-cols-4 divide-x divide-[#e5e7eb]">
        {items.map(({ label, sublabel, icon: Icon, href }) => <a key={label} href={href} className="flex min-w-0 flex-col items-center gap-1 px-1 text-center no-underline active:opacity-70"><Icon className="h-5 w-5 text-[#101010]" strokeWidth={1.6} /><span className="text-[10px] font-semibold leading-4 text-[#101010]">{label}</span><span className="text-[8px] leading-3 text-[#585858]">{sublabel}</span></a>)}
      </div>
    </section>
  );
}

function MemberCard({ desktop = false }: { desktop?: boolean } = {}) {
  return (
    <section aria-label="Deraah rewards membership" className={`relative aspect-[410/238] h-auto overflow-hidden rounded-[18px] border border-[#303030] bg-[#171717] p-[5.85%] text-white shadow-[0_10px_24px_rgba(8,12,18,.12)] ${desktop ? "mx-0 w-full max-w-none" : "mx-[10px] w-[calc(100%_-_20px)] max-w-[410px]"}`}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-[3.9%]">
            <span className={`grid shrink-0 place-items-center rounded-[7px] border-2 border-[#171717] bg-white ${desktop ? "h-[24px] w-[24px]" : "h-[34px] w-[34px]"}`}><img aria-hidden="true" src="/product-assets/account/membership-qr-icon.svg" alt="" className="h-[75%] w-[75%]" /></span>
            <div className="min-w-0">
              <p className={`whitespace-nowrap font-semibold leading-tight ${desktop ? "text-[11px]" : "text-[15px]"}`}>Ahmed Mohey</p>
              <p className={`mt-1 whitespace-nowrap leading-tight text-white/75 ${desktop ? "text-[10px]" : "text-[11px]"}`}>+966 509195216</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <img aria-hidden="true" src="/product-assets/account/membership-brand-mark.svg" alt="" className={`${desktop ? "h-[16px] w-[38px]" : "h-[22px] w-[54px]"}`} />
            <span className={`rounded-full border border-[#e07272]/60 px-2 py-0.5 font-medium tracking-[.12em] text-[#e07272] ${desktop ? "text-[10px]" : "text-[9px]"}`}>GOLD</span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 divide-x divide-white/15">
          <div className="pr-[8%]">
            <p className={`text-white/65 ${desktop ? "text-[10px]" : "text-[11px]"}`}>Your Balance</p>
            <p className={`mt-1 font-bold leading-none ${desktop ? "text-[16px]" : "text-[22px]"}`}>5000 <span className={`font-medium text-white/75 ${desktop ? "text-[10px]" : "text-[11px]"}`}>Points</span></p>
          </div>
          <div className="pl-[8%]">
            <p className={`text-white/65 ${desktop ? "text-[10px]" : "text-[11px]"}`}>Amount</p>
            <p className={`mt-1 font-bold leading-none ${desktop ? "text-[16px]" : "text-[22px]"}`}>100 <span className={`font-medium text-white/75 ${desktop ? "text-[10px]" : "text-[11px]"}`}>SAR</span></p>
          </div>
        </div>

        <div className="mt-[7%] flex items-end justify-between gap-3 border-t border-white/15 pt-[5%]">
          <p className={`leading-tight text-white/75 ${desktop ? "text-[10px]" : "text-[11px]"}`}><strong className="text-white">429</strong> Pending points<br />Value <strong className="text-white">4.29</strong> SAR</p>
          <a href="/#gift-offers" className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-white no-underline transition-colors hover:bg-white/15 ${desktop ? "text-[10px] font-medium" : "text-[10px] font-semibold"}`}>
            <img aria-hidden="true" src="/product-assets/account/membership-gift.svg" alt="" className={`${desktop ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
            <span>Mukafaati</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function DesktopAccountSidebar({ view, onChange }: { view: AccountView; onChange: (view: AccountView) => void }) {
  const groups = [
    { title: "My Account", actions: DESKTOP_ACCOUNT_ACTIONS },
    { title: "Settings", actions: SETTINGS_ACTIONS },
    { title: "Support", actions: SUPPORT_ACTIONS },
  ];
  return <aside className="space-y-5">
    <MemberCard desktop />
    <nav aria-label="Account sections" className="rounded-[20px] border border-[#e4e9f0] bg-white p-3 shadow-[0_8px_24px_rgba(30,50,80,.04)]">
      {groups.map(group => <div key={group.title}>
        <h2 className={`px-3 pb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#9aa1ac] ${group.title === "My Account" ? "" : "pt-6"}`}>{group.title}</h2>
        <div className="space-y-1">
          {group.actions.map(({ label, icon: Icon, view: actionView, onClick }) => {
            const active = Boolean(actionView && actionView === view);
            const handleClick = () => {
              if (label === "Sign Out") {
                onClick?.();
                return;
              }
              onChange(actionView ?? "profile");
            };
            return <button key={label} type="button" onClick={handleClick} aria-current={active ? "page" : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors ${active ? "bg-[#f0f8f2] font-semibold text-[#267b42]" : "text-[#4e5661] hover:bg-[#f6f8fa]"}`}><Icon aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#2c8b4b]" : "text-[#78818d]"}`} strokeWidth={1.7} /><span className="min-w-0 flex-1 truncate">{label}</span>{label !== "Sign Out" && <ChevronRight aria-hidden="true" size={15} className="shrink-0 text-[#aab1bb]" strokeWidth={1.7} />}</button>;
          })}
        </div>
      </div>)}
    </nav>
  </aside>;
}

function DesktopSavedAddressCard({ address, onEdit, onRemove, onSetDefault }: { address: Address; onEdit: () => void; onRemove: () => void; onSetDefault: () => void }) {
  return <article className={`rounded-[18px] border p-5 transition-colors ${address.isDefault ? "border-[#8fd3a5] bg-[#f5fcf7]" : "border-[#e3e8ee] bg-white"}`}>
    <div className="flex items-start gap-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${address.isDefault ? "bg-[#dff5e5] text-[#2c8b4b]" : "bg-[#f1f4f7] text-[#75808d]"}`}><MapPin size={21} strokeWidth={1.7} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-[15px] font-semibold text-[#171a1f]">{address.label}</h3><p className="mt-1 text-[11px] text-[#7a838e]">{address.recipient} · {address.phone}</p></div>{address.isDefault && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#dff5e5] px-2.5 py-1 text-[10px] font-semibold text-[#267b42]"><Check size={12} strokeWidth={2.5} /> Default</span>}</div>
        <p className="mt-3 text-xs leading-5 text-[#4e5661]">{address.city} · {address.street}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e7ecef] pt-3"><button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe5ea] px-3 py-2 text-[11px] font-semibold text-[#3f4852] transition-colors hover:border-[#9aa6b2] hover:bg-white"><Pencil size={13} strokeWidth={1.8} /> Edit</button><button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold text-[#b34b55] transition-colors hover:bg-[#fff3f3]"><Trash2 size={13} strokeWidth={1.8} /> Remove</button>{!address.isDefault && <button type="button" onClick={onSetDefault} className="ms-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#2c8b4b] hover:underline">Set as default <ArrowRight size={13} /></button>}</div>
      </div>
    </div>
  </article>;
}

function DesktopAddressBook() {
  const [addresses, setAddresses] = useState<Address[]>(() => loadAddresses());
  const [draft, setDraft] = useState<Address | null>(null);

  const persist = (next: Address[]) => {
    setAddresses(next);
    window.localStorage.setItem("deraah-addresses", JSON.stringify(next));
  };
  const startNewAddress = () => setDraft({ id: "", label: "Home", recipient: "", phone: "", city: "", street: "", code: "", nationalCode: "", otherLabel: "", recipientDifferent: false, isDefault: addresses.length === 0, addressType: "home" });
  const startEditAddress = (address: Address) => setDraft({ ...address, label: ["Home", "Work", "Other"].includes(address.label) ? address.label : "Other", otherLabel: address.otherLabel ?? (["Home", "Work", "Other"].includes(address.label) ? "" : address.label) });
  const updateDraft = (field: keyof Address, value: string | boolean) => setDraft(current => current ? { ...current, [field]: value } : current);
  const saveAddress = () => {
    if (!draft || !draft.city || !draft.street) return;
    const id = draft.id || `address-${Date.now()}`;
    const savedAddress: Address = { ...draft, id, label: draft.label === "Other" && draft.otherLabel?.trim() ? draft.otherLabel.trim() : draft.label };
    const next = draft.id ? addresses.map(address => address.id === draft.id ? savedAddress : address) : [...addresses, savedAddress];
    const normalized = savedAddress.isDefault ? next.map(address => address.id === id ? address : { ...address, isDefault: false }) : next;
    persist(normalized);
    setDraft(null);
  };
  const removeAddress = (id: string) => {
    const remaining = addresses.filter(address => address.id !== id);
    const next = remaining.length && !remaining.some(address => address.isDefault) ? remaining.map((address, index) => index === 0 ? { ...address, isDefault: true } : address) : remaining;
    persist(next);
  };
  const setDefault = (id: string) => persist(addresses.map(address => ({ ...address, isDefault: address.id === id })));

  return <section aria-labelledby="desktop-address-book-title" className="rounded-[24px] border border-[#e4e9f0] bg-white p-7 shadow-[0_8px_28px_rgba(30,50,80,.05)]">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8edf1] pb-6"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#2c8b4b]">Account settings</p><h1 id="desktop-address-book-title" className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#171a1f]">My Address Book</h1><p className="mt-2 text-sm text-[#737c87]">Manage your saved delivery addresses and choose your default location.</p></div>{!draft && <button type="button" onClick={startNewAddress} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#171a1f] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#2c3036]"><Plus size={16} /> Add new address</button>}</div>
    {draft ? <div className="mt-6 rounded-2xl border border-[#e3e8ee] bg-[#f8fafc] p-5"><AddressForm draft={draft} onChange={updateDraft} onSave={saveAddress} onCancel={() => setDraft(null)} /></div> : <><div className="mt-6 flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-[#171a1f]">Saved addresses</h2><span className="text-xs text-[#8a939e]">{addresses.length} {addresses.length === 1 ? "address" : "addresses"}</span></div><div className="mt-4 grid gap-4 lg:grid-cols-2">{addresses.map(address => <DesktopSavedAddressCard key={address.id} address={address} onEdit={() => startEditAddress(address)} onRemove={() => removeAddress(address.id)} onSetDefault={() => setDefault(address.id)} />)}</div>{!addresses.length && <div className="mt-4 rounded-2xl border border-dashed border-[#dfe5ea] px-5 py-12 text-center text-sm text-[#737c87]">You have no saved addresses yet.</div>}</>}
  </section>;
}

function AccountPanel({ icon: Icon, eyebrow = "Account dashboard", title, description, action, children }: { icon: typeof UserRound; eyebrow?: string; title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return <section className="rounded-[24px] border border-[#e4e9f0] bg-white p-7 shadow-[0_8px_28px_rgba(30,50,80,.05)]"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8edf1] pb-6"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f0f8f2] text-[#2c8b4b]"><Icon size={22} strokeWidth={1.6} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#2c8b4b]">{eyebrow}</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#171a1f]">{title}</h1><p className="mt-2 max-w-[620px] text-sm leading-6 text-[#737c87]">{description}</p></div></div>{action}</div><div className="mt-6">{children}</div></section>;
}

const accountInputClass = "h-11 w-full rounded-xl border border-[#dfe5ea] bg-white px-3 text-sm text-[#20252b] outline-none transition-colors placeholder:text-[#a0a8b2] focus:border-[#2c8b4b] focus:ring-2 focus:ring-[#2c8b4b]/10";

function AccountField({ label, value, placeholder, type = "text", onChange }: { label: string; value: string; placeholder?: string; type?: string; onChange?: (value: string) => void }) {
  return <label className="grid gap-2 text-xs font-semibold text-[#4e5661]">{label}<input type={type} value={value} placeholder={placeholder} onChange={event => onChange?.(event.target.value)} className={accountInputClass} /></label>;
}

type VerificationTarget = "email" | "phone";

const defaultProfileForm = { firstName: "Ahmed", lastName: "Mohey", email: "ahmed@example.com", phone: "+966 509195216", birthDate: "1992-05-18", gender: "Prefer not to say" };

function ProfilePanel() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(defaultProfileForm);
  const [verified, setVerified] = useState({ email: true, phone: false });
  const [verificationTarget, setVerificationTarget] = useState<VerificationTarget | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationNotice, setVerificationNotice] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const isAccountVerified = verified.email && verified.phone;
  const update = (key: keyof typeof form) => (value: string) => {
    setSaved(false);
    setSaveMessage("");
    setVerificationNotice("");
    setForm(current => ({ ...current, [key]: value }));
    if (key === "email" || key === "phone") setVerified(current => ({ ...current, [key]: false }));
  };
  const beginVerification = (target: VerificationTarget) => {
    setVerificationTarget(target);
    setVerificationCode("");
    setVerificationError("");
    setVerificationNotice(`We sent a 6-digit code to your ${target}. Use 123456 in this preview.`);
  };
  const verifyCode = () => {
    if (!verificationTarget) return;
    if (verificationCode !== "123456") {
      setVerificationError("The code is incorrect. Please try 123456 in this preview.");
      return;
    }
    setVerified(current => ({ ...current, [verificationTarget]: true }));
    setVerificationTarget(null);
    setVerificationCode("");
    setVerificationError("");
    setVerificationNotice(`${verificationTarget === "email" ? "Email" : "Phone number"} verified successfully.`);
  };
  const resetForm = () => {
    setForm(defaultProfileForm);
    setVerified({ email: true, phone: false });
    setVerificationTarget(null);
    setVerificationCode("");
    setVerificationNotice("");
    setVerificationError("");
    setSaveMessage("");
    setSaved(false);
  };
  return <AccountPanel icon={UserRound} eyebrow="Personal details" title="My Profile" description="Keep your personal information up to date for a smoother Deraah experience." action={<span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold ${isAccountVerified ? "bg-[#f0f8f2] text-[#267b42]" : "bg-[#fff5df] text-[#9b6b14]"}`}><CheckCircle2 size={14} /> {isAccountVerified ? "Account verified" : "Verification needed"}</span>}>
    <form onSubmit={event => { event.preventDefault(); if (!isAccountVerified) { setSaved(false); setSaveMessage("Verify your email and phone number before saving changes."); return; } setSaveMessage(""); setSaved(true); }} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <AccountField label="First name" value={form.firstName} onChange={update("firstName")} />
        <AccountField label="Last name" value={form.lastName} onChange={update("lastName")} />
        <div className="grid gap-2"><AccountField label="Email address" type="email" value={form.email} onChange={update("email")} /><div className="flex items-center justify-between gap-2 text-[10px]"><span className={verified.email ? "font-semibold text-[#267b42]" : "font-semibold text-[#9b6b14]"}>{verified.email ? "Email verified" : "Email not verified"}</span>{!verified.email && <button type="button" onClick={() => beginVerification("email")} className="font-semibold text-[#2c8b4b] underline-offset-2 hover:underline">Verify email</button>}</div></div>
        <div className="grid gap-2"><AccountField label="Phone number" value={form.phone} onChange={update("phone")} /><div className="flex items-center justify-between gap-2 text-[10px]"><span className={verified.phone ? "font-semibold text-[#267b42]" : "font-semibold text-[#9b6b14]"}>{verified.phone ? "Phone verified" : "Phone not verified"}</span>{!verified.phone && <button type="button" onClick={() => beginVerification("phone")} className="font-semibold text-[#2c8b4b] underline-offset-2 hover:underline">Verify phone</button>}</div></div>
        <AccountField label="Date of birth" type="date" value={form.birthDate} onChange={update("birthDate")} />
        <label className="grid gap-2 text-xs font-semibold text-[#4e5661]">Gender<select value={form.gender} onChange={event => update("gender")(event.target.value)} className={accountInputClass}><option value="">Select gender</option><option value="Female">Female</option><option value="Male">Male</option><option value="Prefer not to say">Prefer not to say</option></select></label>
      </div>
      {verificationTarget && <div className="rounded-2xl border border-[#c8dcfb] bg-[#f5f9ff] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[#20252b]">Verify your {verificationTarget === "email" ? "email address" : "phone number"}</p><p className="mt-1 text-[11px] leading-5 text-[#71809a]">{verificationNotice}</p></div><button type="button" onClick={() => { setVerificationTarget(null); setVerificationNotice(""); setVerificationError(""); }} className="text-xs font-semibold text-[#6d7890] hover:text-[#20252b]">Cancel</button></div><div className="mt-4 flex flex-wrap gap-3"><input aria-label="One-time password" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={verificationCode} onChange={event => { setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setVerificationError(""); }} placeholder="123456" className={`${accountInputClass} max-w-[180px] text-center tracking-[.3em]`} /><button type="button" onClick={verifyCode} disabled={verificationCode.length !== 6} className="h-11 rounded-xl bg-[#171a1f] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#2c3036] disabled:cursor-not-allowed disabled:opacity-40">Verify code</button><button type="button" onClick={() => beginVerification(verificationTarget)} className="h-11 rounded-xl border border-[#dfe5ea] bg-white px-4 text-xs font-semibold text-[#4e5661] hover:bg-[#f8fafc]">Resend code</button></div>{verificationError && <p className="mt-2 text-[11px] font-semibold text-[#b42318]">{verificationError}</p>}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e7ecef] bg-[#f8fafc] p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#2c8b4b] shadow-sm"><Mail size={17} /></span><div><p className="text-xs font-semibold text-[#20252b]">Email preferences</p><p className="mt-1 text-[11px] leading-5 text-[#7a838e]">Your account email is used for order updates and receipts.</p></div></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${verified.email ? "bg-[#e8f7ec] text-[#267b42]" : "bg-[#fff5df] text-[#9b6b14]"}`}>{verified.email ? "Confirmed" : "Action required"}</span></div>
      {(verificationNotice && !verificationTarget || saveMessage) && <p className={`text-xs font-semibold ${saveMessage ? "text-[#9b6b14]" : "text-[#267b42]"}`}>{saveMessage || verificationNotice}</p>}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#e8edf1] pt-5"><span className={`me-auto text-xs font-semibold text-[#2c8b4b] ${saved ? "opacity-100" : "opacity-0"}`}>Changes saved successfully</span><button type="button" onClick={resetForm} className="rounded-xl border border-[#dfe5ea] px-4 py-2.5 text-xs font-semibold text-[#4e5661] hover:bg-[#f8fafc]">Cancel</button><button type="submit" className="rounded-xl bg-[#171a1f] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2c3036]">Save changes</button></div>
    </form>
  </AccountPanel>;
}

function CardsPanel() {
  const cards = [{ brand: "VISA", last4: "4242", holder: "Ahmed Mohey", expiry: "08/27", color: "from-[#24242b] to-[#51515d]" }, { brand: "mada", last4: "0912", holder: "Ahmed Mohey", expiry: "11/28", color: "from-[#1e5d47] to-[#4b9b7a]" }];
  return <AccountPanel icon={WalletCards} eyebrow="Payment settings" title="My Payment Cards" description="Save your preferred payment methods for a faster, simpler checkout." action={<button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#171a1f] px-4 text-xs font-semibold text-white hover:bg-[#2c3036]"><Plus size={16} /> Add new card</button>}>
    <div className="grid gap-4 lg:grid-cols-2">{cards.map(card => <article key={card.last4} className={`relative min-h-[190px] overflow-hidden rounded-[20px] bg-gradient-to-br ${card.color} p-5 text-white shadow-[0_12px_24px_rgba(30,50,80,.12)]`}><div className="flex items-start justify-between"><span className="rounded-md bg-white/15 px-2 py-1 text-[11px] font-bold tracking-[.12em]">{card.brand}</span><span className="text-[10px] text-white/65">Default for checkout</span></div><div className="mt-9 text-lg tracking-[.24em]">••••  ••••  ••••  {card.last4}</div><div className="mt-6 flex items-end justify-between"><div><p className="text-[9px] uppercase tracking-[.16em] text-white/55">Cardholder</p><p className="mt-1 text-xs font-semibold">{card.holder}</p></div><div><p className="text-[9px] uppercase tracking-[.16em] text-white/55">Expires</p><p className="mt-1 text-xs font-semibold">{card.expiry}</p></div></div></article>)}</div>
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e7ecef] bg-[#f8fafc] p-4"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#2c8b4b]" /><p className="text-xs leading-5 text-[#737c87]">Your card details are encrypted and securely processed by our payment provider. Deraah never stores your full card number.</p></div>
  </AccountPanel>;
}

function OrdersPanel() {
  const { orders } = useStoreOrders();
  const formatDate = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return <AccountPanel icon={PackageCheck} eyebrow="Order history" title="My Orders" description="Track recent deliveries and revisit everything you have ordered from Deraah." action={<a href="/payment-summary" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe5ea] px-4 text-xs font-semibold text-[#4e5661] no-underline hover:bg-[#f8fafc]">View order summary <ArrowRight size={15} /></a>}>
    <div className="space-y-4">{orders.map(order => <article key={order.id} className="rounded-2xl border border-[#e4e9f0] p-4 transition-colors hover:border-[#bfe8cc]"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold text-[#20252b]">Order #{order.id}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${order.status === "Delivered" ? "bg-[#e8f7ec] text-[#267b42]" : "bg-[#fff5df] text-[#9b6b14]"}`}>{order.status}</span></div><p className="mt-1 flex items-center gap-1 text-[11px] text-[#9aa1ac]"><CalendarDays size={13} /> {formatDate(order.placedAt)}</p></div><span className="text-xs font-semibold text-[#20252b]">{order.items.length} {order.items.length === 1 ? "product" : "products"}</span></div><div className="mt-4"><OrderItemsPreview items={order.items} /></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8edf1] pt-3"><div><p className="text-[10px] text-[#9aa1ac]">Total</p><p className="mt-1 text-sm font-semibold text-[#20252b]">⃁ {order.total}</p></div><button type="button" onClick={() => window.location.assign(`/payment-summary?order=${encodeURIComponent(order.id)}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#171a1f] px-3.5 py-2.5 text-[11px] font-semibold text-white hover:bg-[#2c3036]">Track order <ArrowRight size={14} /></button></div></article>)}</div>
  </AccountPanel>;
}

function FavoritesPanel() {
  const { favorites, removeFavorite } = useStoreFavorites();
  return <AccountPanel icon={Heart} eyebrow="Your collection" title="Favorites" description="Keep your favorite gifts close and return to them whenever the perfect moment arrives." action={<span className="rounded-full bg-[#fff0f6] px-3 py-2 text-[11px] font-semibold text-[#cd1a76]">{favorites.length} saved items</span>}>
    {favorites.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{favorites.map(product => <article key={product.id} className="overflow-hidden rounded-2xl border border-[#e4e9f0] bg-white"><div className="relative grid h-[170px] place-items-center bg-[#f5f7f9] p-5"><img src={product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" /><button type="button" onClick={() => removeFavorite(product.id)} aria-label={`Remove ${product.name} from favorites`} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[#cd1a76] shadow-sm"><Heart size={15} fill="currentColor" /></button></div><div className="p-4"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9aa1ac]">{product.brand}</p><h2 className="mt-1 min-h-[40px] text-sm font-semibold leading-5 text-[#20252b]">{product.name}</h2><div className="mt-4 flex items-center justify-between"><span className="text-sm font-semibold text-[#20252b]">{product.price}</span><button type="button" className="rounded-lg bg-[#171a1f] px-3 py-2 text-[10px] font-semibold text-white">Add to cart</button></div></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-[#dfe5ea] px-5 py-12 text-center text-sm text-[#737c87]">You have no favorite products yet. Save products from the store to see them here.</div>}
  </AccountPanel>;
}

function CouponsPanel() {
  const coupons = [{ code: "WELCOME15", title: "15% off your first order", expiry: "Valid until 30 Jun 2025", tone: "bg-[#f4e8f0] text-[#6f1e3b]" }, { code: "GIFT100", title: "⃁ 100 off selected gifts", expiry: "Valid until 15 Jul 2025", tone: "bg-[#e7f4ed] text-[#267b42]" }, { code: "FREESHIP", title: "Free delivery this month", expiry: "No minimum spend", tone: "bg-[#f6efe2] text-[#8b651e]" }];
  return <AccountPanel icon={TicketPercent} eyebrow="Member offers" title="My Coupons" description="Use your saved offers on the gifts that matter most." action={<span className="rounded-full bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold text-[#66707b]">{coupons.length} available</span>}>
    <div className="grid gap-4 lg:grid-cols-3">{coupons.map(coupon => <article key={coupon.code} className={`relative overflow-hidden rounded-2xl p-5 ${coupon.tone}`}><span className="absolute -right-7 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-white/50" /><p className="text-[10px] font-bold uppercase tracking-[.16em] opacity-70">Deraah offer</p><h2 className="mt-3 max-w-[180px] text-base font-semibold leading-6">{coupon.title}</h2><p className="mt-5 text-[11px] opacity-75">{coupon.expiry}</p><div className="mt-4 flex items-center justify-between border-t border-current/15 pt-3"><span className="rounded-lg border border-current/20 bg-white/40 px-2.5 py-1.5 text-[11px] font-bold tracking-[.1em]">{coupon.code}</span><button type="button" aria-label={`Copy ${coupon.code}`} className="grid h-8 w-8 place-items-center rounded-lg bg-white/60"><Copy size={14} /></button></div></article>)}</div>
  </AccountPanel>;
}

function ReferPanel() {
  const [copied, setCopied] = useState(false);
  const copyCode = async () => { try { await navigator.clipboard?.writeText("AHMED25"); } catch { /* clipboard may be unavailable in preview */ } setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <AccountPanel icon={Share2} eyebrow="Grow together" title="Refer & Earn" description="Invite friends to Deraah and earn Mukafaati points when they place their first order." action={<span className="inline-flex items-center gap-2 rounded-full bg-[#f0f8f2] px-3 py-2 text-[11px] font-semibold text-[#267b42]"><GiftIcon /> 500 points per referral</span>}>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-2xl bg-[#441039] p-6 text-white"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/60">Your referral code</p><div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/10 p-4"><span className="text-2xl font-semibold tracking-[.18em]">AHMED25</span><button type="button" onClick={copyCode} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-[#441039]"><Copy size={14} /> {copied ? "Copied" : "Copy"}</button></div><p className="mt-4 max-w-[370px] text-xs leading-5 text-white/70">Share your code with friends. They receive a welcome offer and you receive points after their first completed order.</p></div><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><div className="rounded-2xl border border-[#e4e9f0] p-4"><p className="text-[10px] text-[#9aa1ac]">Friends invited</p><p className="mt-2 text-2xl font-semibold text-[#20252b]">08</p></div><div className="rounded-2xl border border-[#e4e9f0] p-4"><p className="text-[10px] text-[#9aa1ac]">Successful referrals</p><p className="mt-2 text-2xl font-semibold text-[#20252b]">05</p></div><div className="rounded-2xl border border-[#e4e9f0] p-4"><p className="text-[10px] text-[#9aa1ac]">Points earned</p><p className="mt-2 text-2xl font-semibold text-[#2c8b4b]">2,500</p></div></div></div>
  </AccountPanel>;
}

function GiftIcon() { return <img aria-hidden="true" src="/product-assets/account/membership-gift.svg" alt="" className="h-3.5 w-3.5" />; }

function NotificationsPanel() {
  const [settings, setSettings] = useState([{ label: "Order updates", detail: "Delivery, status, and payment notifications", enabled: true }, { label: "Exclusive offers", detail: "New collections, promotions, and member benefits", enabled: true }, { label: "Mukafaati rewards", detail: "Points earned and rewards unlocked", enabled: false }, { label: "Personalized recommendations", detail: "Gift ideas selected for your preferences", enabled: true }]);
  return <AccountPanel icon={Bell} eyebrow="Account preferences" title="Notifications" description="Choose how Deraah keeps you informed about orders, offers, and rewards."><div className="divide-y divide-[#e8edf1]">{settings.map((setting, index) => <div key={setting.label} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><h2 className="text-sm font-semibold text-[#20252b]">{setting.label}</h2><p className="mt-1 text-xs leading-5 text-[#7a838e]">{setting.detail}</p></div><button type="button" aria-pressed={setting.enabled} onClick={() => setSettings(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: !item.enabled } : item))} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${setting.enabled ? "bg-[#2c8b4b]" : "bg-[#d8dee4]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${setting.enabled ? "translate-x-6" : "translate-x-1"}`} /></button></div>)}</div></AccountPanel>;
}

function LocalePanel() {
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("Saudi Arabia");
  return <AccountPanel icon={Globe2} eyebrow="Shopping preferences" title="Language / Country" description="Set the language, country, and currency you prefer while shopping with Deraah." action={<span className="rounded-full bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold text-[#66707b]">⃁ SAR</span>}>
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-semibold text-[#4e5661]">Language<select value={language} onChange={event => setLanguage(event.target.value)} className={accountInputClass}><option>English</option><option>العربية</option></select></label><label className="grid gap-2 text-xs font-semibold text-[#4e5661]">Country<select value={country} onChange={event => setCountry(event.target.value)} className={accountInputClass}><option>Saudi Arabia</option><option>United Arab Emirates</option><option>Kuwait</option><option>Qatar</option><option>Bahrain</option></select></label></div><div className="mt-5 rounded-2xl border border-[#dff0e4] bg-[#f5fcf7] p-4"><div className="flex items-start gap-3"><CheckCircle2 size={18} className="mt-0.5 text-[#2c8b4b]" /><p className="text-xs leading-5 text-[#4e5661]">Prices are currently shown in Saudi Riyal and delivery options are tailored for Saudi Arabia.</p></div></div>
  </AccountPanel>;
}

function StoresPanel() {
  const stores = [{ name: "Deraah Riyadh Park", address: "Northern Ring Road, Riyadh", hours: "10:00 AM – 11:00 PM" }, { name: "Deraah Al Olaya", address: "King Fahd Road, Riyadh", hours: "10:00 AM – 11:00 PM" }, { name: "Deraah Jeddah", address: "Tahlia Street, Jeddah", hours: "10:00 AM – 11:00 PM" }];
  return <AccountPanel icon={Store} eyebrow="Find us nearby" title="Stores / Nearest Store" description="Visit a Deraah store, discover the latest collections, and get help from our team." action={<button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe5ea] px-4 text-xs font-semibold text-[#4e5661]"><MapPin size={15} /> Use my location</button>}><div className="grid gap-4 lg:grid-cols-3">{stores.map(store => <article key={store.name} className="rounded-2xl border border-[#e4e9f0] p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f8f2] text-[#2c8b4b]"><MapPin size={19} /></span><h2 className="mt-4 text-sm font-semibold text-[#20252b]">{store.name}</h2><p className="mt-2 text-xs leading-5 text-[#737c87]">{store.address}</p><p className="mt-3 flex items-center gap-2 text-[11px] text-[#8a939e]"><CalendarDays size={13} /> {store.hours}</p><button type="button" className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2c8b4b]">Get directions <ArrowRight size={13} /></button></article>)}</div></AccountPanel>;
}

function AboutPanel() {
  return <AccountPanel icon={Info} eyebrow="The Deraah story" title="About Deraah" description="Thoughtful fragrance, beautiful gifts, and a service designed around meaningful moments."><div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-2xl bg-[#f7eef3] p-6"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#a35a71]">Since 1997</p><h2 className="mt-4 text-2xl font-semibold tracking-[-.04em] text-[#321b24]">Gifts that stay with you.</h2><p className="mt-4 max-w-[520px] text-sm leading-6 text-[#6f6267]">Deraah brings together signature fragrances, thoughtful accessories, flowers, and care sets so every celebration can feel personal.</p></div><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"><div className="rounded-2xl border border-[#e4e9f0] p-4"><p className="text-2xl font-semibold text-[#321b24]">25+</p><p className="mt-1 text-xs text-[#7a838e]">Years of gifting</p></div><div className="rounded-2xl border border-[#e4e9f0] p-4"><p className="text-2xl font-semibold text-[#321b24]">100+</p><p className="mt-1 text-xs text-[#7a838e]">Stores across KSA</p></div><div className="rounded-2xl border border-[#e4e9f0] p-4"><p className="text-2xl font-semibold text-[#321b24]">24/7</p><p className="mt-1 text-xs text-[#7a838e]">Gift inspiration</p></div></div></div></AccountPanel>;
}

function PoliciesPanel() {
  const policies = [{ title: "Shipping and delivery", text: "Delivery times and fees are shown at checkout based on your location. You can follow the latest status from My Orders." }, { title: "Returns and exchanges", text: "Eligible products can be returned in their original condition according to our return window and product guidelines." }, { title: "Privacy and data", text: "We use your information to process orders, provide support, and personalize your Deraah experience." }];
  return <AccountPanel icon={ShieldCheck} eyebrow="Help and trust" title="Policies and Regulations" description="Everything you need to shop with confidence at Deraah."><div className="space-y-3">{policies.map(policy => <details key={policy.title} className="group rounded-2xl border border-[#e4e9f0] p-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#20252b]"><span>{policy.title}</span><ChevronRight size={16} className="transition-transform group-open:rotate-90" /></summary><p className="mt-3 max-w-[650px] text-xs leading-6 text-[#737c87]">{policy.text}</p></details>)}</div></AccountPanel>;
}

function FaqPanel() {
  const faqs = [{ title: "How can I track my order?", text: "Open My Orders from your account menu to view the latest status and delivery updates." }, { title: "Can I change my delivery address?", text: "Yes. Open My Address Book, edit a saved address, or add a new one before placing your next order." }, { title: "How do Mukafaati points work?", text: "Points are earned on eligible purchases and referrals. Your current balance is shown on your membership card." }, { title: "How do I contact customer service?", text: "Email, WhatsApp, and phone support are available through the support links on your account page." }];
  return <AccountPanel icon={HelpCircle} eyebrow="Need a hand?" title="Frequently Asked Questions" description="Quick answers to the most common questions about your Deraah account and orders."><div className="space-y-3">{faqs.map(faq => <details key={faq.title} className="group rounded-2xl border border-[#e4e9f0] p-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#20252b]"><span>{faq.title}</span><ChevronRight size={16} className="transition-transform group-open:rotate-90" /></summary><p className="mt-3 text-xs leading-6 text-[#737c87]">{faq.text}</p></details>)}</div><div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f8fafc] p-4"><MessageCircle size={18} className="text-[#2c8b4b]" /><p className="text-xs text-[#737c87]">Still need help? <a href="mailto:support@deraahstore.com" className="font-semibold text-[#2c8b4b]">Contact our team</a>.</p></div></AccountPanel>;
}

function DesktopAccountContent({ view }: { view: AccountView }) {
  if (view === "addresses") return <DesktopAddressBook />;
  if (view === "profile") return <ProfilePanel />;
  if (view === "cards") return <CardsPanel />;
  if (view === "orders") return <OrdersPanel />;
  if (view === "favorites") return <FavoritesPanel />;
  if (view === "coupons") return <CouponsPanel />;
  if (view === "refer") return <ReferPanel />;
  if (view === "notifications") return <NotificationsPanel />;
  if (view === "locale") return <LocalePanel />;
  if (view === "stores") return <StoresPanel />;
  if (view === "about") return <AboutPanel />;
  if (view === "policies") return <PoliciesPanel />;
  return <FaqPanel />;
}

function DesktopAccountWorkspace() {
  const [view, setView] = useState<AccountView>(() => getAccountViewFromUrl() ?? "addresses");
  return <main className="mx-auto hidden min-h-[1708.25px] max-w-[1240px] px-8 pb-16 pt-[64px] md:block"><div className="mb-7 flex items-end justify-between gap-6"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#2c8b4b]">Account dashboard</p><h1 className="mt-2 text-[34px] font-semibold tracking-[-.045em] text-[#171a1f]">My account</h1></div><span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#66707b] shadow-sm">Welcome back, Ahmed</span></div><div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"><DesktopAccountSidebar view={view} onChange={setView} /><DesktopAccountContent view={view} /></div></main>;
}

export default function StoreAccountPage() {
  const { cartItemCount } = useStoreCart();
  const [mobileView, setMobileView] = useState<AccountView | null>(() => getAccountViewFromUrl());
  return <div className="min-h-screen bg-[#fafcff] pb-[88px] font-['Poppins','Ping AR',sans-serif] text-[#1f2024] md:bg-[#f1f4f8]">
    <div className="hidden md:block"><StoreHeader /></div>
    <DesktopAccountWorkspace />
    <main className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fafcff] pb-8 md:hidden">
      {mobileView ? <div className="px-3 pt-6"><button type="button" onClick={() => setMobileView(null)} className="inline-flex items-center gap-2 px-2 text-xs font-semibold text-[#4e5661]"><ChevronRight size={16} className="rotate-180" /> Back to account</button><div className="mt-4"><DesktopAccountContent view={mobileView} /></div></div> : <><div className="mt-[37px]"><MemberCard /></div><div className="mt-[60px]"><AccountListSection title="My Account" actions={ACCOUNT_ACTIONS} onChange={setMobileView} /><div className="mt-[64px]"><AccountListSection title="Settings" actions={SETTINGS_ACTIONS} onChange={setMobileView} /></div><div className="mt-[64px]"><AccountListSection title="Support" actions={SUPPORT_ACTIONS} onChange={setMobileView} /></div><div className="mt-[84px]"><SupportCard /></div><div className="mt-6 flex items-center justify-center gap-3 px-7 text-[#b9bdc4]"><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[11px] shadow-sm">▶</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[11px] shadow-sm">p</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[11px] shadow-sm">𝕏</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[11px] shadow-sm">♧</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[11px] shadow-sm">♪</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[11px] shadow-sm">f</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[11px] shadow-sm">◎</span></div></div></>}
    </main>
    <div className="md:hidden"><StoreMobileNav collapsed={false} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
  </div>;
}
