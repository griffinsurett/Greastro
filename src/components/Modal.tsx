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
}: ModalProps): ReactPortal | null {
  const [mounted, setMounted] = useState<boolean>(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (mounted && !allowScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted, allowScroll]);

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

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const previouslyFocused = document.activeElement as HTMLElement;
      modalRef.current.focus();
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
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