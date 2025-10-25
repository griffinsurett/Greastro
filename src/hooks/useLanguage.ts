// src/hooks/useLanguage.ts
/**
 * Language Preference Hook
 *
 * Manages language preference using localStorage with cross-tab sync.
 * Google Translate handles the actual translation via cookies.
 */

import useLocalStorage from "./useLocalStorage";
import { defaultLanguage, getLanguageByCode } from "@/utils/languages";

export function useLanguage() {
  const defaultCode = defaultLanguage?.code || "en";

  const [languageCode, setLanguageCode] = useLocalStorage<string>(
    "user-language",
    defaultCode,
    {
      raw: true,
      syncTabs: true,
      validate: (code) => !!getLanguageByCode?.(code),
    }
  );

  /**
   * Change language - only triggers when user explicitly selects
   */
  const changeLanguage = (code: string) => {
    const language = getLanguageByCode?.(code);
    if (!language) {
      console.error(`Invalid language code: ${code}`);
      return;
    }

    // Update localStorage
    setLanguageCode(code);
    
    // Apply via Google Translate (will trigger page reload)
    if (typeof window !== 'undefined') {
      const applyFn = (window as any).applyGoogleTranslateLanguage;
      if (applyFn) {
        applyFn(code);
      } else {
        console.warn("⚠️  Google Translate not ready yet");
      }
    }
  };

  const resetLanguage = () => {
    changeLanguage(defaultCode);
  };

  const currentLanguage = getLanguageByCode?.(languageCode) ||
    defaultLanguage || {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
    };

  return {
    currentLanguage,
    languageCode,
    changeLanguage,
    resetLanguage,
  };
}