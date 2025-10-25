// src/components/accessibility/AccessibilityButton.tsx
import { useState, useTransition, lazy, Suspense, memo } from 'react';

const AccessibilityModal = lazy(() => import('./AccessibilityModal'));

function AccessibilityButton() {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = () => {
    startTransition(() => {
      setShowModal(true);
    });
  };

  const handleCloseModal = () => {
    startTransition(() => {
      setShowModal(false);
    });
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
        type="button"
        aria-label="Manage reading preferences"
        disabled={isPending}
      >
        Reading Preferences
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </button>

      {showModal && (
        <Suspense fallback={null}>
          <AccessibilityModal
            isOpen={showModal}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </>
  );
}

export default memo(AccessibilityButton);