import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BadgePercent, Bell, CheckCircle2, ChevronDown, ClipboardList, Clock3, Copy, Gift, Globe2, Headphones, Heart, Menu, PackageCheck, ScanLine, Search, ShoppingBag, Sparkles, Truck, UserRound, X } from "lucide-react";
import { CATEGORY_GROUPS, getCategoryItemImage } from "./storeNavigation";
import { useStoreCart } from "./StoreCartContext";
import StoreCartDrawer from "./StoreCartDrawer";
import { useStoreFavorites, type StoreFavoriteProduct } from "./StoreFavoritesContext";
import { useStoreOrders } from "./StoreOrdersContext";
import StoreSearchPanel from "./StoreSearchPanel";
import { useStoreLocale, type StoreCountry, type StoreLanguage } from "./StoreLocaleContext";
import { MobileSheetHandle, useMobileSheetDrag } from "./MobileSheet";
import OrderItemsPreview from "./OrderItemsPreview";
import SwipeToast from "./SwipeToast";

const categories = CATEGORY_GROUPS.map(category => category.name);
const arabicHeaderCategoryLabels: Record<string, string> = {
  Perfumes: "العطــور",
  Oud: "العــود",
  Gifts: "الهــدايا",
  "Hair Care": "العنــاية بالشعر",
  Accessories: "الإكسســوارات",
  "Body Care": "العنــاية بالجسم",
  "Home Care": "العنــاية بالمنزل",
  Offers: "العــروض",
};

function headerCategoryLabel(category: string, language: StoreLanguage) {
  return language === "العربية" ? (arabicHeaderCategoryLabels[category] ?? category) : category;
}

const arabicHeaderSubcategoryLabels: Record<string, string> = {
  "Niche perfumes": "عطــور نيش",
  "Men Perfumes": "عطــور رجالية",
  "Unisex Perfumes": "عطــور للجنسين",
  "Women Perfumes": "عطــور نسائية",
  "Gifts for all occasions": "هــدايا لكل المناسبات",
  "All Perfumes": "كل العطــور",
  "Oriental Perfumes": "عطــور شرقية",
  "Oud And Incense": "العــود والبخور",
  steamers: "مبــخرات",
  Crews: "خلطــات",
  "Bedspread Fresheners": "معطــرات المفارش",
  Mixtures: "خلطــات",
  "Oud-Hair-Fresheners": "معطــرات الشعر بالعود",
  "Oud Oil": "زيــت العود",
  "BODY MIST": "رذاذ الجسم",
  "Al Sadu Collection": "مجمــوعة السدو",
  "Gifts For Men": "هــدايا للرجال",
  "Gifts For Women": "هــدايا للنساء",
  "Unisex Gifts": "هــدايا للجنسين",
  "Permanent Natural Rose": "ورد طبيعي محفوظ",
  "gift box": "علــبة هدايا",
  "Perfume gifts": "هــدايا العطور",
  "Oud sets": "مجمــوعات العود",
  "Accessory sets": "مجمــوعات الإكسسوارات",
  Ceramic: "سيرامــيك",
  curly: "الشعر الكيرلي",
  dryer: "مجففــات الشعر",
  Stylist: "أدوات التصفــيف",
  "Hair products": "منتجــات الشعر",
  "Argan Set": "مجمــوعة الأرجان",
  "Coloured Hair": "الشعر المصبــوغ",
  "Keratin Set": "مجمــوعة الكيراتين",
  "Wavy Hair": "الشعر الممــوج",
  "Men Accessories": "إكسســوارات الرجال",
  "Women-Accessories": "إكسســوارات النساء",
  "Men-Watches": "ساعــات الرجال",
  Sunglasses: "نظــارات شمسية",
  Stick: "أعــواد",
  Silver: "فضيــات",
  Cufflinks: "أزرار أكمــام",
  "Men-Rings": "خواتــم الرجال",
  "Men-Sets": "مجمــوعات الرجال",
  "Men-Wallet": "محــافظ الرجال",
  Pens: "أقــلام",
  Rosary: "مســابح",
  "Shemagh and ghutra": "شمــاغ وغترة",
  "PROUD HAND BAG": "حقيبــة براود",
  "Women Bags": "حقــائب النساء",
  "Women-Sets": "مجمــوعات النساء",
  "Women-Watches": "ساعــات النساء",
  glasses: "نظــارات",
  "Deraah-Home": "درعه للمنزل",
  "Air fresheners": "معطــرات الجو",
  "Scented Candles": "شمــوع معطرة",
  "Room Spray": "بخــاخ الغرف",
  "Reed Diffuser": "موزع عطري بالأعــواد",
  Labeaute: "لابــوتيه",
  "Body-Butter": "زبدة الجسم",
  "Body Fresheners": "معطــرات الجسم",
  "Body Lotion": "لوشــن الجسم",
  "Toilet Perfumes": "عطــور التواليت",
  "Hair Fresheners": "معطــرات الشعر",
  "Shower Gel": "جل الاستحمــام",
};

function headerSubcategoryLabel(category: string, language: StoreLanguage) {
  return language === "العربية" ? (arabicHeaderSubcategoryLabels[category] ?? category) : category;
}

