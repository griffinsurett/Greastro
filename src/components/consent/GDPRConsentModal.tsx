// src/components/consent/GDPRConsentModal.tsx
import { useState, useEffect } from "react";
import Modal from "../Modal";
import Button from "../Button/Button";
import Accordion from "../Accordion";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import type { ConsentPreferences } from "@/contexts/CookieConsentContext";

interface ConsentCategory {
  key: keyof Omit<ConsentPreferences, "timestamp" | "version">;
  title: string;
  description: string;
  required?: boolean;
}

const consentCategories: ConsentCategory[] = [
  {
    key: "necessary",
    title: "Strictly Necessary Cookies",
    description:
      "These cookies are essential for the website to function properly. They cannot be disabled.",
    required: true,
  },
  {
    key: "functional",
    title: "Functional Cookies",
    description:
      "These cookies enable enhanced functionality and personalization, such as remembering your preferences.",
  },
  {
    key: "analytics",
    title: "Performance Cookies",
    description:
      "These cookies help us understand how visitors interact with our website by collecting anonymous data.",
  },
  {
    key: "marketing",
    title: "Targeting Cookies",
    description:
      "These cookies are used to track visitors across websites to display relevant advertisements.",
  },
];

export default function GDPRConsentModal() {
  const {
    preferences,
    hasConsented,
    isConsentModalOpen,
    updatePreferences,
    rejectAll,
    closeConsentModal,
  } = useCookieConsent();

  const [tempPreferences, setTempPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  // Sync tempPreferences when modal opens or preferences change
  useEffect(() => {
    if (isConsentModalOpen && preferences) {
      setTempPreferences({
        necessary: true,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        functional: preferences.functional,
      });
    } else if (isConsentModalOpen && !preferences) {
      setTempPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
      });
    }
  }, [isConsentModalOpen, preferences]);

  const handleToggle = (key: keyof ConsentPreferences) => {
    if (key === "necessary") return;

    setTempPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    updatePreferences(tempPreferences);
  };

  const handleClose = () => {
    if (hasConsented) {
      closeConsentModal();
    }
  };

  const accordionItems = consentCategories.map((category) => ({
    id: category.key,
    title: category.title,
    description: category.description,
    rightContent: category.required ? (
      <span className="text-xs text-blue-600 font-medium">
        Always Active
      </span>
    ) : (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={tempPreferences[category.key] as boolean}
          onChange={() => handleToggle(category.key)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
      </label>
    ),
  }));

  return (
    <Modal
      isOpen={isConsentModalOpen}
      onClose={handleClose}
      closeButton={hasConsented}
      className="bg-white text-gray-900 shadow-2xl p-0 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      closeButtonClass="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
      overlayClass="bg-transparent bg-opacity-50"
      ariaLabel="Cookie Consent Preferences"
    >
      {/* Scrollable content area */}
      <div className="overflow-y-auto flex-1">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Manage Consent Preferences
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              We use cookies and similar technologies to help personalize content and offer a better experience. You can click{" "}
              <a
                href="/cookie-policy"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                here
              </a>{" "}
              to find out more and change our default settings. However, blocking some types of cookies may impact your experience of the site and the services we are able to offer.
            </p>
            <a
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-700 underline text-sm inline-flex items-center gap-1"
            >
              More information
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="mb-6">
            <Accordion items={accordionItems} allowMultiple={false} />
          </div>
        </div>
      </div>

      {/* Fixed button area */}
      <div className="border-t border-gray-200 p-6 bg-white">
        <div className="flex gap-3">
          <Button
            onClick={rejectAll}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Reject All
          </Button>
          <Button
            onClick={handleSavePreferences}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            Confirm My Choices
          </Button>
        </div>
      </div>
    </Modal>
  );
}