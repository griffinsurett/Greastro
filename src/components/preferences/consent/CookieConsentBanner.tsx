// src/components/consent/CookieConsentBanner.tsx
// Clear cookie and reload the page
// document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; location.reload();
// src/components/consent/CookieConsentBanner.tsx
import { useState, useEffect, lazy, Suspense, useTransition } from 'react';
import { useCookieStorage } from '@/hooks/useCookieStorage';
import Modal from '@/components/Modal'; // Now optimized!
import type { CookieConsent } from './types';

const CookiePreferencesModal = lazy(() => import('./CookiePreferencesModal'));

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { getCookie, setCookie } = useCookieStorage();

  useEffect(() => {
    // Quick inline check
    if (document.cookie.includes('cookie-consent=')) return;

    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      functional: true,
      performance: true,
      targeting: true,
      timestamp: Date.now(),
    };
    
    setCookie('cookie-consent', JSON.stringify(consent), { expires: 365 });
    startTransition(() => {
      setShowBanner(false);
    });
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
    startTransition(() => {
      setShowBanner(false);
    });
  };

  const handleOpenSettings = () => {
    startTransition(() => {
      setShowModal(true);
    });
  };

  return (
    <>
      <Modal
        isOpen={showBanner}
        onClose={() => setShowBanner(false)}
        closeButton={false}
        position="bottom-left"
        className="bg-white border border-transparent rounded-lg p-6 shadow-xl max-w-lg w-full"
        overlayClass="bg-transparent pointer-events-none"
        allowScroll={true}
        ssr={false}
        ariaLabel="Cookie consent banner"
      >
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

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleRejectAll}
            className="flex-1 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
            type="button"
            disabled={isPending}
          >
            Reject All
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            type="button"
            disabled={isPending}
          >
            Accept All
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={handleOpenSettings}
            className="text-sm text-blue-600 underline hover:text-blue-700"
            type="button"
            disabled={isPending}
          >
            Cookies Settings
          </button>
        </div>
      </Modal>

      {showModal && (
        <Suspense fallback={null}>
          <CookiePreferencesModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        </Suspense>
      )}
    </>
  );
}