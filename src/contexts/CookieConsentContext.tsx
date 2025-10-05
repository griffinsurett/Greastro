// src/contexts/CookieConsentContext.tsx
import { createContext, useContext, type FC, type ReactNode } from "react";
import { useConsentPreferences } from "@/hooks/useConsentPreferences";
import {
  defaultConsentConfig,
  type ConsentConfig,
} from "@/utils/consent/config";

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp?: string;
  version?: string;
}

interface CookieConsentContextType {
  preferences: ConsentPreferences | null;
  hasConsented: boolean;
  updatePreferences: (prefs: Partial<ConsentPreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showConsentModal: () => void;
  closeConsentModal: () => void;
  isConsentModalOpen: boolean;
  isConsentBannerOpen: boolean;
}

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider"
    );
  }
  return context;
};

interface CookieConsentProviderProps {
  children: ReactNode;
  config?: Partial<ConsentConfig>;
}

export const CookieConsentProvider: FC<CookieConsentProviderProps> = ({
  children,
  config: configOverrides,
}) => {
  const config = configOverrides
    ? { ...defaultConsentConfig, ...configOverrides }
    : defaultConsentConfig;

  const consentState = useConsentPreferences(config);

  return (
    <CookieConsentContext.Provider value={consentState}>
      {children}
    </CookieConsentContext.Provider>
  );
};
