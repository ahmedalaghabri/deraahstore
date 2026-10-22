import { useEffect } from "react";
import "./EnjoyLandingPage.css";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";
import StoreMobileNav from "./StoreMobileNav";
import { useStoreCart } from "./StoreCartContext";

const asset = (name: string) => `/enjoy-landing/${name}`;

const fragranceDescription = (
  <>
    تبدأ رحلة إنجوي بانتعاش فاكهي مشرق، حيث يلتقي حلاوة الخوخ والكمثرى مع الإشراقة
    العطرية الناعمة لزهرة البرتقال، لتمنحك إحساسًا فوريًا بالنظافة والحيوية.
    <br />
    <br />
    وفي القلب، تنساب نفحات تيوب روز والياسمين واليلانج يلانج في تناغم زهري أنيق، يضفي
    على العطر لمسة أنثوية ناعمة وحضورًا جذابًا.
    <br />
    <br />
    أما القاعدة، فتستقر على دفء الفانيليا والمسك والكاشميران، لتمنح العطر لمسة ناعمة
    ودافئة تدوم بإحساس مريح وأنيق.
  </>
);

const lotionDescription = (
  <>
    بودي لوشن 100 مل: بودي لوشن بطبقتان، وكل طبقة لها سحرها.
    <br />
    الطبقة الخارجية، جل منعش: تلمس بشرتك فتشعر بالانتعاش أول ما تضعيه. فيها الجلسرين
    والإريثريتول اللذان يحتفظان بالرطوبة ويعطيان ترطيبًا خفيفًا. (حجم 50 مل)
    <br />
    <br />
    الطبقة الداخلية، لوشن كريمي: تغلف بشرتك بنعومة وغنى بفضل زبدة الشيا، ويحسّن
    النياسيناميد ملمس البشرة ومظهرها، ويدعم سيراميد NP حاجزها، ويضيف فيتامين E وزيت
    حبة البركة لمسة مغذية، ويكمل التجربة العطرية بنفس رائحة إنجوي. (حجم 50 مل)
  </>
);

function CampaignFooter() {
  const socials = [
    ["facebook.svg", "فيسبوك"],
    ["instagram.svg", "إنستغرام"],
    ["x.svg", "إكس"],
    ["youtube.svg", "يوتيوب"],
    ["tiktok.svg", "تيك توك"],
  ];

  return (
    <footer className="enjoy-footer" data-node-id="1221:773">
      <div className="enjoy-footer__main">
        <div className="enjoy-footer__app">
          <p>لتجربة تسوق أفضل، حمّل تطبيق درعه</p>
          <img className="enjoy-footer__logo" src={asset("deraah-logo.png")} alt="درعه" />
          <div className="enjoy-footer__stores">
            <a href="#download" aria-label="Google Play"><img src={asset("google-play.svg")} alt="" /></a>
            <a href="#download" aria-label="App Store"><img src={asset("app-store.svg")} alt="" /></a>
          </div>
        </div>

        <div className="enjoy-footer__links">
          <div>
            <h3>عملائنا</h3>
            <a href="#login">تسجيل الدخول</a>
            <a href="#orders">حالة الطلب</a>
            <a href="#wishlist">قائمة الأمنيات</a>
            <a href="#faq">الأسئلة الشائعة</a>
          </div>
          <div>
            <h3>سياسات وضوابط</h3>
            <a href="#policies">سياسات الشركة</a>
            <a href="#terms">الشروط والأحكام</a>
          </div>
          <div>
            <h3>عن شركة درعه</h3>
            <a href="#home">الرئيسية</a>
            <a href="#about">عن درعه</a>
            <a href="#branches">معارض درعه</a>
            <a href="#contact">اتصل بنا</a>
            <a href="#business">مبيعات الشركات</a>
          </div>
        </div>

        <div className="enjoy-footer__socials" aria-label="روابط التواصل الاجتماعي">
          {socials.map(([icon, label]) => (
            <a key={icon} href={`#${label}`} aria-label={label}>
              <img src={asset(icon)} alt="" />
            </a>
          ))}
        </div>
      </div>

      <div className="enjoy-footer__meta">
        <span>© جميع الحقوق محفوظة | متجر درعه</span>
        <span>2025</span>
        <span>300055804900003</span>
        <a href="#language">English</a>
        <span>السعودية العربية المملكة</span>
      </div>
    </footer>
  );
}

