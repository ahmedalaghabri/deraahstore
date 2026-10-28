export type StoreAiHistoryEntry = {
  question: string;
  answer: string;
  productNames?: string[];
};

export const STORE_AI_HISTORY_KEY = "deraah-ai-history";

export function loadStoreAiHistory(): StoreAiHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORE_AI_HISTORY_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is StoreAiHistoryEntry => Boolean(
      entry &&
      typeof entry.question === "string" &&
      typeof entry.answer === "string",
    )).slice(-20);
  } catch {
    return [];
  }
}

export function saveStoreAiHistory(entries: StoreAiHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_AI_HISTORY_KEY, JSON.stringify(entries.slice(-20)));
  } catch {
    // History is an enhancement; the assistant still works when storage is unavailable.
  }
}
