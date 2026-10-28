import { useEffect, useMemo, useState } from "react";
import { ArrowRight, History, MessageCircle, Send, Sparkles } from "lucide-react";
import { RiyalPrice } from "./RiyalPrice";
import StoreRouteFrame from "./StoreRouteFrame";
import { SEARCH_PRODUCTS, type SearchProduct } from "./StoreSearchPanel";
import { useStoreCart, type StoreCartItem } from "./StoreCartContext";
import { useStoreLocale } from "./StoreLocaleContext";
import { loadStoreAiHistory, saveStoreAiHistory, type StoreAiHistoryEntry } from "./storeAiHistory";

function toCartItem(product: SearchProduct): StoreCartItem {
  return {
    id: "ai-" + product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: product.name,
    brand: product.brand,
    price: String(product.price),
    oldPrice: product.oldPrice ? String(product.oldPrice) : undefined,
    image: product.image,
    quantity: 1,
  };
}

type AiMessage = StoreAiHistoryEntry & { products: SearchProduct[] };

function getRecommendations(value: string) {
  const normalized = value.toLocaleLowerCase();
  const filtered = SEARCH_PRODUCTS.filter(product => {
    const text = [product.name, product.nameAr, product.category, product.categoryAr, ...product.tags].join(" ").toLocaleLowerCase();
    const isGiftRequest = normalized.includes("هدية") || normalized.includes("gift");
    const isWoodyRequest = normalized.includes("خشب") || normalized.includes("wood") || normalized.includes("عود") || normalized.includes("oud");
    const matchesIntent = isGiftRequest ? product.category === "Gifts" : isWoodyRequest ? text.includes("wood") || text.includes("oud") : true;
    return matchesIntent && product.price <= (normalized.includes("300") ? 300 : 700);
  });
  return (filtered.length ? filtered : SEARCH_PRODUCTS).slice(0, 3);
}