function MobileCampaign() {
  return (
    <div className="enjoy-mobile" data-node-id="1093:16">
      <section className="enjoy-mobile__video" data-node-id="1272:3696">
        <img src={asset("raw-02.png")} alt="فاكهة الخوخ وأجواء إنجوي" />
        <div className="enjoy-mobile__brand" aria-label="إنجوي">
          <span>إنجـــــــوي</span>
          <small>ENJOY</small>
        </div>
      </section>

      <section className="enjoy-mobile__intro">
        <h1>رحلة من الانتعاش إلى الأنوثة الناعمة</h1>
        <p>
          تبدأ رحلة إنجوي بانتعاش فاكهي مشرق، حيث يلتقي حلاوة الخوخ والكمثرى مع الإشراقة
          العطرية الناعمة لزهرة البرتقال، لتمنحك إحساسًا فوريًا بالنظافة والحيوية.
        </p>
      </section>

      <section className="enjoy-mobile__media" data-node-id="1272:3709">
        <img src={asset("raw-13.png")} alt="عطر إنجوي 100 مل" />
      </section>
      <section className="enjoy-mobile__copy enjoy-mobile__copy--perfume">
        <h2>عطر إنجوي 100 مل</h2>
        <p>{fragranceDescription}</p>
      </section>

      <section className="enjoy-mobile__media" data-node-id="1272:3719">
        <img src={asset("raw-01.jpeg")} alt="بودي لوشن إنجوي 100 مل" />
      </section>
      <section className="enjoy-mobile__copy enjoy-mobile__copy--lotion">
        <h2>بودي لوشن 100 مل</h2>
        <p>{lotionDescription}</p>
      </section>

      <section className="enjoy-mobile__media" data-node-id="1272:3726">
        <img src={asset("raw-04.jpeg")} alt="معطر الجسم من إنجوي" />
      </section>
      <section className="enjoy-mobile__copy enjoy-mobile__copy--mist">
        <h2>معطر الجسم من إنجوي</h2>
        <p>بنفس رائحة العطر المميزة، يُرشّ على الجسم مباشرة بعد الاستحمام. وللحصول على قوة وثبات أعلى للرائحة، استخدميه مع البودي لوشن.</p>
      </section>

      <a className="enjoy-mobile__cta" href="/product-details">احصــل عليـــه الآن</a>
    </div>
  );
}

export default function EnjoyLandingPage({ internal = false }: { internal?: boolean }) {
  const { cartItemCount } = useStoreCart();
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "إنجوي | درعه";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className={internal ? "store-page enjoy-store-page min-h-screen bg-white" : ""} dir="rtl">
      {internal && <StoreHeader />}
      <main className="enjoy-landing" dir="rtl">
      <div className="enjoy-responsive">
        <section className="enjoy-desktop" data-node-id="1221:633">
          <div className="enjoy-desktop__hero" data-node-id="1221:1185">
            <img src={asset("hero.jpg")} alt="مجموعة إنجوي 5·5·5" />
          </div>

          <div className="enjoy-desktop__body">
            <section className="enjoy-desktop__intro">
              <div className="enjoy-desktop__video" data-node-id="1221:1184">
                <img src={asset("raw-02.png")} alt="فاكهة الخوخ وأجواء إنجوي" />
              </div>
              <div className="enjoy-desktop__intro-copy">
                <div className="enjoy-desktop__brand"><span>إنجـــــــوي</span><small>ENJOY</small></div>
                <h1>رحلة من الانتعاش إلى الأنوثة الناعمة</h1>
                <p>تبدأ رحلة إنجوي بانتعاش فاكهي مشرق، حيث يلتقي حلاوة الخوخ والكمثرى مع الإشراقة العطرية الناعمة لزهرة البرتقال، لتمنحك إحساسًا فوريًا بالنظافة والحيوية.</p>
                <a className="enjoy-cta" href="/product-details">احصــل عليـــه الآن</a>
              </div>
            </section>

            <section className="enjoy-desktop__product enjoy-desktop__product--perfume">
              <div className="enjoy-desktop__product-copy">
                <h2>عطر إنجوي 100 مل</h2>
                <p>{fragranceDescription}</p>
              </div>
              <img src={asset("raw-13.png")} alt="عطر إنجوي 100 مل" />
            </section>

            <section className="enjoy-desktop__product enjoy-desktop__product--lotion">
              <img src={asset("raw-01.jpeg")} alt="بودي لوشن إنجوي 100 مل" />
              <div className="enjoy-desktop__product-copy">
                <h2>بودي لوشن 100 مل</h2>
                <p>{lotionDescription}</p>
              </div>
            </section>

            <section className="enjoy-desktop__product enjoy-desktop__product--mist">
              <div className="enjoy-desktop__product-copy">
                <h2>معطر الجسم من إنجوي</h2>
                <p>بنفس رائحة العطر المميزة، يُرشّ على الجسم مباشرة بعد الاستحمام. وللحصول على قوة وثبات أعلى للرائحة، استخدميه مع البودي لوشن.</p>
              </div>
              <img src={asset("raw-04.jpeg")} alt="معطر الجسم من إنجوي" />
            </section>
          </div>

          {!internal && <CampaignFooter />}
        </section>
        <MobileCampaign />
      </div>
      </main>
      {internal && <StoreFooter />}
      {internal && <EnjoyMobileNav cartItemCount={cartItemCount} />}
    </div>
  );
}

function EnjoyMobileNav({ cartItemCount }: { cartItemCount: number }) {
  return <div className="md:hidden"><StoreMobileNav collapsed={false} onOpenCategories={() => window.dispatchEvent(new Event("store:open-menu"))} onOpenCart={() => window.dispatchEvent(new Event("store:open-cart"))} onOpenAccount={() => window.dispatchEvent(new Event("store:open-mobile-account"))} onOpenRewards={() => window.dispatchEvent(new Event("store:open-rewards"))} onOpenHome={() => window.location.assign("/")} cartItemCount={cartItemCount} /></div>;
}
