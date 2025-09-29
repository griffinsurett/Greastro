// src/components/GDPRManager.tsx
import React from 'react';
import GDPRConsentModal from './GDPRConsentModal';
import { CookieConsentProvider, useCookieConsent } from '@/contexts/CookieConsentContext';

function FloatingSettingsButton() {
  const { hasConsented, showConsentModal } = useCookieConsent();
  
  if (!hasConsented) return null;
  
  return (
    <button
      onClick={showConsentModal}
      className="fixed bottom-4 left-4 z-40 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow group"
      aria-label="Cookie Settings"
      title="Cookie Settings"
    >
      <svg 
        className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" 
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
    </button>
  );
}

function GDPRContent() {
  return (
    <>
      <GDPRConsentModal />
      <FloatingSettingsButton />
    </>
  );
}

export default function GDPRManager() {
  return (
    <CookieConsentProvider>
      <GDPRContent />
    </CookieConsentProvider>
  );
}