import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  Gift,
  HelpCircle,
  Medal,
  Sparkles,
  Star,
  TicketPercent,
  TrendingUp,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import TiltedCard from "./TiltedCard";
import MukafaatiJourneyMap from "./MukafaatiJourneyMap";
import { useStoreCart } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";

type TierKey = "basic" | "silver" | "gold" | "diamond";

type Tier = {
  key: TierKey;
  name: string;
  englishName: string;
  threshold: string;
  englishThreshold: string;
  color: string;
  icon: LucideIcon;
};

const tiers: Tier[] = [
  { key: "basic", name: "الأساسية", englishName: "Basic", threshold: "0 نقطة", englishThreshold: "0 points", color: "#a9b2bc", icon: Medal },
  { key: "silver", name: "الفضية", englishName: "Silver", threshold: "1,000 نقطة", englishThreshold: "1,000 points", color: "#8d9aa5", icon: Star },
  { key: "gold", name: "الذهبية", englishName: "Gold", threshold: "2,500 نقطة", englishThreshold: "2,500 points", color: "#c58b2a", icon: Crown },
  { key: "diamond", name: "الماسية", englishName: "Diamond", threshold: "5,000 نقطة", englishThreshold: "5,000 points", color: "#3c9770", icon: Sparkles },
];

const benefitRows = [
  { key: "points", label: "النقاط على المشتريات", englishLabel: "Points on purchases", values: ["1x", "1.2x", "1.5x", "2x"], icon: WalletCards },
  { key: "offers", label: "عروض وقسائم الأعضاء", englishLabel: "Member offers and coupons", values: ["متاحة", "متاحة", "أكثر", "حصرية"], englishValues: ["Available", "Available", "More", "Exclusive"], icon: TicketPercent },
  { key: "gifts", label: "هدايا ومفاجآت موسمية", englishLabel: "Seasonal gifts and surprises", values: ["—", "✓", "✓", "✓"], icon: Gift },
  { key: "support", label: "مزايا وخدمة مميزة", englishLabel: "Priority member care", values: ["—", "—", "✓", "✓"], icon: Star },
] as const;

const faqByTier: Record<TierKey, { ar: Array<{ title: string; body: string }>; en: Array<{ title: string; body: string }> }> = {
  basic: {
    ar: [
      { title: "كيف أبدأ في عضوية مكافآتي؟", body: "سجّل دخولك إلى حساب درعه وابدأ التسوق. ستظهر عضويتك ورصيد نقاطك في هذه الصفحة." },
      { title: "كيف أصل إلى المستوى الفضي؟", body: "استمر في التسوق على المشتريات المؤهلة حتى تصل إلى حد الترقية الموضح في المستوى الفضي." },
    ],
    en: [
      { title: "How do I start with Mukafaati?", body: "Sign in to your Deraah account and start shopping. Your membership and points balance appear here." },
      { title: "How do I reach Silver?", body: "Keep shopping on eligible purchases until you reach the upgrade threshold shown for Silver." },
    ],
  },
  silver: {
    ar: [
      { title: "ما الذي يميز العضوية الفضية؟", body: "تمنحك العضوية الفضية مزايا إضافية على النقاط وعروضاً أوسع من العضوية الأساسية." },
      { title: "كيف أصل إلى الذهبية؟", body: "اجمع نقاطاً أكثر من خلال التسوق والعروض المؤهلة، وتابع شريط التقدم لمعرفة ما تبقى لك." },
    ],
    en: [
      { title: "What makes Silver different?", body: "Silver gives you stronger points benefits and a wider set of offers than Basic." },
      { title: "How do I reach Gold?", body: "Collect more points through eligible shopping and offers, then follow the progress bar." },
    ],
  },
  gold: {
    ar: [
      { title: "ما هي مزايا العضوية الذهبية؟", body: "تستمتع بمضاعف نقاط أعلى، وعروض وقسائم خاصة، ومفاجآت موسمية مخصصة لأعضاء المستوى الذهبي." },
      { title: "كم تبقى لي للوصول إلى الماسية؟", body: "بحسب تقدمك الحالي، تبقى لك 1,500 نقطة. واصل التسوق من المنتجات المؤهلة للوصول إلى المستوى التالي." },
      { title: "كيف أستفيد من القسائم؟", body: "افتح المكافآت المتاحة لك، راجع شروط القسيمة وتاريخ صلاحيتها، ثم استخدمها على الطلب المؤهل." },
    ],
    en: [
      { title: "What are the Gold benefits?", body: "Gold gives you a stronger points multiplier, special offers and seasonal surprises." },
      { title: "How far am I from Diamond?", body: "You have 1,500 points left. Keep shopping eligible products to reach the next tier." },
      { title: "How do I use my coupons?", body: "Review the coupon terms and expiry, then use it on an eligible order." },
    ],
  },
  diamond: {
    ar: [
      { title: "ماذا تقدم العضوية الماسية؟", body: "العضوية الماسية هي أعلى مستوى في رحلة مكافآتي، وتجمع أعلى مضاعف للنقاط مع المزايا والعروض الحصرية." },
      { title: "هل تتغير المزايا خلال المواسم؟", body: "قد تظهر مزايا وحملات خاصة خلال مواسم معينة. راجع تفاصيل كل عرض قبل استخدامه." },
    ],
    en: [
      { title: "What does Diamond offer?", body: "Diamond is the highest Mukafaati tier, combining the strongest points multiplier with exclusive benefits." },
      { title: "Do benefits change during seasons?", body: "Special benefits and campaigns may appear in selected seasons. Review each offer before using it." },
    ],
  },
};

