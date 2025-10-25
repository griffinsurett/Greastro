// src/hooks/useLanguage.ts
/**
 * Language Preference Hook
 * 
 * Manages language preference using localStorage with cross-tab sync.
 */

import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { defaultLanguage, getLanguageByCode } from '@/config/languages';
import type { Language } from '@/config/languages';

export function useLanguage() {
  const defaultCode = defaultLanguage?.code || 'en';
  
  const [languageCode, setLanguageCode] = useLocalStorage<string>(
    'user-language',
    defaultCode,
    {
      raw: true,
      syncTabs: true,
      validate: (code) => !!getLanguageByCode?.(code),
    }
  );

  // Apply language whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const applyFn = (window as any).applyGoogleTranslateLanguage;
    
    if (!applyFn) {
      console.warn('⚠️  Google Translate not ready yet');
      return;
    }

    applyFn(languageCode);
  }, [languageCode]);

  const changeLanguage = (code: string) => {
    const language = getLanguageByCode?.(code);
    if (!language) {
      console.error(`Invalid language code: ${code}`);
      return;
    }
    
    setLanguageCode(code);
  };

  const resetLanguage = () => {
    setLanguageCode(defaultCode);
  };

  const currentLanguage = getLanguageByCode?.(languageCode) || defaultLanguage || {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  };

  return {
    currentLanguage,
    languageCode,
    changeLanguage,
    resetLanguage,
  };
}