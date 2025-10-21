// src/components/accessibility/AccessibilityButton.tsx - REPLACE ENTIRE FILE

import { useState, useTransition, lazy, Suspense, memo } from 'react';

const AccessibilityModal = lazy(() => import('./AccessibilityModal'));

function AccessibilityButton() {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = () => {
    console.log('🖱️ Accessibility button clicked');
    startTransition(() => {
      setShowModal(true);
    });
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={isPending}
        className="fixed bottom-6 right-6 z-[9999] p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Open reading preferences"
        title="Reading Preferences"
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </button>

      {showModal && (
        <Suspense fallback={null}>
          <AccessibilityModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        </Suspense>
      )}
    </>
  );
}

export default memo(AccessibilityButton);