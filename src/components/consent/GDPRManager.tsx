// src/components/consent/GDPRManager.tsx
import React from 'react';
import GDPRConsentBanner from './GDPRConsentBanner';
import GDPRConsentModal from './GDPRConsentModal';
import PrivacyChoicesButton from './PrivacyChoicesButton';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';

function GDPRContent() {
  return (
    <>
      <GDPRConsentBanner />
      <GDPRConsentModal />
      <PrivacyChoicesButton />
    </>
  );
}

interface GDPRManagerProps {
  testMode?: boolean;
}

export default function GDPRManager({ testMode = false }: GDPRManagerProps) {
  return (
    <CookieConsentProvider config={{ testMode }}>
      <GDPRContent />
    </CookieConsentProvider>
  );
}