import { ArrowLeft, ArrowRight, Clock3, Share2 } from "lucide-react";
import { useState } from "react";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";
import { deraahBlogPosts, type DeraahBlogPost } from "./StoreHomePage";

function articleCopy(post: DeraahBlogPost, isArabic: boolean) {
  return {
    category: isArabic ? post.categoryAr : post.category,
    title: isArabic ? post.titleAr : post.title,
    description: isArabic ? post.descriptionAr : post.description,
    intro: isArabic ? post.introAr : post.intro,
    readTime: isArabic ? post.readTimeAr : post.readTime,
    publishedAt: isArabic ? post.publishedAtAr : post.publishedAt,
    sections: post.sections.map(section => ({
      title: isArabic ? section.titleAr : section.title,
      body: isArabic ? section.bodyAr : section.body,
      image: section.image,
      imageAlt: isArabic ? section.imageAltAr ?? section.imageAlt ?? post.alt : section.imageAlt ?? post.alt,
    })),
  };
}

function RelatedStory({ post, isArabic }: { post: DeraahBlogPost; isArabic: boolean }) {
  const title = isArabic ? post.titleAr : post.title;
  const category = isArabic ? post.categoryAr : post.category;
  const readTime = isArabic ? post.readTimeAr : post.readTime;
  return (
    <a href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-[20px] border border-[#e8e0d9] bg-white text-[#171515] no-underline transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(44,34,28,.1)]">
      <div className="aspect-[1.45] overflow-hidden bg-[#eee8e2]"><img src={post.image} alt={post.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
      <div className="p-4 sm:p-5"><span className="text-[9px] uppercase tracking-[.14em] text-[#96775f]">{category}</span><h3 className="mt-2 line-clamp-2 text-base font-medium leading-[1.25] tracking-[-.02em] sm:text-lg">{title}</h3><span className="mt-3 block text-[10px] text-[#8a817a]">{readTime}</span></div>
    </a>
  );
}

export default function StoreBlogArticlePage({ slug }: { slug: string }) {
  const { language, direction } = useStoreLocale();
  const { cartItemCount } = useStoreCart();
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);
  const isArabic = language === "العربية";
  const post = deraahBlogPosts.find(item => item.slug === slug) ?? deraahBlogPosts[0];
  const copy = articleCopy(post, isArabic);
  const relatedPosts = deraahBlogPosts.filter(item => item.slug !== post.slug).slice(0, 3);
  const PreviousIcon = isArabic ? ArrowRight : ArrowLeft;
  const nextPost = deraahBlogPosts[(deraahBlogPosts.findIndex(item => item.slug === post.slug) + 1) % deraahBlogPosts.length];

  return (
    <div dir={direction} className="store-home min-h-screen bg-[#fbfaf8] font-sans text-start text-[#171515]">
      <StoreHeader />
      <main>
        <nav aria-label={isArabic ? "مسار المدونة" : "Blog breadcrumb"} className="mx-auto flex max-w-[1180px] items-center gap-2 px-4 pb-4 pt-6 text-[11px] text-[#857b73] sm:px-6 sm:pt-9">
          <a href="/" className="no-underline transition hover:text-[#9a5a2e]">{isArabic ? "الرئيسية" : "Home"}</a><span aria-hidden="true">/</span><a href="/blog" className="no-underline transition hover:text-[#9a5a2e]">{isArabic ? "المدونة" : "Journal"}</a><span aria-hidden="true">/</span><span className="truncate text-[#4d443e]">{copy.title}</span>
        </nav>

        <article>
          <header className="mx-auto max-w-[1180px] px-4 pb-12 sm:px-6 sm:pb-16">
            <div className="grid overflow-hidden rounded-[26px] bg-[#1c1817] text-white shadow-[0_20px_55px_rgba(44,34,28,.12)] lg:grid-cols-[.84fr_1.16fr]">
              <div className="flex min-h-[390px] flex-col justify-between p-7 sm:min-h-[470px] sm:p-12 lg:order-1 lg:min-h-[535px] lg:p-14">
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[.16em] text-[#d5aa7f]"><span>{copy.category}</span><span className="h-1 w-1 rounded-full bg-[#d5aa7f]/60" /><span>{copy.publishedAt}</span></div>
                  <h1 className="mt-7 max-w-[520px] text-3xl font-medium leading-[1.08] tracking-[-.045em] sm:text-5xl lg:text-[clamp(3rem,4.5vw,5rem)]">{copy.title}</h1>
                  <p className="mt-6 max-w-[470px] text-sm leading-7 text-white/65 sm:text-base sm:leading-8">{copy.description}</p>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-4 text-[11px] text-white/60"><span className="inline-flex items-center gap-2"><Clock3 size={15} /> {copy.readTime}</span><button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-white transition hover:bg-white hover:text-[#171515]"><Share2 size={14} /> {isArabic ? "مشاركة المقال" : "Share article"}</button></div>
              </div>
              <div className="relative min-h-[300px] overflow-hidden lg:order-2 lg:min-h-[535px]"><img src={post.image} alt={post.alt} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" /><span className="absolute bottom-5 left-5 rounded-full border border-white/40 bg-black/20 px-3 py-1 text-[9px] uppercase tracking-[.16em] text-white backdrop-blur-sm sm:bottom-7 sm:left-7">{copy.category}</span></div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[980px] gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_230px] lg:gap-20">
            <div className="min-w-0">
              <p className="text-xl font-medium leading-[1.55] tracking-[-.02em] text-[#25201d] sm:text-2xl sm:leading-[1.5]">{copy.intro}</p>
              <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-20">
                {copy.sections.map((section, index) => (
                  <section key={section.title} aria-labelledby={`article-section-${index}`}>
                    <h2 id={`article-section-${index}`} className="text-2xl font-medium leading-[1.2] tracking-[-.035em] text-[#171515] sm:text-3xl">{section.title}</h2>
                    <p className="mt-5 max-w-[680px] text-[15px] leading-8 text-[#625a54] sm:text-base sm:leading-9">{section.body}</p>
                    {section.image && <figure className="mt-7 overflow-hidden rounded-[20px] bg-[#eee8e2]"><img src={section.image} alt={section.imageAlt} loading="lazy" decoding="async" className="max-h-[560px] w-full object-cover" />{section.imageAlt && <figcaption className="px-4 py-3 text-[10px] text-[#968c84] sm:px-5">{section.imageAlt}</figcaption>}</figure>}
                  </section>
                ))}
              </div>
            </div>
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[20px] border border-[#e8e0d9] bg-white p-5 sm:p-6">
                <p className="text-[10px] font-medium uppercase tracking-[.16em] text-[#96775f]">{isArabic ? "في هذا المقال" : "In this story"}</p>
                <ol className="mt-5 space-y-4">{copy.sections.map((section, index) => <li key={section.title}><a href={`#article-section-${index}`} className="flex gap-3 text-xs leading-5 text-[#625a54] no-underline transition hover:text-[#9a5a2e]"><span className="text-[#b98a68]">0{index + 1}</span><span>{section.title}</span></a></li>)}</ol>
              </div>
              <a href={`/blog/${nextPost.slug}`} className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-[#e8e0d9] bg-[#f4ede7] p-5 text-xs text-[#352c27] no-underline transition hover:bg-[#eaded4]"><span className="min-w-0"><span className="block text-[9px] uppercase tracking-[.14em] text-[#96775f]">{isArabic ? "المقال التالي" : "Next story"}</span><strong className="mt-2 block truncate font-medium">{isArabic ? nextPost.titleAr : nextPost.title}</strong></span><PreviousIcon size={17} className="shrink-0" /></a>
            </aside>
          </div>
        </article>

        <section aria-labelledby="related-stories-title" className="border-t border-[#ebe7e2] bg-[#f6f1ec] px-4 py-14 sm:py-18"><div className="mx-auto max-w-[1180px]"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#96775f]">{isArabic ? "المزيد من المدونة" : "Keep exploring"}</p><h2 id="related-stories-title" className="mt-2 text-2xl font-medium tracking-[-.03em] sm:text-3xl">{isArabic ? "قصص قد تعجبك" : "More stories to discover"}</h2></div><a href="/blog" className="text-xs text-[#5f5148] no-underline hover:text-[#9a5a2e]">{isArabic ? "كل القصص" : "All stories"}</a></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{relatedPosts.map(related => <RelatedStory key={related.slug} post={related} isArabic={isArabic} />)}</div></div></section>
      </main>
      <StoreFooter />
      <div className="md:hidden"><StoreMobileNav collapsed={mobileNavCollapsed} onToggle={() => setMobileNavCollapsed(collapsed => !collapsed)} onOpenCategories={() => { window.dispatchEvent(new Event("store:open-menu")); setMobileNavCollapsed(false); }} onOpenCart={() => { window.dispatchEvent(new Event("store:open-cart")); setMobileNavCollapsed(false); }} onOpenAccount={() => { window.dispatchEvent(new Event("store:open-mobile-account")); setMobileNavCollapsed(false); }} onOpenRewards={() => { window.location.assign("/mukafaati"); setMobileNavCollapsed(false); }} onOpenHome={() => { window.location.assign("/"); setMobileNavCollapsed(false); }} cartItemCount={cartItemCount} /></div>
    </div>
  );
}
