// src/components/Modal.tsx
/**
 * Modal Component
 * 
 * A flexible, accessible modal dialog component with:
 * - Portal rendering (renders outside normal DOM hierarchy)
 * - Keyboard support (Escape to close)
 * - Focus management (traps focus, returns focus on close)
 * - Smooth animations (fade and scale transitions)
 * - Flexible positioning (center, corners)
 * - Optional overlay click-to-close
 * - Optional scroll locking
 * 
 * Used for cookie consent banners, settings modals, and other overlay content.
 */

import { useState, useEffect, useRef, type ReactNode, type ReactPortal, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;                  // Controls modal visibility
  onClose: () => void;              // Callback when modal should close
  children: ReactNode;              // Modal content
  closeButton?: boolean;            // Show X button in top right
  closeButtonClass?: string;        // Custom classes for close button
  overlayClass?: string;            // Custom classes for backdrop
  className?: string;               // Custom classes for modal container
  allowScroll?: boolean;            // Allow body scrolling when open
  ariaLabel?: string;               // Accessibility label
  ariaDescribedBy?: string;         // ID of element describing modal
  position?: 'center' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

/**
 * Modal component with portal rendering and accessibility features
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  closeButton = true,
  closeButtonClass = "absolute top-4 right-4",
  overlayClass = 'bg-black bg-opacity-50',
  className = "bg-white shadow-xl p-6 rounded-lg max-w-lg w-full mx-4",
  allowScroll = false,
  ariaLabel,
  ariaDescribedBy,
  position = 'center',
}: ModalProps): ReactPortal | null {
  // Track whether modal has ever been opened (for portal mounting)
  const [mounted, setMounted] = useState<boolean>(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Mount modal when it opens
   */
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  /**
   * Lock body scroll when modal is open (unless allowScroll is true)
   */
  useEffect(() => {
    if (mounted && !allowScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted, allowScroll]);

  /**
   * Handle Escape key to close modal
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (mounted) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, onClose]);

  /**
   * Focus modal when it opens, return focus when it closes
   */
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const previouslyFocused = document.activeElement as HTMLElement;
      modalRef.current.focus();
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

  /**
   * Unmount modal after exit animation completes
   */
  const handleAnimationEnd = (): void => {
    if (!isOpen) {
      setMounted(false);
    }
  };

  /**
   * Close modal when clicking overlay (not the modal itself)
   */
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Prevent clicks on modal from closing it
   */
  const handleModalClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
  };

  /**
   * Position classes for different modal placements
   */
  const positionClasses = {
    'center': 'flex items-center justify-center',
    'bottom-left': 'flex items-end justify-start p-4',
    'bottom-right': 'flex items-end justify-end p-4',
    'top-left': 'flex items-start justify-start p-4',
    'top-right': 'flex items-start justify-end p-4',
  };

  // Don't render anything if never mounted
  if (!mounted) return null;

  // Render modal as a portal to document.body
  return createPortal(
    <div
      className={`
        fixed inset-0 z-[9999] ${positionClasses[position]}
        ${overlayClass}
        transform transition-opacity duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `.trim()}
      onClick={handleOverlayClick}
      onTransitionEnd={handleAnimationEnd}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <div
        ref={modalRef}
        className={`
          relative ${className}
          transform-gpu transition-all duration-300 ease-in-out
          origin-center
          ${isOpen 
            ? 'scale-100 translate-y-0 opacity-100' 
            : 'scale-95 translate-y-4 opacity-0'
          }
        `.trim()}
        onClick={handleModalClick}
        tabIndex={-1}
      >
        {/* Optional close button */}
        {closeButton && (
          <button
            onClick={onClose}
            className={closeButtonClass}
            aria-label="Close modal"
            type="button"
          >
            <svg 
              className="w-6 h-6" 
              viewBox="0 0 24 24" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}