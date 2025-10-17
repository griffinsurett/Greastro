// src/components/HamburgerButton.tsx
/**
 * Animated Hamburger Button
 * 
 * Three-line hamburger that can optionally transform into a perfect X.
 * All lines rotate from the same center point.
 */

import { memo } from 'react';

export interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hamburgerTransform?: boolean;
  className?: string;
  ariaLabel?: string;
}

function HamburgerButton({
  isOpen,
  onClick,
  hamburgerTransform,
  className = '',
  ariaLabel = 'Toggle menu',
}: HamburgerButtonProps) {
  const shouldTransform = hamburgerTransform && isOpen;
  
  return (
    <button
      onClick={onClick}
      className={`p-2 text-gray-700 hover:text-blue-600 transition-colors ${className}`}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      type="button"
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
    </button>
  );
}

export default memo(HamburgerButton);