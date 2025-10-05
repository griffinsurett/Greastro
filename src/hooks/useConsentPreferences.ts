// src/hooks/useConsentPreferences.ts
import { useState, useEffect, useCallback } from "react";
import { useCookieStorage } from "./useCookieStorage";
import type { ConsentPreferences } from "@/contexts/CookieConsentContext";
import type { ConsentConfig } from "@/utils/consent/config";

export function useConsentPreferences(config: ConsentConfig) {
  const { getCookie, setCookie } = useCookieStorage();
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null
  );
  const [hasConsented, setHasConsented] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isConsentBannerOpen, setIsConsentBannerOpen] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      // If test mode is enabled, always show the banner
      if (config.testMode) {
        console.log(
          "🧪 Cookie Consent Test Mode: Banner will show on every load"
        );
        setIsConsentBannerOpen(true);
        setHasConsented(false);
        setPreferences(null);
        return;
      }

      try {
        const cookieValue = getCookie(config.cookieName);

        if (!cookieValue) {
          setIsConsentBannerOpen(true);
          return;
        }

        const parsed = JSON.parse(cookieValue) as ConsentPreferences;

        if (parsed.version === config.version) {
          setPreferences(parsed);
          setHasConsented(true);
        } else {
          // Version mismatch, need new consent
          setIsConsentBannerOpen(true);
        }
      } catch (error) {
        console.error("Error loading consent preferences:", error);
        setIsConsentBannerOpen(true);
      }
    };

    loadPreferences();
  }, [getCookie, config.cookieName, config.version, config.testMode]);

  // Save preferences to cookie
  const savePreferences = useCallback(
    (prefs: ConsentPreferences) => {
      try {
        const prefsToSave: ConsentPreferences = {
          ...prefs,
          timestamp: new Date().toISOString(),
          version: config.version,
        };

        // In test mode, log the preferences but don't actually save
        if (config.testMode) {
          console.log("🧪 Test Mode: Preferences would be saved:", prefsToSave);
          setPreferences(prefsToSave);
          setHasConsented(true);

          // Dispatch event even in test mode
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("consentUpdate", {
                detail: prefsToSave,
              })
            );
          }
          return;
        }

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
      setIsConsentBannerOpen(false);
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
    setIsConsentBannerOpen(false);
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
    setIsConsentBannerOpen(false);
    setIsConsentModalOpen(false);
  }, [savePreferences]);

  const showConsentModal = useCallback(() => {
    setIsConsentBannerOpen(false);
    setIsConsentModalOpen(true);
  }, []);

  const closeConsentModal = useCallback(() => {
    setIsConsentModalOpen(false);
    // Don't reopen banner if user has already consented
    if (!hasConsented) {
      setIsConsentBannerOpen(true);
    }
  }, [hasConsented]);

  return {
    preferences,
    hasConsented,
    isConsentModalOpen,
    isConsentBannerOpen,
    updatePreferences,
    acceptAll,
    rejectAll,
    showConsentModal,
    closeConsentModal,
  };
}
