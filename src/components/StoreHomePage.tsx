import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, Pause, Play, ShoppingBag } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import { formatPrice, getGiftOfferForProduct } from "./storeCartData";
import CouponOffersDrawer from "./CouponOffersDrawer";
import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreFavorites } from "./StoreFavoritesContext";
import { useStoreLocale } from "./StoreLocaleContext";
import { ProductCarousel, QuickCartDrawer, recommendations, type Product as StoreProduct } from "./ProductDetailsPage";
import { GiftEligibilityBadge } from "./StoreGiftPicker";
import FragranceFinder from "./FragranceFinder";
import FragranceLab from "./FragranceLab";
import JellyRadio from "./JellyRadio";
import DepthCarousel from "./DepthCarousel";
import BellToggle from "./BellToggle";
import InteractiveAccessoriesSection from "./InteractiveAccessoriesSection";
import "./StoreHomePage.css";

type HomeProduct = {
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage?: string;
  badge?: string;
  outOfStock?: boolean;
};

const categories = ["Perfumes", "Oud", "Gifts", "Hair Care", "Accessories", "Home Care", "Body Care"];
const categoryImages = [
  "/product-assets/category-cutouts/perfumes-0.png",
  "/product-assets/category-cutouts/oud-wood-generated.png",
  "/product-assets/category-cutouts/gifts-2.png",
  "/product-assets/category-cutouts/hair-care-0.png",
  "/product-assets/category-cutouts/accessories-0.png",
  "/product-assets/category-cutouts/home-care-0.png",
  "/product-assets/category-cutouts/body-care-0.png",
];

const featuredProducts: HomeProduct[] = [
  { name: "Leader Perfume for Men 100 ml", brand: "PROUD", price: 220, oldPrice: 500, image: "/product-assets/real-products/black-woods.jpg", hoverImage: "/product-assets/gallery/leader-lifestyle.png", badge: "56% Off" },
  { name: "Green Woods Eau de Parfum", brand: "LINK", price: 258, oldPrice: 600, image: "/product-assets/real-products/green-woods.jpg", hoverImage: "/product-assets/hover-products/green-woods-hover.png", badge: "Best Seller" },
  { name: "Black Woods Eau de Toilette", brand: "LINK", price: 208, oldPrice: 500, image: "/product-assets/real-products/black-woods.jpg", hoverImage: "/product-assets/hover-products/black-woods-hover.png", badge: "National Day" },
  { name: "Maroon Perfume by LINK 200ml", brand: "LINK", price: 308, oldPrice: 420, image: "/product-assets/real-products/maroon.jpg", hoverImage: "/product-assets/hover-products/maroon-hover.png", badge: "1+2 Free", outOfStock: true },
  { name: "Link White Limited Edition 150ml", brand: "LINK", price: 288, oldPrice: 500, image: "/product-assets/real-products/link-white.jpg", hoverImage: "/product-assets/hover-products/link-white-hover.png", badge: "Limited Edition" },
  { name: "Silver Woods Eau de Parfum", brand: "LINK", price: 208, oldPrice: 500, image: "/product-assets/real-products/silver-woods.jpg", hoverImage: "/product-assets/hover-products/silver-woods-hover.png", badge: "New" },
];

const newArrivals: HomeProduct[] = [
  { name: "DERAAH PRIVATE Enjoy Eau de Parfum 100ml", brand: "DERAAH PRIVATE", price: 159, oldPrice: 378, image: "/product-assets/private-555.png", badge: "Special Offer" },
  { name: "MAIOS Aroma 100 ml", brand: "MAIOS", price: 108, oldPrice: 268, image: "/product-assets/misk-toffee.png", badge: "Save later" },
  { name: "PROUD Suave Perfume", brand: "PROUD", price: 294, oldPrice: 420, image: "/product-assets/leader.png", badge: "1+2 Free" },
  { name: "LINK Pedestal Extrait 100 ml", brand: "LINK", price: 348, image: "/product-assets/real-products/link-white.jpg", badge: "New" },
];

const newArrivalProducts: StoreProduct[] = newArrivals.map(product => ({
  name: product.name,
  brand: product.brand,
  price: formatPrice(product.price),
  oldPrice: formatPrice(product.oldPrice ?? product.price),
  image: product.image,
  hoverImage: product.hoverImage,
  offer: product.badge,
  views: "—",
}));

const priceNumber = (price: string) => Number(price.replace(/[^\d.]/g, ""));

const newArrivalTabs = [
  { id: "bestsellers", label: "Bestsellers", products: recommendations },
  { id: "new-in", label: "New in", products: newArrivalProducts },
  { id: "under-300", label: "Under SAR 300", products: [...recommendations, ...newArrivalProducts].filter(product => priceNumber(product.price) < 300) },
] as const;
type NewArrivalTabId = typeof newArrivalTabs[number]["id"];

const fragranceStoryCarouselItems = [
  {
    image: "/product-assets/story/new-arrivals/djewel-collection.png?v=original-20261020",
    alt: "The new D'JEWEL collection",
    eyebrow: "New release",
    title: "The new D'JEWEL collection",
    description: ["A special release from the new fragrance, designed to feel effortlessly refined.", "Perfume, shower gel, body & hair mist, and an elegant bag."],
    cta: "Discover the collection",
  },
  {
    image: "/product-assets/story/new-arrivals/pedestal-shower-gel.png?v=original-20261020",
    alt: "The new Pedestal Olé edition",
    eyebrow: "Special edition",
    title: "The new Pedestal Olé edition",
    description: ["A signature fragrance with a fresh, polished presence.", "Complete with shower gel, body & hair mist, and an elegant bag."],
    cta: "Explore the edition",
  },
  {
    image: "/product-assets/story/new-arrivals/lofty-bloom-set.png?v=original-20261020",
    alt: "The new Rarity collection",
    eyebrow: "Rarity collection",
    title: "The new Rarity collection",
    description: ["A soft fragrance with a body and hair spray in the same scent."],
    cta: "Choose what makes you shine",
  },
  {
    image: "/product-assets/story/new-arrivals/turquoise-gift-set.png?v=original-20261020",
    alt: "A luxury gift set from Deraah",
    eyebrow: "Elegant gift",
    title: "A gift with beautiful details",
    description: ["A complete set bringing fragrance and care together in an elegant box.", "A luxurious choice for you or someone special."],
    cta: "Explore the gifts",
  },
  {
    image: "/product-assets/story/new-arrivals/555-enjoy-set.png?v=original-20261020",
    alt: "The new 5·5·5 Enjoy collection",
    eyebrow: "New collection",
    title: "The new 5·5·5 Enjoy collection",
    description: ["A soft fragrance with caring touches for a joyful ritual.", "Treat yourself every day with Deraah."],
    cta: "Enjoy the collection",
  },
];

const fragranceStoryCarouselItemsAr = [
  {
    image: "/product-assets/story/new-arrivals/djewel-collection.png?v=original-20261020",
    alt: "مجموعة D'JEWEL الجديدة",
    eyebrow: "إصدار جديد",
    title: "مجموعة D'JEWEL الجديدة",
    description: ["إصدار خاص من العطر الجديد، صُمم ليمنحك أناقة بلا تكلّف.", "عطر وجل استحمام ورذاذ للجسم والشعر وحقيبة أنيقة."],
    cta: "اكتشف المجموعة",
  },
  {
    image: "/product-assets/story/new-arrivals/pedestal-shower-gel.png?v=original-20261020",
    alt: "إصدار بيدستال أوليه الجديد",
    eyebrow: "إصدار خاص",
    title: "إصدار بيدستال أوليه الجديد",
    description: ["عطر مميز بحضور منعش وأنيق.", "يتكامل مع جل الاستحمام ورذاذ الجسم والشعر وحقيبة أنيقة."],
    cta: "اكتشف الإصدار",
  },
  {
    image: "/product-assets/story/new-arrivals/lofty-bloom-set.png?v=original-20261020",
    alt: "مجموعة راريتي الجديدة",
    eyebrow: "مجموعة راريتي",
    title: "مجموعة راريتي الجديدة",
    description: ["عطر ناعم مع رذاذ للجسم والشعر بالنفحة نفسها."],
    cta: "اختر ما يبرز تألقك",
  },
  {
    image: "/product-assets/story/new-arrivals/turquoise-gift-set.png?v=original-20261020",
    alt: "مجموعة هدايا فاخرة من درعه",
    eyebrow: "هدية أنيقة",
    title: "هدية بتفاصيل جميلة",
    description: ["مجموعة متكاملة تجمع العطر والعناية داخل علبة أنيقة.", "خيار فاخر لك أو لشخص مميز."],
    cta: "اكتشف الهدايا",
  },
  {
    image: "/product-assets/story/new-arrivals/555-enjoy-set.png?v=original-20261020",
    alt: "مجموعة 5·5·5 إنجوي الجديدة",
    eyebrow: "مجموعة جديدة",
    title: "مجموعة 5·5·5 إنجوي الجديدة",
    description: ["عطر ناعم بلمسات عناية لطقس مليء بالفرح.", "دلّل نفسك كل يوم مع درعه."],
    cta: "استمتع بالمجموعة",
  },
];

