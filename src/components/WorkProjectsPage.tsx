import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Gift,
  Layers3,
  MapPin,
  PackageCheck,
  Palette,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  UsersRound,
} from "lucide-react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";
import "./WorkProjectsPage.css";

type LocaleCopy = { ar: string; en: string };
type ProjectStatus = "active" | "planned" | "ready";
type ProjectFilter = "all" | ProjectStatus;

type StoreSurface = {
  path: LocaleCopy;
  title: LocaleCopy;
  detail: LocaleCopy;
  project: string;
};

type WorkTask = {
  id: string;
  step: string;
  title: LocaleCopy;
  team: LocaleCopy;
  phase: LocaleCopy;
  done?: boolean;
};

type WorkProject = {
  id: string;
  number: string;
  title: LocaleCopy;
  eyebrow: LocaleCopy;
  summary: LocaleCopy;
  route: LocaleCopy;
  status: ProjectStatus;
  priority: LocaleCopy;
  icon: LucideIcon;
  accent: string;
  features: LocaleCopy[];
  teams: LocaleCopy[];
  tasks: WorkTask[];
};

const storeSurfaces: StoreSurface[] = [
  { path: { ar: "/", en: "/" }, title: { ar: "الرئيسية", en: "Store home" }, detail: { ar: "البطل، العروض، التصنيفات، المنتجات الجديدة، الإلهام", en: "Hero, offers, categories, new arrivals and inspiration" }, project: "store-home" },
  { path: { ar: "/search", en: "/search" }, title: { ar: "محرك البحث", en: "Search engine" }, detail: { ar: "الاقتراحات، المرادفات، النتائج، الفلاتر وحالة عدم النتائج", en: "Suggestions, synonyms, results, filters and no-results state" }, project: "store-foundation" },
  { path: { ar: "/ask-ai", en: "/ask-ai" }, title: { ar: "المساعد الذكي «اسأل AI»", en: "Ask AI assistant" }, detail: { ar: "أسئلة العميل، الإجابات، الإحالة للمنتج وقياس النتيجة", en: "Customer questions, answers, product handoff and outcome measurement" }, project: "store-foundation" },
  { path: { ar: "/enjoy", en: "/enjoy" }, title: { ar: "صفحة Enjoy", en: "Enjoy landing" }, detail: { ar: "صفحة حملة بمنتج واحد ودعوة شراء مباشرة", en: "Campaign landing with a focused product CTA" }, project: "campaign-landing" },
  { path: { ar: "/blog | /journal", en: "/blog | /journal" }, title: { ar: "المدونة", en: "Journal" }, detail: { ar: "قائمة القصص، التصنيفات، والتنقل بين المقالات", en: "Story index, categories and article navigation" }, project: "journal-content" },
  { path: { ar: "/blog/:slug | /journal/:slug", en: "/blog/:slug | /journal/:slug" }, title: { ar: "المقال", en: "Article" }, detail: { ar: "قراءة، مشاركة، قصص ذات صلة، والمقال التالي", en: "Reading, sharing, related stories and the next article" }, project: "journal-content" },
  { path: { ar: "/category | /clp", en: "/category | /clp" }, title: { ar: "التصنيفات", en: "Categories" }, detail: { ar: "التصنيف، الفئات الفرعية، الفلاتر، الفرز والمنتجات", en: "Category, subcategories, filters, sorting and products" }, project: "category-discovery" },
  { path: { ar: "/product-details", en: "/product-details" }, title: { ar: "تفاصيل المنتج", en: "Product details" }, detail: { ar: "الصور، المتغيرات، الهدايا، المفضلة، السلة والتوصيات", en: "Gallery, variants, gifts, favorites, cart and recommendations" }, project: "product-decision" },
  { path: { ar: "/gifts", en: "/gifts" }, title: { ar: "الهدايا", en: "Gifts" }, detail: { ar: "اختيار المناسبة، المنتج، التغليف والرسالة", en: "Occasion, product, wrapping and message selection" }, project: "gifting" },
  { path: { ar: "/gifts/cards", en: "/gifts/cards" }, title: { ar: "بطاقات درعه جيفت", en: "Deraah Gift cards" }, detail: { ar: "القيمة، الرابط، QR، الاسترداد والبطاقة داخل الهدية", en: "Value, link, QR, redemption and gift-card experience" }, project: "gifting" },
  { path: { ar: "/checkout | /cart", en: "/checkout | /cart" }, title: { ar: "السلة", en: "Cart" }, detail: { ar: "الكميات، الحذف، 1+2، العينات، الكوبونات وإتمام الطلب", en: "Quantity, removal, 1+2, samples, coupons and checkout" }, project: "cart-incentives" },
  { path: { ar: "/account | /my-account", en: "/account | /my-account" }, title: { ar: "الحساب", en: "Account" }, detail: { ar: "الملف، الطلبات، المفضلة، العناوين واللغة", en: "Profile, orders, favorites, addresses and locale" }, project: "account" },
  { path: { ar: "/mukafaati | /rewards", en: "/mukafaati | /rewards" }, title: { ar: "مكافآتي", en: "Mukafaati" }, detail: { ar: "الرصيد، المستويات، المزايا ورحلة الترقية", en: "Balance, tiers, benefits and progression" }, project: "loyalty" },
  { path: { ar: "/shipping-payment", en: "/shipping-payment" }, title: { ar: "التوصيل والدفع", en: "Shipping & payment" }, detail: { ar: "العنوان أو الفرع، الموعد، طريقة الدفع وملخص الطلب", en: "Address or branch, timing, payment and order summary" }, project: "shipping-payment" },
  { path: { ar: "/payment-link", en: "/payment-link" }, title: { ar: "رابط الدفع المشترك", en: "Shared payment link" }, detail: { ar: "مشاركة السلة أو رابط الدفع ليكمل شخص آخر العملية", en: "Share a cart or payment link so someone else can complete the order" }, project: "payment-summary" },
  { path: { ar: "/payment-summary", en: "/payment-summary" }, title: { ar: "تأكيد الطلب", en: "Order confirmation" }, detail: { ar: "حالة الطلب، تفاصيل الاستلام، المبلغ والمدفوعات", en: "Order status, receiving details, totals and payment" }, project: "order-follow-up" },
];

