// src/components/consent/GDPRManager.tsx
import React from 'react';
import GDPRConsentModal from './GDPRConsentModal';
import PrivacyChoicesButton from './PrivacyChoicesButton';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';

function GDPRContent() {
  return (
    <>
      <GDPRConsentModal />
      <PrivacyChoicesButton />
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