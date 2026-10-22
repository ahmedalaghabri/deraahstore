import type { ComponentType } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Camera, Check, ChevronRight, PlayCircle, ClipboardList, CreditCard, Grid2X2, Home, LockKeyhole, Mic, PackageCheck, Route, Search, ShoppingCart, Sparkles, Truck, UserPlus, UserRound, UsersRound } from "lucide-react";

type FlowStep = {
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  tone: string;
};

const journeySteps: FlowStep[] = [
  { title: "ابدأ", description: "الوصول إلى المتجر", icon: PlayCircle, tone: "bg-[#d9f5e8] text-[#16885b]" },
  { title: "تهيئة المستخدم", description: "تجربة ترحيبية بسيطة", icon: UserPlus, tone: "bg-[#e7e2ff] text-[#6354d8]" },
  { title: "الدخول أو التسجيل", description: "مستخدم جديد أو حالي", icon: UsersRound, tone: "bg-[#dcecff] text-[#2873d1]" },
  { title: "الرئيسية", description: "بوابة كل الخدمات", icon: Home, tone: "bg-[#e7e2ff] text-[#6354d8]" },
  { title: "اختيار المنتج", description: "بحث، تصنيفات أو توصيات", icon: Search, tone: "bg-[#dcecff] text-[#2873d1]" },
  { title: "السلة", description: "مراجعة المنتجات والعروض", icon: ShoppingCart, tone: "bg-[#dcecff] text-[#2873d1]" },
  { title: "إتمام الطلب", description: "العنوان والدفع والتأكيد", icon: CreditCard, tone: "bg-[#dcecff] text-[#2873d1]" },
  { title: "تتبع الطلب", description: "حالة الشحن لحظة بلحظة", icon: Route, tone: "bg-[#d9f5e8] text-[#16885b]" },
  { title: "استلام الطلب", description: "تجربة ما بعد الشراء", icon: PackageCheck, tone: "bg-[#d9f5e8] text-[#16885b]" },
];

const discoveryFlows = [
  { title: "البحث", description: "اكتب اسم المنتج ثم راجع نتائج البحث.", icon: Search },
  { title: "الكاميرا", description: "التقط صورة ليتم تحليل المنتج المقترح.", icon: Camera },
  { title: "الصوت", description: "قل اسم المنتج وحوّل الصوت إلى بحث.", icon: Mic },
  { title: "التصنيفات", description: "استكشف العطور، العود، الهدايا والعناية.", icon: Grid2X2 },
  { title: "الطلبات", description: "راجع الطلبات السابقة والحالية.", icon: ClipboardList },
  { title: "الملف الشخصي", description: "العناوين، المفضلة والإعدادات.", icon: UserRound },
];

const purchaseSteps = [
  { title: "تفاصيل المنتج", description: "الصور، المقاسات، السعر والمراجعات." },
  { title: "إضافة إلى السلة", description: "تحديد الكمية والعروض المتاحة." },
  { title: "مراجعة السلة", description: "عدد المنتجات، الإجمالي والعينة المجانية." },
  { title: "اختيار العنوان", description: "العنوان الأخير أو عنوان محفوظ أو جديد." },
  { title: "طريقة الشحن", description: "Redbox أو الشحن العادي." },
  { title: "طريقة الدفع", description: "بطاقة، Apple Pay أو الدفع عند الاستلام." },
  { title: "تأكيد الطلب", description: "مراجعة نهائية ثم تنفيذ الطلب." },
];

