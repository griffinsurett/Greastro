// src/components/GDPRConsentModal.tsx
import { useState } from "react";
import Modal from "../Modal";
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
    title: "Necessary Cookies",
    description:
      "Essential for the website to function properly. These cannot be disabled.",
    required: true,
  },
  {
    key: "analytics",
    title: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website by collecting anonymous data.",
  },
  {
    key: "marketing",
    title: "Marketing Cookies",
    description:
      "Used to track visitors across websites to display relevant advertisements.",
  },
  {
    key: "functional",
    title: "Functional Cookies",
    description:
      "Enable enhanced functionality and personalization, such as remembering preferences.",
  },
];

export default function GDPRConsentModal() {
  const {
    preferences,
    isConsentModalOpen,
    updatePreferences,
    acceptAll,
    rejectAll,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<
    Partial<ConsentPreferences>
  >({
    necessary: true,
    analytics: preferences?.analytics || false,
    marketing: preferences?.marketing || false,
    functional: preferences?.functional || false,
  });

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

  return (
    <Modal
      isOpen={isConsentModalOpen}
      onClose={() => {}} // Prevent closing without consent
      closeButton={false}
      className="bg-white shadow-2xl p-0 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      overlayClass="bg-none items-end justify-start p-4 sm:p-6"
      ariaLabel="Cookie Consent"
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🍪 Your Privacy Matters
          </h2>
          <p className="text-gray-600">
            We use cookies and similar technologies to enhance your experience
            on our website. Please choose your preferences below.
          </p>
        </div>

        {!showDetails && (
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                We respect your privacy. You can customize your cookie
                preferences or accept our recommended settings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptAll}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Accept All
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Customize
              </button>
            </div>
          </div>
        )}

        {showDetails && (
          <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
            {consentCategories.map((category) => (
              <div
                key={category.key}
                className={`p-4 rounded-lg border ${
                  category.required
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {category.title}
                      {category.required && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Required)
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={tempPreferences[category.key] as boolean}
                      onChange={() => handleToggle(category.key)}
                      disabled={category.required}
                    />
                    <div
                      className={`
                      w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                      peer-focus:ring-blue-300 rounded-full peer 
                      peer-checked:after:translate-x-full peer-checked:after:border-white 
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all
                      ${
                        category.required
                          ? "peer-checked:bg-gray-400 cursor-not-allowed"
                          : "peer-checked:bg-blue-600"
                      }
                    `}
                    />
                  </label>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Privacy Policy
            </a>
            <a
              href="/cookie-policy"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
