// src/hooks/useConsentPreferences.ts
import { useState, useEffect, useCallback } from "react";
import { useCookieStorage } from "./useCookieStorage";
import type { ConsentPreferences } from "@/contexts/CookieConsentContext";
import type { ConsentConfig } from "@/utils/consentConfig";

export function useConsentPreferences(config: ConsentConfig) {
  const { getCookie, setCookie } = useCookieStorage();
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null
  );
  const [hasConsented, setHasConsented] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const cookieValue = getCookie(config.cookieName);

        if (!cookieValue) {
          setIsConsentModalOpen(true);
          return;
        }

        const parsed = JSON.parse(cookieValue) as ConsentPreferences;

        if (parsed.version === config.version) {
          setPreferences(parsed);
          setHasConsented(true);
        } else {
          // Version mismatch, need new consent
          setIsConsentModalOpen(true);
        }
      } catch (error) {
        console.error("Error loading consent preferences:", error);
        setIsConsentModalOpen(true);
      }
    };

    loadPreferences();
  }, [getCookie, config.cookieName, config.version]);

  // Save preferences to cookie
  const savePreferences = useCallback(
    (prefs: ConsentPreferences) => {
      try {
        const prefsToSave: ConsentPreferences = {
          ...prefs,
          timestamp: new Date().toISOString(),
          version: config.version,
        };

        setCookie(config.cookieName, JSON.stringify(prefsToSave), {
          expires: config.expiryDays,
        });

        setPreferences(prefsToSave);
        setHasConsented(true);

        // Dispatch custom event for analytics
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("consentUpdate", {
              detail: prefsToSave,
            })
          );
        }
      } catch (error) {
        console.error("Error saving consent preferences:", error);
      }
    },
    [setCookie, config]
  );

  const updatePreferences = useCallback(
    (updates: Partial<ConsentPreferences>) => {
      const newPrefs: ConsentPreferences = {
        ...config.categories,
        ...preferences,
        ...updates,
        necessary: true, // Always required
      };

      savePreferences(newPrefs);
      setIsConsentModalOpen(false);
    },
    [preferences, config.categories, savePreferences]
  );

  const acceptAll = useCallback(() => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };

    savePreferences(allAccepted);
    setIsConsentModalOpen(false);
  }, [savePreferences]);

  const rejectAll = useCallback(() => {
    const allRejected: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };

    savePreferences(allRejected);
    setIsConsentModalOpen(false);
  }, [savePreferences]);

  const showConsentModal = useCallback(() => {
    setIsConsentModalOpen(true);
  }, []);

  return {
    preferences,
    hasConsented,
    isConsentModalOpen,
    updatePreferences,
    acceptAll,
    rejectAll,
    showConsentModal,
  };
}