const plannedPages = [
  { title: "الرئيسية", label: "Home", description: "العروض، التصنيفات والمنتجات المقترحة.", icon: Home, href: "/" },
  { title: "المنتجات والتصنيفات", label: "Discovery", description: "البحث، الكاميرا، الصوت والتصفية.", icon: Search, href: "/product-details" },
  { title: "تفاصيل المنتج", label: "Product details", description: "اختيار المنتج والمقاس والإضافة للسلة.", icon: Sparkles, href: "/product-details#details" },
  { title: "السلة", label: "Cart", description: "العروض، العينات، الكوبونات والإجمالي.", icon: ShoppingCart, href: "/product-details#cart" },
  { title: "الدفع", label: "Checkout", description: "العنوان، الشحن، الدفع وتأكيد الطلب.", icon: CreditCard, href: "/checkout" },
  { title: "تتبع الطلب", label: "Order tracking", description: "الخط الزمني للشحن والتحديثات.", icon: Truck, href: "#tracking" },
  { title: "الحساب", label: "Profile", description: "الملف الشخصي والعناوين والمفضلة.", icon: UserRound, href: "#profile" },
  { title: "تسجيل الدخول", label: "Auth", description: "تسجيل جديد أو دخول المستخدم الحالي.", icon: LockKeyhole, href: "#auth" },
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="max-w-2xl"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-[#16885b]">{eyebrow}</p><h2 className="text-2xl font-semibold tracking-[-.03em] text-[#18202a] sm:text-3xl">{title}</h2><p className="mt-4 text-sm leading-7 text-[#687381]">{description}</p></div>;
}

export default function UserFlowPage() {
  return <div dir="rtl" className="min-h-screen bg-[#f6f9ff] text-[#18202a]">
    <header className="border-b border-[#e5eaf1] bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between gap-5 px-5 sm:h-[88px] sm:px-8">
        <a href="/" aria-label="العودة إلى الرئيسية" className="shrink-0"><img src="/product-assets/deraah-wordmark.svg" alt="DERAAH" className="h-9 w-[118px] object-contain" /></a>
        <nav className="hidden items-center gap-7 text-xs font-medium text-[#44505d] md:flex"><a href="/" className="transition-colors hover:text-[#16885b]">الرئيسية</a><a href="/product-details" className="transition-colors hover:text-[#16885b]">المنتجات</a><a href="/checkout" className="transition-colors hover:text-[#16885b]">الدفع</a><a href="/user-flow" className="font-semibold text-[#16885b]">تتبع المستخدم</a></nav>
        <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#44505d] transition-colors hover:text-[#16885b]"><ArrowRight size={16} /> العودة للمتجر</a>
      </div>
    </header>

    <main>
      <section className="overflow-hidden border-b border-[#e4ebf2] bg-[linear-gradient(135deg,#eefaff_0%,#f6f0ff_55%,#f4fff8_100%)] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#16885b] shadow-sm"><Route size={14} /> User journey map</div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-[-.05em] text-[#14202c] sm:text-6xl">تتبع المستخدم من أول زيارة حتى استلام الطلب</h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#5f6d7b] sm:text-base">خريطة موحدة لتجربة متجر Deraah الإلكتروني، مصممة لتوضح كل صفحة وكل قرار يمر به العميل على الويب والجوال.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#journey" className="inline-flex items-center gap-2 rounded-full bg-[#16885b] px-5 py-3 text-xs font-semibold text-white no-underline shadow-[0_10px_25px_rgba(22,136,91,.18)] transition hover:bg-[#106c48]">استعرض الرحلة <ArrowLeft size={15} /></a><a href="#pages" className="inline-flex items-center gap-2 rounded-full border border-[#cfd9e5] bg-white/70 px-5 py-3 text-xs font-semibold text-[#344250] no-underline transition hover:border-[#16885b]">كل الصفحات <ChevronRight size={15} /></a></div>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_24px_70px_rgba(61,83,120,.12)] backdrop-blur sm:p-7">
            <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#16885b]">Journey overview</p><h2 className="mt-2 text-xl font-semibold">تجربة متصلة وواضحة</h2></div><BadgeCheck className="text-[#16885b]" size={30} /></div>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3"><div className="rounded-2xl bg-[#eef7ff] p-3"><strong className="block text-2xl font-semibold text-[#2873d1]">09</strong><span className="mt-1 block text-[10px] text-[#687381]">مراحل رئيسية</span></div><div className="rounded-2xl bg-[#f2efff] p-3"><strong className="block text-2xl font-semibold text-[#6354d8]">08</strong><span className="mt-1 block text-[10px] text-[#687381]">صفحات أساسية</span></div><div className="rounded-2xl bg-[#edf9f2] p-3"><strong className="block text-2xl font-semibold text-[#16885b]">02</strong><span className="mt-1 block text-[10px] text-[#687381]">نسخ متجاوبة</span></div></div>
            <div className="mt-6 rounded-2xl bg-[#f8fbff] p-4"><div className="flex items-center justify-between text-[11px] font-semibold text-[#536171]"><span>الرحلة الأساسية</span><span className="text-[#16885b]">Start → End</span></div><div className="mt-4 flex items-center gap-1">{journeySteps.map((step, index) => <div key={step.title} className="flex min-w-0 flex-1 items-center gap-1"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${step.tone}`}><step.icon size={14} /></span>{index < journeySteps.length - 1 && <span className="h-px min-w-1 flex-1 bg-[#cbd8e5]" />}</div>)}</div></div>
          </div>
        </div>
      </section>

      <section id="journey" className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20"><SectionHeading eyebrow="01 · Main flow" title="المسار الرئيسي للمستخدم" description="كل مرحلة لها هدف واضح، وحالة نجاح، وانتقال منطقي إلى الخطوة التالية. على الجوال تتحول الخريطة إلى خط زمني رأسي سهل التصفح." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{journeySteps.map((step, index) => <article key={step.title} className="relative rounded-2xl border border-[#e1e8f0] bg-white p-5 shadow-[0_8px_25px_rgba(55,77,110,.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(55,77,110,.10)]"><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${step.tone}`}><step.icon size={21} /></span><span className="text-2xl font-semibold text-[#dce4ed]">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-5 text-base font-semibold">{step.title}</h3><p className="mt-2 text-xs leading-6 text-[#71808e]">{step.description}</p>{index < journeySteps.length - 1 && <div className="mt-5 hidden items-center gap-2 text-[10px] font-semibold text-[#16885b] lg:flex"><span>الخطوة التالية</span><ArrowLeft size={13} /></div>}</article>)}</div></section>

      <section className="border-y border-[#e5ebf2] bg-white px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1240px]"><SectionHeading eyebrow="02 · Entry & discovery" title="كيف يصل المستخدم إلى المنتج؟" description="تعدد نقاط الدخول يضمن تجربة مرنة: بحث مباشر، صورة، صوت، تصفح التصنيفات، أو العودة إلى طلب سابق." /><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{discoveryFlows.map(flow => <div key={flow.title} className="flex items-start gap-4 rounded-2xl bg-[#f7faff] p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dcecff] text-[#2873d1]"><flow.icon size={19} /></span><div><h3 className="text-sm font-semibold">{flow.title}</h3><p className="mt-2 text-xs leading-6 text-[#71808e]">{flow.description}</p></div></div>)}</div></div></section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><SectionHeading eyebrow="03 · Purchase flow" title="من المنتج إلى الطلب المؤكد" description="مسار شراء مختصر وواضح، مع إبقاء العنوان والشحن والدفع قابلين للتعديل في كل لحظة." /><div className="mt-7 rounded-2xl bg-[#18202a] p-5 text-white sm:p-6"><div className="flex items-center gap-3"><Truck className="text-[#8de1b8]" size={23} /><strong className="text-sm">تجربة الدفع</strong></div><p className="mt-3 text-xs leading-6 text-white/65">Redbox أو الشحن العادي، ثم تحديد طريقة الدفع، ثم تأكيد الطلب وتتبع الشحنة.</p></div></div><div className="relative space-y-3 lg:pt-2">{purchaseSteps.map((step, index) => <div key={step.title} className="relative flex items-start gap-4 rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-[0_6px_18px_rgba(55,77,110,.04)]"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7f7ee] text-xs font-semibold text-[#16885b]">{index + 1}</span><div><h3 className="text-sm font-semibold">{step.title}</h3><p className="mt-1 text-xs leading-5 text-[#71808e]">{step.description}</p></div>{index < purchaseSteps.length - 1 && <span className="absolute -bottom-3 right-7 z-10 grid h-5 w-5 place-items-center rounded-full border border-[#e1e8f0] bg-white text-[#16885b]"><ChevronRight size={12} className="rotate-90" /></span>}</div>)}</div></div></section>

      <section id="pages" className="border-y border-[#e5ebf2] bg-[#f8fbff] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1240px]"><SectionHeading eyebrow="04 · Product map" title="الصفحات التي تشكل المتجر المتكامل" description="هذه هي الوحدات الأساسية التي سنبنيها ونربطها بنفس الرحلة، مع واجهة مناسبة للشاشات الكبيرة والجوال." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{plannedPages.map(page => <a key={page.label} href={page.href} className="group rounded-2xl border border-[#e1e8f0] bg-white p-5 no-underline transition hover:-translate-y-1 hover:border-[#8ed5b0] hover:shadow-[0_14px_32px_rgba(55,77,110,.08)]"><div className="flex items-center justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f7ee] text-[#16885b]"><page.icon size={19} /></span><ArrowLeft size={15} className="text-[#a4b0bc] transition group-hover:-translate-x-1 group-hover:text-[#16885b]" /></div><h3 className="mt-5 text-sm font-semibold text-[#18202a]">{page.title}</h3><p className="mt-1 text-[10px] font-medium uppercase tracking-[.12em] text-[#98a4b1]">{page.label}</p><p className="mt-3 text-xs leading-6 text-[#71808e]">{page.description}</p></a>)}</div></div></section>

      <section id="tracking" className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20"><div className="rounded-[28px] bg-[#e7f7ee] p-6 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10"><div><p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-[#16885b]">05 · After purchase</p><h2 className="text-2xl font-semibold tracking-[-.03em] text-[#18202a] sm:text-3xl">تجربة ما بعد الطلب لا تنتهي عند الدفع</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6d68]">صفحة التتبع تعرض حالة الطلب، العنوان، شركة الشحن، الوقت المتوقع، والتنبيهات حتى الاستلام، مع إمكانية العودة إلى الدعم أو إعادة الطلب.</p></div><div className="mt-7 grid shrink-0 gap-2 sm:grid-cols-3 lg:mt-0 lg:w-[390px]"><div className="rounded-2xl bg-white/80 p-4 text-center"><Check className="mx-auto text-[#16885b]" size={20} /><span className="mt-2 block text-[10px] font-semibold">تم التأكيد</span></div><div className="rounded-2xl bg-white/80 p-4 text-center"><Truck className="mx-auto text-[#16885b]" size={20} /><span className="mt-2 block text-[10px] font-semibold">قيد الشحن</span></div><div className="rounded-2xl bg-white/80 p-4 text-center"><PackageCheck className="mx-auto text-[#16885b]" size={20} /><span className="mt-2 block text-[10px] font-semibold">تم الاستلام</span></div></div></div></section>
    </main>

    <footer className="bg-[#111820] px-5 pb-8 pt-14 text-white sm:px-8 lg:px-12"><div className="mx-auto grid max-w-[1240px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr_1fr]"><div><img src="/product-assets/deraah-wordmark.svg" alt="DERAAH" className="h-9 w-[112px] brightness-0 invert" /><p className="mt-5 max-w-[270px] text-xs leading-6 text-white/60">خريطة تجربة المستخدم لمتجر Deraah الإلكتروني، من أول زيارة حتى استلام الطلب.</p></div><div><h3 className="text-sm font-semibold">روابط المتجر</h3><nav className="mt-5 space-y-3 text-xs text-white/65"><a href="/" className="block hover:text-white">الرئيسية</a><a href="/product-details" className="block hover:text-white">المنتجات</a><a href="/checkout" className="block hover:text-white">الدفع</a><a href="/user-flow" className="block font-semibold text-[#8de1b8]">تتبع المستخدم</a></nav></div><div><h3 className="text-sm font-semibold">مراحل الرحلة</h3><nav className="mt-5 space-y-3 text-xs text-white/65"><a href="#journey" className="block hover:text-white">المسار الرئيسي</a><a href="#pages" className="block hover:text-white">خريطة الصفحات</a><a href="#tracking" className="block hover:text-white">ما بعد الطلب</a></nav></div><div><h3 className="text-sm font-semibold">جاهز للخطوة التالية؟</h3><p className="mt-4 text-xs leading-6 text-white/60">ابدأ من الرئيسية أو انتقل مباشرة إلى الدفع لمراجعة التجربة.</p><a href="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#8de1b8] px-4 py-2.5 text-xs font-semibold text-[#10241a] no-underline">العودة للمتجر <ArrowRight size={14} /></a></div></div><div className="mx-auto mt-12 flex max-w-[1240px] flex-col gap-3 border-t border-white/15 pt-5 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Deraah. All rights reserved.</span><span>Web · Mobile · Responsive journey</span></div></footer>
  </div>;
}
