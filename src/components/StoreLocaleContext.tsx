import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type StoreLanguage = "English" | "العربية" | "বাংলা";
export type StoreDirection = "ltr" | "rtl";
export type StoreCountry = "Saudi Arabia" | "United Arab Emirates" | "Qatar" | "Oman";

type StoreLocaleContextValue = {
  country: StoreCountry;
  language: StoreLanguage;
  direction: StoreDirection;
  setCountry: (country: StoreCountry) => void;
  setLanguage: (language: StoreLanguage) => void;
  setLocale: (country: StoreCountry, language: StoreLanguage) => void;
};

const COUNTRY_STORAGE_KEY = "deraah-store-country";
const LANGUAGE_STORAGE_KEY = "deraah-store-language";
const StoreLocaleContext = createContext<StoreLocaleContextValue | null>(null);

const countrySlugs: Record<StoreCountry, string> = {
  "Saudi Arabia": "saudi-arabia",
  "United Arab Emirates": "united-arab-emirates",
  Qatar: "qatar",
  Oman: "oman",
};

const languageCodes: Record<StoreLanguage, string> = {
  English: "en",
  العربية: "ar",
  বাংলা: "bn",
};

function getInitialUrlValue(key: "country" | "language") {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

function readInitialCountry(): StoreCountry {
  const urlCountry = getInitialUrlValue("country");
  const urlMatch = (Object.entries(countrySlugs) as Array<[StoreCountry, string]>).find(([, slug]) => slug === urlCountry)?.[0];
  if (urlMatch) return urlMatch;
  try {
    const savedCountry = window.localStorage.getItem(COUNTRY_STORAGE_KEY) as StoreCountry | null;
    if (savedCountry && savedCountry in countrySlugs) return savedCountry;
  } catch {
    // Use the default when storage is unavailable.
  }
  return "Saudi Arabia";
}

function readInitialLanguage(): StoreLanguage {
  const urlLanguage = getInitialUrlValue("language");
  if (urlLanguage === "ar") return "العربية";
  if (urlLanguage === "bn") return "বাংলা";
  if (urlLanguage === "en") return "English";
  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage === "العربية" || savedLanguage === "বাংলা" ? savedLanguage : "English";
  } catch {
    return "English";
  }
}

export function StoreLocaleProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<StoreCountry>(readInitialCountry);
  const [language, setLanguageState] = useState<StoreLanguage>(readInitialLanguage);
  const direction: StoreDirection = language === "العربية" ? "rtl" : "ltr";

  const persistLocale = (nextCountry: StoreCountry, nextLanguage: StoreLanguage) => {
    setCountryState(nextCountry);
    setLanguageState(nextLanguage);
    try {
      window.localStorage.setItem(COUNTRY_STORAGE_KEY, nextCountry);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // UI state and URL still update if storage is unavailable.
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("country", countrySlugs[nextCountry]);
      url.searchParams.set("language", languageCodes[nextLanguage]);
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const setCountry = (nextCountry: StoreCountry) => persistLocale(nextCountry, language);
  const setLanguage = (nextLanguage: StoreLanguage) => persistLocale(country, nextLanguage);
  const setLocale = (nextCountry: StoreCountry, nextLanguage: StoreLanguage) => persistLocale(nextCountry, nextLanguage);

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    const previousDirection = document.documentElement.dir;
    document.documentElement.lang = direction === "rtl" ? "ar" : language === "বাংলা" ? "bn" : "en";
    document.documentElement.dir = direction;
    document.body.classList.add("store-page");
    return () => {
      document.body.classList.remove("store-page");
      document.documentElement.lang = previousLanguage || "en";
      document.documentElement.dir = previousDirection || "ltr";
    };
  }, [direction, language]);

  const value = useMemo(() => ({ country, language, direction, setCountry, setLanguage, setLocale }), [country, language, direction]);
  return <StoreLocaleContext.Provider value={value}>{children}</StoreLocaleContext.Provider>;
}

export function useStoreLocale() {
  const context = useContext(StoreLocaleContext);
  if (!context) throw new Error("useStoreLocale must be used inside StoreLocaleProvider");
  return context;
}
