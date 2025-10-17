// src/components/HamburgerButton.tsx
/**
 * Animated Hamburger Button (Checkbox-based)
 * 
 * Uses a hidden checkbox for state control with pure CSS animations.
 * Three-line hamburger that transforms into a perfect X.
 */

import { memo } from 'react';

export interface HamburgerButtonProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  hamburgerTransform?: boolean;
  className?: string;
  ariaLabel?: string;
  id?: string;
}

function HamburgerButton({
  isOpen,
  onChange,
  hamburgerTransform = true,
  className = '',
  ariaLabel = 'Toggle menu',
  id = 'hamburger-menu',
}: HamburgerButtonProps) {
  const shouldTransform = hamburgerTransform && isOpen;
  
  return (
    <div className={`relative ${className}`}>
      {/* Hidden checkbox - controls state */}
      <input
        type="checkbox"
        id={id}
        checked={isOpen}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={ariaLabel}
      />
      
      {/* Label styled as hamburger button */}
      <label
        htmlFor={id}
        className="cursor-pointer p-2 text-gray-700 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
      >
        <div className="w-6 h-5 relative flex items-center justify-center">
          {/* Top line */}
          <span
            className={`absolute h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
              shouldTransform
                ? 'rotate-45'
                : '-translate-y-2'
            }`}
          />
          
          {/* Middle line */}
          <span
            className={`absolute h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${
              shouldTransform ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            }`}
          />
          
          {/* Bottom line */}
          <span
            className={`absolute h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
              shouldTransform
                ? '-rotate-45'
                : 'translate-y-2'
            }`}
          />
        </div>
      </label>
    </div>
  );
}

export default memo(HamburgerButton);