function ProductRecommendation({ product, isArabic, onAdd }: { product: SearchProduct; isArabic: boolean; onAdd: () => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#edf0f2] bg-[#fafbfb]">
      <a href={"/product-details?product=" + encodeURIComponent(product.name) + "#details"} className="block no-underline">
        <div className="grid h-32 place-items-center bg-[#f0f2f2] p-4"><img src={product.image} alt={isArabic ? product.nameAr : product.name} className="h-full w-full object-contain" /></div>
        <div className="p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9ca3aa]">{isArabic ? product.brandAr : product.brand}</p><h3 className="mt-1 min-h-[36px] text-xs font-semibold leading-5 text-[#252a30]">{isArabic ? product.nameAr : product.name}</h3><div className="mt-2"><RiyalPrice value={product.price} /></div></div>
      </a>
      <button type="button" onClick={onAdd} className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-xl bg-[#20242a] py-2 text-[11px] font-semibold text-white">{isArabic ? "أضف للسلة" : "Add to cart"}</button>
    </article>
  );
}

export default function StoreAskAiPage() {
  const { language } = useStoreLocale();
  const { addToCart } = useStoreCart();
  const isArabic = language === "العربية";
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AiMessage[]>(() => loadStoreAiHistory().map(entry => ({
    ...entry,
    products: entry.productNames?.length ? SEARCH_PRODUCTS.filter(product => entry.productNames?.includes(product.name)) : getRecommendations(entry.question),
  })));
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, loadStoreAiHistory().length - 1));
  const suggestedQuestions = isArabic
    ? ["أريد عطراً خشبياً للاستخدام اليومي", "ما الهدية المناسبة لزوجي؟", "أريد عطراً ثابتاً بسعر أقل من 300"]
    : ["I want a woody fragrance for everyday use", "What gift is right for my husband?", "Show me a long-lasting fragrance under 300"];

  useEffect(() => {
    saveStoreAiHistory(messages.map(({ question: savedQuestion, answer, products }) => ({ question: savedQuestion, answer, productNames: products.map(product => product.name) })));
  }, [messages]);

  const answerFor = (value: string) => {
    const products = getRecommendations(value);
    return {
      question: value,
      answer: isArabic ? "بناءً على طلبك، هذه مجموعة مختارة من درعه. يمكنك فتح أي منتج لمعرفة التفاصيل أو إضافته مباشرة إلى السلة." : "Based on your request, here is a considered Deraah edit. Open a product for details or add it directly to your cart.",
      products,
    };
  };

  const submit = (value = question) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessages(current => {
      const next = [...current, answerFor(trimmed)];
      setActiveIndex(next.length - 1);
      return next;
    });
    setQuestion("");
  };

  const activeMessage = useMemo(() => messages[activeIndex] ?? messages[messages.length - 1], [activeIndex, messages]);

  return (
    <StoreRouteFrame mainClassName="pb-10">
      <section className="bg-[#17191c] px-5 pb-12 pt-28 text-white sm:px-8 sm:pb-16 lg:px-12"><div className="mx-auto max-w-[1120px] text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#b51d6a] text-white"><Sparkles size={25} /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[.24em] text-[#efb4cf]">{isArabic ? "المساعد الذكي" : "Smart assistant"}</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">{isArabic ? "اسأل AI عن عطرك القادم" : "Ask AI about your next fragrance"}</h1><p className="mx-auto mt-4 max-w-[560px] text-sm leading-6 text-white/65">{isArabic ? "صف ذوقك أو المناسبة أو ميزانيتك، وسنساعدك في الوصول إلى الاختيار الأقرب لك." : "Describe your taste, occasion or budget and we’ll guide you toward the closest match."}</p></div></section>
      <section className="mx-auto grid max-w-[1120px] gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:px-12 lg:py-12">
        <aside className="space-y-5">
          <div className="rounded-[24px] border border-[#e5e9ed] bg-white p-5 shadow-[0_12px_30px_rgba(16,24,40,.05)] sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f8e8f0] text-[#b51d6a]"><MessageCircle size={19} /></span><div><h2 className="text-sm font-semibold">{isArabic ? "ابدأ بسؤال" : "Start with a question"}</h2><p className="mt-1 text-[11px] text-[#8b939c]">{isArabic ? "أمثلة تساعدك على البدء" : "Ideas to get you started"}</p></div></div><div className="mt-6 space-y-2.5">{suggestedQuestions.map(item => <button key={item} type="button" onClick={() => submit(item)} className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-[#e7ebee] px-4 py-3 text-start text-xs leading-5 text-[#424950] transition hover:border-[#d8a2bb] hover:bg-[#fffafd]"><span>{item}</span><ArrowRight size={15} className="shrink-0 text-[#b51d6a] transition group-hover:translate-x-0.5" /></button>)}</div><a href="/search" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#20242a] underline underline-offset-4">{isArabic ? "أو تصفح المنتجات بنفسك" : "Or browse products yourself"}<ArrowRight size={14} /></a></div>
          {messages.length > 0 && <div className="rounded-[24px] border border-[#e5e9ed] bg-white p-5 shadow-[0_12px_30px_rgba(16,24,40,.05)] sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">{isArabic ? "سجل الأسئلة" : "Question history"}</h2><p className="mt-1 text-[11px] text-[#8b939c]">{isArabic ? "اختر محادثة للمتابعة" : "Choose a conversation to continue"}</p></div><History size={17} className="text-[#b51d6a]" /></div><div className="mt-4 space-y-2">{messages.map((message, index) => <button key={message.question + "-" + index} type="button" onClick={() => setActiveIndex(index)} className={"w-full rounded-xl border px-3 py-2.5 text-start text-xs leading-5 transition " + (index === activeIndex ? "border-[#d8a5bd] bg-[#fff7fb] text-[#8f174f]" : "border-[#edf0f2] text-[#59616a] hover:border-[#d8a5bd]")}><span className="block truncate">{message.question}</span><span className="mt-1 block text-[10px] text-[#9aa1a8]">{isArabic ? "محادثة " + (index + 1) : "Conversation " + (index + 1)}</span></button>)}</div></div>}
        </aside>
        <div className="flex min-h-[390px] flex-col rounded-[24px] border border-[#e5e9ed] bg-white p-5 shadow-[0_12px_30px_rgba(16,24,40,.05)] sm:p-7"><div className="flex-1">{activeMessage ? <div className="space-y-4" aria-live="polite"><div className="ms-auto max-w-[88%] rounded-2xl rounded-ee-md bg-[#20242a] px-4 py-3 text-sm leading-6 text-white">{activeMessage.question}</div><div className="rounded-2xl rounded-es-md bg-[#f8f1f5] px-4 py-4 text-sm leading-6 text-[#343a42]"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-[#b51d6a]">{isArabic ? "اسأل AI" : "Ask AI"}</span>{activeMessage.answer}</div><div className="grid gap-3 sm:grid-cols-3">{activeMessage.products.map(product => <ProductRecommendation key={product.name} product={product} isArabic={isArabic} onAdd={() => addToCart(toCartItem(product))} />)}</div></div> : <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#f2f4f5] text-[#7d8790]"><Sparkles size={21} /></span><h2 className="mt-4 text-lg font-semibold">{isArabic ? "أنا جاهز لمساعدتك" : "I’m ready to help"}</h2><p className="mt-2 max-w-[320px] text-xs leading-5 text-[#8a929b]">{isArabic ? "اسأل عن الثبات، النفحات، الهدايا، أو أي منتج في المتجر." : "Ask about longevity, notes, gifts, or any product in the store."}</p></div>}</div><form onSubmit={event => { event.preventDefault(); submit(); }} className="mt-6 flex items-center gap-2 rounded-2xl border border-[#d8dfe4] bg-[#fafbfc] p-2 focus-within:border-[#20242a]"><input value={question} onChange={event => setQuestion(event.target.value)} placeholder={isArabic ? "اكتب سؤالك هنا..." : "Write your question here..."} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#a0a7ae]" /><button type="submit" aria-label={isArabic ? "إرسال السؤال" : "Send question"} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#b51d6a] text-white transition hover:bg-[#8f174f]"><Send size={16} /></button></form></div>
      </section>
    </StoreRouteFrame>
  );
}