const tierBenefits: Record<TierKey, { ar: string[]; en: string[] }> = {
  basic: { ar: ["رصيد نقاط أساسي", "عروض الأعضاء"], en: ["Basic points balance", "Member offers"] },
  silver: { ar: ["نقاط إضافية", "عروض أوسع", "هدية موسمية"], en: ["Extra points", "Wider offers", "Seasonal gift"] },
  gold: { ar: ["مضاعف نقاط أعلى", "قسائم حصرية", "مفاجآت موسمية"], en: ["Higher points multiplier", "Exclusive coupons", "Seasonal surprises"] },
  diamond: { ar: ["أعلى مضاعف للنقاط", "أولوية في المزايا", "عروض خاصة", "خدمة مميزة"], en: ["Highest points multiplier", "Priority benefits", "Private offers", "Priority care"] },
};

function DirectionArrow({ isArabic, size = 16 }: { isArabic: boolean; size?: number }) {
  return isArabic ? <ArrowLeft size={size} /> : <ArrowRight size={size} />;
}

function TierIcon({ tier, size = 22 }: { tier: Tier; size?: number }) {
  const Icon = tier.icon;
  return <Icon size={size} strokeWidth={1.7} />;
}

export default function MukafaatiPage() {
  const { language, direction } = useStoreLocale();
  const { cartItemCount } = useStoreCart();
  const [selectedTier, setSelectedTier] = useState<TierKey>("gold");
  const [openFaq, setOpenFaq] = useState(0);
  const isArabic = language === "العربية";
  const currentTierIndex = 2;
  const currentTier = tiers[currentTierIndex];
  const selectedTierIndex = tiers.findIndex(tier => tier.key === selectedTier);
  const selectedTierData = tiers[selectedTierIndex];
  const faqItems = isArabic ? faqByTier[selectedTier].ar : faqByTier[selectedTier].en;
  const selectedBenefits = isArabic ? tierBenefits[selectedTier].ar : tierBenefits[selectedTier].en;

  const copy = isArabic
    ? {
        program: "مكافآتي",
        eyebrow: "برنامج الولاء من درعه",
        welcome: "كل طلب يقرّبك من مستوى أكبر",
        welcomeBody: "عضويتك تجمع بين التقدير والمزايا. تابع تقدمك، تسوّق بذكاء، وافتح قيمة أكبر مع كل مرحلة.",
        shop: "ابدأ التسوق",
        member: "العضوية الذهبية",
        points: "نقطة",
        balance: "رصيدك الحالي",
        value: "قيمة الرصيد",
        pending: "نقاط معلقة",
        next: "المتبقي للماسية",
        active: "نشطة الآن",
        ledger: "ملخص عضويتك",
        mapIntro: "خريطة الرحلة",
        levels: "المستويات ومزاياها",
        levelsBody: "قارن المزايا في نظرة واحدة، وحدد المرحلة التي تريد الوصول إليها.",
        here: "أنت هنا",
        benefit: "الميزة",
        journey: "ثلاث خطوات. قيمة أكبر.",
        journeyBody: "رحلة واضحة لا تحتاج إلى شرح طويل: ابدأ، اجمع، ثم استمتع بالمستوى الذي يناسبك.",
        faq: "أسئلة عضويتك",
        faqBody: "اختر مستوى لمعرفة تفاصيل المزايا وطريقة التقدم.",
        details: "تفاصيل المستوى",
        terms: "تطبق الشروط والأحكام على النقاط والقسائم والعروض.",
      }
    : {
        program: "Mukafaati",
        eyebrow: "Deraah loyalty program",
        welcome: "Every order moves you forward",
        welcomeBody: "Your membership combines recognition and value. Track your progress, shop smarter and unlock more at every stage.",
        shop: "Start shopping",
        member: "Gold membership",
        points: "points",
        balance: "Current balance",
        value: "Balance value",
        pending: "Pending points",
        next: "Remaining to Diamond",
        active: "Active now",
        ledger: "Your membership ledger",
        mapIntro: "Journey map",
        levels: "Tiers and benefits",
        levelsBody: "Compare the benefits at a glance and choose the stage you want to reach.",
        here: "You are here",
        benefit: "Benefit",
        journey: "Three steps. More value.",
        journeyBody: "A clear journey that needs no long explanation: start, collect, then enjoy the tier that fits you.",
        faq: "Your membership questions",
        faqBody: "Choose a tier to explore its benefits and upgrade details.",
        details: "Tier details",
        terms: "Terms apply to points, coupons and offers.",
      };

  const steps = isArabic
    ? [
        { number: "01", icon: UserRound, title: "سجّل دخولك", body: "احتفظ بعضويتك ورصيد نقاطك في حساب درعه." },
        { number: "02", icon: Sparkles, title: "تسوّق واجمع", body: "اجمع النقاط من المشتريات المؤهلة والعروض المتاحة." },
        { number: "03", icon: TrendingUp, title: "ارتقِ واستمتع", body: "تقدم بين المراحل وافتح مزايا ومكافآت أكثر." },
      ]
    : [
        { number: "01", icon: UserRound, title: "Sign in", body: "Keep your membership and points balance in your Deraah account." },
        { number: "02", icon: Sparkles, title: "Shop and collect", body: "Collect points from eligible purchases and available offers." },
        { number: "03", icon: TrendingUp, title: "Move up and enjoy", body: "Progress through the tiers and unlock more rewards." },
      ];

  const selectTier = (tierKey: TierKey) => {
    setSelectedTier(tierKey);
    setOpenFaq(0);
  };

  return (
    <div dir={direction} className="mukafaati-editorial-page min-h-screen font-['Poppins',sans-serif]">
      <StoreHeader />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 md:px-8 md:pt-14">
        <section className="mukafaati-editorial-hero" aria-labelledby="mukafaati-editorial-title">
          <div className="mukafaati-editorial-hero__copy">
            <p className="mukafaati-editorial-kicker"><Sparkles size={13} /> {copy.eyebrow}</p>
            <h1 id="mukafaati-editorial-title">{copy.welcome}</h1>
            <p className="mukafaati-editorial-hero__body">{copy.welcomeBody}</p>
            <div className="mukafaati-editorial-hero__meta">
              <span><Crown size={15} /> {copy.member}</span>
              <span><WalletCards size={15} /> {isArabic ? "عضو منذ 2024" : "Member since 2024"}</span>
            </div>
            <a href="/category" className="mukafaati-editorial-button">{copy.shop} <DirectionArrow isArabic={isArabic} /></a>
          </div>
          <div className="mukafaati-editorial-hero__visual" aria-hidden="true">
            <div className="mukafaati-editorial-hero__orbit mukafaati-editorial-hero__orbit--outer" />
            <div className="mukafaati-editorial-hero__orbit mukafaati-editorial-hero__orbit--inner" />
            <span className="mukafaati-editorial-hero__spark mukafaati-editorial-hero__spark--one"><Star size={16} /></span>
            <span className="mukafaati-editorial-hero__spark mukafaati-editorial-hero__spark--two"><Gift size={16} /></span>
            <TiltedCard width={300} height={220} maxTilt={10} scaleOnHover={1.035} ariaLabel={isArabic ? "بطاقة عضوية مكافآتي" : "Mukafaati membership card"} className="mukafaati-editorial-card">
              <div className="mukafaati-editorial-card__surface">
                <div className="mukafaati-editorial-card__top"><span>DERAAH</span><Crown size={18} /></div>
                <p>{copy.member}</p>
                <strong>5,000</strong>
                <span>{copy.points}</span>
                <div className="mukafaati-editorial-card__footer"><span>{isArabic ? "عضو منذ 2024" : "Member since 2024"}</span><span>+429</span></div>
              </div>
            </TiltedCard>
          </div>
        </section>

        <section className="mukafaati-editorial-ledger" aria-labelledby="mukafaati-ledger-title">
          <div className="mukafaati-editorial-ledger__identity"><p className="mukafaati-editorial-kicker">{copy.program}</p><h2 id="mukafaati-ledger-title">{copy.ledger}</h2><span>{copy.active}</span></div>
          <div className="mukafaati-editorial-ledger__progress"><div className="mukafaati-editorial-ledger__progress-head"><span>{copy.member}</span><strong>5,000 / 5,000</strong></div><div className="mukafaati-editorial-rule"><span /></div><div className="mukafaati-editorial-ledger__progress-foot"><span>{copy.balance}</span><span>{copy.next}: 1,500 {copy.points}</span></div></div>
          <div className="mukafaati-editorial-ledger__facts"><div><strong>5,000</strong><span>{copy.points}</span></div><div><strong>100</strong><span>{copy.value}</span></div><div><strong>429</strong><span>{copy.pending}</span></div></div>
        </section>

        <section className="mukafaati-editorial-map-wrap" aria-label={copy.mapIntro}><MukafaatiJourneyMap tiers={tiers} currentTierKey={currentTier.key} selectedTierKey={selectedTier} isArabic={isArabic} onSelect={selectTier} /></section>

        <section className="mukafaati-editorial-levels" aria-labelledby="mukafaati-levels-title">
          <div className="mukafaati-editorial-section-heading"><div><p className="mukafaati-editorial-kicker">{copy.program}</p><h2 id="mukafaati-levels-title">{copy.levels}</h2><p>{copy.levelsBody}</p></div><span><Crown size={14} /> {copy.here}: {isArabic ? currentTier.name : currentTier.englishName}</span></div>
          <div className="mukafaati-editorial-tier-rail">{tiers.map((tier, index) => { const active = selectedTier === tier.key; return <button key={tier.key} type="button" onClick={() => selectTier(tier.key)} className={active ? "is-active" : ""} aria-pressed={active}><span className="mukafaati-editorial-tier-rail__number">0{index + 1}</span><span className="mukafaati-editorial-tier-rail__icon" style={{ color: tier.color }}><TierIcon tier={tier} size={20} /></span><span><strong>{isArabic ? tier.name : tier.englishName}</strong><small>{isArabic ? tier.threshold : tier.englishThreshold}</small></span>{index === currentTierIndex && <em>{copy.here}</em>}</button>; })}</div>
          <div className="mukafaati-editorial-matrix"><div className="mukafaati-editorial-matrix__head"><span>{copy.benefit}</span>{tiers.map(tier => <strong key={tier.key} className={tier.key === currentTier.key ? "is-current" : ""}>{isArabic ? tier.name : tier.englishName}</strong>)}</div>{benefitRows.map(row => { const Icon = row.icon; return <div className="mukafaati-editorial-matrix__row" key={row.key}><span><Icon size={17} />{isArabic ? row.label : row.englishLabel}</span>{row.values.map((value, index) => <strong key={`${row.key}-${index}`} className={index === currentTierIndex ? "is-current" : ""}>{isArabic && "englishValues" in row ? value : "englishValues" in row ? row.englishValues[index] : value}</strong>)}</div>; })}</div>
        </section>

        <section className="mukafaati-editorial-journey" aria-labelledby="mukafaati-journey-title">
          <div className="mukafaati-editorial-journey__statement"><p className="mukafaati-editorial-kicker">{copy.program}</p><h2 id="mukafaati-journey-title">{copy.journey}</h2><p>{copy.journeyBody}</p><a href="/category">{copy.shop} <DirectionArrow isArabic={isArabic} /></a></div>
          <div className="mukafaati-editorial-journey__steps">{steps.map(({ number, icon: Icon, title, body }) => <article key={number}><span>{number}</span><div><Icon size={18} /><h3>{title}</h3><p>{body}</p></div></article>)}</div>
        </section>

        <section className="mukafaati-editorial-faq" aria-labelledby="mukafaati-faq-title"><div className="mukafaati-editorial-section-heading"><div><p className="mukafaati-editorial-kicker">{copy.program}</p><h2 id="mukafaati-faq-title">{copy.faq}</h2><p>{copy.faqBody}</p></div></div><div className="mukafaati-editorial-faq__layout"><aside><span><HelpCircle size={15} /> {copy.details}</span><div><TierIcon tier={selectedTierData} size={30} /><p>{isArabic ? selectedTierData.name : selectedTierData.englishName}</p></div><strong>{isArabic ? selectedTierData.threshold : selectedTierData.englishThreshold}</strong><ul>{selectedBenefits.map(benefit => <li key={benefit}><Check size={14} />{benefit}</li>)}</ul></aside><div className="mukafaati-editorial-faq__content"><nav aria-label={copy.details}>{tiers.map(tier => <button key={tier.key} type="button" onClick={() => selectTier(tier.key)} className={selectedTier === tier.key ? "is-active" : ""}>{isArabic ? tier.name : tier.englishName}</button>)}</nav><div>{faqItems.map((item, index) => { const open = openFaq === index; return <article key={item.title}><button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : index)}><span>{item.title}</span><ChevronDown size={17} /></button>{open && <p>{item.body}</p>}</article>; })}</div></div></div></section>
        <p className="mukafaati-editorial-terms">{copy.terms}</p>
      </main>
      <StoreFooter />
      <div className="md:hidden"><StoreMobileNav collapsed={false} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.location.assign("/account")} onOpenRewards={() => window.scrollTo({ top: 0, behavior: "smooth" })} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
    </div>
  );
}
