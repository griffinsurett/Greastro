// src/components/Modal.tsx
import { useState, useEffect, useRef, type ReactNode, type ReactPortal, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeButton?: boolean;
  closeButtonClass?: string;
  overlayClass?: string;
  className?: string;
  allowScroll?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  position?: 'center' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  ssr?: boolean;
}

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
  ssr = true,
}: ModalProps): ReactPortal | null {
  const [mounted, setMounted] = useState<boolean>(ssr ? isOpen : false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Only mount on client side if ssr is false
  useEffect(() => {
    if (!ssr) {
      setMounted(true);
    }
  }, [ssr]);

  // Track isOpen state for animations
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (mounted && isOpen && !allowScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted, isOpen, allowScroll]);

  // Handle Escape key
  useEffect(() => {
    if (!mounted) return;
    
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (mounted && isOpen && modalRef.current) {
      const previouslyFocused = document.activeElement as HTMLElement;
      modalRef.current.focus();
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [mounted, isOpen]);

  // Unmount modal after exit animation completes
  const handleAnimationEnd = (): void => {
    if (!isOpen) {
      setMounted(false);
    }
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
  };

  const positionClasses = {
    'center': 'flex items-center justify-center',
    'bottom-left': 'flex items-end justify-start p-4',
    'bottom-right': 'flex items-end justify-end p-4',
    'top-left': 'flex items-start justify-start p-4',
    'top-right': 'flex items-start justify-end p-4',
  };

  // Check if overlay has pointer-events-none
  const hasNonInteractiveOverlay = overlayClass.includes('pointer-events-none');

  // Don't render during SSR if ssr is false
  if (!ssr && !mounted) return null;

  // Don't render if not mounted (for animations)
  if (!mounted) return null;

  // Render modal as a portal to document.body
  return createPortal(
    <div
      className={`
        fixed inset-0 z-[10000] ${positionClasses[position]}
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
          ${hasNonInteractiveOverlay ? 'pointer-events-auto' : ''}
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