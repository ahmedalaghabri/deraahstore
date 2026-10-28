import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Crown, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";

export type JourneyMapTier = {
  key: string;
  name: string;
  englishName: string;
  threshold: string;
  englishThreshold: string;
  marker: string;
  color: string;
  icon: LucideIcon;
};

type MukafaatiJourneyMapProps = {
  tiers: JourneyMapTier[];
  currentTierKey: string;
  selectedTierKey: string;
  isArabic: boolean;
  onSelect: (key: string) => void;
};

const copy = {
  ar: {
    eyebrow: "خريطة رحلتك",
    title: "كل مرحلة تفتح لك مستوى جديداً من الاهتمام",
    body: "استكشف المستويات، شاهد موقعك الحالي، وخطط للخطوة التي ستصنع الفرق في تجربتك القادمة.",
    current: "أنت هنا",
    next: "الخطوة التالية",
    progress: "التقدم الحالي",
    points: "نقطة",
    remaining: "متبقٍ للوصول",
    explore: "استكشف المستوى",
    active: "عضويتك الحالية",
    unlock: "مزايا جديدة تفتح مع كل خطوة",
  },
  en: {
    eyebrow: "Your journey map",
    title: "Every stage opens a new level of care",
    body: "Explore every tier, see where you are today, and plan the next move that shapes your experience.",
    current: "You are here",
    next: "Next step",
    progress: "Current progress",
    points: "points",
    remaining: "remaining to unlock",
    explore: "Explore tier",
    active: "Your current tier",
    unlock: "More benefits unlock with every step",
  },
};

export default function MukafaatiJourneyMap({ tiers, currentTierKey, selectedTierKey, isArabic, onSelect }: MukafaatiJourneyMapProps) {
  const reduced = useReducedMotion();
  const text = isArabic ? copy.ar : copy.en;
  const currentIndex = Math.max(0, tiers.findIndex(tier => tier.key === currentTierKey));
  const selectedIndex = Math.max(0, tiers.findIndex(tier => tier.key === selectedTierKey));
  const selected = tiers[selectedIndex];
  const next = tiers[Math.min(tiers.length - 1, currentIndex + 1)];
  const fill = `${Math.max(18, (currentIndex / Math.max(1, tiers.length - 1)) * 100)}%`;

  return (
    <section className="mukafaati-journey-map relative overflow-hidden rounded-[32px] border border-[#263c33] p-6 text-white shadow-[0_24px_64px_rgba(18,46,34,.18)] md:p-9" aria-label={text.eyebrow}>
      <div className="mukafaati-journey-map__glow mukafaati-journey-map__glow--rose" aria-hidden="true" />
      <div className="mukafaati-journey-map__glow mukafaati-journey-map__glow--green" aria-hidden="true" />
      <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div className="max-w-[650px]">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#c8f0d2]"><Sparkles size={14} /> {text.eyebrow}</span>
          <h2 className="mt-4 max-w-[600px] text-[27px] font-semibold leading-[1.2] tracking-[-.05em] md:text-[38px]">{text.title}</h2>
          <p className="mt-4 max-w-[590px] text-sm leading-6 text-white/60">{text.body}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.07] px-4 py-3 backdrop-blur-md"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#efc95e] text-[#262015]"><Crown size={19} /></span><div><p className="text-[10px] text-white/50">{text.active}</p><p className="mt-1 text-sm font-semibold">{isArabic ? tiers[currentIndex].name : tiers[currentIndex].englishName}</p></div></div>
      </div>

      <div className="relative z-10 mt-10">
        <div className="absolute start-[8%] end-[8%] top-[31px] hidden h-px bg-white/15 sm:block" />
        <motion.div className="absolute start-[8%] top-[30px] hidden h-[3px] rounded-full bg-gradient-to-l from-[#efc95e] to-[#2c8b4b] sm:block" initial={{ width: 0 }} animate={{ width: fill }} transition={{ duration: reduced ? 0 : 1.15, ease: [.22, 1, .36, 1] }} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrent = tier.key === currentTierKey;
            const isSelected = tier.key === selectedTierKey;
            const reached = index <= currentIndex;
            return <motion.button key={tier.key} type="button" onClick={() => onSelect(tier.key)} whileHover={reduced ? undefined : { y: -7 }} whileTap={reduced ? undefined : { scale: .98 }} transition={{ type: "spring", stiffness: 310, damping: 21 }} className={`group relative rounded-[22px] border p-4 text-start transition-colors sm:p-5 ${isSelected ? "border-white/55 bg-white/[.14]" : "border-white/10 bg-white/[.045] hover:bg-white/[.09]"}`} aria-pressed={isSelected}>
              <div className="flex items-start justify-between gap-3"><span style={{ color: tier.color }} className={`grid h-12 w-12 place-items-center rounded-2xl ${reached ? "bg-white" : "bg-white/[.08]"}`}><Icon size={22} strokeWidth={1.7} /></span>{isCurrent && <span className="rounded-full bg-[#2c8b4b] px-2 py-1 text-[9px] font-semibold text-white">{text.current}</span>}</div>
              <p className="mt-5 text-sm font-semibold">{isArabic ? tier.name : tier.englishName}</p>
              <p className="mt-1 text-[10px] text-white/45">{isArabic ? tier.threshold : tier.englishThreshold}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/45"><span>{reached ? <Check size={14} className="text-[#c8f0d2]" /> : index + 1}</span><span style={{ backgroundColor: tier.color }} className="h-2.5 w-2.5 rounded-full" /></div>
            </motion.button>;
          })}
        </div>
      </div>

      <div className="relative z-10 mt-7 grid gap-3 border-t border-white/10 pt-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex items-center justify-between gap-4"><span className="text-[10px] uppercase tracking-[.15em] text-white/45">{text.progress}</span><span className="text-xs font-semibold text-[#efc95e]">{currentIndex + 1}/{tiers.length}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-l from-[#efc95e] to-[#2c8b4b]" initial={{ width: 0 }} animate={{ width: fill }} transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : .1, ease: [.22, 1, .36, 1] }} /></div></div><div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[.07] px-4 py-3 md:min-w-[290px]"><div><p className="text-[10px] text-white/45">{text.next}</p><p className="mt-1 text-sm font-semibold">{isArabic ? next.name : next.englishName}</p></div><div className="text-end"><p className="text-[10px] text-white/45">{selected.key === currentTierKey ? text.unlock : text.explore}</p><p className="mt-1 text-xs font-semibold text-[#c8f0d2]">{isArabic ? selected.name : selected.englishName} <span className="inline-block align-middle">{isArabic ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}</span></p></div></div></div>
    </section>
  );
}
