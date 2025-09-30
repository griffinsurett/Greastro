// src/config/consentConfig.ts
export interface ConsentConfig {
  cookieName: string;
  version: string;
  expiryDays: number;
  categories: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
}

export const defaultConsentConfig: ConsentConfig = {
  cookieName: 'gdpr-consent',
  version: '1.0.0',
  expiryDays: 365,
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  },
};

// Allow runtime configuration
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