export type DeraahBlogArticleSection = {
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  image?: string;
  imageAlt?: string;
  imageAltAr?: string;
};

export type DeraahBlogPost = {
  slug: string;
  category: string;
  categoryAr: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  intro: string;
  introAr: string;
  image: string;
  featureImage?: string;
  alt: string;
  readTime: string;
  readTimeAr: string;
  publishedAt: string;
  publishedAtAr: string;
  sections: DeraahBlogArticleSection[];
  href: string;
};

export const deraahBlogPosts: DeraahBlogPost[] = [
  {
    slug: "find-your-signature-scent",
    category: "Fragrance guide",
    categoryAr: "دليل العطور",
    title: "How to find a fragrance that feels like you",
    titleAr: "كيف تجد عطراً يشبهك",
    description: "Choose notes, build a signature, and make scent part of your daily ritual.",
    descriptionAr: "اختر النفحات، كوّن عطرك المميز، واجعل العطر جزءاً من طقوسك اليومية.",
    intro: "The best fragrance is not always the loudest one. It is the scent that settles naturally into your day and becomes part of the way people remember you.",
    introAr: "أفضل عطر ليس بالضرورة الأقوى حضوراً، بل هو العطر الذي ينسجم مع يومك ويصبح جزءاً من الطريقة التي يتذكرك بها الآخرون.",
    image: "/product-assets/story/raw-05.png",
    featureImage: "/product-assets/story/blog-signature-scent-lifestyle.webp",
    alt: "A fragrance bottle resting on textured grass",
    readTime: "5 min read",
    readTimeAr: "قراءة خلال 5 دقائق",
    publishedAt: "October 12, 2026",
    publishedAtAr: "12 أكتوبر 2026",
    href: "/blog/find-your-signature-scent",
    sections: [
      {
        title: "Start with the feeling",
        titleAr: "ابدأ بالإحساس",
        body: "Before choosing a bottle, choose the feeling you want to carry. Fresh citrus and airy woods feel bright and effortless, while amber, vanilla and darker woods create a warmer, more enveloping presence.",
        bodyAr: "قبل اختيار الزجاجة، اختر الإحساس الذي تريد أن تحمله معك. تمنحك الحمضيات والأخشاب الخفيفة حضوراً مشرقاً وعفوياً، بينما تصنع العنبر والفانيلا والأخشاب الداكنة حضوراً أكثر دفئاً واحتواءً.",
        image: "/product-assets/fragrance-notes-clean.png",
        imageAlt: "A clean arrangement of fragrance notes",
        imageAltAr: "ترتيب أنيق لنفحات العطر",
      },
      {
        title: "Give the fragrance time",
        titleAr: "امنح العطر وقته",
        body: "A fragrance changes as it warms on the skin. Smell the first spray, then wait for the heart and base notes to appear. This small pause is often where the right match becomes clear.",
        bodyAr: "يتغير العطر مع دفء البشرة. استنشق الرشة الأولى، ثم انتظر ظهور نفحات القلب والقاعدة. غالباً ما تكشف هذه الوقفة القصيرة عن العطر الأنسب لك.",
        image: "/product-assets/fragrance-flower-jasmine.png",
        imageAlt: "Jasmine and perfume notes",
        imageAltAr: "الياسمين ونفحات العطر",
      },
      {
        title: "Build a small signature wardrobe",
        titleAr: "كوّن خزانة عطرية صغيرة",
        body: "One everyday scent, one evening fragrance and one personal wildcard are enough to begin. Rotate them with intention and notice which notes keep finding their way back into your routine.",
        bodyAr: "يكفي أن تبدأ بعطر يومي، وعطر للمساء، وخيار جريء يعبر عن شخصيتك. بدّل بينها بوعي، ولاحظ النفحات التي تعود إليها دائماً في روتينك.",
      },
    ],
  },
  {
    slug: "the-notes-that-last",
    category: "The Deraah ritual",
    categoryAr: "طقس درعه",
    title: "The notes that make a fragrance memorable",
    titleAr: "النفحات التي تجعل العطر لا يُنسى",
    description: "Discover a balanced scent, from its bright opening to its lasting finish.",
    descriptionAr: "اكتشف عطراً متوازناً، من افتتاحيته المشرقة إلى قاعدته الآسرة.",
    intro: "Every memorable fragrance tells a story in layers. Understanding those layers makes choosing, wearing and gifting perfume feel more intuitive.",
    introAr: "كل عطر لا يُنسى يروي حكايته على طبقات. فهم هذه الطبقات يجعل اختيار العطر وارتداءه وتقديمه هدية أكثر سهولة ومتعة.",
    image: "/product-assets/story/notes-pyramid.png",
    alt: "Fragrance notes pyramid",
    readTime: "4 min read",
    readTimeAr: "قراءة خلال 4 دقائق",
    publishedAt: "September 28, 2026",
    publishedAtAr: "28 سبتمبر 2026",
    href: "/blog/the-notes-that-last",
    sections: [
      {
        title: "The opening makes the introduction",
        titleAr: "الافتتاحية تصنع الانطباع الأول",
        body: "Top notes are the first impression: citrus, herbs, fruits and other bright accents that lift from the skin quickly. They invite you in, but they are only the beginning.",
        bodyAr: "النفحات العليا هي الانطباع الأول: الحمضيات والأعشاب والفواكه وغيرها من اللمسات المشرقة التي تظهر سريعاً على البشرة. إنها تدعوك لاكتشاف العطر، لكنها ليست سوى البداية.",
        image: "/product-assets/fragrance-notes.png",
        imageAlt: "A visual study of perfume notes",
        imageAltAr: "دراسة بصرية لنفحات العطر",
      },
      {
        title: "The heart is where character lives",
        titleAr: "في القلب تسكن شخصية العطر",
        body: "Floral, spicy and aromatic heart notes give the fragrance its personality. This is the moment to notice whether the scent feels soft, confident, playful or refined.",
        bodyAr: "تمنح النفحات الزهرية والتوابل والعناصر العطرية العطر شخصيته. هنا تكتشف ما إذا كان العطر ناعماً أو واثقاً أو مرحاً أو راقياً.",
        image: "/product-assets/story/raw-13.png",
        imageAlt: "A refined perfume moment",
        imageAltAr: "لحظة عطرية راقية",
      },
      {
        title: "The base leaves the memory",
        titleAr: "القاعدة تترك الذكرى",
        body: "Woods, musk, amber and vanilla create the lasting trail. A balanced base does not need to be heavy; it simply gives the fragrance a beautiful place to rest.",
        bodyAr: "تصنع الأخشاب والمسك والعنبر والفانيلا الأثر الأخير. لا تحتاج القاعدة المتوازنة إلى أن تكون ثقيلة؛ يكفي أن تمنح العطر مكاناً جميلاً ليستقر فيه.",
      },
    ],
  },
  {
    slug: "thoughtful-gifts-for-every-occasion",
    category: "Gifting edit",
    categoryAr: "اختيارات الهدايا",
    title: "Thoughtful gifts for every kind of occasion",
    titleAr: "هدايا جميلة لكل مناسبة",
    description: "Find a thoughtful fragrance gift for celebrations and heartfelt thank-yous.",
    descriptionAr: "اعثر على هدية عطرية مميزة للاحتفالات ولحظات الشكر الصادقة.",
    intro: "A beautiful gift starts with attention. Choose a scent and presentation that match the moment, then add one small personal detail that makes the gesture feel unmistakably yours.",
    introAr: "تبدأ الهدية الجميلة بالاهتمام. اختر عطراً وتغليفاً يناسبان المناسبة، ثم أضف لمسة شخصية صغيرة تجعل الهدية معبّرة عنك.",
    image: "/product-assets/gallery/hero-editorial-3.webp",
    alt: "Deraah fragrance collection presented as a gift",
    readTime: "3 min read",
    readTimeAr: "قراءة خلال 3 دقائق",
    publishedAt: "September 10, 2026",
    publishedAtAr: "10 سبتمبر 2026",
    href: "/blog/thoughtful-gifts-for-every-occasion",
    sections: [
      {
        title: "Match the gift to the moment",
        titleAr: "طابق الهدية مع المناسبة",
        body: "For a birthday, look for something joyful and easy to wear. For a thank-you, a polished everyday scent feels generous without being overwhelming. For a new beginning, choose a complete set that turns opening the box into a little ritual.",
        bodyAr: "لأعياد الميلاد، اختر عطراً مبهجاً وسهل الاستخدام. وللتعبير عن الشكر، يكون العطر اليومي الأنيق كريماً من دون مبالغة. أما البدايات الجديدة فتليق بها مجموعة متكاملة تحوّل فتح العلبة إلى طقس جميل.",
        image: "/product-assets/gifts/luxury-floral-gift.png",
        imageAlt: "A luxury floral fragrance gift",
        imageAltAr: "هدية عطرية فاخرة بتفاصيل زهرية",
      },
      {
        title: "When you do not know their signature",
        titleAr: "عندما لا تعرف عطرهم المفضل",
        body: "Stay close to welcoming families: soft florals, clean woods, fresh citrus or a well-balanced gift set. These are thoughtful choices that leave room for the recipient's own style.",
        bodyAr: "اقترب من العائلات العطرية المحببة للجميع: الزهور الناعمة، والأخشاب النظيفة، والحمضيات المنعشة، أو مجموعة هدايا متوازنة. خيارات جميلة تترك مساحة لذوق الشخص نفسه.",
        image: "/product-assets/gift-cards/classic-triptych.png",
        imageAlt: "Classic gift presentation ideas",
        imageAltAr: "أفكار كلاسيكية لتقديم الهدايا",
      },
      {
        title: "Make the final detail personal",
        titleAr: "اجعل اللمسة الأخيرة شخصية",
        body: "A short note, a carefully chosen card or a ribbon in their favourite colour can make a familiar gift feel one of a kind. The detail does not need to be big; it only needs to be considered.",
        bodyAr: "تجعل رسالة قصيرة، أو بطاقة مختارة بعناية، أو شريط بلونهم المفضل، الهدية المألوفة خاصة جداً. لا تحتاج اللمسة إلى أن تكون كبيرة؛ يكفي أن تكون مدروسة.",
      },
    ],
  },
  {
    slug: "build-your-scent-wardrobe",
    category: "Scent wardrobe",
    categoryAr: "خزانة العطور",
    title: "Build a fragrance wardrobe for every moment",
    titleAr: "كوّن مجموعة عطور لكل لحظة",
    description: "Pair bright daytime notes with warm evening scents for every moment.",
    descriptionAr: "نسّق نفحات النهار المشرقة مع عطور المساء الدافئة لكل لحظة.",
    intro: "Your fragrance wardrobe can be as personal as your clothes. A considered edit gives every day, mood and occasion its own finishing touch.",
    introAr: "يمكن لخزانة عطرك أن تكون شخصية مثل ملابسك. مجموعة مختارة بعناية تمنح كل يوم ومزاج ومناسبة لمستها الأخيرة.",
    image: "/product-assets/story/raw-10.jpeg",
    featureImage: "/product-assets/story/blog-scent-wardrobe-lifestyle.webp",
    alt: "A collection of black fragrance bottles",
    readTime: "4 min read",
    readTimeAr: "قراءة خلال 4 دقائق",
    publishedAt: "August 22, 2026",
    publishedAtAr: "22 أغسطس 2026",
    href: "/blog/build-your-scent-wardrobe",
    sections: [
      {
        title: "Keep an everyday favourite",
        titleAr: "احتفظ بعطر يومي مفضل",
        body: "Begin with a fragrance that feels easy and natural: something you can wear to work, on errands or whenever you want a quiet lift. This is the dependable centre of your wardrobe.",
        bodyAr: "ابدأ بعطر سهل وطبيعي: عطر يمكنك ارتداؤه للعمل أو أثناء مشاويرك أو كلما احتجت إلى انتعاش هادئ. هذا هو أساس خزانة عطرك.",
        image: "/product-assets/story/raw-17.png",
        imageAlt: "A fragrance arranged for everyday wear",
        imageAltAr: "عطر مرتب للاستخدام اليومي",
      },
      {
        title: "Add contrast for the evening",
        titleAr: "أضف اختلافاً للمساء",
        body: "Warm woods, amber, spices and richer florals give evening its own language. Choose one scent with more depth rather than simply applying more of the same fragrance.",
        bodyAr: "تمنح الأخشاب الدافئة والعنبر والتوابل والزهور الغنية المساء لغته الخاصة. اختر عطراً أعمق بدلاً من زيادة كمية العطر نفسه.",
        image: "/product-assets/story/raw-18.png",
        imageAlt: "Warm evening fragrance styling",
        imageAltAr: "تنسيق عطري دافئ للمساء",
      },
      {
        title: "Leave space for discovery",
        titleAr: "اترك مساحة للاكتشاف",
        body: "The fourth bottle does not need to fit a rule. Let it be a new texture, a surprising note or a seasonal mood. The best wardrobes keep changing with you.",
        bodyAr: "لا يحتاج العطر الرابع إلى الالتزام بقاعدة. دعه يكون تجربة جديدة أو نفحة مفاجئة أو مزاجاً موسمياً. أجمل الخزائن تتغير معك.",
      },
    ],
  },
];

