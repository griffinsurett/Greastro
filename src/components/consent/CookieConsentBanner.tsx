// src/components/consent/CookieConsentBanner.tsx
import { useState, useEffect } from 'react';
import { useCookieStorage } from '@/hooks/useCookieStorage';
import CookiePreferencesModal from './CookiePreferencesModal';

export interface CookieConsent {
  necessary: boolean;
  functional: boolean;
  performance: boolean;
  targeting: boolean;
  timestamp: number;
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { getCookie, setCookie } = useCookieStorage();

  useEffect(() => {
    // Check if user has already made a choice
    const existingConsent = getCookie('cookie-consent');
    
    if (!existingConsent) {
      // Delay showing banner until page is fully loaded
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [getCookie]);

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      functional: true,
      performance: true,
      targeting: true,
      timestamp: Date.now(),
    };
    
    setCookie('cookie-consent', JSON.stringify(consent), { expires: 365 });
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      functional: false,
      performance: false,
      targeting: false,
      timestamp: Date.now(),
    };
    
    setCookie('cookie-consent', JSON.stringify(consent), { expires: 365 });
    setShowBanner(false);
  };

  const handleOpenSettings = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9998] animate-slide-up"
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent banner"
      >
        <div className="mx-4 mb-4 max-w-lg">
          <div className="rounded-lg border-2 border-blue-600 bg-white p-6 shadow-xl">
            {/* Content */}
            <div className="mb-4 flex items-start gap-3">
              <span className="text-2xl" role="img" aria-label="Cookie">
                🍪
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  We use cookies to improve your browsing experience and for
                  marketing purposes.{' '}
                  <a
                    href="/privacy-policy"
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    Read our Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleRejectAll}
                className="flex-1 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                type="button"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                type="button"
              >
                Accept All
              </button>
            </div>

            {/* Settings Link */}
            <div className="mt-3 text-center">
              <button
                onClick={handleOpenSettings}
                className="text-sm text-blue-600 underline hover:text-blue-700"
                type="button"
              >
                Cookies Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showModal && (
        <CookiePreferencesModal
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}