const projects: WorkProject[] = [
  {
    id: "store-foundation",
    number: "01",
    title: { ar: "واجهة المتجر والتنقل المشترك", en: "Store shell & navigation" },
    eyebrow: { ar: "نقطة الدخول", en: "Entry point" },
    summary: { ar: "تثبيت الأساس الذي يرافق العميل في كل صفحة: الهوية، التنقل، البحث، اللغة، الدولة، الجوال والمساعدة.", en: "Stabilize the shared foundation that follows customers everywhere: identity, navigation, search, locale, mobile and help." },
    route: { ar: "كل صفحات المتجر", en: "All store pages" },
    status: "active",
    priority: { ar: "يبدأ قبل بقية الرحلة", en: "Starts before the rest of the journey" },
    icon: Layers3,
    accent: "ink",
    features: [
      { ar: "الرأس والهوية والتنقل الرئيسي", en: "Header, identity and primary navigation" },
      { ar: "محرك البحث: الاقتراحات، المرادفات، النتائج وعدم وجود نتائج", en: "Search engine: suggestions, synonyms, results and no-results states" },
      { ar: "المساعد الذكي «اسأل AI» داخل رحلة الاكتشاف", en: "Ask AI assistant inside the discovery journey" },
      { ar: "البحث وقائمة التصنيفات", en: "Search and category menu" },
      { ar: "اختيار الدولة واللغة وRTL", en: "Country, language and RTL" },
      { ar: "تنقل الجوال والسلة والحساب", en: "Mobile nav, cart and account" },
      { ar: "الفوتر، المساعدة والروابط العامة", en: "Footer, help and utility links" },
    ],
    teams: [{ ar: "المنتج", en: "Product" }, { ar: "التصميم", en: "Design" }, { ar: "المحتوى", en: "Content" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "foundation-scope", step: "01", title: { ar: "اعتماد خريطة الأسطح المشتركة ونقاط الدخول", en: "Approve the shared surface map and entry points" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "foundation-design", step: "02", title: { ar: "توحيد حالات الرأس والبحث والقائمة والتنقل السفلي", en: "Unify header, search, menu and bottom-navigation states" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" }, done: true },
      { id: "foundation-search", step: "03", title: { ar: "تجهيز قاموس البحث والمرادفات والاقتراحات وربط نوايا العميل", en: "Prepare search vocabulary, synonyms, suggestions and customer intents" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "تجهيز", en: "Prepare" } },
      { id: "foundation-build", step: "04", title: { ar: "تنفيذ محرك البحث والنتائج والحالات الفارغة مع الحالة المشتركة", en: "Build search, results and empty states with shared store state" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "foundation-ai", step: "05", title: { ar: "ربط «اسأل AI» بمصادر المنتجات والتصنيفات والمقالات مع إحالة قابلة للقياس", en: "Connect Ask AI to products, categories and journal sources with measurable handoffs" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "foundation-locale", step: "06", title: { ar: "تجهيز اللغات الإضافية ومنها البنغالية مع اتجاهات النص والبحث", en: "Prepare additional locales including Bengali with locale-aware text and search" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "توطين", en: "Localize" } },
      { id: "foundation-qa", step: "07", title: { ar: "اختبار الروابط والعودة والبحث وAsk AI والسلة والجوال وRTL", en: "Test links, back navigation, search, Ask AI, cart, mobile and RTL" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "store-home",
    number: "02",
    title: { ar: "الرئيسية واكتشاف المتجر", en: "Home discovery" },
    eyebrow: { ar: "أول انطباع", en: "First impression" },
    summary: { ar: "تحويل الصفحة الرئيسية من عرض بصري إلى نقطة توزيع واضحة تقود العميل إلى المنتجات والتصنيفات والهدايا والمحتوى.", en: "Turn the home page from a visual showcase into a clear distribution point for products, categories, gifts and content." },
    route: { ar: "/", en: "/" },
    status: "active",
    priority: { ar: "أولوية رحلة الاكتشاف", en: "Discovery priority" },
    icon: Sparkles,
    accent: "lilac",
    features: [
      { ar: "البطل والعروض الموسمية", en: "Hero and seasonal offers" },
      { ar: "العروض والكوبونات وفتح درج العروض", en: "Offers, coupons and offer drawer" },
      { ar: "التسوق حسب التصنيف والمزاج", en: "Shop by category and mood" },
      { ar: "الوصولات الجديدة والتوصيات والمشاهدة الأخيرة", en: "New arrivals, recommendations and recently viewed" },
      { ar: "مرشد العطر ومختبر العطور", en: "Fragrance finder and fragrance lab" },
    ],
    teams: [{ ar: "التجارة", en: "Merchandising" }, { ar: "المحتوى", en: "Content" }, { ar: "النمو", en: "Growth" }, { ar: "التقنية", en: "Engineering" }],
    tasks: [
      { id: "home-journey", step: "01", title: { ar: "ترتيب وحدات الصفحة حسب قرار العميل من الإلهام إلى المنتج", en: "Order home modules around the customer decision from inspiration to product" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "home-merch", step: "02", title: { ar: "تجهيز المنتجات والعروض والتصنيفات ومحتوى المزاج", en: "Prepare products, offers, categories and mood content" }, team: { ar: "التجارة", en: "Merchandising" }, phase: { ar: "تجهيز", en: "Prepare" }, done: true },
      { id: "home-content", step: "03", title: { ar: "كتابة الرسائل والنداءات وربط كل وحدة بالوجهة الصحيحة", en: "Write messages and CTAs and link every module to the right destination" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "محتوى", en: "Content" } },
      { id: "home-build", step: "04", title: { ar: "تنفيذ الوحدات التفاعلية والشرائح والإضافة السريعة للسلة", en: "Build interactive modules, rails and quick add-to-cart" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "home-measure", step: "05", title: { ar: "قياس النقرات والانتقال من الصفحة الرئيسية إلى التصنيف أو المنتج", en: "Measure clicks and movement from home to category or product" }, team: { ar: "النمو", en: "Growth" }, phase: { ar: "قياس", en: "Measure" } },
    ],
  },
  {
    id: "campaign-landing",
    number: "03",
    title: { ar: "صفحات الحملات والمنتج المميز", en: "Campaign landing pages" },
    eyebrow: { ar: "مسار مختصر", en: "Focused path" },
    summary: { ar: "ضبط صفحة Enjoy كمسار مستقل يختصر التردد ويقود العميل من القصة إلى تفاصيل المنتج ثم الشراء.", en: "Shape Enjoy as a focused path that moves customers from story to product detail and purchase." },
    route: { ar: "/enjoy", en: "/enjoy" },
    status: "ready",
    priority: { ar: "مراجعة قبل الإطلاق", en: "Pre-launch review" },
    icon: ShoppingBag,
    accent: "rose",
    features: [
      { ar: "قصة المنتج والمشهد البطولي", en: "Product story and hero scene" },
      { ar: "تفاصيل مختصرة ومزايا واضحة", en: "Short details and clear benefits" },
      { ar: "زر الشراء على سطح المكتب والجوال", en: "Desktop and mobile purchase CTA" },
      { ar: "الانتقال إلى تفاصيل المنتج والسلة", en: "Handoff to product details and cart" },
    ],
    teams: [{ ar: "التسويق", en: "Marketing" }, { ar: "المحتوى", en: "Content" }, { ar: "التصميم", en: "Design" }, { ar: "التقنية", en: "Engineering" }],
    tasks: [
      { id: "campaign-brief", step: "01", title: { ar: "تحديد هدف الحملة والمنتج والجمهور والرسالة الأساسية", en: "Define campaign goal, product, audience and core message" }, team: { ar: "التسويق", en: "Marketing" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "campaign-copy", step: "02", title: { ar: "إخراج القصة والمزايا والنصوص القصيرة للشراء", en: "Produce the story, benefits and short purchase copy" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "محتوى", en: "Content" } },
      { id: "campaign-ui", step: "03", title: { ar: "تصميم التسلسل البصري ونقطة الإجراء للجوال", en: "Design the visual sequence and mobile action point" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "campaign-release", step: "04", title: { ar: "ربط الزر بالمنتج والسلة وفحص تجربة الشراء كاملة", en: "Connect CTA to product and cart and test the full purchase path" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "إطلاق", en: "Release" } },
    ],
  },
  {
    id: "journal-content",
    number: "04",
    title: { ar: "المدونة والمقالات والإلهام", en: "Journal & editorial content" },
    eyebrow: { ar: "اكتشاف ومساعدة", en: "Discover & guide" },
    summary: { ar: "تنظيم المدونة كقناة تكتشف من خلالها العميلة العطور والطقوس والهدايا، ثم تعود بسهولة إلى المنتجات.", en: "Make the journal a discovery channel for fragrance, rituals and gifting that always leads back to products." },
    route: { ar: "/blog و /blog/:slug", en: "/blog and /blog/:slug" },
    status: "planned",
    priority: { ar: "يبني الثقة قبل القرار", en: "Builds confidence before choice" },
    icon: ClipboardCheck,
    accent: "gold",
    features: [
      { ar: "قائمة القصص والتصنيفات", en: "Story index and categories" },
      { ar: "صفحة المقال والوقت المتوقع للقراءة", en: "Article page and read time" },
      { ar: "مشاركة المقال والمقال التالي", en: "Article sharing and next story" },
      { ar: "قصص ذات صلة والعودة للمتجر", en: "Related stories and return to store" },
    ],
    teams: [{ ar: "المحتوى", en: "Content" }, { ar: "النمو", en: "Growth" }, { ar: "التصميم", en: "Design" }, { ar: "التقنية", en: "Engineering" }],
    tasks: [
      { id: "journal-taxonomy", step: "01", title: { ar: "اعتماد تصنيف القصص وخريطة الروابط إلى المنتجات", en: "Approve story taxonomy and product-link map" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "journal-calendar", step: "02", title: { ar: "إخراج تقويم النشر ومجموعة المقالات ذات الأولوية", en: "Create the publishing calendar and priority story set" }, team: { ar: "النمو", en: "Growth" }, phase: { ar: "تخطيط", en: "Plan" } },
      { id: "journal-template", step: "03", title: { ar: "تثبيت قالب القراءة والمشاركة والقصص ذات الصلة", en: "Lock the reading, sharing and related-story template" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "journal-build", step: "04", title: { ar: "تنفيذ مسارات المقال والتنقل والإحالات القابلة للقياس", en: "Build article routes, navigation and measurable referrals" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
    ],
  },
  {
    id: "category-discovery",
    number: "05",
    title: { ar: "التصنيفات وشجرة الاكتشاف", en: "Category discovery" },
    eyebrow: { ar: "من الاهتمام إلى المجموعة", en: "Interest to collection" },
    summary: { ar: "حصر شجرة المنتجات التي تبدأ من القائمة الرئيسية وتمتد إلى التصنيف والفئة الفرعية مع مسارات مفهومة للعودة.", en: "Map the product tree from the main menu into category and subcategory with clear return paths." },
    route: { ar: "/category + القائمة", en: "/category + menu" },
    status: "active",
    priority: { ar: "تطوير مستمر", en: "Ongoing" },
    icon: Search,
    accent: "blue",
    features: [
      { ar: "التصنيفات السبعة ومحتوى كل تصنيف", en: "Seven top-level categories and their content" },
      { ar: "القائمة متعددة المستويات على الجوال", en: "Multi-level mobile category browser" },
      { ar: "الفئات الفرعية والـ breadcrumbs", en: "Subcategories and breadcrumbs" },
      { ar: "روابط التصنيف من الرئيسية والمقالات", en: "Category links from home and journal" },
    ],
    teams: [{ ar: "التجارة", en: "Merchandising" }, { ar: "المنتج", en: "Product" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "category-taxonomy", step: "01", title: { ar: "تنظيف أسماء التصنيفات والفئات الفرعية والمرادفات", en: "Clean category, subcategory and synonym names" }, team: { ar: "التجارة", en: "Merchandising" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "category-flow", step: "02", title: { ar: "اعتماد تسلسل التنقل من القائمة إلى صفحة المجموعة", en: "Approve navigation from menu to collection page" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تدفق", en: "Flow" } },
      { id: "category-routes", step: "03", title: { ar: "ربط المسارات والصور وحالات العودة على سطح المكتب والجوال", en: "Connect routes, imagery and back states on desktop and mobile" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "category-qa", step: "04", title: { ar: "فحص عدم فقدان التصنيف أو المنتج عند تغيير اللغة أو المسار", en: "Verify categories and products survive locale and route changes" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "listing-filters",
    number: "06",
    title: { ar: "قائمة المنتجات والفلاتر والفرز", en: "Product listing, filters & sorting" },
    eyebrow: { ar: "تضييق الاختيار", en: "Narrow the choice" },
    summary: { ar: "جعل صفحة المجموعة قابلة للاستخدام عندما تكثر المنتجات: فرز، فلترة، توفر، سعر، مفضلة وإضافة سريعة للسلة.", en: "Make collection pages useful at scale with sorting, filters, availability, price, favorites and quick add-to-cart." },
    route: { ar: "صفحة التصنيف", en: "Category listing" },
    status: "active",
    priority: { ar: "أثر مباشر على التحويل", en: "Direct conversion impact" },
    icon: Search,
    accent: "mint",
    features: [
      { ar: "فلتر المجموعة أو الفئة والسعر", en: "Collection, category and price filters" },
      { ar: "التوفر والفرز بخمسة خيارات", en: "Availability and five sorting options" },
      { ar: "لوحة الفلاتر ودرج الفرز على الجوال", en: "Filter panel and mobile sort sheet" },
      { ar: "المفضلة، الإضافة للسلة، ونفاد المخزون", en: "Favorites, add-to-cart and out-of-stock states" },
      { ar: "حالة عدم وجود نتائج ومسح الفلاتر", en: "No-results state and clear filters" },
    ],
    teams: [{ ar: "المنتج", en: "Product" }, { ar: "التصميم", en: "Design" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "listing-rules", step: "01", title: { ar: "اعتماد قواعد الفلترة والفرز ورسائل عدم النتائج", en: "Approve filter, sort and no-results rules" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "listing-mobile", step: "02", title: { ar: "تصميم لوحة الفلاتر والفرز كرحلة قصيرة على الجوال", en: "Design a short mobile filter and sort journey" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "listing-state", step: "03", title: { ar: "تنفيذ الحالة المشتركة مع المفضلة والسلة ونفاد المخزون", en: "Implement shared state with favorites, cart and stock" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "listing-regression", step: "04", title: { ar: "اختبار تغيير الفلاتر واللغة والعودة إلى القائمة", en: "Test filter changes, locale switching and list back navigation" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "product-decision",
    number: "07",
    title: { ar: "تفاصيل المنتج واتخاذ القرار", en: "Product detail & decision" },
    eyebrow: { ar: "من الاختيار إلى السلة", en: "Choice to cart" },
    summary: { ar: "جمع كل ما يحتاجه العميل قبل الإضافة: الصورة، السعر، الحجم، المزايا، الهدايا، المفضلة، التوصيات والمشاهدة الأخيرة.", en: "Bring together everything needed before add-to-cart: imagery, price, size, benefits, gifts, favorites, recommendations and history." },
    route: { ar: "/product-details", en: "/product-details" },
    status: "active",
    priority: { ar: "بوابة التحويل الأساسية", en: "Core conversion gate" },
    icon: PackageCheck,
    accent: "rose",
    features: [
      { ar: "معرض الصور ومعلومات المنتج والسعر", en: "Gallery, product information and price" },
      { ar: "اختيار الحجم والمتغيرات", en: "Size and variant selection" },
      { ar: "المفضلة والمشاركة والإضافة للسلة", en: "Favorites, sharing and add-to-cart" },
      { ar: "الهدايا المرتبطة بالمنتج", en: "Product-linked complimentary gifts" },
      { ar: "التوصيات المترابطة: يشترى معًا، اشترِ لأنك اشتريت، والمشاهدة الأخيرة", en: "Connected recommendations: bought together, bought because you bought and recently viewed" },
      { ar: "التقييمات، الأسئلة والأجوبة، والضمان الذهبي", en: "Reviews, Q&A and Gold Warranty" },
      { ar: "التوصيات والمشاهدة الأخيرة والـ quick cart", en: "Recommendations, recently viewed and quick cart" },
    ],
    teams: [{ ar: "التجارة", en: "Merchandising" }, { ar: "المحتوى", en: "Content" }, { ar: "التصميم", en: "Design" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "pdp-catalog", step: "01", title: { ar: "تثبيت بيانات المنتج والأحجام والسعر والعروض والضمان الذهبي", en: "Lock product data, sizes, pricing, offers and Gold Warranty" }, team: { ar: "التجارة", en: "Merchandising" }, phase: { ar: "تجهيز", en: "Prepare" } },
      { id: "pdp-copy", step: "02", title: { ar: "كتابة الوصف والمزايا ورسائل الهدايا والتقييمات ونفاد المخزون", en: "Write description, benefits, gift, review and stock-state copy" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "محتوى", en: "Content" } },
      { id: "pdp-recommendations", step: "03", title: { ar: "اعتماد قواعد التوصيات: يشترى معًا، اشترِ لأنك اشتريت، والبدائل", en: "Approve bought-together, bought-because-you-bought and alternative rules" }, team: { ar: "التجارة", en: "Merchandising" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "pdp-ux", step: "04", title: { ar: "تصميم القرار والتقييم والتوصيات والإضافة السريعة مع مراعاة الجوال", en: "Design decision, reviews, recommendations and quick-add for mobile" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "pdp-build", step: "05", title: { ar: "ربط المتغيرات والمفضلة والهدايا والتوصيات والتقييم بالسلة", en: "Connect variants, favorites, gifts, recommendations and reviews to cart" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "pdp-qa", step: "06", title: { ar: "اختبار الإضافة والعودة والتقييمات والضمان والمنتج المنفد والهدايا لكل كمية", en: "Test add, return, reviews, warranty, out-of-stock and quantity-based gifts" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "fragrance-discovery",
    number: "08",
    title: { ar: "مرشد العطور ومختبر الرائحة", en: "Fragrance discovery lab" },
    eyebrow: { ar: "اكتشاف مخصص", en: "Personalized discovery" },
    summary: { ar: "مساعدة العميل على اختيار العطر عبر أسئلة الشخصية والنوتات وتجربة مختبر تفاعلية، ثم إيصاله إلى المنتج المناسب.", en: "Help customers choose through personality questions, notes and an interactive lab before leading them to the right product." },
    route: { ar: "الرئيسية + تفاصيل المنتج", en: "Home + product detail" },
    status: "active",
    priority: { ar: "قيد التصميم", en: "In design" },
    icon: Sparkles,
    accent: "lilac",
    features: [
      { ar: "أسئلة المزاج والشخصية والذوق", en: "Mood, personality and taste questions" },
      { ar: "ربط النوتات والعائلات بمصفوفة توصية", en: "Notes and scent families mapped to recommendations" },
      { ar: "نتائج قابلة للحفظ والمفضلة", en: "Saveable results and favorites" },
      { ar: "مختبر عطري تفاعلي وإضافة مباشرة للسلة", en: "Interactive fragrance lab and direct add-to-cart" },
    ],
    teams: [{ ar: "العطور", en: "Fragrance" }, { ar: "المنتج", en: "Product" }, { ar: "المحتوى", en: "Content" }, { ar: "التقنية", en: "Engineering" }],
    tasks: [
      { id: "fragrance-taxonomy", step: "01", title: { ar: "اعتماد عائلات الروائح والنوتات وقواعد الترشيح", en: "Approve scent families, notes and recommendation rules" }, team: { ar: "العطور", en: "Fragrance" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "fragrance-questions", step: "02", title: { ar: "ترتيب الأسئلة ومسارات الإجابة والنتيجة النهائية", en: "Order questions, answer paths and final recommendation" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تدفق", en: "Flow" }, done: true },
      { id: "fragrance-copy", step: "03", title: { ar: "كتابة شرح النوتات والنتائج والانتقالات إلى المنتج", en: "Write note explanations, results and product handoffs" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "محتوى", en: "Content" } },
      { id: "fragrance-build", step: "04", title: { ar: "تنفيذ المختبر والنتائج والإضافة والمفضلة والقياس", en: "Build lab, results, add, favorites and measurement" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
    ],
  },
  {
    id: "gifting",
    number: "09",
    title: { ar: "تجربة الهدايا والتخصيص", en: "Gifting & personalization" },
    eyebrow: { ar: "لحظة شخصية", en: "Personal moment" },
    summary: { ar: "تجهيز رحلة الهدية من صفحة المناسبة إلى اختيار المنتج والبطاقة والتغليف والهدايا المجانية داخل السلة.", en: "Create the gifting path from occasion page to product, card, wrapping and complimentary gifts in cart." },
    route: { ar: "/gifts + تخصيص السلة", en: "/gifts + cart customization" },
    status: "planned",
    priority: { ar: "في التخطيط", en: "Planning" },
    icon: Gift,
    accent: "rose",
    features: [
      { ar: "صفحة الهدايا والمناسبات", en: "Gift and occasion landing" },
      { ar: "هدايا للرجال والنساء والمناسبات العامة", en: "Gifts for men, women and shared occasions" },
      { ar: "اختيار البطاقة والرسالة والتغليف", en: "Card, message and wrapping selection" },
      { ar: "اختيار الهدية المجانية حسب المنتج والكمية", en: "Free-gift selection by product and quantity" },
      { ar: "بطاقات درعه جيفت وقيمتها واستخدامها في الدفع", en: "Deraah Gift cards, their value and payment redemption" },
      { ar: "تحويل رابط الهدية إلى QR قابل للطباعة والمشاركة", en: "Convert gift links into printable, shareable QR codes" },
    ],
    teams: [{ ar: "الهدايا", en: "Gifting" }, { ar: "المحتوى", en: "Content" }, { ar: "العمليات", en: "Operations" }, { ar: "التصميم", en: "Design" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "gifting-occasions", step: "01", title: { ar: "حصر المناسبات وباقات الهدية وقواعد الأهلية", en: "Map occasions, gift bundles and eligibility rules" }, team: { ar: "الهدايا", en: "Gifting" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "gifting-copy", step: "02", title: { ar: "كتابة نبرة الاقتراحات والبطاقات والرسائل", en: "Write recommendation, card and message copy" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "محتوى", en: "Content" } },
      { id: "gifting-fulfilment", step: "03", title: { ar: "اعتماد طريقة التجهيز والتغليف داخل الفرع أو المستودع", en: "Approve fulfillment and wrapping inside branch or warehouse" }, team: { ar: "العمليات", en: "Operations" }, phase: { ar: "تشغيل", en: "Operate" } },
      { id: "gifting-qr", step: "04", title: { ar: "تصميم بطاقة الهدية ورابطها وQR للطباعة أو المشاركة", en: "Design the gift card, link and QR for print or sharing" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "gifting-build", step: "05", title: { ar: "تنفيذ بطاقات درعه جيفت وQR والاختيار والمعاينة والحفظ داخل السلة والطلب", en: "Build Deraah Gift cards, QR, selection, preview and persistence in cart and order" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "gifting-qa", step: "06", title: { ar: "فحص صلاحية البطاقة والـQR وتطابق الهدية مع الطلب على الجوال", en: "Verify card validity, QR behavior and gift-to-order matching on mobile" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "cart-incentives",
    number: "10",
    title: { ar: "السلة والعروض ومحفزات القيمة", en: "Cart & basket incentives" },
    eyebrow: { ar: "قبل الإتمام", en: "Before completion" },
    summary: { ar: "جعل السلة مكانًا واضحًا للمراجعة: المنتجات، الكمية، الخصم، العروض، العينة، الهدية، الشحن وزر الإكمال.", en: "Make cart a clear review point for products, quantity, discount, offers, samples, gifts, shipping and completion." },
    route: { ar: "/checkout أو درج السلة", en: "/checkout or cart drawer" },
    status: "active",
    priority: { ar: "أثر مباشر على الإتمام", en: "Direct completion impact" },
    icon: ShoppingBag,
    accent: "gold",
    features: [
      { ar: "درج السلة والسلة كصفحة كاملة", en: "Cart drawer and full cart page" },
      { ar: "زيادة ونقصان الكمية والحذف", en: "Quantity controls and removal" },
      { ar: "عرض 1+2 مجانًا والعينات المجانية", en: "1+2 Free offer and free samples" },
      { ar: "شريط مكافآت الشحن والخصم", en: "Shipping and discount reward rail" },
      { ar: "العينات المجانية والهدايا المرتبطة بالسلة", en: "Free samples and basket-linked gifts" },
      { ar: "كوبوناتي والعروض المخصصة بحسب فئة العميل", en: "My coupons and offers personalized by customer segment" },
      { ar: "الكوبونات والهدايا وزر إتمام الطلب", en: "Coupons, gifts and checkout CTA" },
    ],
    teams: [{ ar: "التجارة", en: "Merchandising" }, { ar: "النمو", en: "Growth" }, { ar: "التصميم", en: "Design" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "cart-policy", step: "01", title: { ar: "توثيق قواعد 1+2 والعينات والهدايا والشحن والخصومات والكوبونات", en: "Document 1+2, samples, gifts, shipping, discount and coupon rules" }, team: { ar: "التجارة", en: "Merchandising" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "cart-ux", step: "02", title: { ar: "ترتيب ملخص السلة وشريط المكافآت والزر الأساسي", en: "Order cart summary, reward rail and primary action" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "cart-growth", step: "03", title: { ar: "تحديد رسائل التحفيز وكوبوناتي والعروض بحسب فئة العميل", en: "Define incentive, My Coupons and segment-based offer messaging" }, team: { ar: "النمو", en: "Growth" }, phase: { ar: "تحفيز", en: "Activate" } },
      { id: "cart-engine", step: "04", title: { ar: "ربط الحسابات والأسعار والأهلية والعينات والهدايا والخصومات بالملخص النهائي", en: "Connect account, pricing, eligibility, samples, gifts and discounts to final summary" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "cart-qa", step: "05", title: { ar: "اختبار الحالات الفارغة والتغيير والعينة والهدية والكوبون والجوال", en: "Test empty, change, sample, gift, coupon and mobile states" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "account",
    number: "11",
    title: { ar: "الحساب والمفضلة والعناوين", en: "Account, favorites & addresses" },
    eyebrow: { ar: "خدمة ذاتية", en: "Self service" },
    summary: { ar: "تجميع الأدوات التي يحتاجها العميل قبل وبعد الشراء في مركز واحد: الملف، الطلبات، المفضلة، العناوين واللغة.", en: "Bring pre- and post-purchase tools into one account center: profile, orders, favorites, addresses and locale." },
    route: { ar: "/account", en: "/account" },
    status: "ready",
    priority: { ar: "مراجعة تجربة الجوال", en: "Mobile review" },
    icon: UsersRound,
    accent: "mint",
    features: [
      { ar: "الملف الشخصي والبيانات الأساسية", en: "Profile and core details" },
      { ar: "الطلبات وتفاصيل الطلب", en: "Orders and order details" },
      { ar: "المفضلة والعناوين وبطاقات الدفع المحفوظة بأمان", en: "Favorites, addresses and securely saved payment cards" },
      { ar: "كوبوناتي والعروض المخصصة بحسب فئة العميل", en: "My Coupons and offers personalized by customer segment" },
      { ar: "اختيار الدولة واللغة وحفظهما", en: "Country and language persistence" },
      { ar: "النوافذ السفلية للحساب على الجوال", en: "Mobile account bottom sheets" },
    ],
    teams: [{ ar: "المنتج", en: "Product" }, { ar: "التصميم", en: "Design" }, { ar: "النمو", en: "Growth" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "account-ia", step: "01", title: { ar: "اعتماد بنية الحساب وأولوية الأدوات بعد الشراء", en: "Approve account information architecture and post-purchase priorities" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "account-sheets", step: "02", title: { ar: "تصميم القوائم والنوافذ السفلية وحقول العنوان", en: "Design menus, bottom sheets and address fields" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" }, done: true },
      { id: "account-offers", step: "03", title: { ar: "تعريف كوبوناتي والعروض المخصصة وقواعد فئة العميل", en: "Define My Coupons, personalized offers and customer-segment rules" }, team: { ar: "النمو", en: "Growth" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "account-state", step: "04", title: { ar: "حفظ المفضلة والعناوين واللغة والدولة وبطاقات الدفع بشكل آمن", en: "Persist favorites, addresses, locale, country and payment cards securely" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" }, done: true },
      { id: "account-qa", step: "05", title: { ar: "اختبار الحساب وكوبوناتي والبطاقات المحفوظة على المقاسات الأساسية مع العودة للسلة", en: "Test account, My Coupons and saved cards across core breakpoints with return-to-cart" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "loyalty",
    number: "12",
    title: { ar: "مكافآتي والاحتفاظ بالعميل", en: "Mukafaati loyalty & retention" },
    eyebrow: { ar: "بعد الشراء والعودة", en: "Return & retention" },
    summary: { ar: "تحويل الرصيد والمستوى والمزايا إلى رحلة مفهومة تحفز العميل على العودة والشراء التالي.", en: "Turn balance, tier and benefits into a clear journey that motivates the next visit and purchase." },
    route: { ar: "/mukafaati", en: "/mukafaati" },
    status: "active",
    priority: { ar: "قيد البناء", en: "In build" },
    icon: Gift,
    accent: "gold",
    features: [
      { ar: "كسب النقاط والرصيد وتاريخ العمليات والصلاحية", en: "Earning, balance, transaction history and expiry" },
      { ar: "المستويات والمزايا وشروط الانتقال", en: "Tiers, benefits and progression rules" },
      { ar: "استبدال المكافآت في السلة والدفع والاسترجاع عند الإلغاء", en: "Reward redemption in cart, payment and cancellation reversal" },
      { ar: "خريطة رحلة العضوية والتنبيهات والحملات المخصصة", en: "Membership journey, notifications and personalized campaigns" },
      { ar: "الربط بين المكافآت والسلة", en: "Connection between rewards and cart" },
    ],
    teams: [{ ar: "التسويق", en: "Marketing" }, { ar: "المحتوى", en: "Content" }, { ar: "المنتج", en: "Product" }, { ar: "النمو", en: "Growth" }, { ar: "التقنية", en: "Engineering" }],
    tasks: [
      { id: "loyalty-rules", step: "01", title: { ar: "توثيق كسب النقاط والمستويات والرصيد وشروط الانتقال والمزايا والصلاحية", en: "Document earning, tiers, balance, progression, benefits and expiry" }, team: { ar: "التسويق", en: "Marketing" }, phase: { ar: "تعريف", en: "Define" }, done: true },
      { id: "loyalty-ledger", step: "02", title: { ar: "اعتماد سجل العمليات والاستبدال والإلغاء وإعادة النقاط", en: "Approve the ledger for earning, redemption, cancellation and point reversal" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تدفق", en: "Flow" } },
      { id: "loyalty-copy", step: "03", title: { ar: "صياغة شرح مبسط لكل مستوى والصلاحية والتنبيهات وأسئلة العميل", en: "Write simple tier, expiry, alert and customer-question explanations" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "محتوى", en: "Content" } },
      { id: "loyalty-journey", step: "04", title: { ar: "تصميم لوحة الرصيد وخريطة التقدم والاستبدال والدعوة للخطوة التالية", en: "Design balance, progress, redemption and next-step guidance" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "loyalty-personalization", step: "05", title: { ar: "تجهيز حملات ومزايا مخصصة بحسب المستوى وسلوك العميل", en: "Prepare campaigns and benefits personalized by tier and customer behavior" }, team: { ar: "النمو", en: "Growth" }, phase: { ar: "تحفيز", en: "Activate" } },
      { id: "loyalty-build", step: "06", title: { ar: "ربط الرصيد والاستبدال والمزايا بالسلة والحساب والدفع والقياس", en: "Connect balance, redemption and benefits to cart, account, payment and measurement" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
    ],
  },
  {
    id: "shipping-payment",
    number: "13",
    title: { ar: "التوصيل والاستلام والدفع", en: "Shipping, pickup & payment" },
    eyebrow: { ar: "إتمام الطلب", en: "Complete the order" },
    summary: { ar: "تقليل الاحتكاك في آخر خطوة: اختيار العنوان أو الفرع، الموعد، طريقة الدفع، ثم مراجعة كل تفاصيل الطلب قبل الإرسال.", en: "Remove friction at the final step: choose address or branch, timing and payment, then review everything before placing the order." },
    route: { ar: "/shipping-payment", en: "/shipping-payment" },
    status: "active",
    priority: { ar: "مسار الإتمام الأساسي", en: "Primary completion path" },
    icon: Truck,
    accent: "blue",
    features: [
      { ar: "التوصيل إلى عنوان أو الاستلام من الفرع", en: "Delivery to address or branch pickup" },
      { ar: "الاستلام من الفروع: اختيار الفرع، ساعات العمل، الجاهزية والتنبيه", en: "Branch pickup: branch, opening hours, readiness and notification" },
      { ar: "RedBox: نقاط الاستلام، الأهلية، الرسوم وحالة الشحنة", en: "RedBox: pickup points, eligibility, fees and shipment status" },
      { ar: "اختيار المدينة والفرع والموعد المتوقع", en: "City, branch and expected timing" },
      { ar: "حالات العنوان والتعديل أثناء الطلب", en: "Address states and in-checkout editing" },
      { ar: "طرق الدفع والملخص النهائي", en: "Payment methods and final summary" },
    ],
    teams: [{ ar: "اللوجستيات", en: "Logistics" }, { ar: "العمليات", en: "Operations" }, { ar: "المنتج", en: "Product" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "shipping-zones", step: "01", title: { ar: "حصر المدن والمناطق وأوقات القطع ونطاقات التوصيل", en: "Map cities, zones, cut-off times and delivery coverage" }, team: { ar: "اللوجستيات", en: "Logistics" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "shipping-redbox", step: "02", title: { ar: "اعتماد تكامل RedBox ونقاط الاستلام والرسوم وحالات التتبع", en: "Approve RedBox integration, pickup points, fees and tracking states" }, team: { ar: "اللوجستيات", en: "Logistics" }, phase: { ar: "تشغيل", en: "Operate" } },
      { id: "shipping-ops", step: "03", title: { ar: "اعتماد قواعد التوصيل والاستلام من الفرع والموعد ورسوم الشحن", en: "Approve delivery, branch pickup, timing and shipping-fee rules" }, team: { ar: "العمليات", en: "Operations" }, phase: { ar: "تشغيل", en: "Operate" } },
      { id: "shipping-ux", step: "04", title: { ar: "ترتيب العنوان والفرع وRedBox والموعد وطريقة الدفع في خطوات واضحة", en: "Order address, branch, RedBox, timing and payment into clear steps" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تدفق", en: "Flow" } },
      { id: "shipping-integration", step: "05", title: { ar: "ربط الحالات والموعد والفرع وRedBox والملخص مع الطلب", en: "Connect states, timing, branch, RedBox and summary to the order" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "shipping-qa", step: "06", title: { ar: "فحص أهلية الاستلام والتوصيل وتغير العنوان والموعد والتنبيهات", en: "Test pickup and delivery eligibility, address/timing changes and notifications" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "payment-summary",
    number: "14",
    title: { ar: "الدفع وملخص الطلب", en: "Payment & order summary" },
    eyebrow: { ar: "ثقة قبل التأكيد", en: "Confidence before confirm" },
    summary: { ar: "تقديم الدفع والخصومات والهدايا والتوصيل في ملخص واحد قابل للمراجعة، مع حالات واضحة للنجاح والفشل.", en: "Present payment, discounts, gifts and delivery in one reviewable summary with clear success and failure states." },
    route: { ar: "/shipping-payment", en: "/shipping-payment" },
    status: "ready",
    priority: { ar: "مراجعة نهائية", en: "Final review" },
    icon: ClipboardCheck,
    accent: "ink",
    features: [
      { ar: "مدى، البطاقات، Apple Pay، STC Pay وطرق الدفع المتاحة حسب الحالة", en: "Mada, cards, Apple Pay, STC Pay and available payment states" },
      { ar: "التقسيط: تمارا، تابي، الأهلية، الحد الأدنى ورسائل التعثر", en: "Installments: Tamara, Tabby, eligibility, minimums and failure messaging" },
      { ar: "حفظ بطاقة الدفع بشكل آمن وإدارتها من الحساب", en: "Securely save payment cards and manage them from account" },
      { ar: "مشاركة رابط الدفع أو السلة ليكمل شخص آخر الدفع", en: "Share a payment or cart link so someone else can complete payment" },
      { ar: "الخصومات والشحن والمجموع النهائي", en: "Discounts, shipping and final total" },
      { ar: "التحقق من الحقول ورسائل الخطأ", en: "Field validation and error messages" },
      { ar: "حفظ لقطة الطلب قبل الانتقال للتأكيد", en: "Persist order snapshot before confirmation" },
    ],
    teams: [{ ar: "المالية", en: "Finance" }, { ar: "المنتج", en: "Product" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "payment-rules", step: "01", title: { ar: "تثبيت مدى والبطاقات والمحافظ والتقسيط والرسوم وسياسة الخصم والاسترجاع", en: "Lock Mada, cards, wallets, installments, fees, discount and refund policy" }, team: { ar: "المالية", en: "Finance" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "payment-ux", step: "02", title: { ar: "تصميم ترتيب الملخص والزر الأساسي وحالات الخطأ", en: "Design summary order, primary action and error states" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تصميم", en: "Design" }, done: true },
      { id: "payment-build", step: "03", title: { ar: "ربط بوابات الدفع والتقسيط وحفظ لقطة الطلب والانتقال الآمن", en: "Connect payment and installment gateways, order snapshot and secure handoff" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "payment-cards-share", step: "04", title: { ar: "تنفيذ حفظ البطاقة بتوكن آمن وإنشاء رابط دفع أو سلة قابل للمشاركة", en: "Implement tokenized card saving and a shareable payment or cart link" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "payment-qa", step: "05", title: { ar: "فحص النجاح والفشل والتقسيط والإعادة والرابط وعدم تكرار الطلب", en: "Test success, failure, installments, retry, sharing and duplicate-order prevention" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" }, done: true },
    ],
  },
  {
    id: "order-follow-up",
    number: "15",
    title: { ar: "تأكيد الطلب ومتابعة ما بعد الشراء", en: "Order confirmation & follow-up" },
    eyebrow: { ar: "آخر خطوة في الرحلة", en: "The journey end" },
    summary: { ar: "إغلاق الرحلة بثقة: رقم الطلب، حالة التجهيز، تفاصيل الاستلام، الهدايا، إدارة الموعد والعنوان، والدعم.", en: "Close the journey with confidence: order number, fulfillment status, receiving details, gifts, timing, address and support." },
    route: { ar: "/payment-summary + الحساب", en: "/payment-summary + account" },
    status: "active",
    priority: { ar: "يستمر بعد الإطلاق", en: "Continues after launch" },
    icon: CheckCircle2,
    accent: "mint",
    features: [
      { ar: "تأكيد الدفع ورقم الطلب", en: "Payment confirmation and order number" },
      { ar: "مراحل التأكيد والتجهيز والشحن والتسليم", en: "Confirmed, preparing, shipping and delivered stages" },
      { ar: "تفاصيل الاستلام والهدايا والعينة", en: "Receiving details, gifts and sample" },
      { ar: "RedBox أو الفرع وتفاصيل الاستلام والتنبيهات", en: "RedBox or branch receiving details and notifications" },
      { ar: "الضمان الذهبي وسياسة الإلغاء والاسترجاع", en: "Gold Warranty and cancellation and return policy" },
      { ar: "إلغاء الطلب وإعادة الجدولة وتعديل العنوان بعد الطلب", en: "Cancel order, reschedule and change address after ordering" },
      { ar: "متابعة الطلب والدعم والعودة للتسوق", en: "Order follow-up, support and continue shopping" },
    ],
    teams: [{ ar: "العمليات", en: "Operations" }, { ar: "خدمة العملاء", en: "Customer Care" }, { ar: "المنتج", en: "Product" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "order-status", step: "01", title: { ar: "اعتماد حالات الطلب ومصدر الحقيقة لكل مرحلة", en: "Approve order states and source of truth for each stage" }, team: { ar: "العمليات", en: "Operations" }, phase: { ar: "تشغيل", en: "Operate" } },
      { id: "order-policy", step: "02", title: { ar: "اعتماد الضمان الذهبي وسياسة الإلغاء والاسترجاع والمهل والاستثناءات", en: "Approve Gold Warranty, cancellation and return policy, windows and exceptions" }, team: { ar: "خدمة العملاء", en: "Customer Care" }, phase: { ar: "سياسة", en: "Policy" } },
      { id: "order-support", step: "03", title: { ar: "تحديد رسائل الدعم وخيارات الإلغاء وإعادة الجدولة وتعديل العنوان", en: "Define support messages and cancellation, rescheduling and address-change options" }, team: { ar: "خدمة العملاء", en: "Customer Care" }, phase: { ar: "خدمة", en: "Support" } },
      { id: "order-controls", step: "04", title: { ar: "تصميم إدارة الموعد والعنوان وRedBox والفرع والتفاصيل والعودة للتسوق", en: "Design timing, address, RedBox, branch, detail and continue-shopping controls" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "order-build", step: "05", title: { ar: "ربط الطلبات والتحديثات والهدايا والسلة بالحالة المؤكدة مع دعم الإلغاء والجدولة", en: "Connect orders, updates, gifts and cart to confirmed state with cancellation and rescheduling" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تنفيذ", en: "Build" } },
      { id: "order-qa", step: "06", title: { ar: "اختبار الطلب من التأكيد إلى التسليم والإلغاء والاسترجاع وإعادة الجدولة", en: "Test the order from confirmation through delivery, cancellation, return and rescheduling" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "localization-quality",
    number: "16",
    title: { ar: "العربية وRTL والاستجابة", en: "Arabic, RTL & responsive quality" },
    eyebrow: { ar: "يعمل فوق كل المشاريع", en: "Runs across every project" },
    summary: { ar: "مراجعة كل النصوص والحالات والمحاذاة والمقاسات حتى تبقى تجربة المتجر عربية وواضحة في التفاعل، لا في العرض فقط.", en: "Review copy, states, alignment and breakpoints so the store stays Arabic and clear during interaction, not only at rest." },
    route: { ar: "كل الصفحات والحالات", en: "All pages and states" },
    status: "active",
    priority: { ar: "تدقيق مستمر قبل كل إطلاق", en: "Continuous pre-release audit" },
    icon: Palette,
    accent: "lilac",
    features: [
      { ar: "النصوص التي تظهر عند التفاعل فقط", en: "Text revealed only during interaction" },
      { ar: "المحاذاة والأيقونات واتجاه الحركة", en: "Alignment, icons and motion direction" },
      { ar: "الجوال، سطح المكتب، والنوافذ السفلية", en: "Mobile, desktop and bottom sheets" },
      { ar: "اللغات الإضافية ومنها البنغالية مع الترجمة والاختبار", en: "Additional locales including Bengali with translation and testing" },
      { ar: "الوصول، التركيز، ومسميات الأزرار", en: "Access, focus and button labels" },
    ],
    teams: [{ ar: "المحتوى", en: "Content" }, { ar: "التصميم", en: "Design" }, { ar: "التقنية", en: "Engineering" }, { ar: "ضمان الجودة", en: "QA" }],
    tasks: [
      { id: "locale-inventory", step: "01", title: { ar: "حصر النصوص الإنجليزية والحالات المخفية واللغات المطلوبة في كل صفحة", en: "Inventory English text, hidden states and required locales on every page" }, team: { ar: "ضمان الجودة", en: "QA" }, phase: { ar: "حصر", en: "Audit" }, done: true },
      { id: "locale-copy", step: "02", title: { ar: "تثبيت الترجمة العربية والبنغالية ونبرة الرسائل والتنبيهات", en: "Lock Arabic and Bengali translation, message tone and alerts" }, team: { ar: "المحتوى", en: "Content" }, phase: { ar: "محتوى", en: "Content" } },
      { id: "locale-layout", step: "03", title: { ar: "مراجعة RTL وLTR والفراغات واتجاه الأيقونات على المقاسات الأساسية", en: "Review RTL, LTR, spacing and icon direction at core breakpoints" }, team: { ar: "التصميم", en: "Design" }, phase: { ar: "تصميم", en: "Design" } },
      { id: "locale-regression", step: "04", title: { ar: "إنشاء فحص انحدار عربي وبنغالي قبل نشر أي مشروع", en: "Create Arabic and Bengali regression checks before every project release" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "مراجعة", en: "Validate" } },
    ],
  },
  {
    id: "journey-measurement",
    number: "17",
    title: { ar: "القياس والتحسين المستمر", en: "Measurement & continuous improvement" },
    eyebrow: { ar: "حلقة ما بعد الإطلاق", en: "Post-launch loop" },
    summary: { ar: "ربط كل خطوة من أول زيارة حتى التسليم بمؤشرات واضحة، ثم تحويل الملاحظات إلى مشاريع التحسين التالية.", en: "Connect every step from first visit to delivery with clear signals, then turn learnings into the next improvement projects." },
    route: { ar: "من الرئيسية إلى الطلب", en: "Home to order" },
    status: "planned",
    priority: { ar: "بعد اكتمال الأساسيات", en: "After core delivery" },
    icon: BarChart3,
    accent: "blue",
    features: [
      { ar: "أحداث البحث والتصنيف والمنتج", en: "Search, category and product events" },
      { ar: "السلة والدفع والتحويل والتسرب", en: "Cart, checkout, conversion and drop-off" },
      { ar: "الشراء المتكرر والولاء وما بعد الشراء", en: "Repeat purchase, loyalty and post-purchase" },
      { ar: "لوحة متابعة وأجندة تحسين", en: "Monitoring dashboard and improvement backlog" },
    ],
    teams: [{ ar: "التحليلات", en: "Analytics" }, { ar: "المنتج", en: "Product" }, { ar: "النمو", en: "Growth" }, { ar: "التقنية", en: "Engineering" }],
    tasks: [
      { id: "measure-events", step: "01", title: { ar: "تعريف قاموس الأحداث من الدخول إلى تأكيد الطلب", en: "Define the event dictionary from entry to order confirmation" }, team: { ar: "التحليلات", en: "Analytics" }, phase: { ar: "تعريف", en: "Define" } },
      { id: "measure-funnel", step: "02", title: { ar: "بناء مسار التحويل ومواطن التسرب حسب الجهاز واللغة", en: "Build conversion and drop-off views by device and locale" }, team: { ar: "النمو", en: "Growth" }, phase: { ar: "قياس", en: "Measure" } },
      { id: "measure-dashboard", step: "03", title: { ar: "إخراج لوحة أسبوعية تربط الملاحظات بالمشاريع", en: "Create a weekly dashboard that connects insight to projects" }, team: { ar: "المنتج", en: "Product" }, phase: { ar: "قرار", en: "Decide" } },
      { id: "measure-release", step: "04", title: { ar: "تحديث الأولويات بعد كل إطلاق ومراجعة شهرية مع الفرق", en: "Refresh priorities after each release and review monthly with teams" }, team: { ar: "التقنية", en: "Engineering" }, phase: { ar: "تحسين", en: "Improve" } },
    ],
  },
];

const filterLabels: Record<ProjectFilter, LocaleCopy> = {
  all: { ar: "كل المشاريع", en: "All projects" },
  active: { ar: "قيد العمل", en: "In progress" },
  planned: { ar: "في التخطيط", en: "Planning" },
  ready: { ar: "جاهزة للمراجعة", en: "Ready for review" },
};

const teamFilters = Array.from(
  new Map(projects.flatMap(project => project.teams.map(team => [team.en, team] as const))).values(),
);

const statusLabels: Record<ProjectStatus, LocaleCopy> = {
  active: { ar: "قيد العمل", en: "In progress" },
  planned: { ar: "في التخطيط", en: "Planning" },
  ready: { ar: "جاهزة للمراجعة", en: "Ready for review" },
};

function copy(text: LocaleCopy, isArabic: boolean) {
  return isArabic ? text.ar : text.en;
}

function initialTaskState() {
  return projects.reduce<Record<string, boolean>>((state, project) => {
    project.tasks.forEach(task => { state[task.id] = Boolean(task.done); });
    return state;
  }, {});
}

export default function WorkProjectsPage() {
  const { language, direction } = useStoreLocale();
  const { cartItemCount } = useStoreCart();
  const isArabic = language === "العربية";
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState("store-foundation");
  const [taskState, setTaskState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = window.localStorage.getItem("deraah-work-project-tasks");
      return saved ? { ...initialTaskState(), ...JSON.parse(saved) } : initialTaskState();
    } catch {
      return initialTaskState();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("deraah-work-project-tasks", JSON.stringify(taskState));
    } catch {
      // The board remains usable when storage is unavailable.
    }
  }, [taskState]);

  const totals = useMemo(() => {
    const allTasks = projects.flatMap(project => project.tasks);
    const done = allTasks.filter(task => taskState[task.id]).length;
    return {
      projects: projects.length,
      active: projects.filter(project => project.status === "active").length,
      done,
      tasks: allTasks.length,
      progress: Math.round((done / allTasks.length) * 100),
    };
  }, [taskState]);

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filter === "all" || project.status === filter;
    const matchesTeam = teamFilter === "all" || project.teams.some(team => team.en === teamFilter);
    return matchesStatus && matchesTeam;
  });
  const activeProject = filteredProjects.find(project => project.id === selectedProject) ?? filteredProjects[0];

  const toggleTask = (taskId: string) => setTaskState(current => ({ ...current, [taskId]: !current[taskId] }));
  const focusProject = (projectId: string, resetFilters = true) => {
    setSelectedProject(projectId);
    if (resetFilters) {
      setFilter("all");
      setTeamFilter("all");
    }
    window.requestAnimationFrame(() => document.getElementById(`project-${projectId}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return <div dir={direction} className="work-projects-page store-account-page min-h-screen bg-[#fafcff] pb-[88px] font-['Poppins',sans-serif] text-[#1f2024] md:bg-[#f1f4f8]">
    <div className="hidden md:block"><StoreHeader /></div>

    <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 md:px-8 md:pb-16 md:pt-[64px]">
      <div className="work-projects-account-heading">
        <div><p className="work-projects-account-eyebrow">{isArabic ? "مكتب تنفيذ درعه" : "Deraah delivery office"}</p><h1>{isArabic ? "مشاريع العمل" : "Work projects"}</h1><p>{isArabic ? "خريطة تنفيذ المتجر من أول نقطة دخول حتى متابعة الطلب، مع مسؤولية كل فريق وخطوة العمل التالية." : "The store delivery map from first entry to order follow-up, with team ownership and the next move."}</p></div>
        <span className="work-projects-account-welcome"><Briefcase size={14} />{isArabic ? `${totals.projects} مشروعًا · ${storeSurfaces.length} سطحًا` : `${totals.projects} projects · ${storeSurfaces.length} surfaces`}</span>
      </div>

      <div className="work-projects-summary-strip" aria-label={isArabic ? "ملخص المشاريع" : "Project summary"}>
        <div><span>{isArabic ? "التقدم العام" : "Overall progress"}</span><strong>{totals.progress}%</strong><small>{isArabic ? "من المهام منجزة" : "of tasks complete"}</small></div>
        <div><span>{isArabic ? "قيد العمل" : "In progress"}</span><strong>{String(totals.active).padStart(2, "0")}</strong><small>{isArabic ? "مشروعًا نشطًا" : "active projects"}</small></div>
        <div><span>{isArabic ? "المهام المنجزة" : "Completed duties"}</span><strong>{String(totals.done).padStart(2, "0")}</strong><small>{isArabic ? `من أصل ${totals.tasks}` : `of ${totals.tasks}`}</small></div>
      </div>

      <section id="inventory" className="work-projects-account-panel work-projects-inventory">
        <div className="work-projects-inventory__intro">
          <p className="work-projects-eyebrow">00 · {isArabic ? "حصر أسطح المتجر" : "Store surface inventory"}</p>
          <h2>{isArabic ? "كل صفحة لها مشروع واضح داخل رحلة العميل" : "Every store surface has a clear project in the customer journey"}</h2>
          <p>{isArabic ? "هذا هو الحصر التشغيلي للصفحات التي يغطيها المتجر حاليًا. اختر أي سطح لتصل إلى المشروع المسؤول عنه." : "This is the operating inventory of the store surfaces currently covered. Each surface maps to the project responsible for it."}</p>
        </div>
      </section>

      <section id="projects" className="work-projects-account-panel work-projects-content">
        <div className="work-projects-overview">
          <div className="work-projects-filters">
            <div className="work-projects-filter-group">
              <span>{isArabic ? "حالة المشروع" : "Project status"}</span>
              <div className="work-projects-filter" role="group" aria-label={isArabic ? "تصفية حالة المشاريع" : "Filter project status"}>{(Object.keys(filterLabels) as ProjectFilter[]).map(item => <button key={item} type="button" className={filter === item ? "is-active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{copy(filterLabels[item], isArabic)}</button>)}</div>
            </div>
            <div className="work-projects-filter-group">
              <span>{isArabic ? "القسم المسؤول" : "Owning department"}</span>
              <div className="work-projects-filter" role="group" aria-label={isArabic ? "تصفية المشاريع حسب القسم" : "Filter projects by department"}>
                <button type="button" className={teamFilter === "all" ? "is-active" : ""} aria-pressed={teamFilter === "all"} onClick={() => setTeamFilter("all")}>{isArabic ? "كل الأقسام" : "All departments"}</button>
                {teamFilters.map(team => <button key={team.en} type="button" className={teamFilter === team.en ? "is-active" : ""} aria-pressed={teamFilter === team.en} onClick={() => setTeamFilter(team.en)}>{copy(team, isArabic)}</button>)}
              </div>
            </div>
          </div>
        </div>

        <div className="work-projects-workspace">
          <aside className="work-projects-sidebar" aria-label={isArabic ? "قائمة المشاريع بالتسلسل" : "Sequential project list"}>
            <div className="work-projects-sidebar__heading"><div><p>{isArabic ? "رحلة العميل" : "Customer journey"}</p><h3>{isArabic ? "المشاريع بالتسلسل" : "Projects in order"}</h3></div><strong>{String(filteredProjects.length).padStart(2, "0")}</strong></div>
            <div className="work-projects-sidebar__list">{filteredProjects.map(project => {
              const completed = project.tasks.filter(task => taskState[task.id]).length;
              const progress = Math.round((completed / project.tasks.length) * 100);
              return <button key={project.id} type="button" className={`work-projects-sidebar__item ${activeProject?.id === project.id ? "is-active" : ""}`} onClick={() => focusProject(project.id, false)}><span className="work-projects-sidebar__item-top"><span>{project.number}</span><span className={`work-projects-sidebar__status work-projects-sidebar__status--${project.status}`} /></span><strong>{copy(project.title, isArabic)}</strong><span className="work-projects-sidebar__item-meta"><span>{copy(statusLabels[project.status], isArabic)}</span><span>{progress}%</span></span><span className="work-projects-sidebar__mini-progress"><span style={{ width: `${progress}%` }} /></span></button>;
            })}</div>
            <div className="work-projects-sidebar__legend"><span><i className="is-active" />{isArabic ? "قيد العمل" : "In progress"}</span><span><i className="is-ready" />{isArabic ? "جاهزة" : "Ready"}</span></div>
          </aside>

          <div className="work-projects-grid">
            {!activeProject && <div className="work-projects-empty">{isArabic ? "لا توجد مشاريع مطابقة لهذه التصفية." : "No projects match these filters."}</div>}
            {activeProject && (() => {
              const project = activeProject;
              const Icon = project.icon;
              const completed = project.tasks.filter(task => taskState[task.id]).length;
              const progress = Math.round((completed / project.tasks.length) * 100);
              return <article id={`project-${project.id}`} key={project.id} className={`work-project-card work-project-card--${project.accent}`}>
                <div className="work-project-card__header"><span className="work-project-card__number">{project.number}</span><span className={`work-project-status work-project-status--${project.status}`}><span />{copy(statusLabels[project.status], isArabic)}</span></div>
                <div className="work-project-card__title-row"><span className="work-project-icon"><Icon size={20} strokeWidth={1.8} /></span><div><p>{copy(project.eyebrow, isArabic)}</p><h3>{copy(project.title, isArabic)}</h3></div></div>
                <div className="work-project-card__route"><MapPin size={13} />{copy(project.route, isArabic)}</div>
                <p className="work-project-card__summary">{copy(project.summary, isArabic)}</p>
                <div className="work-project-card__features"><div className="work-project-card__section-label">{isArabic ? "الميزات والأجزاء المحصورة" : "Inventoried features & parts"}</div><div className="work-project-card__feature-list">{project.features.map(feature => <span key={feature.en}>{copy(feature, isArabic)}</span>)}</div></div>
                <div className="work-project-card__progress"><div><span>{isArabic ? "تقدم المشروع" : "Project progress"}</span><strong>{progress}%</strong></div><div className="work-project-progress"><span style={{ width: `${progress}%` }} /></div></div>
                <div className="work-project-card__teams"><span>{isArabic ? "الفرق المالكة" : "Owning teams"}</span><div>{project.teams.map(team => <span key={team.en}>{copy(team, isArabic)}</span>)}</div></div>
                <div className="work-project-card__tasks"><div className="work-project-card__tasks-heading"><span>{isArabic ? "واجبات الفرق بالتسلسل" : "Sequenced team duties"}</span><span>{completed}/{project.tasks.length}</span></div><div className="work-project-task-list">{project.tasks.map(task => <div key={task.id} className={`work-project-task ${taskState[task.id] ? "is-done" : ""}`}><span className="work-project-task__step">{task.step}</span><button type="button" aria-label={`${taskState[task.id] ? (isArabic ? "إلغاء إنجاز" : "Mark incomplete") : (isArabic ? "إنجاز" : "Mark complete")} ${copy(task.title, isArabic)}`} onClick={() => toggleTask(task.id)}><span>{taskState[task.id] && <Check size={11} strokeWidth={3} />}</span></button><span className="work-project-task__body"><strong>{copy(task.title, isArabic)}</strong><small><span className="work-project-task__team">{copy(task.team, isArabic)}</span><span className="work-project-task__phase">{copy(task.phase, isArabic)}</span></small></span></div>)}</div></div>
                <div className="work-project-card__footer"><span><Clock3 size={14} />{copy(project.priority, isArabic)}</span><button type="button" aria-label={isArabic ? "الانتقال إلى المشروع التالي" : "Go to next project"} onClick={() => { const currentIndex = projects.findIndex(item => item.id === project.id); const next = projects[(currentIndex + 1) % projects.length]; focusProject(next.id); }}><ChevronDown size={15} /></button></div>
              </article>;
            })()}
          </div>
        </div>
      </section>

    </main>
    <div className="md:hidden"><StoreMobileNav collapsed={false} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.location.assign("/mukafaati")} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>
    <StoreFooter />
  </div>;
}
