// src/components/consent/CookiePreferencesModal.tsx
import { useState, useEffect, useMemo, useTransition, memo } from 'react';
import Modal from '@/components/Modal';
import { useCookieStorage } from '@/hooks/useCookieStorage';
import type { CookieConsent, CookieCategoryInfo } from './types';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cookieCategories: CookieCategoryInfo[] = [
  {
    id: 'necessary',
    title: 'Strictly Necessary Cookies',
    description:
      'These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
    required: true,
  },
  {
    id: 'functional',
    title: 'Functional Cookies',
    description:
      'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers.',
  },
  {
    id: 'performance',
    title: 'Performance Cookies',
    description:
      'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
  },
  {
    id: 'targeting',
    title: 'Targeting Cookies',
    description:
      'These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts.',
  },
];

// Memoize the category component for better performance
const CategoryItem = memo(({ 
  category, 
  isExpanded, 
  isEnabled, 
  onToggleExpand, 
  onToggleEnabled 
}: {
  category: CookieCategoryInfo;
  isExpanded: boolean;
  isEnabled: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
}) => (
  <div className="border border-gray-300 rounded-lg overflow-hidden">
    <div className="flex items-center justify-between p-4 bg-gray-50">
      <button
        onClick={onToggleExpand}
        className="flex items-center gap-2 flex-1 text-left"
        type="button"
        aria-expanded={isExpanded}
      >
        <span className="text-gray-600 font-medium">
          {isExpanded ? '−' : '+'}
        </span>
        <span className="font-semibold text-gray-900">
          {category.title}
        </span>
      </button>

      {category.required ? (
        <span className="text-sm text-blue-600 font-medium">
          Always Active
        </span>
      ) : (
        <button
          onClick={onToggleEnabled}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{
            backgroundColor: isEnabled ? '#3B82F6' : '#D1D5DB',
          }}
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label={`Toggle ${category.title}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      )}
    </div>

    {isExpanded && (
      <div className="p-4 bg-white border-t border-gray-300">
        <p className="text-sm text-gray-600">{category.description}</p>
      </div>
    )}
  </div>
));

CategoryItem.displayName = 'CategoryItem';

function CookiePreferencesModal({
  isOpen,
  onClose,
}: CookiePreferencesModalProps) {
  const { getCookie, setCookie } = useCookieStorage();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  
  // Parse cookie only once with useMemo
  const initialPreferences = useMemo(() => {
    const existingConsent = getCookie('cookie-consent');
    if (existingConsent) {
      try {
        return JSON.parse(existingConsent) as CookieConsent;
      } catch (error) {
        console.error('Failed to parse cookie consent:', error);
      }
    }
    return {
      necessary: true,
      functional: false,
      performance: false,
      targeting: false,
      timestamp: Date.now(),
    };
  }, [getCookie]);

  const [preferences, setPreferences] = useState<CookieConsent>(initialPreferences);

  const toggleCategory = (category: string) => {
    startTransition(() => {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(category)) {
          next.delete(category);
        } else {
          next.add(category);
        }
        return next;
      });
    });
  };

  const handleToggle = (categoryId: keyof Omit<CookieConsent, 'timestamp'>) => {
    if (categoryId === 'necessary') return;

    setPreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
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
      onClose();
    });
  };

  const handleConfirm = () => {
    const consent: CookieConsent = {
      ...preferences,
      timestamp: Date.now(),
    };
    setCookie('cookie-consent', JSON.stringify(consent), { expires: 365 });
    startTransition(() => {
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeButton={true}
      className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      overlayClass="bg-black/50 bg-opacity-50"
      ariaLabel="Manage cookie consent preferences"
      ssr={false}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Manage Consent Preferences
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We use cookies and similar technologies to help personalize content
          and offer a better experience. You can click{' '}
          <a
            href="/cookie-policy"
            className="text-blue-600 underline hover:text-blue-700"
          >
            here
          </a>{' '}
          to find out more and change our default settings. However, blocking
          some types of cookies may impact your experience of the site and the
          services we are able to offer.
        </p>
        <a
          href="/cookie-policy"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
        >
          More information
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>

      <div className="space-y-3 mb-6">
        {cookieCategories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isExpanded={expandedCategories.has(category.id)}
            isEnabled={preferences[category.id]}
            onToggleExpand={() => toggleCategory(category.id)}
            onToggleEnabled={() => handleToggle(category.id)}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleRejectAll}
          className="flex-1 rounded-lg border-2 border-blue-600 bg-white px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
          type="button"
          disabled={isPending}
        >
          Reject All
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          type="button"
          disabled={isPending}
        >
          Confirm My Choices
        </button>
      </div>
    </Modal>
  );
}

export default memo(CookiePreferencesModal);