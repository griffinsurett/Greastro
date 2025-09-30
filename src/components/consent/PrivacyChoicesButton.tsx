// src/components/consent/PrivacyChoicesButton.tsx
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { useRef, useEffect } from 'react';

export default function PrivacyChoicesButton() {
  const { showConsentModal, hasConsented } = useCookieConsent();
  const timeoutRef = useRef<number | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  if (!hasConsented) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      showConsentModal();
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout and store reference
      timeoutRef.current = window.setTimeout(() => {
        e.target.checked = false;
        timeoutRef.current = null;
      }, 100);
    }
  };
  
  return (
    <label className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2">
      <input
        type="checkbox"
        id="privacy-choices-toggle"
        className="hidden"
        onChange={handleChange}
        aria-label="Open Privacy Choices"
      />
      <span className="underline decoration-dotted underline-offset-4">
        Your Privacy Choices
      </span>
      <svg 
        className="w-4 h-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
        />
      </svg>
    </label>
  );
}