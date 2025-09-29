// src/contexts/CookieConsentContext.tsx
import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from 'react';

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
  isConsentModalOpen: boolean;
}

const CONSENT_COOKIE_NAME = 'gdpr-consent';
const CONSENT_VERSION = '1.0.0';
const CONSENT_EXPIRY_DAYS = 365;

const defaultPreferences: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
  version: CONSENT_VERSION,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider: FC<CookieConsentProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const loadPreferences = () => {
      try {
        const cookies = document.cookie.split(';');
        const consentCookie = cookies.find(c => c.trim().startsWith(`${CONSENT_COOKIE_NAME}=`));
        
        if (consentCookie) {
          const value = consentCookie.split('=')[1];
          const decoded = decodeURIComponent(value);
          const parsed = JSON.parse(decoded) as ConsentPreferences;
          
          if (parsed.version === CONSENT_VERSION) {
            setPreferences(parsed);
            setHasConsented(true);
          } else {
            // Version mismatch, need new consent
            setIsConsentModalOpen(true);
          }
        } else {
          // No consent yet - show immediately since we're already idle
          setIsConsentModalOpen(true);
        }
      } catch (error) {
        console.error('Error loading consent preferences:', error);
        setIsConsentModalOpen(true);
      }
    };

    loadPreferences();
  }, []);

  const savePreferences = (prefs: ConsentPreferences) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + CONSENT_EXPIRY_DAYS);
    
    const cookieValue = encodeURIComponent(JSON.stringify(prefs));
    document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
    
    setPreferences(prefs);
    setHasConsented(true);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('consentUpdate', { 
        detail: prefs 
      }));
    }
  };

  const updatePreferences = (updates: Partial<ConsentPreferences>) => {
    const newPrefs: ConsentPreferences = {
      ...defaultPreferences,
      ...preferences,
      ...updates,
      necessary: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    savePreferences(newPrefs);
    setIsConsentModalOpen(false);
  };

  const acceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    savePreferences(allAccepted);
    setIsConsentModalOpen(false);
  };

  const rejectAll = () => {
    const allRejected: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    savePreferences(allRejected);
    setIsConsentModalOpen(false);
  };

  const showConsentModal = () => setIsConsentModalOpen(true);

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        updatePreferences,
        acceptAll,
        rejectAll,
        showConsentModal,
        isConsentModalOpen,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};