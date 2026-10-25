import { isGiftCustomizationItem, type StoreCartItem } from "./StoreCartContext";

export const RIYAL = "⃁";
export const formatPrice = (value: number | string) => `${RIYAL} ${value}`;

export type FreeSampleOption = { name: string; image: string };

export type StoreGiftOption = {
  id: string;
  name: string;
  description: string;
  image: string;
  brand?: string;
  category?: string;
  value?: number;
};

export type StoreGiftOffer = {
  id: string;
  title: string;
  subtitle: string;
  maxSelectionsPerUnit: number;
  gifts: StoreGiftOption[];
};

export const freeSampleOptions: FreeSampleOption[] = [
  { name: "Small deraah art packaging set RED", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw3c159d0c/images/10211221053000-2006-1.png?q=50&sh=920&sw=920" },
  { name: "Medium Deraah Art Packaging Set Blue", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dwb3d3decf/images/10211221053000-2008-1.png?sh=920&sw=920" },
  { name: "Small Deraah art packaging set Green", image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw4aff568a/images/10211221053000-2012-1.png?q=50&sh=920&sw=920" },
];

const bodyCareGiftOptions: StoreGiftOption[] = [
  { id: "gift-carino-body-mist", name: "LABEAUTE Carino Body Mist 250ml", description: "A fresh, fragrant mist for your daily ritual.", brand: "LABEAUTE", category: "Body mist", value: 74, image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-lb-master/default/dwd4539ab6/images/10511121752250-4044-1.png?q=50&sh=920&sw=920" },
  { id: "gift-tube-rose-body-mist", name: "LABEAUTE Tube Rose Body Mist", description: "A nourishing mist that leaves skin softly scented.", brand: "LABEAUTE", category: "Body mist", value: 59, image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dwd3456b11/images/10511121752150-1006-1.jpg?q=50&sh=920&sw=920" },
  { id: "gift-sweet-miss-lotion", name: "LABEAUTE Sweet Miss Body Lotion 250ml", description: "Floral and fruity care with a smooth finish.", brand: "LABEAUTE", category: "Body lotion", value: 50, image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-lb-master/default/dw912a00fe/images/10511121772250-1041-1.png?sh=920&sw=920" },
  { id: "gift-patchouli-lotion", name: "LABEAUTE Patchouli Body Lotion 245ml", description: "Richly scented body care with a warm character.", brand: "LABEAUTE", category: "Body lotion", value: 59, image: "https://www.deraahstore.com/dw/image/v2/BJFS_PRD/on/demandware.static/-/Sites-deraah-master/default/dw4f23aabd/images/10511121772245-1036-1.png?q=50&sh=920&sw=920" },
];

const woodsGiftOptions = bodyCareGiftOptions;
const privateGiftOptions = bodyCareGiftOptions;

const giftOffers: Array<{ matches: string[]; offer: StoreGiftOffer }> = [
  {
    matches: ["Green Woods Eau de Parfum"],
    offer: { id: "green-woods-gift", title: "Your Green Woods gift", subtitle: "Choose up to 2 gifts with this product.", maxSelectionsPerUnit: 2, gifts: woodsGiftOptions },
  },
  {
    matches: ["Link White Limited Edition 150ml", "Maroon Perfume by Link 200ml", "Maroon Perfume by LINK 200ml", "Black Woods Eau de Toilette"],
    offer: { id: "link-gift", title: "Your complimentary gift", subtitle: "Choose 1 gift to accompany this product.", maxSelectionsPerUnit: 1, gifts: woodsGiftOptions },
  },
  {
    matches: ["DERAAH PRIVATE Enjoy Eau de Parfum 100ml"],
    offer: { id: "enjoy-gift", title: "Your Enjoy gift", subtitle: "Choose 1 gift to complete the experience.", maxSelectionsPerUnit: 1, gifts: privateGiftOptions },
  },
];

export function getGiftOfferForProduct(productName: string): StoreGiftOffer | null {
  return giftOffers.find(entry => entry.matches.includes(productName))?.offer ?? null;
}

export function getGiftSelectionLimit(item: Pick<StoreCartItem, "name" | "quantity">): number {
  const offer = getGiftOfferForProduct(item.name);
  return offer ? offer.maxSelectionsPerUnit * Math.max(1, item.quantity) : 0;
}

export function getFreeUnitsByItem(items: Array<Pick<StoreCartItem, "id" | "name" | "price" | "quantity">>) {
  const units = items.filter(item => !isGiftCustomizationItem(item)).flatMap(item => Array.from({ length: item.quantity }, () => ({ id: item.id, price: Number(item.price.replace(/[^0-9]/g, "")) })));
  const freeUnits = new Map<string, number>();
  units.sort((a, b) => b.price - a.price);
  for (let index = 0; index + 2 < units.length; index += 3) {
    for (const unit of [units[index + 1], units[index + 2]]) freeUnits.set(unit.id, (freeUnits.get(unit.id) ?? 0) + 1);
  }
  return freeUnits;
}

export const cartRewardStages = [
  { threshold: 300, title: "Free shipping", reward: "Free shipping unlocked", detail: "Your order ships free.", color: "#2c8b4b", softColor: "#ecfdf1" },
  { threshold: 600, title: "5% off", reward: "5% discount unlocked", detail: "Save 5% on your order.", color: "#2c8b4b", softColor: "#ecfdf1" },
  { threshold: 900, title: "Free sample", reward: "Premium sample unlocked", detail: "Choose one free sample at checkout.", color: "#2c8b4b", softColor: "#ecfdf1" },
  { threshold: 1200, title: "10% off", reward: "10% discount unlocked", detail: "Your biggest cart reward is active.", color: "#2c8b4b", softColor: "#ecfdf1" },
];

export const getCartItemSize = (item: StoreCartItem) => item.variant?.match(/\d+\s?ml/i)?.[0] ?? item.name.match(/\d+\s?ml/i)?.[0] ?? "100 ml";

const defaultOriginalPrices: Record<string, number> = {
  "Leader Perfume for Men 100 ml": 500,
  "Green Woods Eau de Parfum": 600,
  "Black Woods Eau de Toilette": 500,
  "Maroon Perfume by Link 200ml": 420,
  "Maroon Perfume by LINK 200ml": 420,
  "Link White Limited Edition 150ml": 500,
  "Silver Woods Eau de Parfum": 500,
  "DERAAH PRIVATE Enjoy Eau de Parfum 100ml": 378,
  "MAIOS Aroma 100 ml": 268,
  "PROUD Suave Perfume": 420,
};

export function getCartItemOriginalPrice(item: StoreCartItem): number {
  const storedPrice = Number(String(item.oldPrice ?? "").replace(/[^0-9.]/g, ""));
  if (storedPrice > 0) return storedPrice;
  return defaultOriginalPrices[item.name] ?? (Number(String(item.price).replace(/[^0-9.]/g, "")) || 0);
}