const countryOptions: Array<{ value: StoreCountry; label: string; shortLabel: string; englishLabel: string; flag: string; currency: string; languages: Array<{ value: StoreLanguage; label: string; ariaLabel: string }> }> = [
  { value: "Saudi Arabia", label: "المملكة العربية السعودية", shortLabel: "Saudi", englishLabel: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", languages: [{ value: "English", label: "English", ariaLabel: "English" }, { value: "العربية", label: "عربي", ariaLabel: "Arabic" }, { value: "বাংলা", label: "বাংলা", ariaLabel: "Bengali" }] },
  { value: "United Arab Emirates", label: "الإمارات العربية المتحدة", shortLabel: "UAE", englishLabel: "United Arab Emirates", flag: "🇦🇪", currency: "AED", languages: [{ value: "English", label: "English", ariaLabel: "English" }, { value: "العربية", label: "عربي", ariaLabel: "Arabic" }] },
  { value: "Qatar", label: "قطر", shortLabel: "Qatar", englishLabel: "Qatar", flag: "🇶🇦", currency: "QAR", languages: [{ value: "English", label: "English", ariaLabel: "English" }, { value: "العربية", label: "عربي", ariaLabel: "Arabic" }] },
  { value: "Oman", label: "عمان", shortLabel: "Oman", englishLabel: "Oman", flag: "🇴🇲", currency: "OMR", languages: [{ value: "English", label: "English", ariaLabel: "English" }, { value: "العربية", label: "عربي", ariaLabel: "Arabic" }] },
];

type AuthStep = "login" | "otp" | "register" | "complete" | "profile-form" | "profile-otp" | "profile-complete";
type AuthMode = "login" | "register";

function CountryLanguagePanel({ open, onClose, country, language, onSelectLocale }: { open: boolean; onClose: () => void; country: StoreCountry; language: StoreLanguage; onSelectLocale: (country: StoreCountry, language: StoreLanguage) => void }) {
  const { direction } = useStoreLocale();
  const isArabic = language === "العربية";
  const countryNames: Record<StoreCountry, string> = { "Saudi Arabia": "السعودية", "United Arab Emirates": "الإمارات", Qatar: "قطر", Oman: "عمان" };
  const mobileDrag = useMobileSheetDrag(onClose);
  if (!open) return null;
  return createPortal(<div dir={direction} role="dialog" aria-modal="true" aria-labelledby="country-language-title" className="store-side-overlay fixed inset-0 z-[140] flex justify-end bg-black/35 backdrop-blur-[3px] max-md:items-end" onClick={onClose}>
    <section onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className="store-mobile-sheet store-country-panel store-side-panel-right flex h-dvh w-full max-w-[440px] flex-col overflow-y-auto bg-white px-7 pb-7 pt-5 text-start shadow-2xl max-md:h-[min(92dvh,760px)] max-md:max-w-none max-md:rounded-t-[28px] max-md:px-5">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="flex items-center justify-between gap-4"><span className="inline-flex items-center gap-2 text-[11px] text-[#9a9da3]"><Globe2 size={17} /> {isArabic ? "التفضيلات" : "Preferences"}</span><button type="button" onClick={onClose} aria-label={isArabic ? "إغلاق نافذة الدولة واللغة" : "Close country and language panel"} className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button></div>
      <div className="flex flex-1 flex-col justify-center py-8">
        <div className="mx-auto w-full max-w-[340px]"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#a0a4aa]">{isArabic ? "الدولة واللغة" : "Country & language"}</p><h2 id="country-language-title" className="mt-5 text-[34px] font-semibold leading-[1.12] tracking-[-.045em] text-[#242225]">{isArabic ? <>اختر<br />تفضيلات التسوق</> : <>Choose your<br />shopping preferences</>}</h2><p className="mt-5 text-sm leading-6 text-[#737982]">{isArabic ? "اختر لغة تجربة التسوق لكل دولة." : "Choose the language for each country&apos;s shopping experience."}</p>
          <section aria-labelledby="country-options-title" className="mt-8"><h3 id="country-options-title" className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#a0a4aa]">{isArabic ? "الدولة" : "Country"}</h3><div className="mt-3 grid gap-2">{countryOptions.map(option => <div key={option.value} dir="ltr" className="rounded-xl border border-[#e4e6e9] bg-[#f7f8f9] px-3 py-2.5 transition-colors"><div className="flex min-w-0 items-center gap-2"><div className="flex min-w-0 flex-1 items-center gap-2"><span aria-hidden="true" className="text-lg leading-none">{option.flag}</span><span className="min-w-0 truncate text-sm font-medium text-[#242225]">{isArabic ? countryNames[option.value] : option.shortLabel}</span><span aria-label={`${option.englishLabel} currency ${option.currency}`} className="shrink-0 text-[10px] font-semibold tracking-[.04em] text-[#68717a]">{option.currency}</span></div><div className="flex shrink-0 items-center gap-1" aria-label={`${option.englishLabel} languages`}>{option.languages.map(locale => <button key={locale.value} type="button" aria-pressed={country === option.value && language === locale.value} aria-label={`${option.englishLabel}: ${locale.ariaLabel}`} onClick={() => onSelectLocale(option.value, locale.value)} className={`rounded-md border px-1.5 py-1 text-[9px] transition-colors ${country === option.value && language === locale.value ? "border-[#242225] bg-[#242225] font-semibold text-white" : "border-[#dfe4e8] bg-white text-[#68717a] hover:border-[#242225] hover:text-[#242225]"}`}>{locale.label}</button>)}</div></div></div>)}</div></section>
        </div>
      </div>
      <p className="mx-auto max-w-[340px] text-center text-[10px] leading-5 text-[#a0a4aa]">{isArabic ? "يتم حفظ تفضيلاتك لجلسة التسوق هذه." : "Your preferences are saved for this shopping session."}</p>
    </section>
  </div>, document.body);
}

function AccountAuthPanel({ open, onClose, mode, onLoginSuccess, onSwitchMode }: { open: boolean; onClose: () => void; mode: AuthMode; onLoginSuccess: () => void; onSwitchMode: (mode: AuthMode) => void }) {
  const { direction } = useStoreLocale();
  const [step, setStep] = useState<AuthStep>("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [registerForm, setRegisterForm] = useState({ firstName: "", lastName: "", email: "" });
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", birthDate: "", gender: "", nationality: "Saudi Arabia", email: "" });
  const [profileOtp, setProfileOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const profileOtpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const mobileDrag = useMobileSheetDrag(onClose);

  useEffect(() => {
    setStep("login");
    setPhone("");
    setOtp(["", "", "", ""]);
    setRegisterForm({ firstName: "", lastName: "", email: "" });
    setProfileForm({ firstName: "", lastName: "", birthDate: "", gender: "", nationality: "Saudi Arabia", email: "" });
    setProfileOtp(["", "", "", ""]);
    setError("");
  }, [open, mode]);

  useEffect(() => {
    if (step !== "otp" && step !== "profile-otp") return;
    setResendCountdown(60);
    const countdown = window.setInterval(() => {
      setResendCountdown(current => current > 0 ? current - 1 : 0);
    }, 1000);
    return () => window.clearInterval(countdown);
  }, [step]);

  if (!open) return null;

  const phoneDigits = phone.replace(/\D/g, "");
  const submitPhone = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phoneDigits.length < 9) {
      setError("Enter a valid phone number to continue.");
      return;
    }
    setError("");
    setStep("otp");
  };
  const updateOtp = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    setOtp(current => current.map((digit, digitIndex) => digitIndex === index ? nextValue : digit));
    setError("");
    if (nextValue && index < 3) window.requestAnimationFrame(() => otpInputRefs.current[index + 1]?.focus());
  };
  const submitOtp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.join("").length !== 4) {
      setError("Enter the 4-digit verification code.");
      return;
    }
    setError("");
    if (mode === "login") {
      onClose();
      onLoginSuccess();
      return;
    }
    setStep("register");
  };
  const submitRegistration = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!registerForm.firstName.trim() || !registerForm.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    setError("");
    setStep("complete");
  };
  const openProfileForm = () => {
    setProfileForm(current => ({ ...current, firstName: registerForm.firstName, lastName: registerForm.lastName, email: registerForm.email }));
    setError("");
    setStep("profile-form");
  };
  const submitProfileForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.birthDate || !profileForm.gender || !profileForm.nationality || !profileForm.email.trim()) {
      setError("Complete all profile fields to continue.");
      return;
    }
    setError("");
    setProfileOtp(["", "", "", ""]);
    setStep("profile-otp");
  };
  const submitProfileOtp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (profileOtp.join("").length !== 4) {
      setError("Enter the 4-digit verification code.");
      return;
    }
    setError("");
    setStep("profile-complete");
  };
  const updateProfileOtp = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    setProfileOtp(current => current.map((digit, digitIndex) => digitIndex === index ? nextValue : digit));
    setError("");
    if (nextValue && index < 3) window.requestAnimationFrame(() => profileOtpInputRefs.current[index + 1]?.focus());
  };
  const maskedPhone = phoneDigits.length > 4 ? `05${"•".repeat(Math.max(2, phoneDigits.length - 4))}${phoneDigits.slice(-2)}` : "your phone number";
  const maskedEmail = profileForm.email ? profileForm.email.replace(/^(.{2}).*(@.*)$/, "$1•••$2") : "your email";

  return createPortal(<div dir={direction} role="dialog" aria-modal="true" aria-labelledby="account-auth-title" className="store-side-overlay fixed inset-0 z-[140] flex justify-end bg-black/35 backdrop-blur-[3px] max-md:items-end" onClick={onClose}>
    <section onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className="store-mobile-sheet store-auth-panel store-side-panel-right flex h-dvh w-full max-w-[440px] flex-col overflow-y-auto bg-white px-7 pb-7 pt-5 text-start shadow-2xl max-md:h-[min(92dvh,760px)] max-md:max-w-none max-md:rounded-t-[28px] max-md:px-5">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="flex items-center justify-between gap-4"><button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-[11px] text-[#9a9da3] transition-colors hover:text-[#171a1f]"><Headphones size={17} /> Need help?</button><button type="button" onClick={onClose} aria-label="Close account panel" className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button></div>
      <div className="flex flex-1 flex-col justify-center py-8">
        {step === "login" && <form onSubmit={submitPhone} className="mx-auto w-full max-w-[340px]"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#a0a4aa]">{mode === "register" ? "Create an account" : "Account access"}</p><h2 id="account-auth-title" className="mt-5 text-[34px] font-semibold leading-[1.12] tracking-[-.045em] text-[#242225]">{mode === "register" ? <>Create your<br />Deraah account</> : <>Welcome!<br />Log in</>}</h2><p className="mt-10 text-sm text-[#333238]">{mode === "register" ? "Enter your phone number to start registration" : "Please enter your phone number"}</p><div className="mt-4 flex h-14 items-stretch gap-2"><button type="button" className="flex h-full shrink-0 items-center gap-2 rounded-xl border border-[#cfd3d9] bg-white px-4 text-xs text-[#555b63] transition-colors hover:border-[#b8bec7]">🇸🇦 <span>+966</span><ChevronDown size={13} /></button><div className="flex min-w-0 flex-1 items-center rounded-xl border border-[#cfd3d9] bg-white transition-colors focus-within:border-[#287cf0] focus-within:ring-2 focus-within:ring-[#287cf0]/10"><input aria-label="Phone number" value={phone} onChange={event => { setPhone(event.target.value.replace(/[^0-9 ]/g, "").slice(0, 12)); setError(""); }} placeholder="05 0000 0000" inputMode="tel" autoComplete="tel" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#171a1f] outline-none placeholder:text-[#9da2aa]" /></div></div><p className="mt-5 text-[11px] leading-5 text-[#a0a4aa]">A 4-digit code will be sent to your phone number via SMS</p>{error && <p role="alert" className="mt-3 text-xs font-semibold text-[#b42318]">{error}</p>}<button type="submit" className="mt-6 h-12 w-full rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">{mode === "register" ? "Start registration" : "Log in"}</button><p className="mt-5 text-center text-xs text-[#7d838a]">{mode === "login" ? <>Don't have an account? <button type="button" onClick={() => onSwitchMode("register")} className="font-semibold text-[#242225] underline underline-offset-2 transition-colors hover:text-[#cd1a76]">Create a new account</button></> : <>Already have an account? <button type="button" onClick={() => onSwitchMode("login")} className="font-semibold text-[#242225] underline underline-offset-2 transition-colors hover:text-[#cd1a76]">Log in</button></>}</p></form>}
        {step === "otp" && <form onSubmit={submitOtp} className="mx-auto w-full max-w-[340px]"><button type="button" onClick={() => { setStep("login"); setError(""); }} className="mb-10 inline-flex items-center gap-2 text-xs text-[#7d838a] hover:text-[#171a1f]"><ArrowLeft size={16} /> Back</button><h2 id="account-auth-title" className="text-center text-[32px] font-semibold leading-[1.12] tracking-[-.045em] text-[#242225]">Enter the verification<br />code</h2><p className="mx-auto mt-5 max-w-[260px] text-center text-xs leading-5 text-[#8b9097]">The 4-digit code has been sent to<br />{maskedPhone}</p><div className="mt-7 grid grid-cols-4 gap-2"><input ref={element => { otpInputRefs.current[0] = element; }} autoFocus aria-label="Verification digit 1" value={otp[0]} onChange={event => updateOtp(0, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /><input ref={element => { otpInputRefs.current[1] = element; }} aria-label="Verification digit 2" value={otp[1]} onChange={event => updateOtp(1, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /><input ref={element => { otpInputRefs.current[2] = element; }} aria-label="Verification digit 3" value={otp[2]} onChange={event => updateOtp(2, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /><input ref={element => { otpInputRefs.current[3] = element; }} aria-label="Verification digit 4" value={otp[3]} onChange={event => updateOtp(3, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /></div>{error && <p role="alert" className="mt-3 text-center text-xs font-semibold text-[#b42318]">{error}</p>}<button type="submit" className="mt-7 h-12 w-full rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">Continue</button><button type="button" disabled={resendCountdown > 0} onClick={() => { setResendCountdown(60); setError("A new code has been sent."); }} className={`mx-auto mt-7 block text-xs font-medium ${resendCountdown > 0 ? "cursor-not-allowed text-[#a0a4aa]" : "text-[#287cf0] hover:underline"}`}>{resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend code"}</button></form>}
        {step === "register" && <form onSubmit={submitRegistration} className="mx-auto w-full max-w-[340px]"><button type="button" onClick={() => { setStep("otp"); setError(""); }} className="mb-10 inline-flex items-center gap-2 text-xs text-[#7d838a] hover:text-[#171a1f]"><ArrowLeft size={16} /> Back</button><h2 id="account-auth-title" className="text-[32px] font-semibold leading-[1.12] tracking-[-.045em] text-[#242225]">That's great<br />just a few seconds</h2><div className="mt-9 grid gap-3"><input aria-label="First name" required value={registerForm.firstName} onChange={event => setRegisterForm(form => ({ ...form, firstName: event.target.value }))} placeholder="* First Name" className="h-14 rounded-xl border border-[#cfd3d9] bg-white px-4 text-sm outline-none placeholder:text-[#7d838a] focus:border-[#287cf0]" /><input aria-label="Last name" required value={registerForm.lastName} onChange={event => setRegisterForm(form => ({ ...form, lastName: event.target.value }))} placeholder="* Last Name" className="h-14 rounded-xl border border-[#cfd3d9] bg-white px-4 text-sm outline-none placeholder:text-[#7d838a] focus:border-[#287cf0]" /><input aria-label="Email" type="email" value={registerForm.email} onChange={event => setRegisterForm(form => ({ ...form, email: event.target.value }))} placeholder="Email" className="h-14 rounded-xl border border-[#cfd3d9] bg-white px-4 text-sm outline-none placeholder:text-[#7d838a] focus:border-[#287cf0]" /></div>{error && <p role="alert" className="mt-3 text-xs font-semibold text-[#b42318]">{error}</p>}<button type="submit" className="mt-6 h-12 w-full rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">Save and Continue</button></form>}
        {step === "complete" && <div className="mx-auto w-full max-w-[340px] text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ecfdf1] text-[#2c8b4b]"><CheckCircle2 size={32} /></span><h2 id="account-auth-title" className="mt-6 text-[30px] font-semibold tracking-[-.04em] text-[#242225]">You're all set</h2><p className="mt-3 text-sm leading-6 text-[#737982]">Your Deraah account is ready. You can now continue shopping and track your orders.</p><button type="button" onClick={openProfileForm} className="mt-7 w-full rounded-2xl border border-[#bfe8cc] bg-[#f1fcf4] p-4 text-left transition-colors hover:bg-[#e7f8ec]"><span className="block text-sm font-semibold text-[#23763d]">Complete your profile</span><span className="mt-1 block text-xs leading-5 text-[#5b7262]">Add a few details and earn <strong className="text-[#23763d]">500 Mukafaati points</strong>.</span></button><button type="button" onClick={onClose} className="mt-4 h-12 w-full rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">Continue shopping</button><button type="button" onClick={onClose} className="mt-4 text-xs font-medium text-[#7d838a] hover:text-[#242225]">Skip for now</button></div>}
        {step === "profile-form" && <form onSubmit={submitProfileForm} className="mx-auto w-full max-w-[340px]"><button type="button" onClick={() => { setStep("complete"); setError(""); }} className="mb-7 inline-flex items-center gap-2 text-xs text-[#7d838a] hover:text-[#171a1f]"><ArrowLeft size={16} /> Back</button><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#2c8b4b]">500 Mukafaati points</p><h2 id="account-auth-title" className="mt-4 text-[30px] font-semibold leading-[1.12] tracking-[-.045em] text-[#242225]">Complete your profile</h2><p className="mt-3 text-xs leading-5 text-[#737982]">Finish your details to personalize your account and unlock your points.</p><div className="mt-6 grid gap-3"><input aria-label="Profile first name" required value={profileForm.firstName} onChange={event => setProfileForm(form => ({ ...form, firstName: event.target.value }))} placeholder="First Name" className="h-12 rounded-xl border border-[#cfd3d9] bg-white px-4 text-sm outline-none placeholder:text-[#7d838a] focus:border-[#287cf0]" /><input aria-label="Profile last name" required value={profileForm.lastName} onChange={event => setProfileForm(form => ({ ...form, lastName: event.target.value }))} placeholder="Last Name" className="h-12 rounded-xl border border-[#cfd3d9] bg-white px-4 text-sm outline-none placeholder:text-[#7d838a] focus:border-[#287cf0]" /><label className="grid gap-1 text-[11px] font-medium text-[#626a73]">Date of birth<input aria-label="Date of birth" required type="date" value={profileForm.birthDate} onChange={event => setProfileForm(form => ({ ...form, birthDate: event.target.value }))} className="h-12 rounded-xl border border-[#cfd3d9] bg-white px-4 text-sm font-normal text-[#171a1f] outline-none focus:border-[#287cf0]" /></label><div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-[11px] font-medium text-[#626a73]">Gender<select aria-label="Gender" required value={profileForm.gender} onChange={event => setProfileForm(form => ({ ...form, gender: event.target.value }))} className="h-12 rounded-xl border border-[#cfd3d9] bg-white px-3 text-sm font-normal text-[#171a1f] outline-none focus:border-[#287cf0]"><option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="prefer-not-to-say">Prefer not to say</option></select></label><label className="grid gap-1 text-[11px] font-medium text-[#626a73]">Nationality<select aria-label="Nationality" required value={profileForm.nationality} onChange={event => setProfileForm(form => ({ ...form, nationality: event.target.value }))} className="h-12 rounded-xl border border-[#cfd3d9] bg-white px-3 text-sm font-normal text-[#171a1f] outline-none focus:border-[#287cf0]"><option>Saudi Arabia</option><option>United Arab Emirates</option><option>Kuwait</option><option>Qatar</option><option>Bahrain</option><option>Oman</option><option>Other</option></select></label></div><input aria-label="Profile email" required type="email" value={profileForm.email} onChange={event => setProfileForm(form => ({ ...form, email: event.target.value }))} placeholder="Email" className="h-12 rounded-xl border border-[#cfd3d9] bg-white px-4 text-sm outline-none placeholder:text-[#7d838a] focus:border-[#287cf0]" /></div>{error && <p role="alert" className="mt-3 text-xs font-semibold text-[#b42318]">{error}</p>}<button type="submit" className="mt-6 h-12 w-full rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">Send verification code</button><button type="button" onClick={onClose} className="mx-auto mt-4 block text-xs font-medium text-[#7d838a] hover:text-[#242223]">Skip and continue shopping</button></form>}
        {step === "profile-otp" && <form onSubmit={submitProfileOtp} className="mx-auto w-full max-w-[340px]"><button type="button" onClick={() => { setStep("profile-form"); setError(""); }} className="mb-10 inline-flex items-center gap-2 text-xs text-[#7d838a] hover:text-[#171a1f]"><ArrowLeft size={16} /> Back</button><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#2c8b4b]">Verify your email</p><h2 id="account-auth-title" className="mt-4 text-[30px] font-semibold leading-[1.12] tracking-[-.045em] text-[#242225]">Check your inbox</h2><p className="mt-4 text-xs leading-5 text-[#737982]">We sent a 4-digit verification code to<br /><strong className="text-[#242225]">{maskedEmail}</strong></p><div className="mt-7 grid grid-cols-4 gap-2"><input autoFocus aria-label="Profile verification digit 1" value={profileOtp[0]} onChange={event => updateProfileOtp(0, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /><input aria-label="Profile verification digit 2" value={profileOtp[1]} onChange={event => updateProfileOtp(1, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /><input aria-label="Profile verification digit 3" value={profileOtp[2]} onChange={event => updateProfileOtp(2, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /><input aria-label="Profile verification digit 4" value={profileOtp[3]} onChange={event => updateProfileOtp(3, event.target.value)} className="h-12 rounded-lg border border-[#cfd3d9] text-center text-lg outline-none focus:border-[#287cf0] focus:ring-2 focus:ring-[#287cf0]/10" inputMode="numeric" maxLength={1} /></div>{error && <p role="alert" className="mt-3 text-center text-xs font-semibold text-[#b42318]">{error}</p>}<button type="submit" className="mt-7 h-12 w-full rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">Verify and earn 500 points</button><button type="button" onClick={() => setError("A new code has been sent.")} className="mx-auto mt-6 block text-xs font-medium text-[#287cf0] hover:underline">Resend code</button><button type="button" onClick={onClose} className="mx-auto mt-5 block text-xs font-medium text-[#7d838a] hover:text-[#242223]">Skip and continue shopping</button></form>}
        {step === "profile-complete" && <div className="mx-auto w-full max-w-[340px] text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ecfdf1] text-[#2c8b4b]"><CheckCircle2 size={32} /></span><h2 id="account-auth-title" className="mt-6 text-[30px] font-semibold tracking-[-.04em] text-[#242225]">Profile completed</h2><p className="mt-3 text-sm leading-6 text-[#737982]">Your details were verified and <strong className="text-[#23763d]">500 Mukafaati points</strong> were added to your account.</p><button type="button" onClick={onClose} className="mt-8 h-12 w-full rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">Continue shopping</button></div>}
      </div>
      <p className="mx-auto max-w-[340px] text-center text-[10px] leading-5 text-[#a0a4aa]">By continuing, you agree to our terms and privacy policy.</p>
    </section>
  </div>, document.body);
}

function AccountSuccessToast({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return createPortal(<div className="pointer-events-none fixed inset-0 z-[145]" aria-live="polite"><aside role="status" className="pointer-events-auto fixed right-6 top-24 w-[min(380px,calc(100vw-32px))] rounded-2xl border border-[#bfe8cc] bg-white p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,.18)] max-md:right-4 max-md:top-20 max-md:w-[calc(100vw-32px)]"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ecfdf1] text-[#2c8b4b]"><CheckCircle2 size={22} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-base font-semibold text-[#242225]">Logged in successfully</h2><button type="button" onClick={onClose} aria-label="Close login success notification" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a]">×</button></div><p className="mt-1 text-xs leading-5 text-[#737982]">You are now signed in to your Deraah account.</p></div></div><span aria-hidden="true" className="mt-4 block h-1 origin-left rounded-full bg-[#2c8b4b] account-success-timer" /></aside></div>, document.body);
}

function FavoriteSuccessToast({ product, onClose, onViewFavorites }: { product: StoreFavoriteProduct | null; onClose: () => void; onViewFavorites: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  const [mounted, setMounted] = useState(Boolean(product));
  useEffect(() => {
    if (product) setMounted(true);
  }, [product]);
  if (!product || !mounted) return null;
  const handleClose = () => {
    setMounted(false);
    onClose();
  };
  return createPortal(<SwipeToast
    key={product.id}
    open={Boolean(product)}
    title={isArabic ? "تمت الإضافة إلى المفضلة" : "Added to favorites"}
    description={<>
      <span className="quick-cart-toast__status">{isArabic ? "تم حفظ المنتج بنجاح." : "Your product was saved successfully."}</span>
      <span className="quick-cart-toast__product">
        <span className="quick-cart-toast__thumb"><img src={product.image} alt={product.name} /></span>
        <span>
          <span className="quick-cart-toast__brand">{product.brand}</span>
          <strong className="quick-cart-toast__name">{product.name}</strong>
          <span className="quick-cart-toast__price">{product.price}</span>
        </span>
        <span className="quick-cart-toast__qty">1×</span>
      </span>
    </>}
    actionLabel={isArabic ? "عرض المفضلة" : "View favorites"}
    onAction={onViewFavorites}
    onClose={handleClose}
    background="#ffffff"
    color="#171a1f"
    fuseColor="#cd1a76"
    width={460}
    radius={18}
    slideMs={400}
    settleBounce={0.2}
    swipeDistance={40}
    duration={5000}
    fuse="bottom"
    pauseOnHover
    closeButton
    className="quick-cart-toast"
  />, document.body);
}

type NotificationCard = {
  kind: "order" | "coupon" | "offer";
  title: string;
  message: string;
  time: string;
  image?: string;
};

const notificationCards: NotificationCard[] = [
  { kind: "order", title: "Your Order has been Shipped", message: "Your Order No “23651547” has been shipped", time: "30 Minutes Ago" },
  { kind: "coupon", title: "SPECIAL OFFER FOR YOU", message: "50% Discount on all products. Use coupon “Free50”", time: "2 Hours Ago" },
  { kind: "offer", title: "Free Delivery", message: "Special Offer: 50% Discount on Incense and Oud Products", time: "14:00 AM", image: "/product-assets/gallery/leader-lifestyle.png" },
  { kind: "offer", title: "Free Delivery", message: "Special Offer: 50% Discount on Incense and Oud Products", time: "14:00 AM", image: "/product-assets/gallery/leader-lifestyle.png" },
];

function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { direction, language } = useStoreLocale();
  const isArabic = language === "العربية";
  const [copied, setCopied] = useState(false);
  const mobileDrag = useMobileSheetDrag(onClose);
  if (!open) return null;

  const copyCoupon = async () => {
    try {
      await navigator.clipboard?.writeText("Free50");
    } catch {
      // The visual confirmation still helps on browsers that block clipboard access.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return createPortal(<div dir={direction} role="dialog" aria-modal="true" aria-labelledby="notifications-title" className="store-side-overlay fixed inset-0 z-[140] flex justify-end bg-black/35 backdrop-blur-[3px] max-md:items-end" onClick={onClose}>
    <section onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className="store-mobile-sheet store-notifications-panel store-side-panel-right flex h-dvh w-full max-w-[460px] flex-col overflow-hidden bg-[#f7f9fc] text-start shadow-2xl max-md:h-[min(92dvh,820px)] max-md:max-w-none max-md:rounded-t-[28px]">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <header className="flex shrink-0 items-center justify-between border-b border-[#e8ebef] bg-[#f7f9fc] px-5 pb-4 pt-5 md:px-6 md:pt-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#cd1a76] shadow-[0_8px_22px_rgba(15,23,42,.06)]"><Bell size={18} strokeWidth={1.7} /></span>
          <div><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#9a9fa6]">{isArabic ? "ابقَ على اطلاع" : "Stay in the loop"}</p><h2 id="notifications-title" className="mt-0.5 text-[24px] font-semibold leading-7 tracking-[-.04em] text-[#242225]">{isArabic ? "الإشعارات" : "Notifications"}</h2></div>
        </div>
        <button type="button" onClick={onClose} aria-label={isArabic ? "إغلاق الإشعارات" : "Close notifications"} className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#69717a] shadow-[0_6px_18px_rgba(15,23,42,.05)] transition-colors hover:bg-[#eef1f4]"><X size={17} /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
        <p className="text-xs leading-5 text-[#737982]">{isArabic ? "آخر التحديثات والعروض ونشاط طلباتك من درعه." : "Important updates, offers, and order activity from Deraah."}</p>
        <div className="mt-4 grid gap-3">
          {notificationCards.map((notification, index) => {
            const isOrder = notification.kind === "order";
            const isCoupon = notification.kind === "coupon";
            const Icon = isOrder ? PackageCheck : isCoupon ? BadgePercent : Truck;
            const title = isArabic ? (isOrder ? "تم شحن طلبك" : isCoupon ? "عرض خاص لك" : "توصيل مجاني") : notification.title;
            const message = isArabic ? (isOrder ? "تم شحن طلبك رقم “23651547”" : isCoupon ? "خصم 50% على جميع المنتجات. استخدم الكوبون “Free50”" : "عرض خاص: خصم 50% على منتجات البخور والعود") : notification.message;
            const time = isArabic ? (isOrder ? "منذ 30 دقيقة" : isCoupon ? "منذ ساعتين" : "14:00") : notification.time;
            return <article key={`${notification.kind}-${index}`} className={`notification-card notification-card-${notification.kind} rounded-[18px] bg-white p-3.5 shadow-[0_8px_22px_rgba(15,23,42,.05)] md:p-4`}>
              <div className="notification-card-header flex items-start gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isOrder ? "bg-[#e8f0ff] text-[#6b86bc]" : isCoupon ? "bg-[#fff0f6] text-[#cd1a76]" : "bg-[#fff3ec] text-[#b05a31]"}`}><Icon size={19} strokeWidth={1.65} /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-semibold leading-5 text-[#3a3b3f]">{title}</h3>
                  <p className="notification-card-message mt-0.5 text-[11px] leading-[1.7] text-[#737982]">{message}</p>
                  {isCoupon && <div className="mt-2.5 flex flex-wrap items-center gap-2"><button type="button" onClick={copyCoupon} className="inline-flex items-center gap-1.5 rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#303030]"><span>{copied ? (isArabic ? "تم النسخ" : "Copied") : (isArabic ? "نسخ Free50" : "Copy Free50")}</span><Copy size={11} strokeWidth={1.8} /></button>{copied && <span role="status" className="text-[9px] font-medium text-[#2c8b4b]">{isArabic ? "تم نسخ الكوبون" : "Coupon copied"}</span>}</div>}
                </div>
              </div>
              {notification.image && <div className="notification-card-image mt-3 overflow-hidden rounded-[14px] bg-[#f4e8e2]"><img src={notification.image} alt={isArabic ? "عرض عطور من درعه" : "Deraah fragrance offer"} className="block aspect-[2/1] w-full object-cover" /></div>}
              <div className="notification-card-footer mt-3 flex items-center justify-between gap-3 border-t border-[#f0f1f3] pt-2.5"><span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#858a92]"><Clock3 size={12} strokeWidth={1.7} />{time}</span>{notification.image && <a href="#gift-offers" onClick={onClose} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#242225] no-underline transition-colors hover:text-[#cd1a76]">{isArabic ? "تسوق العرض" : "Shop offer"}<ArrowRight size={13} strokeWidth={1.8} /></a>}{isOrder && <a href="/checkout" onClick={onClose} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#242225] no-underline transition-colors hover:text-[#cd1a76]">{isArabic ? "عرض الطلب" : "View order"}<ArrowRight size={13} strokeWidth={1.8} /></a>}</div>
            </article>;
          })}
        </div>
        <p className="pb-2 pt-6 text-center text-[9px] leading-5 text-[#a0a4aa]">{isArabic ? "لا توجد تحديثات جديدة حالياً." : "You&apos;re all caught up for now."}</p>
      </div>
    </section>
  </div>, document.body);
}

type AccountEmptyView = "account" | "favorites" | "track-order" | "orders" | "rewards";

const accountEmptyContent: Record<AccountEmptyView, { title: string; message: string; action: string }> = {
  account: { title: "My account", message: "Your account details, orders, and Mukafaati rewards will appear here after you sign in.", action: "Log in / Sign up" },
  favorites: { title: "Favorites", message: "You have no favorite products yet. Save products here to find them quickly later.", action: "Continue shopping" },
  "track-order": { title: "Track an order", message: "Your tracked orders will appear here once you place an order with Deraah.", action: "Continue shopping" },
  orders: { title: "My orders", message: "Your completed and current orders will appear here after you place an order with Deraah.", action: "Continue shopping" },
  rewards: { title: "Mukafaati", message: "Your points, rewards, and special offers will appear here as you earn them.", action: "Continue shopping" }
};

const mobileFavoriteArabicNames: Record<string, string> = {
  "Black Woods Eau de Toilette": "بلاك وودز أو دو تواليت",
  "Green Woods Eau de Parfum": "جرين وودز أو دو بارفان",
  "Link White Limited Edition 150ml": "لينك الأبيض إصدار محدود 150 مل",
  "Silver Woods Eau de Parfum": "سيلفر وودز أو دو بارفان",
};

function MobileFavoriteCard({ product, isArabic, onClose, onRemove, onAdd }: { product: StoreFavoriteProduct; isArabic: boolean; onClose: () => void; onRemove: () => void; onAdd: () => void }) {
  const productName = isArabic ? mobileFavoriteArabicNames[product.name] ?? product.name : product.name;
  const brand = isArabic && product.brand === "LINK" ? "لينك" : product.brand;
  return <article className="group relative flex h-fit min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#e8ebee] bg-white shadow-sm transition-shadow hover:shadow-md">
    <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} onClick={onClose} className="relative grid h-[148px] shrink-0 place-items-center overflow-hidden bg-[#f5f6f7] p-3"><img src={product.image} alt={productName} className="block h-auto w-auto max-h-[124px] max-w-[104px] object-contain transition-transform duration-300 group-hover:scale-105" /></a>
    <button type="button" onClick={onRemove} aria-label={`${isArabic ? "إزالة" : "Remove"} ${productName} ${isArabic ? "من المفضلة" : "from favorites"}`} className="absolute end-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-[#cd1a76] shadow-md transition-colors hover:bg-[#fff0f6]"><Heart size={16} fill="currentColor" /></button>
    <div className="flex min-h-[132px] flex-1 flex-col p-3"><div className="flex items-center justify-between gap-2"><span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a9fa6]">{brand}</span><span className="shrink-0 text-[10px] font-semibold text-[#6b7280]" aria-label={isArabic ? "تقييم المنتج 4.8 من 5" : "Product rating 4.8 out of 5"}>★ 4.8</span></div><a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} onClick={onClose} className="mt-1 block min-h-[36px] line-clamp-2 text-[12px] font-semibold leading-5 text-[#242225] no-underline hover:text-[#cd1a76]">{productName}</a><div className="mt-auto flex items-end justify-between gap-2 border-t border-[#edf0f3] pt-3"><span className="text-[13px] font-semibold text-[#5d6570]">{product.price}</span><button type="button" onClick={onAdd} aria-label={`${isArabic ? "أضف" : "Add"} ${productName} ${isArabic ? "إلى السلة" : "to cart"}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#d8d4cf] text-[#161616] transition hover:border-[#161616] hover:bg-[#161616] hover:text-white"><ShoppingBag size={15} strokeWidth={1.7} /></button></div></div>
  </article>;
}

function AccountEmptyPanel({ view, onClose, onOpenAuth }: { view: AccountEmptyView | null; onClose: () => void; onOpenAuth: () => void }) {
  const { direction, language } = useStoreLocale();
  const isArabic = language === "العربية";
  const { favorites, removeFavorite } = useStoreFavorites();
  const { addToCart } = useStoreCart();
  const { orders } = useStoreOrders();
  const mobileDrag = useMobileSheetDrag(onClose);
  if (!view) return null;
  const content = accountEmptyContent[view];
  const favoriteTitle = isArabic ? "المفضلة" : content.title;
  const savedProductsLabel = isArabic ? `${favorites.length} ${favorites.length === 1 ? "منتج محفوظ" : "منتجات محفوظة"}` : `${favorites.length} saved ${favorites.length === 1 ? "product" : "products"}`;
  const Icon = view === "favorites" ? Heart : view === "orders" ? PackageCheck : view === "track-order" ? ClipboardList : view === "rewards" ? Gift : UserRound;
  const showFavorites = view === "favorites" && favorites.length > 0;
  const showOrders = (view === "orders" || view === "track-order") && orders.length > 0;
  const handleAction = () => {
    if (view === "account") onOpenAuth();
    else onClose();
  };
  if (showFavorites) return createPortal(<div dir={direction} role="dialog" aria-modal="true" aria-labelledby="account-empty-title" className="store-side-overlay fixed inset-0 z-[140] flex justify-end bg-black/35 backdrop-blur-[3px] max-md:items-end" onClick={onClose}>
    <section onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className="store-mobile-sheet store-account-panel store-side-panel-right flex h-dvh w-full max-w-[440px] flex-col bg-white px-7 pb-7 pt-5 text-start shadow-2xl max-md:h-[min(92dvh,760px)] max-md:max-w-none max-md:rounded-t-[28px] max-md:px-5">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="flex items-center justify-end"><button type="button" onClick={onClose} aria-label={isArabic ? "إغلاق المفضلة" : "Close favorites"} className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button></div>
      <div className="flex min-h-0 flex-1 flex-col pt-8"><div><h2 id="account-empty-title" className="text-[30px] font-semibold tracking-[-.04em] text-[#242225]">{favoriteTitle}</h2><p className="mt-2 text-sm text-[#737982]">{savedProductsLabel}</p></div><div className="mt-5 grid min-h-0 flex-1 content-start items-start grid-cols-2 gap-2 overflow-y-auto pr-1">{favorites.map(product => <MobileFavoriteCard key={product.id} product={product} isArabic={isArabic} onClose={onClose} onRemove={() => removeFavorite(product.id)} onAdd={() => addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image, quantity: 1 })} />)}</div></div>
    </section>
  </div>, document.body);
  return createPortal(<div dir={direction} role="dialog" aria-modal="true" aria-labelledby="account-empty-title" className="store-side-overlay fixed inset-0 z-[140] flex justify-end bg-black/35 backdrop-blur-[3px] max-md:items-end" onClick={onClose}>
    <section onClick={event => event.stopPropagation()} style={mobileDrag.dragStyle} className="store-mobile-sheet store-account-panel store-side-panel-right flex h-dvh w-full max-w-[440px] flex-col bg-white px-7 pb-7 pt-5 text-start shadow-2xl max-md:h-[min(92dvh,760px)] max-md:max-w-none max-md:rounded-t-[28px] max-md:px-5">
      <MobileSheetHandle dragHandlers={mobileDrag.dragHandlers} />
      <div className="flex items-center justify-end"><button type="button" onClick={onClose} aria-label={`Close ${content.title}`} className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f6f8] text-[#69717a] transition-colors hover:bg-[#e9edf1]"><X size={18} /></button></div>
      {showFavorites ? <div className="flex min-h-0 flex-1 flex-col pt-8"><div><h2 id="account-empty-title" className="text-[30px] font-semibold tracking-[-.04em] text-[#242225]">Favorites</h2><p className="mt-2 text-sm text-[#737982]">{favorites.length} saved {favorites.length === 1 ? "product" : "products"}</p></div><div className="mt-5 grid min-h-0 flex-1 content-start items-start grid-cols-2 gap-2 overflow-y-auto pr-1">{favorites.map(product => <article key={product.id} className="group relative flex h-fit min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#e8ebee] bg-white shadow-sm transition-shadow hover:shadow-md"><a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} onClick={onClose} className="relative grid h-[148px] shrink-0 place-items-center overflow-hidden bg-[#f5f6f7] p-3"><img src={product.image} alt={product.name} className="block h-auto w-auto max-h-[124px] max-w-[104px] object-contain transition-transform duration-300 group-hover:scale-105" /></a><button type="button" onClick={() => removeFavorite(product.id)} aria-label={`Remove ${product.name} from favorites`} className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-[#cd1a76] shadow-md transition-colors hover:bg-[#fff0f6]"><Heart size={16} fill="currentColor" /></button><div className="p-3"><span className="block text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a9fa6]">{product.brand}</span><a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} onClick={onClose} className="mt-1 block line-clamp-2 min-h-[36px] text-[12px] font-semibold leading-5 text-[#242225] no-underline hover:text-[#cd1a76]">{product.name}</a><span className="mt-3 block text-[13px] font-semibold text-[#5d6570]">{product.price}</span></div></article>)}</div></div> : showOrders ? <div className="flex min-h-0 flex-1 flex-col pt-8"><div><h2 id="account-empty-title" className="text-[30px] font-semibold tracking-[-.04em] text-[#242225]">{view === "track-order" ? "Track an order" : "My orders"}</h2><p className="mt-2 text-sm text-[#737982]">{orders.length} {orders.length === 1 ? "order" : "orders"} in your account</p></div><div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">{orders.map(order => <article key={order.id} className={`rounded-2xl border border-[#e8ebee] bg-white p-4 shadow-sm ${order.status === "Delivered" ? "cursor-pointer" : ""}`} onClick={order.status === "Delivered" ? () => window.location.assign(`/payment-summary?order=${encodeURIComponent(order.id)}`) : undefined}><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-[#242225]">Order #{order.id}</h3><p className="mt-1 text-[11px] text-[#8b9199]">{new Date(order.placedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${order.status === "Delivered" ? "bg-[#e8f7ec] text-[#267b42]" : "bg-[#fff5df] text-[#9b6b14]"}`}>{order.status}</span></div><div className="mt-3"><OrderItemsPreview items={order.items} compact /></div><div className="mt-3 flex items-center justify-between gap-3 border-t border-[#eef0f2] pt-3 text-xs"><div><span className="block text-[#8b9199]">Total</span><strong className="mt-1 block text-base text-[#242225]">⃁ {order.total}</strong></div>{order.status === "Delivered" ? <button type="button" aria-label={`Open order ${order.id}`} onClick={event => { event.stopPropagation(); window.location.assign(`/payment-summary?order=${encodeURIComponent(order.id)}`); }} className="grid h-9 w-9 place-items-center rounded-full bg-[#242223] text-white transition-colors hover:bg-[#111011]"><ArrowRight size={15} /></button> : <button type="button" onClick={() => window.location.assign(`/payment-summary?order=${encodeURIComponent(order.id)}`)} className="inline-flex items-center gap-1 rounded-lg bg-[#242223] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#111011]">Track order <ArrowRight size={14} /></button>}</div></article>)}</div></div> : <div className="flex flex-1 flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-[#f4f6f8] text-[#737982]"><Icon size={28} strokeWidth={1.5} /></span><h2 id="account-empty-title" className="mt-6 text-[30px] font-semibold tracking-[-.04em] text-[#242225]">{content.title}</h2><p className="mt-3 max-w-[310px] text-sm leading-6 text-[#737982]">{content.message}</p><button type="button" onClick={handleAction} className="mt-8 h-12 w-full max-w-[340px] rounded-xl bg-[#242223] px-4 text-sm font-medium text-white transition-colors hover:bg-[#111011]">{content.action}</button></div>}
    </section>
  </div>, document.body);
}

function HeaderAccountMenu({ authenticated, open, onToggle, onOpenAuth, onOpenView, onLogout }: { authenticated: boolean; open: boolean; onToggle: () => void; onOpenAuth: (mode: AuthMode) => void; onOpenView: (view: AccountEmptyView) => void; onLogout: () => void }) {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  return <div data-store-header-account={authenticated ? "authenticated" : "guest"} className="relative shrink-0">
    <button type="button" onClick={onToggle} aria-label={authenticated ? (isArabic ? "حسابي" : "My account") : (isArabic ? "الحساب" : "Account")} aria-expanded={open} className={authenticated ? "inline-flex h-10 items-center gap-1 border-s-[#e6e2de] px-3 text-[12px] font-normal text-[#171717] transition-colors hover:bg-[#f1f2f3]" : "grid h-10 w-10 place-items-center text-[#171717] transition-opacity hover:opacity-60"}>
      {authenticated ? <>{isArabic ? "حسابي" : "My account"} <ChevronDown size={13} strokeWidth={1.5} className={`transition-transform ${open ? "rotate-180" : ""}`} /></> : <img src="/product-assets/icons/account.svg" alt="" className="h-[18px] w-[18px]" />}
    </button>
    {open && <><button type="button" aria-label={isArabic ? "إغلاق قائمة الحساب" : "Close account menu"} className="fixed inset-0 z-[40] cursor-default" onClick={onToggle} /><div role="menu" aria-label={isArabic ? "قائمة الحساب" : "Account menu"} className="absolute end-0 top-12 z-[50] w-56 overflow-hidden rounded-2xl border border-[#e5e9ee] bg-white p-2 text-start shadow-[0_18px_40px_rgba(15,23,42,.14)]">
      {!authenticated ? <>
        <button type="button" role="menuitem" onClick={() => onOpenAuth("login")} className="w-full rounded-xl px-3 py-3 text-start text-xs font-medium text-[#252a30] transition-colors hover:bg-[#f4f6f8]">Log in</button>
        <button type="button" role="menuitem" onClick={() => onOpenAuth("register")} className="w-full rounded-xl px-3 py-3 text-start text-xs font-medium text-[#252a30] transition-colors hover:bg-[#f4f6f8]">Register</button>
      </> : null}
      {!authenticated && <div className="my-1 border-t border-[#eef0f2]" />}
      <button type="button" role="menuitem" onClick={() => onOpenView("account")} className="w-full rounded-xl px-3 py-3 text-start text-xs font-medium text-[#252a30] transition-colors hover:bg-[#f4f6f8]">My account</button>
      <button type="button" role="menuitem" onClick={() => onOpenView("favorites")} className="w-full rounded-xl px-3 py-3 text-start text-xs font-medium text-[#252a30] transition-colors hover:bg-[#f4f6f8]">Favorites</button>
      <button type="button" role="menuitem" onClick={() => onOpenView("track-order")} className="w-full rounded-xl px-3 py-3 text-start text-xs font-medium text-[#252a30] transition-colors hover:bg-[#f4f6f8]">Track an order</button>
      {authenticated && <button type="button" role="menuitem" onClick={() => onOpenView("orders")} className="w-full rounded-xl px-3 py-3 text-start text-xs font-medium text-[#252a30] transition-colors hover:bg-[#f4f6f8]">My orders</button>}
      {authenticated && <><div className="my-1 border-t border-[#eef0f2]" /><button type="button" role="menuitem" onClick={onLogout} className="w-full rounded-xl px-3 py-3 text-start text-xs font-medium text-[#b42318] transition-colors hover:bg-[#fff5f5]">Log out</button></>}
    </div></>}
  </div>;
}

type TopMenu = "country" | "language" | "contact" | "account" | null;

export default function StoreHeader({ overlay = false }: { overlay?: boolean }) {
  const { cartItemCount } = useStoreCart();
  const { country, language, direction, setCountry, setLanguage, setLocale } = useStoreLocale();
  const [topMenu, setTopMenu] = useState<TopMenu>(null);
  const [countryPanelOpen, setCountryPanelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryName, setMobileCategoryName] = useState(CATEGORY_GROUPS[0]?.name ?? "Perfumes");
  const [mobileCategorySearch, setMobileCategorySearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAiMode, setSearchAiMode] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginSuccessOpen, setLoginSuccessOpen] = useState(false);
  const [openMobileAccountAfterLogin, setOpenMobileAccountAfterLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("deraah-store-auth") === "signed-in");
  const [favoriteSuccessProduct, setFavoriteSuccessProduct] = useState<StoreFavoriteProduct | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accountView, setAccountView] = useState<AccountEmptyView | null>(null);
  const [isScrolled, setIsScrolled] = useState(() => typeof window !== "undefined" && overlay && window.scrollY > 36);
  const cartCloseTimer = useRef<number | null>(null);
  const openSearch = (mode: "search" | "ai" = "search") => {
    setSearchAiMode(mode === "ai");
    setSearchOpen(true);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchAiMode(false);
  };

  useEffect(() => {
    let previousScrollY = window.scrollY;
    setIsScrolled(overlay && window.scrollY > 36);
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (overlay) {
        const movedUp = currentScrollY < previousScrollY - 4;
        const movedDown = currentScrollY > previousScrollY;
        if (movedUp) setIsScrolled(false);
        else if (movedDown) setIsScrolled(currentScrollY > 36);
      }
      if (currentScrollY > previousScrollY) {
        setActiveCategory(null);
        setTopMenu(null);
      }
      previousScrollY = currentScrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTopMenu(null);
        setCountryPanelOpen(false);
        setActiveCategory(null);
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setCartDrawerOpen(false);
        setNotificationsOpen(false);
        setAuthOpen(false);
        setAccountMenuOpen(false);
        setAccountView(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    let searchHistoryEntryActive = true;
    const currentState = window.history.state && typeof window.history.state === "object" ? window.history.state : {};
    window.history.pushState({ ...currentState, __deraahSearch: true }, "", window.location.href);

    const onPopState = () => {
      searchHistoryEntryActive = false;
      setSearchOpen(false);
      setSearchAiMode(false);
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      if (searchHistoryEntryActive) {
        searchHistoryEntryActive = false;
        window.history.back();
      }
    };
  }, [searchOpen]);

  useEffect(() => {
    const shouldLockCartScroll = cartDrawerOpen && window.matchMedia("(max-width: 767px)").matches;
    document.body.style.overflow = mobileMenuOpen || searchOpen || shouldLockCartScroll || notificationsOpen || authOpen || countryPanelOpen || Boolean(accountView) ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, searchOpen, cartDrawerOpen, notificationsOpen, authOpen, countryPanelOpen, accountView]);

  useEffect(() => {
    const openSharedMenu = () => {
      setActiveCategory(null);
      setMobileCategorySearch("");
      setMobileMenuOpen(true);
    };
    window.addEventListener("store:open-menu", openSharedMenu);
    return () => window.removeEventListener("store:open-menu", openSharedMenu);
  }, []);

  useEffect(() => {
    const openSharedCart = () => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        window.location.assign("/checkout");
        return;
      }
      setCartDrawerOpen(true);
    };
    window.addEventListener("store:open-cart", openSharedCart);
    return () => window.removeEventListener("store:open-cart", openSharedCart);
  }, []);

  useEffect(() => {
    const openSharedAccount = () => {
      if (isAuthenticated) window.location.assign("/account");
      else {
        setAuthMode("login");
        setAuthOpen(true);
      }
    };
    window.addEventListener("store:open-account", openSharedAccount);
    return () => window.removeEventListener("store:open-account", openSharedAccount);
  }, [isAuthenticated]);

  useEffect(() => {
    const openMobileAccount = () => {
      if (isAuthenticated) {
        window.location.assign("/account");
        return;
      }
      setOpenMobileAccountAfterLogin(true);
      setAuthMode("login");
      setAuthOpen(true);
    };
    window.addEventListener("store:open-mobile-account", openMobileAccount);
    return () => window.removeEventListener("store:open-mobile-account", openMobileAccount);
  }, [isAuthenticated]);

  useEffect(() => {
    const openSharedRewards = () => setAccountView("rewards");
    window.addEventListener("store:open-rewards", openSharedRewards);
    return () => window.removeEventListener("store:open-rewards", openSharedRewards);
  }, []);

  useEffect(() => {
    const openSharedNotifications = () => setNotificationsOpen(true);
    const openSharedCountryPanel = () => setCountryPanelOpen(true);
    window.addEventListener("store:open-notifications", openSharedNotifications);
    window.addEventListener("store:open-country", openSharedCountryPanel);
    return () => {
      window.removeEventListener("store:open-notifications", openSharedNotifications);
      window.removeEventListener("store:open-country", openSharedCountryPanel);
    };
  }, []);

  useEffect(() => {
    if (!loginSuccessOpen) return;
    const timeout = window.setTimeout(() => setLoginSuccessOpen(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [loginSuccessOpen]);

  useEffect(() => {
    const onFavoriteFeedback = (event: Event) => {
      const detail = (event as CustomEvent<{ action?: "added" | "removed"; product?: StoreFavoriteProduct }>).detail;
      if (!detail?.product) return;
      setFavoriteSuccessProduct(detail.action === "added" ? detail.product : null);
    };
    window.addEventListener("deraah-favorite-feedback", onFavoriteFeedback);
    return () => window.removeEventListener("deraah-favorite-feedback", onFavoriteFeedback);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || searchOpen || cartDrawerOpen || notificationsOpen || authOpen || countryPanelOpen || Boolean(accountView) ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, searchOpen, cartDrawerOpen, notificationsOpen, authOpen, countryPanelOpen, accountView]);

  const cancelCartClose = () => {
    if (cartCloseTimer.current !== null) {
      window.clearTimeout(cartCloseTimer.current);
      cartCloseTimer.current = null;
    }
  };
  const openCart = () => {
    cancelCartClose();
    setCartDrawerOpen(true);
  };
  const closeCart = () => {
    cancelCartClose();
    setCartDrawerOpen(false);
  };
  const scheduleCartClose = () => {
    cancelCartClose();
    cartCloseTimer.current = window.setTimeout(() => {
      setCartDrawerOpen(false);
      cartCloseTimer.current = null;
    }, 280);
  };
  const selectLocale = (nextCountry: StoreCountry, nextLanguage: StoreLanguage) => {
    setLocale(nextCountry, nextLanguage);
    setCountryPanelOpen(false);
  };
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const mobileCategoryDrag = useMobileSheetDrag(closeMobileMenu, { enabled: mobileMenuOpen });
  const mobileCategoryData = CATEGORY_GROUPS.find(category => category.name === mobileCategoryName) ?? CATEGORY_GROUPS[0];
  const visibleMobileCategoryItems = (mobileCategoryData?.items ?? []).filter(item => item.toLowerCase().includes(mobileCategorySearch.trim().toLowerCase()));
  const activeCategoryData = CATEGORY_GROUPS.find(category => category.name === activeCategory);
  const activeCategoryPanel = activeCategoryData && <div className="absolute start-0 top-full z-30 mt-[2px] hidden w-full overflow-hidden rounded-[28px] border border-white/75 bg-white/95 text-[#161616] shadow-[0_18px_35px_rgba(0,0,0,.12)] md:block"><div className="mx-auto max-w-[1200px] px-6 py-5"><div className="mb-4 flex items-center justify-between border-b border-[#ececef] pb-3"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9a9ca2]">Explore subcategories</p><div className="flex items-center gap-2"><a href={activeCategoryData.name === "Gifts" ? "/gifts" : `/category?category=${encodeURIComponent(activeCategoryData.name)}`} onClick={() => setActiveCategory(null)} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-[#242225] no-underline transition-colors hover:bg-[#f1f2f3] hover:text-[#9a5a2e]">View all <ArrowRight size={13} /></a><button type="button" onClick={() => setActiveCategory(null)} aria-label="Close categories" className="rounded-full px-3 py-1 text-xs text-[#737782] transition-colors hover:bg-[#f1f2f3]">Close ×</button></div></div><section aria-label={activeCategoryData.name}><ul className="grid grid-cols-4 content-start gap-x-3 gap-y-2">{activeCategoryData.items.map((link, index) => <li key={link}><a href={`/category?category=${encodeURIComponent(activeCategoryData.name)}&subcategory=${encodeURIComponent(link)}`} onClick={() => setActiveCategory(null)} className="group flex flex-col items-center gap-3 rounded-xl px-2 py-2 text-center text-[#555861] no-underline transition-colors hover:bg-[#f1f2f3] hover:text-[#202125]"><span className="flex aspect-square h-auto w-full max-w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-transparent mix-blend-multiply transition-transform duration-200 group-hover:scale-[1.03]"><img src={getCategoryItemImage(activeCategoryData.name, link, index, activeCategoryData.image)} alt="" className="h-full w-full object-contain" /></span><span className={`text-center text-xs leading-4 ${language === "العربية" ? "font-light" : "font-semibold"}`}>{headerSubcategoryLabel(link, language)}</span></a></li>)}</ul></section></div></div>;

  return (
    <header dir={direction} data-store-overlay={overlay ? "true" : undefined} onMouseLeave={() => setActiveCategory(null)} className={`${overlay ? "fixed inset-x-0 top-[22px] z-40 bg-transparent text-[#171717] shadow-none" : "relative z-20 bg-transparent pb-4 pt-[22px] text-[#171717]"} translate-y-0 transition-transform duration-300 ease-out`}>
      <div className="hidden">
        <div className="flex h-full items-center gap-5">
          <div className="relative">
            <button type="button" onClick={() => { setTopMenu(null); setCountryPanelOpen(true); }} className="inline-flex h-full items-center gap-2 transition-opacity hover:opacity-75">
              <span className="grid h-4 w-4 place-items-center rounded-sm bg-[#4b9b47] text-[8px] text-white">KSA</span><span>{country}</span><ChevronDown size={12} className={`transition-transform ${topMenu === "country" ? "rotate-180" : ""}`} />
            </button>
            {topMenu === "country" && <div className="absolute start-0 top-6 z-50 min-w-52 overflow-hidden rounded-xl border border-[#e5e9ee] bg-white p-1 text-[#252a30] shadow-xl">{countryOptions.map(option => <button key={option.value} type="button" onClick={() => { setCountry(option.value); setTopMenu(null); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-xs hover:bg-[#f4f6f8]"><span>{option.label}</span>{country === option.value && <span className="text-[#2c8b4b]">✓</span>}</button>)}</div>}
          </div>
          <div className="relative">
            <button type="button" onClick={() => { setTopMenu(null); setCountryPanelOpen(true); }} className="inline-flex h-full items-center gap-1 text-white/80 transition-colors hover:text-white">{language} <ChevronDown size={12} /></button>
            {topMenu === "language" && <div className="absolute start-0 top-6 z-50 min-w-28 rounded-lg border border-[#e5e9ee] bg-white p-1 text-[#252a30] shadow-xl"><button type="button" onClick={() => { setLanguage("English"); setTopMenu(null); }} className="w-full rounded-md px-3 py-2 text-start text-xs hover:bg-[#f4f6f8]">English</button><button type="button" onClick={() => { setLanguage("العربية"); setTopMenu(null); }} className="w-full rounded-md px-3 py-2 text-start text-xs hover:bg-[#f4f6f8]">العربية</button></div>}
          </div>
        </div>
        <span>Free 2-hour delivery in Riyadh on orders before 8 PM</span>
        <div className="relative">
          <button type="button" onClick={() => setTopMenu(topMenu === "contact" ? null : "contact")} className="inline-flex h-full items-center gap-1 transition-opacity hover:opacity-75">Contact us <ChevronDown size={12} className={`transition-transform ${topMenu === "contact" ? "rotate-180" : ""}`} /></button>
          {topMenu === "contact" && <div className="absolute end-0 top-6 z-50 min-w-40 rounded-lg border border-[#e5e9ee] bg-white p-1 text-[#252a30] shadow-xl"><a href="tel:+966500000000" className="block rounded-md px-3 py-2 text-xs no-underline hover:bg-[#f4f6f8]">Call support</a><a href="mailto:support@deraah.sa" className="block rounded-md px-3 py-2 text-xs no-underline hover:bg-[#f4f6f8]">Email support</a></div>}
        </div>
      </div>

      <div data-store-header-shell className={`relative mx-auto flex h-[52px] items-center gap-4 ${overlay ? `pointer-events-auto mx-4 w-[calc(100%_-_2rem)] max-w-none rounded-full border-0 bg-white/95 px-3 shadow-[0_12px_35px_rgba(24,20,16,.14)] md:mx-auto md:w-full md:max-w-[1240px] md:gap-4 md:rounded-none md:bg-transparent md:px-0 md:shadow-none ${isScrolled ? "max-md:mx-auto max-md:w-fit max-md:gap-0 max-md:px-2" : ""}` : "mx-4 w-[calc(100%_-_2rem)] rounded-full border-0 bg-white/95 px-3 shadow-[0_12px_35px_rgba(24,20,16,.14)] md:mx-auto md:w-full md:max-w-[1240px] md:gap-4 md:rounded-none md:bg-transparent md:px-0 md:shadow-none"}`}>
        <div className={`static flex h-full min-w-0 items-center gap-2 overflow-visible transition-[flex-basis,width,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] will-change-[flex-basis,width,opacity] md:relative md:flex-1 md:overflow-visible md:rounded-full md:border md:border-white/75 md:bg-white/95 md:px-4 md:shadow-[0_12px_35px_rgba(24,20,16,.14)] ${overlay && isScrolled ? "max-md:w-0 max-md:opacity-0" : ""}`}>
          <button type="button" onClick={() => setNotificationsOpen(true)} aria-label="Notifications" title="Notifications" style={{ left: direction === "rtl" ? "calc(50% - 92px)" : undefined, right: direction === "ltr" ? "calc(50% - 92px)" : undefined }} className="absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center text-[#171717] md:hidden"><Bell size={22} strokeWidth={1.5} /></button>
          <a href="/" aria-label="Deraah home" className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 no-underline transition-opacity duration-500 md:relative md:left-auto md:top-auto md:order-first md:translate-x-0 md:translate-y-0 ${overlay && isScrolled ? "max-md:pointer-events-none max-md:opacity-0" : ""}`}><img src="/product-assets/deraah-wordmark.svg" alt="DERAAH" className="h-[36px] w-[86px] object-contain md:ms-[12px] md:h-[27.06px] md:w-[82px]" /></a>
          <div className="relative hidden h-10 min-w-0 flex-1 md:block">
            <nav aria-label="Main navigation" aria-hidden={overlay && isScrolled} className={`absolute inset-0 flex min-w-0 items-center gap-0 overflow-hidden whitespace-nowrap ps-3 pe-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] will-change-[opacity,transform] md:me-0 md:justify-between md:pe-0 md:ps-[68px] ${overlay && isScrolled ? "pointer-events-none z-0 -translate-y-2 opacity-0" : "z-10 translate-y-0 opacity-100"}`}>
              {categories.filter(category => category !== "Home Care").slice(0, 6).map(category => <button key={category} type="button" aria-expanded={activeCategory === category} onMouseEnter={() => setActiveCategory(category)} onFocus={() => setActiveCategory(category)} onClick={() => setActiveCategory(activeCategory === category ? null : category)} className={`inline-flex h-10 items-center gap-1 rounded-full px-2 text-[13px] ${direction === "rtl" ? "font-light" : "font-normal"} text-[#171717] transition-colors hover:bg-[#f1f2f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20`}><span>{headerCategoryLabel(category, language)}</span><ChevronDown size={12} strokeWidth={1.5} className={`transition-transform ${activeCategory === category ? "rotate-180" : ""}`} /></button>)}
              <button type="button" aria-expanded={activeCategory === "Home Care"} onMouseEnter={() => setActiveCategory("Home Care")} onFocus={() => setActiveCategory("Home Care")} onClick={() => setActiveCategory(activeCategory === "Home Care" ? null : "Home Care")} className={`inline-flex h-10 items-center gap-1 rounded-full px-2 text-[13px] ${direction === "rtl" ? "font-light" : "font-normal"} text-[#171717] transition-colors hover:bg-[#f1f2f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20`}><span>{headerCategoryLabel("Home Care", language)}</span><ChevronDown size={12} strokeWidth={1.5} className={`transition-transform ${activeCategory === "Home Care" ? "rotate-180" : ""}`} /></button>
              <a href="#gift-offers" className={`inline-flex h-10 items-center rounded-full px-2 text-[13px] ${direction === "rtl" ? "font-light" : "font-normal"} text-[#171717] no-underline transition-colors hover:bg-[#f1f2f3]`}>{headerCategoryLabel("Offers", language)}</a>
            </nav>
            <div data-store-header-search-switch aria-hidden={!(overlay && isScrolled)} className={`absolute inset-0 flex min-w-0 items-center gap-1 overflow-hidden border-s-0 border-[#e3e3e3] bg-transparent ps-3 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform ${overlay && isScrolled ? "z-10 translate-y-0 border-s" : "pointer-events-none z-0 translate-y-2"}`}>
              <div className={`flex min-w-0 flex-1 items-center gap-1 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] will-change-[opacity,transform] ${overlay && isScrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}>
                <button type="button" onClick={() => openSearch()} aria-label="Search products" className="flex min-w-0 flex-1 items-center gap-2 text-start text-[13px] text-[#757575] transition-colors hover:text-[#171717]">
                  <img src="/product-assets/icons/search.svg" alt="" className="h-[17px] w-[17px] shrink-0 opacity-70" />
                  <span className="truncate">Search products, brands, or categories</span>
                </button>
                <button type="button" onClick={() => openSearch("ai")} aria-label="Ask AI" className="inline-flex h-9 shrink-0 items-center gap-1 border-s border-[#e3e3e3] px-3 text-[12px] text-[#66666a] transition-colors hover:text-[#171717]">
                  <Sparkles size={13} strokeWidth={1.6} />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          </div>
          <button type="button" aria-label="Open categories menu" onClick={() => setMobileMenuOpen(true)} className="hidden"><Menu size={20} strokeWidth={1.5} /><span className="mb-[-6px]">Categories</span></button>
          {activeCategoryPanel}
        </div>
        <div data-store-header-actions={isAuthenticated ? "authenticated" : "guest"} data-store-header-scrolled={overlay && isScrolled ? "true" : "false"} className={`order-last ml-auto flex h-full min-w-0 items-center rounded-full text-[12px] transition-[width,padding,gap,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] will-change-[width,padding,gap,opacity] max-md:gap-1 md:border md:border-white/75 md:bg-white/95 md:shadow-[0_12px_35px_rgba(24,20,16,.14)] ${overlay && isScrolled ? (isAuthenticated ? "gap-3 md:w-[274px] md:px-[8px] md:opacity-95" : "gap-3 md:w-[224px] md:px-[6px] md:opacity-95") : (isAuthenticated ? "gap-1 md:w-[328.625px] md:px-[18px] md:opacity-100" : "gap-0 md:w-[274px] md:px-[18px] md:opacity-100")}`}>
          <button data-store-header-search-button type="button" onClick={() => openSearch()} aria-label="Search products" className={`hidden h-10 place-items-center overflow-hidden rounded-full text-[#171717] transition-[opacity,transform,width] duration-700 ease-[cubic-bezier(.22,1,.36,1)] will-change-[opacity,transform,width] hover:bg-[#f1f2f3] md:ml-[-11px] md:grid ${overlay ? (isScrolled ? "pointer-events-none w-0 -translate-x-2 scale-75 opacity-0" : "w-10 translate-x-0 scale-100 opacity-100") : "w-10"}`}><img src="/product-assets/icons/search.svg" alt="" className="h-5 w-5 shrink-0" /></button>
          <div className="hidden shrink-0 items-center gap-2 md:flex">
              <div className="relative hidden md:block"><button type="button" aria-label="Change country and language" aria-expanded={countryPanelOpen} onClick={() => { setTopMenu(null); setCountryPanelOpen(true); }} className="grid h-10 w-10 place-items-center rounded-full text-[#171717] transition-colors hover:bg-[#f1f2f3]"><Globe2 size={18} strokeWidth={1.5} /></button></div>
              <button type="button" onClick={() => setNotificationsOpen(true)} aria-label="Notifications" title="Notifications" className="grid h-10 w-10 place-items-center rounded-full text-[#171717] transition-colors hover:bg-[#f1f2f3]"><Bell size={18} strokeWidth={1.5} /></button>
              <a href="/checkout" onMouseEnter={openCart} onMouseLeave={scheduleCartClose} onFocus={openCart} onClick={event => { event.preventDefault(); openCart(); }} aria-expanded={cartDrawerOpen} aria-label={`Shopping cart, ${cartItemCount} items`} className="relative grid h-10 w-10 place-items-center text-[#171717] no-underline transition-opacity hover:opacity-60"><img src="/product-assets/icons/cart.svg" alt="" className="h-[18px] w-[18px]" />{cartItemCount > 0 && <span className="absolute end-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#cd1a76] px-1 text-[9px] font-bold text-white">{cartItemCount}</span>}</a>
              {isAuthenticated ? <HeaderAccountMenu authenticated open={accountMenuOpen} onToggle={() => { setTopMenu(null); setAccountMenuOpen(open => !open); }} onOpenAuth={mode => { setAccountMenuOpen(false); setAuthMode(mode); setAuthOpen(true); }} onOpenView={view => { setAccountMenuOpen(false); if (view === "account") window.location.assign("/account"); else setAccountView(view); }} onLogout={() => { setAccountMenuOpen(false); setIsAuthenticated(false); window.localStorage.removeItem("deraah-store-auth"); }} /> : <button type="button" onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="hidden h-10 rounded-none border-s border-[#e6e2de] ps-3 text-[12px] font-normal text-[#171717] transition-colors hover:bg-[#f1f2f3] md:inline-flex md:items-center">Sign in</button>}
          </div>
          <button type="button" onClick={() => openSearch()} aria-label="Search products" className="grid h-10 w-10 place-items-center text-[#171717] md:hidden"><img src="/product-assets/icons/search.svg" alt="" className="h-5 w-5" /></button>
          {overlay && isScrolled && <>
            <button type="button" onClick={() => setNotificationsOpen(true)} aria-label="Notifications" title="Notifications" className="grid h-10 w-10 place-items-center text-[#171717] transition-opacity hover:opacity-60 md:hidden"><Bell size={19} strokeWidth={1.7} /></button>
            <a href="/" aria-label="Home" className="grid h-10 w-10 place-items-center text-[#171717] no-underline transition-opacity hover:opacity-60 md:hidden"><img src="/product-assets/icons/mobile-nav/home.svg" alt="" className="block max-w-none shrink-0" /></a>
          </>}
        </div>
      </div>

      {mobileMenuOpen && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Categories menu" className="store-side-overlay store-mobile-sheet-overlay fixed inset-0 z-[80] bg-black/40" onClick={closeMobileMenu}>
          <aside id="store-category-menu" dir={direction} style={mobileCategoryDrag.dragStyle} className="store-mobile-sheet store-category-drawer store-side-panel-left mobile-category-sheet absolute start-0 top-0 flex h-full w-[min(100vw,380px)] flex-col overflow-hidden bg-white/85 shadow-2xl md:w-[min(100vw,520px)] md:max-w-[520px]" onClick={event => event.stopPropagation()}>
            <MobileSheetHandle dragHandlers={mobileCategoryDrag.dragHandlers} />
            <div className="flex h-[82px] shrink-0 items-center gap-2 border-b border-[#e8e8eb] bg-white/85 px-3 md:h-[82px] md:gap-3 md:px-6">
              <button type="button" aria-label="Close menu" onClick={closeMobileMenu} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#3c4149] transition-colors hover:bg-[#e8e9ed] md:h-11 md:w-11"><X size={18} /></button>
              <label className="flex h-12 min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-[#e1e3e7] bg-white/85 px-2.5 text-[#8d929a] md:h-14 md:gap-2 md:px-3">
                <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center text-[#5c6570] md:h-8 md:w-8"><ScanLine size={18} strokeWidth={1.35} /></span>
                <input aria-label="Search categories" value={mobileCategorySearch} onChange={event => setMobileCategorySearch(event.target.value)} placeholder="Search categories or scan a barcode" className="min-w-0 flex-1 bg-transparent text-[11px] text-[#242830] outline-none placeholder:text-[#989da5] md:text-xs" />
                <Search size={21} strokeWidth={1.5} className="shrink-0 text-[#242830] md:h-6 md:w-6" />
              </label>
            </div>
            <div className="store-category-menu-body flex min-h-0 flex-1">
              <nav aria-label="Mobile category navigation" className="w-[116px] shrink-0 overflow-y-auto bg-white/85 md:w-[174px] md:pl-[21px]">
                {categories.map(category => <button key={category} type="button" onClick={() => { setMobileCategoryName(category); setMobileCategorySearch(""); }} className={`flex min-h-[57px] w-full items-center px-2.5 text-start text-[12px] leading-4 transition-colors md:min-h-[64px] md:w-[177px] md:px-[18px] md:text-[14px] ${mobileCategoryName === category ? `bg-[#f5f5f5] ${direction === "rtl" ? "font-normal" : "font-medium"} text-[#24272d]` : `${direction === "rtl" ? "font-light" : "font-normal"} text-[#34383f] hover:bg-[#fafafa]`}`}>{headerCategoryLabel(category, language)}</button>)}
              </nav>
              <section aria-label={`${mobileCategoryData?.name ?? "Category"} products`} className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white/85">
                <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-5 md:px-6 md:py-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9ca2aa] md:text-[11px]">Explore</p>
                  <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 md:mt-8 md:gap-x-8 md:gap-y-7 md:pl-[18px]">
                    {visibleMobileCategoryItems.map((item, index) => <a key={item} href={`/category?category=${encodeURIComponent(mobileCategoryData?.name ?? "")}&subcategory=${encodeURIComponent(item)}`} onClick={closeMobileMenu} className="group flex min-w-0 flex-col items-center gap-2 rounded-xl px-2 py-2 text-center text-[#24272d] no-underline transition-colors hover:bg-[#f5f5f5] md:h-[125px] md:w-[124px] md:gap-4">
                      <span className="flex h-[84px] w-full items-center justify-center overflow-hidden rounded-lg bg-transparent transition-transform duration-200 group-hover:scale-[1.04] md:h-[78px] md:w-[98px] md:shrink-0"><img src={getCategoryItemImage(mobileCategoryData?.name ?? "", item, index, mobileCategoryData?.image ?? "")} alt="" className="h-full w-full object-contain mix-blend-multiply md:scale-[1.2]" /></span>
                      <span className={`px-1 text-[11px] leading-4 md:text-[12px] md:leading-5 ${language === "العربية" ? "font-light" : "font-semibold md:font-normal"}`}>{headerSubcategoryLabel(item, language)}</span>
                    </a>)}
                  </div>
                  {visibleMobileCategoryItems.length === 0 && <p className="mt-8 text-center text-xs text-[#8b9199]">No categories found.</p>}
                </div>
              </section>
            </div>
          </aside>
        </div>,
        document.body,
      )}

      <CountryLanguagePanel open={countryPanelOpen} onClose={() => setCountryPanelOpen(false)} country={country} language={language} onSelectLocale={selectLocale} />
      <StoreSearchPanel open={searchOpen} onClose={closeSearch} initialMode={searchAiMode ? "ai" : "search"} isAuthenticated={isAuthenticated} isScrolled={isScrolled} />
      <AccountAuthPanel open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} onSwitchMode={mode => setAuthMode(mode)} onLoginSuccess={() => { setIsAuthenticated(true); window.localStorage.setItem("deraah-store-auth", "signed-in"); setLoginSuccessOpen(true); if (openMobileAccountAfterLogin) { setOpenMobileAccountAfterLogin(false); window.location.assign("/account"); } }} />
      <AccountSuccessToast open={loginSuccessOpen} onClose={() => setLoginSuccessOpen(false)} />
      <FavoriteSuccessToast product={favoriteSuccessProduct} onClose={() => setFavoriteSuccessProduct(null)} onViewFavorites={() => { setFavoriteSuccessProduct(null); setAccountView("favorites"); }} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <AccountEmptyPanel view={accountView} onClose={() => setAccountView(null)} onOpenAuth={mode => { setAccountView(null); setAuthMode(mode); setAuthOpen(true); }} />
      <StoreCartDrawer open={cartDrawerOpen} onClose={closeCart} onPanelMouseEnter={openCart} onPanelMouseLeave={scheduleCartClose} />
    </header>
  );
}
