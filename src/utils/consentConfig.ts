// src/utils/consentConfig.ts
/**
 * Cookie Consent Configuration
 * 
 * Centralized configuration for GDPR/cookie consent functionality.
 * Defines cookie names, versions, expiry, and default category states.
 * 
 * Used by the consent hooks and components to maintain consistency.
 */

/**
 * Consent configuration interface
 */
export interface ConsentConfig {
  cookieName: string;      // Name of the consent cookie
  version: string;         // Config version (increment to force re-consent)
  expiryDays: number;      // Cookie lifetime in days
  testMode: boolean;       // If true, always show banner (for testing)
  categories: {
    necessary: boolean;    // Always true (required cookies)
    analytics: boolean;    // Default state for analytics
    marketing: boolean;    // Default state for marketing
    functional: boolean;   // Default state for functional
  };
}

/**
 * Default consent configuration
 * All non-essential categories default to false (opt-in)
 */
export const defaultConsentConfig: ConsentConfig = {
  cookieName: 'gdpr-consent',
  version: '1.0.0',
  expiryDays: 365,
  testMode: false,
  categories: {
    necessary: true,      // Can't be disabled
    analytics: false,     // Opt-in
    marketing: false,     // Opt-in
    functional: false,    // Opt-in
  },
};

/**
 * Create a custom consent config with overrides
 * 
 * @param overrides - Partial config to merge with defaults
 * @returns Complete merged config
 * @example
 * const config = createConsentConfig({ testMode: true });
 */
export function createConsentConfig(overrides?: Partial<ConsentConfig>): ConsentConfig {
  return {
    ...defaultConsentConfig,
    ...overrides,
    categories: {
      ...defaultConsentConfig.categories,
      ...(overrides?.categories || {}),
    },
  };
}