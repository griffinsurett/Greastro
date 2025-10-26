// src/components/preferences/language/LanguageSwitcher.tsx
/**
 * Language Switcher Component
 *
 * Simple dropdown that reads current language from localStorage
 * and calls window.changeLanguage() to switch.
 */

import { useState, useRef, useEffect } from "react";
import {
  supportedLanguages,
  getLanguageByCode,
} from "@/utils/languageTranslation/languages";
import "@/styles/language-switcher.css";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get current language from localStorage
  const getCurrentLanguage = () => {
    if (typeof window === "undefined") return supportedLanguages[0];
    const code = localStorage.getItem("user-language") || "en";
    return getLanguageByCode(code) || supportedLanguages[0];
  };

  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage);

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
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleLanguageChange = (code: string) => {
    setIsOpen(false);

    // Update localStorage and reload page
    if (typeof window !== "undefined" && (window as any).changeLanguage) {
      (window as any).changeLanguage(code);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="language-switcher-button notranslate"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Choose language"
      >
        {currentLanguage.flag && (
          <span className="text-xl leading-none notranslate" aria-hidden="true">
            {currentLanguage.flag}
          </span>
        )}
        <span className="notranslate">{currentLanguage.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
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
            className="language-option notranslate"
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.flag && (
              <span
                className="language-option-flag notranslate"
                aria-hidden="true"
              >
                {language.flag}
              </span>
            )}
            <div className="language-option-text">
              <div className="notranslate">{language.nativeName}</div>
              <div className="language-option-native notranslate">
                {language.name}
              </div>
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