function DeraahBlogCard({ post, isArabic }: { post: DeraahBlogPost; isArabic: boolean }) {
  const category = isArabic ? post.categoryAr : post.category;
  const title = isArabic ? post.titleAr : post.title;
  const description = isArabic ? post.descriptionAr : post.description;
  const readTime = isArabic ? post.readTimeAr : post.readTime;
  return (
    <a
      href={post.href}
      aria-label={`${title} — ${readTime}`}
      className="group flex h-full w-[88%] min-w-[88%] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] bg-white text-[#171717] no-underline shadow-[0_8px_28px_rgba(44,34,28,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(44,34,28,.12)] sm:w-auto sm:min-w-0 sm:shrink sm:snap-none"
    >
      <div className="relative aspect-[1.35] shrink-0 overflow-hidden bg-[#e9e2db]">
        <img src={post.image} alt={post.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2 whitespace-nowrap rounded-full bg-white/90 px-2 py-1 text-[8px] font-medium uppercase tracking-[.1em] text-[#5e4435] backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:text-[9px] sm:tracking-[.14em]">{category}</span>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <span className="text-[9px] uppercase tracking-[.1em] text-[#968c84] sm:text-[10px] sm:tracking-[.14em]">{readTime}</span>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-[1.15] tracking-[-.03em] text-[#181615] sm:text-lg sm:leading-[1.12]">{title}</h3>
        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-[#746d68] sm:mt-3 sm:text-xs sm:leading-5">{description}</p>
        <span className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-[10px] font-medium text-[#201d1b] underline decoration-[#b98a68] underline-offset-4 transition-colors group-hover:text-[#9a5a2e] sm:gap-2 sm:pt-5 sm:text-xs">{isArabic ? "اقرأ المقال" : "Read the story"} <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" /></span>
      </div>
    </a>
  );
}

export function DeraahBlogFeatureSlider() {
  const { language, direction } = useStoreLocale();
  const isArabic = language === "العربية";
  const [activeIndex, setActiveIndex] = useState(0);
  const activePost = deraahBlogPosts[activeIndex];
  const activeCategory = isArabic ? activePost.categoryAr : activePost.category;
  const activeTitle = isArabic ? activePost.titleAr : activePost.title;
  const activeDescription = isArabic ? activePost.descriptionAr : activePost.description;
  const activeReadTime = isArabic ? activePost.readTimeAr : activePost.readTime;
  const PreviousIcon = isArabic ? ArrowRight : ArrowLeft;
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % deraahBlogPosts.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const moveSlide = (delta: number) => {
    setActiveIndex(index => (index + delta + deraahBlogPosts.length) % deraahBlogPosts.length);
  };

  return (
    <section aria-labelledby="deraah-blog-feature-title" className="border-y border-[#ebe7e2] bg-[#f6f1ec] px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="deraah-blog-feature-title" className="text-2xl font-medium tracking-[-.03em] text-[#111] sm:text-3xl">Stories behind the scent</h2>
            <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#706d69]">Fragrance notes, thoughtful rituals and gifting ideas from the world of Deraah.</p>
          </div>
          <a href="/blog" className="inline-flex w-fit items-center gap-2 text-xs font-medium text-[#222] no-underline transition-colors hover:text-[#9a5a2e]">View all stories <ArrowRight size={14} /></a>
        </div>

        <div
          dir={direction}
          role="region"
          aria-label={isArabic ? "القصة المميزة" : "Featured journal story"}
          aria-roledescription="carousel"
          className="blog-feature-slider relative mb-8 grid overflow-hidden rounded-[24px] bg-[#171515] text-white shadow-[0_20px_50px_rgba(33,23,18,.12)] lg:grid-cols-[1.08fr_.92fr]"
        >
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[380px] lg:min-h-[430px]">
            <img key={activePost.featureImage || activePost.image} src={activePost.featureImage || activePost.image} alt={activePost.alt} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
            <span className="absolute bottom-5 left-5 rounded-full border border-white/40 bg-black/20 px-3 py-1 text-[9px] font-medium uppercase tracking-[.16em] text-white backdrop-blur-sm sm:bottom-7 sm:left-7">{activeCategory}</span>
          </div>
          <div className="flex min-h-[280px] flex-col justify-between p-6 sm:min-h-[380px] sm:p-10 lg:min-h-[430px] lg:p-12">
            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[.2em] text-[#d5aa7f]">Featured story</p>
              <h3 className="max-w-[480px] text-2xl font-medium leading-[1.08] tracking-[-.035em] sm:text-4xl">{activeTitle}</h3>
              <p className="mt-4 max-w-[430px] text-sm leading-6 text-white/70">{activeDescription}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <a href={activePost.href} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-medium text-[#171515] no-underline transition hover:bg-[#ead7c8]">Read the story <ArrowRight size={14} /></a>
              <span className="text-[10px] uppercase tracking-[.16em] text-white/55">{activeReadTime}</span>
            </div>
          </div>
          <button type="button" onClick={() => moveSlide(-1)} aria-label={isArabic ? "القصة السابقة" : "Previous story"} className="absolute left-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#171515] sm:left-6 sm:top-6"><PreviousIcon size={17} /></button>
          <button type="button" onClick={() => moveSlide(1)} aria-label={isArabic ? "القصة التالية" : "Next story"} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#171515] sm:right-6 sm:top-6"><NextIcon size={17} /></button>
          <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 sm:bottom-7 sm:right-7">
            {deraahBlogPosts.map((post, index) => <button key={post.title} type="button" onClick={() => setActiveIndex(index)} aria-label={`${isArabic ? "الانتقال إلى القصة" : "Go to story"} ${index + 1}`} aria-pressed={index === activeIndex} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-white" : "w-1.5 bg-white/45"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DeraahBlogSection() {
  const { language } = useStoreLocale();
  const isArabic = language === "العربية";
  return (
    <section id="deraah-blog" aria-labelledby="deraah-blog-title" className="border-b border-[#ebe7e2] bg-[#f6f1ec] px-4 pb-16 pt-4 sm:pb-20 sm:pt-6">
      <div className="mx-auto max-w-[1320px]">

        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-medium tracking-[-.02em] text-[#171515] sm:text-xl">{isArabic ? "مدونة درعه" : "Latest stories"}</h3>
          <span className="text-[10px] uppercase tracking-[.16em] text-[#968c84]">{deraahBlogPosts.length} stories</span>
        </div>
        <div role="region" aria-label="Deraah journal stories" aria-roledescription="carousel" className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
          {deraahBlogPosts.map(post => <DeraahBlogCard key={post.title} post={post} isArabic={isArabic} />)}
        </div>
      </div>
    </section>
  );
}

const heroSlides = [
  {
    image: "/product-assets/gallery/hero-555.jpg",
    alt: "Deraah Private 5·5·5 fragrance collection",
    eyebrow: "5·5·5 collection 01",
    lines: ["No time", "for anything", "but pleasure."],
    description: "Indulge in Deraah Private’s playful 5·5·5 collection, made for sweet rituals, joyful moments, and pleasure that lingers.",
    cta: "Enjoy Now",
    href: "/enjoy",
    imagePosition: "object-center",
  },
  {
    image: "/product-assets/gallery/stadium-hero.jpg",
    alt: "A bold fragrance collection on a dark stadium set",
    eyebrow: "Signature collection 02",
    lines: ["Make an", "entrance", "worth remembering."],
    description: "Discover a confident fragrance with a bold presence and a lasting signature.",
    cta: "Explore the collection",
    href: "#shop",
    imagePosition: "object-center",
  },
  {
    image: "/product-assets/gallery/hero-editorial-3.webp",
    alt: "Luxury fragrance collection framed by a marble arch at sunset",
    eyebrow: "BUY 1, GET 2 FREE",
    lines: ["Buy one", "get two", "free."],
    description: "Buy one fragrance and receive two more fragrances free.",
    cta: "Shop the offer",
    href: "#shop",
    imagePosition: "object-center",
  },
] as const;

const heroSlidesAr = [
  {
    image: "/product-assets/gallery/hero-555.jpg",
    alt: "مجموعة عطور درعه برايفت 5·5·5",
    eyebrow: "مجموعة 5·5·5 رقم 01",
    lines: ["لا وقت", "إلا للمتعة", "فقط."],
    description: "استمتع بمجموعة درعه برايفت المرحة 5·5·5، المصممة للطقوس الجميلة واللحظات السعيدة والمتعة التي تدوم.",
    cta: "استمتع الآن",
    href: "/enjoy",
    imagePosition: "object-center",
  },
  {
    image: "/product-assets/gallery/stadium-hero.jpg",
    alt: "مجموعة عطور جريئة في أجواء مميزة",
    eyebrow: "المجموعة المميزة رقم 02",
    lines: ["اصنع", "حضوراً", "يستحق التذكر."],
    description: "اكتشف عطراً واثقاً بحضور جريء وأثر يدوم.",
    cta: "اكتشف المجموعة",
    href: "#shop",
    imagePosition: "object-center",
  },
  {
    image: "/product-assets/gallery/hero-editorial-3.webp",
    alt: "مجموعة عطور فاخرة بإطار رخامي عند الغروب",
    eyebrow: "اشترِ واحداً واحصل على اثنين مجاناً",
    lines: ["اشترِ واحداً", "واحصل على اثنين", "مجاناً."],
    description: "اشترِ عطراً واحصل على عطرين إضافيين مجاناً.",
    cta: "تسوق العرض",
    href: "#shop",
    imagePosition: "object-center",
  },
] as const;

function HeroCarousel() {
  const { language } = useStoreLocale();
  const slides = language === "العربية" ? heroSlidesAr : heroSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const slideCount = slides.length;

  const goToSlide = (index: number) => setActiveIndex((index + slideCount) % slideCount);
  const goToNext = () => setActiveIndex(current => (current + 1) % slideCount);
  const goToPrevious = () => setActiveIndex(current => (current - 1 + slideCount) % slideCount);

  useEffect(() => {
    if (isPaused) return;
    const timerId = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % slideCount);
    }, 6000);
    return () => window.clearInterval(timerId);
  }, [isPaused, slideCount]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    }
    if (event.key === "Home") {
      event.preventDefault();
      goToSlide(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goToSlide(slideCount - 1);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setIsPaused(true);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 50) {
      if (distance < 0) goToNext();
      else goToPrevious();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured fragrance collections"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStartX.current = null; setIsPaused(false); }}
      className="relative isolate min-h-[700px] w-full overflow-hidden bg-[#0a0a0a] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#9a5a2e] sm:min-h-[760px] lg:min-h-[calc(100vh-36px)]"
    >
      <style>{`@keyframes hero-carousel-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } } .hero-carousel-progress { animation: hero-carousel-progress 6s linear both; transform-origin: left; } @media (prefers-reduced-motion: reduce) { .hero-carousel-progress { animation: none; transform: scaleX(1); } }`}</style>
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        return (
          <article
            key={slide.image}
            aria-hidden={!isActive}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slideCount}: ${slide.lines.join(" ")}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover ${slide.imagePosition} transition-transform duration-[10000ms] ease-out ${isActive ? "scale-105" : "scale-100"}`}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 flex min-h-[700px] items-end px-7 pb-32 pt-48 sm:min-h-[760px] sm:px-12 sm:pb-32 lg:min-h-[calc(100vh-36px)] lg:px-[clamp(64px,8vw,138px)] lg:pb-28 lg:pt-36">
          <div className="store-hero-copy max-w-md max-sm:mb-8">
              <span className={`mb-2 block text-[10px] uppercase tracking-[.4em] text-white/75 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2.5 opacity-0"}`} style={{ transitionDelay: isActive ? "200ms" : "0ms" }}>{slide.eyebrow}</span>
              <h1 className={`mb-6 max-w-[552px] text-3xl font-light leading-[1.08] tracking-[-.035em] text-white transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] sm:text-4xl lg:text-5xl ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2.5 opacity-0"}`} style={{ transitionDelay: isActive ? "400ms" : "0ms" }}>
                {slide.lines.map(line => <span key={line} className="block">{line}</span>)}
              </h1>
              <p className={`mb-6 max-w-[440px] text-xs leading-5 text-white/75 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] sm:text-sm ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2.5 opacity-0"}`} style={{ transitionDelay: isActive ? "520ms" : "0ms" }}>{slide.description}</p>
              <a href={slide.href} tabIndex={isActive ? 0 : -1} className={`group relative inline-block text-xs font-semibold uppercase tracking-[.2em] text-white no-underline transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2.5 opacity-0"}`} style={{ transitionDelay: isActive ? "650ms" : "0ms" }}>{slide.cta}<span className="absolute -bottom-[3px] left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-in-out group-hover:origin-left group-hover:scale-x-100" /></a>
              </div>
            </div>
          </article>
        );
      })}
      <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-between px-7 sm:px-12 lg:px-[clamp(64px,8vw,138px)]">
        <div className="flex items-center gap-3" aria-label="Choose a hero slide">
          <span className="text-[10px] font-medium tracking-[.18em] text-white/80">{String(activeIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}</span>
          {heroSlides.map((slide, index) => (
            <button key={slide.image} type="button" aria-label={`Show slide ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} onClick={() => goToSlide(index)} className="group flex h-5 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <span className="block h-1 w-10 overflow-hidden rounded-full bg-white/40 sm:w-14">
                {index === activeIndex && <span key={activeIndex} className="hero-carousel-progress block h-full w-full rounded-full bg-white" style={{ animationPlayState: isPaused ? "paused" : "running" }} />}
              </span>
            </button>
          ))}
          <button type="button" aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"} onClick={() => setIsPaused(paused => !paused)} className="ml-2 grid h-8 w-8 place-items-center rounded-full border border-white/45 text-white transition hover:bg-white hover:text-[#171513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
          </button>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button type="button" aria-label="Previous slide" onClick={goToPrevious} className="grid h-10 w-10 place-items-center rounded-full border border-white/45 text-white transition hover:bg-white hover:text-[#171513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowLeft size={15} /></button>
          <button type="button" aria-label="Next slide" onClick={goToNext} className="grid h-10 w-10 place-items-center rounded-full border border-white/45 text-white transition hover:bg-white hover:text-[#171513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowRight size={15} /></button>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onAdd, onFavorite, favorite }: { product: HomeProduct; onAdd: () => void; onFavorite: () => void; favorite: boolean }) {
  const giftOffer = getGiftOfferForProduct(product.name);
  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[18px] border border-[#ece9e4] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,25,18,.10)]">
      <div className="relative aspect-[.9] overflow-hidden bg-[#f5f4f2]">
        <a href="/product-details" aria-label={`View ${product.name}`} className="block h-full w-full">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035] group-hover:opacity-0" />
          {product.hoverImage && <img src={product.hoverImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100" />}
        </a>
        {product.outOfStock ? <span className="store-offer-badge single absolute left-1/2 top-0 z-10 flex h-[18px] w-[120px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-b-[6px] bg-white text-[9px] font-semibold text-[#d50000]"><span className="store-offer-badge-track"><span>OUT OF STOCK</span></span></span> : product.badge && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium text-[#242424] shadow-sm">{product.badge}</span>}
        <div className="pointer-events-auto absolute right-3 top-3 flex translate-x-0 flex-col gap-2 opacity-100 transition duration-200 md:pointer-events-none md:translate-x-2 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-x-0 md:group-hover:opacity-100">
          <button type="button" aria-label={`${favorite ? "Remove" : "Add"} ${product.name} ${favorite ? "from" : "to"} wishlist`} onClick={onFavorite} className={`grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm transition hover:bg-[#111] hover:text-white ${favorite ? "text-[#b01f4b]" : "text-[#222]"}`}><Heart size={16} fill={favorite ? "currentColor" : "none"} strokeWidth={1.7} /></button>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[.16em] text-[#88837d]">{product.brand}</p>
        <a href="/product-details" className="block min-h-[42px] text-[13px] font-medium leading-5 text-[#181818] no-underline transition-colors hover:text-[#9a5a2e]">{product.name}</a>
        {giftOffer && <GiftEligibilityBadge className="mt-2 w-fit" />}
        <div className="product-card-actions mt-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 whitespace-nowrap"><strong className="text-[15px] font-semibold text-[#111]"><RiyalPrice value={product.price} /></strong>{product.oldPrice && <s className="text-[10px] text-[#9b9996]"><RiyalPrice value={product.oldPrice} /></s>}</div>
          {product.outOfStock ? <BellToggle offLabel="Notify me" onLabel="Notified" size="sm" color="#111111" background="#ffffff" onColor="#111111" onBackground="#ffffff" radius={18} ringAmplitude={12} ringPasses={4} ringDuration={700} badge={false} className="product-notify-toggle ml-auto" /> : <button type="button" aria-label={`Add ${product.name} to cart`} onClick={onAdd} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d8d4cf] text-[#161616] transition hover:border-[#161616] hover:bg-[#161616] hover:text-white"><ShoppingBag size={16} strokeWidth={1.7} /></button>}
        </div>
      </div>
    </article>
  );
}

function ProductRail({ products, activeTab, onTabChange, onAdd, onFavorite, favorites }: { products: StoreProduct[]; activeTab: NewArrivalTabId; onTabChange: (tab: NewArrivalTabId) => void; onAdd: (product: StoreProduct, quantity: number, variant?: string) => void; onFavorite: (product: StoreProduct) => void; favorites: string[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-[-.03em] text-[#111] sm:text-3xl">New arrivals</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <JellyRadio
            items={newArrivalTabs.map(tab => ({ value: tab.id, label: tab.label }))}
            value={activeTab}
            onChange={value => onTabChange(value as NewArrivalTabId)}
            chipColor="transparent"
            activeColor="#ffffff"
            textColor="#555b58"
            activeTextColor="#171717"
            size="md"
            gap={4}
            radius={18}
            swell={0.12}
            barge={2}
            shrink={0.03}
            jelly={1}
            bounce={0.22}
            stagger={0}
            stiffness={580}
            ariaLabel="New arrivals filters"
            className="new-arrivals-filters w-full justify-start rounded-full bg-[#ecece9] sm:w-auto sm:justify-center lg:mr-[398px]"
          />
          <a href="#shop" className="hidden items-center gap-2 text-xs font-medium text-[#222] no-underline transition-colors hover:text-[#a85e2e] sm:flex">View all {products.length} <ArrowRight size={14} /></a>
        </div>
      </div>
      <ProductCarousel products={products} onAddToCart={onAdd} favorites={favorites} onFavorite={onFavorite} />
    </section>
  );
}

function RecentlyViewedRail({ products, onAdd, onFavorite, favorites }: { products: StoreProduct[]; onAdd: (product: StoreProduct, quantity: number, variant?: string) => void; onFavorite: (product: StoreProduct) => void; favorites: string[] }) {
  return <section id="shop" className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-0 lg:py-20">
    <div className="mb-7 flex items-end justify-between gap-4 lg:-mt-[65px]"><div><h2 className="text-2xl font-medium tracking-[-.03em] text-[#111] sm:text-3xl">Recently Viewed</h2></div><a href="/product-details#recent" className="hidden items-center gap-2 text-xs font-medium text-[#222] no-underline transition-colors hover:text-[#a85e2e] sm:flex">View all <ArrowRight size={14} /></a></div>
    <ProductCarousel products={products} recent onAddToCart={onAdd} favorites={favorites} onFavorite={onFavorite} />
  </section>;
}

export default function StoreHomePage() {
  const { direction, language } = useStoreLocale();
  const { favoriteNames, toggleFavorite: toggleStoreFavorite } = useStoreFavorites();
  const [newArrivalTab, setNewArrivalTab] = useState<NewArrivalTabId>("bestsellers");
  const [fragranceStoryActiveIndex, setFragranceStoryActiveIndex] = useState(0);
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const [toast, setToast] = useState("");
  const [giftOffersOpen, setGiftOffersOpen] = useState(false);
  const [quickCartOpen, setQuickCartOpen] = useState(false);
  const [lastAddedCartItem, setLastAddedCartItem] = useState<StoreCartItem | null>(null);
  const categoryRailRef = useRef<HTMLDivElement | null>(null);
  const { cartItems, cartItemCount: cartCount, addToCart: addSharedCartItem } = useStoreCart();
  const fragranceStoryItems = language === "العربية" ? fragranceStoryCarouselItemsAr : fragranceStoryCarouselItems;
  const activeFragranceStory = fragranceStoryItems[fragranceStoryActiveIndex] ?? fragranceStoryItems[0];

  const addToCart = (product: HomeProduct) => {
    addSharedCartItem({ id: `${product.name}-default`, name: product.name, brand: product.brand, price: String(product.price), oldPrice: product.oldPrice === undefined ? undefined : String(product.oldPrice), image: product.image, quantity: 1 });
    setToast(`${product.name} added to cart`);
    window.setTimeout(() => setToast(""), 2200);
  };
  const addRecentlyViewedToCart = (product: StoreProduct, quantity = 1, variant?: string) => {
    const itemId = `${product.name}-${variant ?? "default"}`;
    const addedItem: StoreCartItem = { id: itemId, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image, quantity, variant };
    const existing = cartItems.find(item => item.id === itemId);
    addSharedCartItem(addedItem);
    setLastAddedCartItem(existing ? { ...existing, quantity: existing.quantity + quantity } : addedItem);
    setQuickCartOpen(true);
  };
  useEffect(() => {
    const rail = categoryRailRef.current;
    if (!rail) return;
    const timerId = window.setInterval(() => {
      if (!window.matchMedia("(max-width: 639px)").matches || rail.scrollWidth <= rail.clientWidth) return;
      const firstCard = rail.querySelector<HTMLElement>("[data-category-card]");
      const step = (firstCard?.offsetWidth ?? rail.clientWidth / 2.5) + 4;
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      const nextScroll = rail.scrollLeft + step;
      rail.scrollTo({ left: nextScroll >= maxScroll - 1 ? 0 : nextScroll, behavior: "smooth" });
    }, 3000);
    return () => window.clearInterval(timerId);
  }, []);
  const toggleFavorite = (product: StoreProduct) => toggleStoreFavorite({ id: product.name, name: product.name, brand: product.brand, price: product.price, oldPrice: product.oldPrice, image: product.image });
  const activeNewArrivalProducts = newArrivalTabs.find(tab => tab.id === newArrivalTab)?.products ?? newArrivalTabs[0].products;
  return <div dir={direction} className="store-home min-h-screen bg-[#fff] font-sans text-start text-[#161616]">
    <StoreHeader overlay />
    <QuickCartDrawer open={quickCartOpen} item={lastAddedCartItem} items={cartItems} onViewCart={() => { setQuickCartOpen(false); window.location.assign("/checkout"); }} onClose={() => setQuickCartOpen(false)} />

    <main className="bg-white">
      <HeroCarousel />

      <section id="gift-offers" aria-label="Gift offers" className="mx-0 max-w-none px-0 py-7 sm:py-10 lg:py-14">
        <style>{`@media (max-width: 639px) { #gift-offers .gift-offer-track { gap: 12px !important; } #gift-offers .gift-offer-track > a:first-child, #gift-offers .gift-bonus-slide { flex: 0 0 88% !important; min-width: 88% !important; } #gift-offers .gift-bonus-slide > a { min-width: 0 !important; min-height: 0 !important; flex: 1 1 0 !important; padding: 12px 16px !important; } #gift-offers .gift-offer-track > a:first-child { padding: 16px 12px !important; } #gift-offers .gift-offer-track > a:first-child > span:nth-of-type(2) { gap: 4px !important; } #gift-offers .gift-offer-track > a:first-child > span:nth-of-type(2) > span:first-child { height: 140px !important; width: 140px !important; } #gift-offers .gift-offer-track > a:first-child > span:nth-of-type(2) > span:nth-of-type(2) { padding-left: 49px !important; } #gift-offers .gift-offer-track > a:first-child strong { font-size: 1.875rem !important; } #gift-offers .gift-bonus-slide > a > span:nth-of-type(2) { font-size: 9px !important; line-height: 12px !important; } #gift-offers .gift-bonus-slide > a strong { font-size: 1rem !important; line-height: 1.15 !important; } #gift-offers .gift-bonus-slide > a:first-child > span:last-child { height: 96px !important; width: 96px !important; } }`}</style>
        <div className="relative overflow-hidden rounded-none bg-[#f8eee9] lg:-mt-[50px]">
          <span className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full border-[28px] border-[#e9b2bb]/35" />
          <span className="pointer-events-none absolute bottom-[-90px] left-[36%] h-64 w-64 rounded-full bg-[#f2c9c5]/35 blur-2xl" />
          <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-7 sm:px-8 sm:py-9 lg:grid lg:grid-cols-[.9fr_1.5fr] lg:gap-10 lg:px-12 lg:py-11">
          <div className="relative z-10 flex flex-col justify-between lg:justify-center">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.22em] text-[#8d3150]">A little extra, just for you</p>
              <h2 className="max-w-[360px] text-3xl font-medium leading-[1.03] tracking-[-.045em] text-[#3f1d2b] sm:text-4xl">Make every order<br />feel like a gift.</h2>
            </div>
            <button type="button" onClick={() => setGiftOffersOpen(true)} className="mt-7 flex w-fit items-center gap-2 rounded-full bg-[#6f1e3b] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#491329]">Explore gift offers <ArrowRight size={14} /></button>
          </div>
          <div className="gift-offer-track relative z-10 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:mt-0">
            <a href="#shop" className="group relative mt-1 min-w-[88%] snap-start flex min-h-[250px] flex-col items-center justify-between gap-x-[10px] gap-y-px overflow-hidden rounded-[16px] bg-[#6f1e3b] px-5 py-[30px] text-white no-underline transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(111,30,59,.22)] sm:row-span-2 sm:min-w-0 sm:snap-none sm:px-6 lg:mt-[25px] lg:min-h-[220px] lg:px-[31px] lg:py-[24px]">
              <span className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[18px] border-white/10" />
              <span className="relative flex w-full items-center justify-center gap-3 sm:gap-4"><span className="group/icon relative flex h-[140px] w-[140px] shrink-0 items-center justify-center transition-transform duration-300 group-hover/icon:rotate-3 group-hover/icon:scale-110"><img src="/product-assets/gifts/gift-bag-3d.png" alt="" className="h-full w-full object-contain" /></span><span className="min-w-0 flex-1 text-left font-semibold max-md:-ml-[37px]"><span className="block text-[9px] font-semibold uppercase tracking-[.16em] text-white/65 sm:text-[10px] sm:tracking-[.2em]">Gift value</span><strong className="mt-1 block text-4xl font-medium tracking-[-.06em] sm:text-4xl"><RiyalPrice value={190} light /></strong><span className="mt-[-3px] block text-xs text-white/80 sm:mt-[-5px] sm:text-sm">for orders over <RiyalPrice value={499} light /></span></span></span>
              <span className="relative mx-auto grid w-full max-w-[276px] grid-cols-2 gap-1 sm:gap-2"><span className="inline-flex min-h-8 w-full items-center justify-center rounded-[35px] border border-white/25 px-1 py-1 text-[10px] font-medium leading-3 text-white/85 sm:w-[132px] sm:px-2.5 sm:py-1.5 sm:text-xs">Duo collection</span><span className="inline-flex min-h-8 w-full items-center justify-center rounded-[35px] border border-white/25 px-1 py-1 text-[10px] font-medium leading-3 text-white/85 sm:w-[132px] sm:px-2.5 sm:py-1.5 sm:text-xs">Digital collection</span><span className="inline-flex min-h-8 w-full items-center justify-center rounded-[35px] border border-white/25 px-1 py-1 text-[10px] font-medium leading-3 text-white/85 sm:w-[132px] sm:px-2.5 sm:py-1.5 sm:text-xs">Extra gift</span><span className="inline-flex min-h-8 w-full items-center justify-center rounded-[35px] border border-white/25 px-1 py-1 text-[10px] font-medium leading-3 text-white/85 sm:w-[132px] sm:px-2.5 sm:py-1.5 sm:text-xs">OFF50: <RiyalPrice value={50} light /> off</span></span>
            </a>
            <div className="gift-bonus-slide flex min-w-[88%] snap-start flex-col gap-2 sm:contents sm:min-w-0 sm:snap-none">
            <a href="#shop" className="group relative min-w-0 snap-start flex min-h-0 items-center justify-between overflow-hidden rounded-[16px] bg-white p-2 text-[#6f1e3b] no-underline shadow-[0_8px_24px_rgba(111,30,59,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(111,30,59,.12)] sm:min-w-0 sm:snap-none lg:mt-[28px] lg:h-[110px] lg:min-h-0 lg:px-7 lg:py-4"><span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border-[14px] border-[#ead6dd]/70" />
              <span className="relative z-10"><span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-[#b27a86]">Bonus gift</span><strong className="mt-1 block text-lg font-semibold">3 Extra gifts</strong><span className="mt-1 block text-xs text-[#856d72]">on orders over <RiyalPrice value={299} /></span></span><span className="group/icon relative z-10 grid h-[100px] w-[100px] shrink-0 place-items-center transition-transform duration-300 group-hover/icon:scale-110"><img src="/product-assets/gifts/gift-bag-3d.png" alt="" className="h-full w-full scale-100 sm:scale-[.88] rotate-0 object-contain" /></span>
            </a>
            <a href="#shop" className="group relative min-w-[88%] snap-start flex min-h-[118px] items-center justify-between overflow-hidden rounded-[16px] bg-[#ead2c8] p-5 text-[#4f2530] no-underline transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(111,30,59,.12)] sm:min-w-0 sm:snap-none lg:min-h-[104px] lg:p-4"><span className="pointer-events-none absolute -bottom-10 -right-10 z-0 h-32 w-32 rounded-full border-[14px] border-[#c58d91]/60" />
              <span className="relative z-10"><span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a5d68]">Bonus gift</span><strong className="mt-1 block text-lg font-semibold">2 Extra gifts</strong><span className="mt-1 block text-xs text-[#76565d]">on orders over <RiyalPrice value={199} /></span></span><span className="group/icon relative z-10 grid h-[87px] w-[100px] shrink-0 place-items-center transition-transform duration-300 group-hover/icon:rotate-6 group-hover/icon:scale-110"><img src="/product-assets/gifts/gift-bag-3d.png" alt="" className="h-full w-full scale-[.94] rotate-6 object-contain brightness-105" /></span>
            </a>
            </div>
          </div>
          </div>
        </div>
      </section>

      <CouponOffersDrawer open={giftOffersOpen} onClose={() => setGiftOffersOpen(false)} />
      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"><div className="mb-7 text-center"><p className="mb-2 text-[10px] font-medium uppercase tracking-[.22em] text-[#9a5a2e]">Explore the store</p><h2 className="text-2xl font-medium tracking-[-.03em] text-[#111] sm:text-3xl">Shop by category</h2></div><div ref={categoryRailRef} aria-label="Shop categories" className="-mx-4 flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-x-4 sm:gap-y-9 sm:overflow-visible sm:px-0 sm:[scroll-snap-type:none] lg:grid-cols-7">{categories.map((category, index) => <a key={category} data-category-card id={category.toLowerCase().replaceAll(" ", "-")} href="#shop" className="group flex w-[128px] shrink-0 snap-start flex-col items-center gap-3 text-center text-[#222] no-underline sm:w-auto sm:shrink sm:snap-none sm:gap-4"><span className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#f7f6f6] p-3 transition duration-300 group-hover:-translate-y-1 lg:h-[146px] lg:w-[146px]"><img src={categoryImages[index]} alt={category} loading="lazy" decoding="async" className="h-full w-full object-contain contrast-[1.04] saturate-[1.08] transition duration-500 group-hover:scale-[1.05]" /></span><span className="text-[11px] font-medium leading-4 sm:text-xs">{category}</span></a>)}</div></section>

      <FragranceFinder onFavorite={toggleFavorite} favorites={favoriteNames} />

      <FragranceLab onAdd={addRecentlyViewedToCart} onFavorite={toggleFavorite} favorites={favoriteNames} />

      <InteractiveAccessoriesSection />

      <RecentlyViewedRail products={recommendations} onAdd={addRecentlyViewedToCart} onFavorite={toggleFavorite} favorites={favoriteNames} />

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-medium uppercase tracking-[.22em] text-[#9a5a2e]">Shop by mood</p><h2 className="text-2xl font-medium tracking-[-.03em] text-[#111] sm:text-3xl">A scent for every story</h2></div><a href="#shop" className="hidden items-center gap-2 text-xs font-medium text-[#222] no-underline sm:flex">Explore all <ArrowRight size={14} /></a></div><div className="grid gap-4 sm:grid-cols-3"><a href="#perfumes" className="group relative min-h-[330px] overflow-hidden rounded-[18px] bg-[#f2eee8] no-underline"><img src="/product-assets/gallery/leader-lifestyle.png" alt="Perfumes" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" /><div className="relative flex h-full items-end justify-between p-5 text-white"><span><span className="mb-1 block text-[10px] uppercase tracking-[.18em] text-white/70">Discover</span><strong className="text-lg font-medium">Perfumes</strong></span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></div></a><a href="#oud" className="group relative min-h-[330px] overflow-hidden rounded-[18px] bg-[#2d2927] no-underline"><img src="/product-assets/story/raw-13.png" alt="Oud" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" /><div className="relative flex h-full items-end justify-between p-5 text-white"><span><span className="mb-1 block text-[10px] uppercase tracking-[.18em] text-white/70">Explore</span><strong className="text-lg font-medium">Oud</strong></span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></div></a><a href="/gifts" className="group relative min-h-[330px] overflow-hidden rounded-[18px] bg-[#eaded4] no-underline"><img src="/product-assets/buy-with-pink-detail.png" alt="Gifts" className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /><div className="relative flex h-full items-end justify-between p-5 text-white"><span><span className="mb-1 block text-[10px] uppercase tracking-[.18em] text-white/70">For every occasion</span><strong className="text-lg font-medium">Gifts</strong></span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></div></a></div></section>

      <section className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[20px] bg-[#f6eee6] px-6 py-8 sm:px-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-14 lg:py-12"><div><p className="mb-2 text-[10px] font-medium uppercase tracking-[.22em] text-[#9a5a2e]">Bundle & save</p><h2 className="max-w-[390px] text-3xl font-medium leading-tight tracking-[-.04em] text-[#1a1511] sm:text-4xl">More fragrance,<br />more to love.</h2><p className="mt-4 max-w-[320px] text-xs leading-5 text-[#76685d]">Build your own ritual with two customer favorites and enjoy a better value together.</p><a href="#new-arrivals" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-3 text-xs font-medium text-white no-underline transition hover:bg-[#9a5a2e]">Shop the bundle <ArrowRight size={14} /></a></div><div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-0"><a href="/product-details" className="group overflow-hidden rounded-[14px] bg-white p-3 no-underline sm:p-4"><div className="aspect-square overflow-hidden rounded-[10px] bg-[#f4f3f1]"><img src="/product-assets/real-products/green-woods.jpg" alt="Green Woods Eau de Parfum" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><p className="mt-3 text-[11px] font-medium text-[#222]">Green Woods Eau de Parfum</p><strong className="mt-2 block text-sm font-semibold text-[#111]"><RiyalPrice value={258} /></strong></a><a href="/product-details" className="group overflow-hidden rounded-[14px] bg-white p-3 no-underline sm:p-4"><div className="aspect-square overflow-hidden rounded-[10px] bg-[#f4f3f1]"><img src="/product-assets/real-products/black-woods.jpg" alt="Black Woods Eau de Toilette" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><p className="mt-3 text-[11px] font-medium text-[#222]">Black Woods Eau de Toilette</p><strong className="mt-2 block text-sm font-semibold text-[#111]"><RiyalPrice value={208} /></strong></a></div></section>

      <div id="new-arrivals"><ProductRail products={activeNewArrivalProducts} activeTab={newArrivalTab} onTabChange={setNewArrivalTab} onAdd={addRecentlyViewedToCart} onFavorite={toggleFavorite} favorites={favoriteNames} /></div>

      <section className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"><div className="relative grid overflow-hidden rounded-[20px] bg-[#eeeae5] lg:grid-cols-2"><div className="relative min-h-[300px] overflow-hidden sm:min-h-[380px]"><img src="/product-assets/story/raw-06.png" alt="A dark fragrance composition" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/15" /></div><div className="relative flex min-h-[300px] flex-col justify-center px-7 py-10 sm:min-h-[380px] sm:px-12"><p className="mb-3 text-[10px] font-medium uppercase tracking-[.22em] text-[#9a5a2e]">The fragrance story</p><h2 className="max-w-[420px] text-3xl font-medium leading-tight tracking-[-.04em] text-[#151515] sm:text-4xl">A little luxury,<br />every day.</h2><p className="mt-5 max-w-[350px] text-xs leading-5 text-[#6e6862]">Explore the notes, textures and stories behind the fragrances that make Deraah different.</p><a href="/product-details#details" className="mt-6 flex w-fit items-center gap-2 text-xs font-medium text-[#111] underline underline-offset-4">Discover the story <ArrowRight size={14} /></a></div></div></section>

      <section aria-labelledby="fragrance-edit-title" className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid overflow-hidden rounded-[24px] bg-[#111] text-white lg:min-h-[500px] lg:grid-cols-[.78fr_1.22fr]">
          <div dir="ltr" aria-live="polite" className="order-2 flex flex-col justify-center px-7 py-10 text-left sm:px-12 sm:py-14 lg:order-1 lg:px-14">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[.24em] text-[#c58d64]">{activeFragranceStory.eyebrow}</p>
            <h2 id="fragrance-edit-title" className="max-w-[390px] text-3xl font-medium leading-[1.08] tracking-[-.04em] text-white sm:text-4xl">{activeFragranceStory.title}</h2>
            <p className="mt-5 line-clamp-2 max-w-[390px] text-sm leading-6 text-white/65">{activeFragranceStory.description.join(" ")}</p>
            <a href="#new-arrivals" className="mt-7 inline-flex w-fit items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-xs font-medium text-[#111] no-underline transition hover:bg-[#ead7c8]">{activeFragranceStory.cta} <ArrowRight size={14} /></a>
          </div>
          <div className="fragrance-story-carousel-panel order-1 min-h-[480px] bg-[#1a1a1a] px-2 py-4 sm:min-h-[500px] sm:px-6 sm:py-6 lg:order-2">
            <DepthCarousel items={fragranceStoryItems} cardWidth={281} cardHeight={400.91} mobileScale={1.38} radius={22} depth={175} spread={70} tilt={18} perspective={1200} visibleCards={4} falloff={0.18} blur={5} autoplay autoplayDelay={3200} loop showControls showIndicators onChange={index => setFragranceStoryActiveIndex(index)} />
          </div>
        </div>
      </section>

      <section className="border-y border-[#ebe7e2] bg-[#faf9f7] px-4 py-16 sm:py-20"><div className="mx-auto max-w-[1320px]"><div className="mb-8 text-center"><p className="mb-2 text-[10px] font-medium uppercase tracking-[.22em] text-[#9a5a2e]">Loved by our community</p><h2 className="text-2xl font-medium tracking-[-.03em] text-[#111] sm:text-3xl">The Deraah edit, in their words</h2></div><div className="grid gap-4 sm:grid-cols-3"><blockquote className="m-0 rounded-[16px] bg-white p-6"><div className="mb-4 text-sm tracking-[.15em] text-[#b8783e]">★★★★★</div><p className="text-sm leading-6 text-[#3f3b37]">“The scent feels polished without being too loud. It has become my everyday signature.”</p><footer className="mt-5 text-[10px] font-medium uppercase tracking-[.14em] text-[#89837d]">Noura · Verified customer</footer></blockquote><blockquote className="m-0 rounded-[16px] bg-white p-6"><div className="mb-4 text-sm tracking-[.15em] text-[#b8783e]">★★★★★</div><p className="text-sm leading-6 text-[#3f3b37]">“Beautiful packaging, quick delivery and a fragrance that lasts through the evening.”</p><footer className="mt-5 text-[10px] font-medium uppercase tracking-[.14em] text-[#89837d]">Sarah · Verified customer</footer></blockquote><blockquote className="m-0 rounded-[16px] bg-white p-6"><div className="mb-4 text-sm tracking-[.15em] text-[#b8783e]">★★★★★</div><p className="text-sm leading-6 text-[#3f3b37]">“The perfect gift. The team made choosing a scent feel simple and personal.”</p><footer className="mt-5 text-[10px] font-medium uppercase tracking-[.14em] text-[#89837d]">Maha · Verified customer</footer></blockquote></div></div></section>

      <DeraahBlogFeatureSlider />
      <DeraahBlogSection />
    </main>

    <StoreFooter />

    <div className="md:hidden"><StoreMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(collapsed => !collapsed)} onOpenCategories={() => { window.dispatchEvent(new Event("store:open-menu")); setMobileNavCollapsed(false); }} onOpenCart={() => { window.dispatchEvent(new Event("store:open-cart")); setMobileNavCollapsed(false); }} onOpenAccount={() => { window.dispatchEvent(new Event("store:open-mobile-account")); setMobileNavCollapsed(false); }} onOpenRewards={() => { window.location.assign("/mukafaati"); setMobileNavCollapsed(false); }} onOpenHome={() => { if (window.location.pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); else window.location.assign("/"); setMobileNavCollapsed(false); }} cartItemCount={cartCount} /></div>

    {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-[#111] px-5 py-3 text-xs text-white shadow-xl">{toast}</div>}
  </div>;
}
