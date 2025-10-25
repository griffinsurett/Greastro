// src/components/preferences/language/LanguageSwitcher.tsx
/**
 * Language Switcher Component
 * 
 * Dropdown for changing site language via Google Translate.
 */

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supportedLanguages } from '@/config/languages';
import '@/styles/language-switcher.css';

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLanguageChange = (code: string) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="language-switcher-button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Choose language"
      >
        {currentLanguage.flag && (
          <span className="text-xl leading-none" aria-hidden="true">
            {currentLanguage.flag}
          </span>
        )}
        <span>{currentLanguage.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        ref={dropdownRef}
        className="language-dropdown"
        role="listbox"
        aria-hidden={!isOpen}
        aria-label="Available languages"
      >
        {supportedLanguages.map((language) => (
          <button
            key={language.code}
            type="button"
            role="option"
            aria-selected={language.code === currentLanguage.code}
            className="language-option"
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.flag && (
              <span className="language-option-flag" aria-hidden="true">
                {language.flag}
              </span>
            )}
            <div className="language-option-text">
              <div>{language.nativeName}</div>
              <div className="language-option-native">{language.name}</div>
            </div>
            {language.code === currentLanguage.code && (
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}