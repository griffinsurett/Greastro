// src/hooks/useAccessibility.ts - REPLACE ENTIRE FILE

import { useCallback } from 'react';
import type { A11yPreferences } from '@/components/accessibility/types';

const STORAGE_KEY = 'user-a11y-prefs';

// Cursor tracking handlers
let guideHandler: ((e: MouseEvent) => void) | null = null;
let maskHandler: ((e: MouseEvent) => void) | null = null;

function attachReadingGuide() {
  if (guideHandler) return;
  
  guideHandler = (e: MouseEvent) => {
    const guide = document.querySelector('[data-reading-guide]') as HTMLElement;
    if (guide) {
      guide.style.top = `${e.clientY}px`;
    }
  };
  
  document.addEventListener('mousemove', guideHandler, { passive: true });
  
  // Create guide element if it doesn't exist
  if (!document.querySelector('[data-reading-guide]')) {
    const guide = document.createElement('div');
    guide.setAttribute('data-reading-guide', 'true');
    guide.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      height: 2px;
      background-color: rgba(255, 0, 0, 0.6);
      pointer-events: none;
      z-index: 9999;
      box-shadow: 0 0 8px rgba(255, 0, 0, 0.4);
    `;
    document.body.appendChild(guide);
  }
}

function detachReadingGuide() {
  if (guideHandler) {
    document.removeEventListener('mousemove', guideHandler);
    guideHandler = null;
  }
  
  const guide = document.querySelector('[data-reading-guide]');
  if (guide) {
    guide.remove();
  }
}

function attachReadingMask() {
  if (maskHandler) return;
  
  maskHandler = (e: MouseEvent) => {
    document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
  };
  
  document.addEventListener('mousemove', maskHandler, { passive: true });
}

function detachReadingMask() {
  if (maskHandler) {
    document.removeEventListener('mousemove', maskHandler);
    maskHandler = null;
  }
}

// EXPORT this so it can be used elsewhere
export function applyPreferences(prefs: A11yPreferences) {
  const root = document.documentElement;
  
  console.log('🎨 Applying accessibility preferences:', prefs);
  
  // TEXT & TYPOGRAPHY
  root.style.setProperty('--a11y-font-size', `${prefs.text.fontSize}%`);
  root.style.setProperty('--a11y-line-height', `${prefs.text.lineHeight}`);
  root.style.setProperty('--a11y-letter-spacing', `${prefs.text.letterSpacing}em`);
  root.style.setProperty('--a11y-word-spacing', `${prefs.text.wordSpacing}em`);
  root.setAttribute('data-a11y-font', prefs.text.fontFamily);
  root.style.fontWeight = prefs.text.fontWeight;
  
  // Apply text align to body
  if (document.body) {
    document.body.style.textAlign = prefs.text.textAlign;
  }
  
  // VISUAL ENHANCEMENTS
  root.setAttribute('data-a11y-links', prefs.visual.linkHighlight ? 'true' : 'false');
  root.setAttribute('data-a11y-titles', prefs.visual.titleHighlight ? 'true' : 'false');
  root.setAttribute('data-a11y-contrast', prefs.visual.contrastBoost ? 'boost' : 'normal');
  root.setAttribute('data-a11y-saturation', prefs.visual.saturation);
  
  // READING AIDS
  root.setAttribute('data-a11y-focus', prefs.reading.focusHighlight ? 'true' : 'false');
  root.setAttribute('data-a11y-cursor', prefs.reading.bigCursor ? 'big' : 'normal');
  root.setAttribute('data-a11y-mask', prefs.reading.readingMask ? 'true' : 'false');
  
  if (prefs.reading.pauseAnimations) {
    root.style.setProperty('--a11y-animation-duration', '0.01ms');
  } else {
    root.style.setProperty('--a11y-animation-duration', '0.3s');
  }
  
  // Attach/detach reading guide
  if (prefs.reading.readingGuide) {
    attachReadingGuide();
  } else {
    detachReadingGuide();
  }
  
  // Attach/detach reading mask
  if (prefs.reading.readingMask) {
    attachReadingMask();
  } else {
    detachReadingMask();
  }
  
  // CONTENT SIMPLIFICATION
  root.setAttribute('data-a11y-images', prefs.content.hideImages ? 'hide' : 'show');
  root.setAttribute('data-a11y-sounds', prefs.content.muteSounds ? 'mute' : 'play');
  root.setAttribute('data-a11y-motion', prefs.content.reducedMotion ? 'reduced' : 'normal');
  
  console.log('✅ Accessibility preferences applied successfully');
  console.log('📊 Font size:', root.style.getPropertyValue('--a11y-font-size'));
  console.log('📊 Data attributes:', {
    font: root.getAttribute('data-a11y-font'),
    links: root.getAttribute('data-a11y-links'),
    images: root.getAttribute('data-a11y-images'),
  });
}

function removePreferences() {
  const root = document.documentElement;
  
  console.log('🧹 Removing all accessibility preferences');
  
  // Remove CSS variables
  root.style.removeProperty('--a11y-font-size');
  root.style.removeProperty('--a11y-line-height');
  root.style.removeProperty('--a11y-letter-spacing');
  root.style.removeProperty('--a11y-word-spacing');
  root.style.removeProperty('--a11y-animation-duration');
  root.style.fontWeight = '';
  
  if (document.body) {
    document.body.style.textAlign = '';
  }
  
  // Remove attributes
  root.removeAttribute('data-a11y-font');
  root.removeAttribute('data-a11y-links');
  root.removeAttribute('data-a11y-titles');
  root.removeAttribute('data-a11y-contrast');
  root.removeAttribute('data-a11y-saturation');
  root.removeAttribute('data-a11y-focus');
  root.removeAttribute('data-a11y-cursor');
  root.removeAttribute('data-a11y-mask');
  root.removeAttribute('data-a11y-images');
  root.removeAttribute('data-a11y-sounds');
  root.removeAttribute('data-a11y-motion');
  
  // Detach handlers
  detachReadingGuide();
  detachReadingMask();
  
  console.log('✅ Preferences removed');
}

export function useAccessibility() {
  const getPreferences = useCallback((): A11yPreferences | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📖 Retrieved preferences from localStorage:', parsed);
        return parsed;
      }
      console.log('📭 No preferences found in localStorage');
      return null;
    } catch (error) {
      console.error('❌ Failed to get accessibility preferences:', error);
      return null;
    }
  }, []);

  const setPreferences = useCallback((prefs: A11yPreferences) => {
    try {
      console.log('💾 Saving preferences to localStorage:', prefs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      
      // CRITICAL: Apply immediately after saving
      applyPreferences(prefs);
      
      console.log('✅ Preferences saved and applied');
    } catch (error) {
      console.error('❌ Failed to set accessibility preferences:', error);
    }
  }, []);

  const resetPreferences = useCallback(() => {
    try {
      console.log('🔄 Resetting preferences');
      localStorage.removeItem(STORAGE_KEY);
      removePreferences();
      console.log('✅ Preferences reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset accessibility preferences:', error);
    }
  }, []);

  return { getPreferences, setPreferences, resetPreferences };
}