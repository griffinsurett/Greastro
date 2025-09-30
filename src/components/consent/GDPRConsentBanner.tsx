// src/components/consent/GDPRConsentBanner.tsx
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import Button from '@/components/Button/Button';
import Modal from '@/components/Modal';

export default function GDPRConsentBanner() {
  const {
    hasConsented,
    acceptAll,
    rejectAll,
    showConsentModal,
    isConsentBannerOpen,
  } = useCookieConsent();

  // Don't show if user has already consented
  if (hasConsented) return null;

  return (
    <Modal
      isOpen={isConsentBannerOpen}
      onClose={() => {}} // Empty function - banner shouldn't close on overlay click
      closeButton={false}
      overlayClass="bg-transparent pointer-events-none"
      className="max-w-md bg-white text-gray-900 rounded-lg shadow-2xl p-6 border border-gray-200 pointer-events-auto"
      position="bottom-left"
      allowScroll={true}
      ariaLabel="Cookie Consent Banner"
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl flex-shrink-0">🍪</span>
        <div>
          <p className="text-sm leading-relaxed text-gray-700">
            We use cookies to improve your browsing experience and for marketing purposes.{' '}
            <Button
              href="/privacy-policy"
              variant="link"
              size="sm"
              className="inline"
            >
              Read our Privacy Policy
            </Button>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            onClick={rejectAll}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            Reject All
          </Button>
          <Button
            onClick={acceptAll}
            variant="primary"
            size="md"
            className="flex-1"
          >
            Accept All
          </Button>
        </div>
        
        <Button
          onClick={showConsentModal}
          variant="link"
          size="sm"
          className="text-center py-1"
        >
          Cookies Settings
        </Button>
      </div>
    </Modal>
  );
}