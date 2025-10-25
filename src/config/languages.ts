// src/config/languages.ts
/**
 * Language Configuration
 * 
 * Defines supported languages for Google Translate integration.
 * Add or remove languages as needed.
 */

export interface Language {
  code: string;      // Google Translate language code
  name: string;      // Display name
  nativeName: string; // Name in native language
  flag?: string;     // Optional emoji flag
}

/**
 * Supported languages for translation
 * 
 * Google Translate language codes:
 * https://cloud.google.com/translate/docs/languages
 */
export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'iw', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
];

/**
 * Default language (site's native language)
 */
export const defaultLanguage: Language = supportedLanguages[0];

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): Language | undefined {
  return supportedLanguages.find(lang => lang.code === code);
}