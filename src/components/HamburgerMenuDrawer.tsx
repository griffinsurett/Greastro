// src/components/LoopTemplates/MobileMenuDrawer.tsx
/**
 * Mobile Menu Drawer Template
 * 
 * Like Accordion, manages open/close state for mobile menu.
 * Uses existing Modal component.
 */

import { useState } from 'react';
import Modal from '@/components/Modal';
import MobileMenuItem from '@/components/LoopComponents/Menu/MobileMenuItem';

interface MobileMenuDrawerProps {
  items: any[];
  className?: string;
}

export default function MobileMenuDrawer({ items, className = '' }: MobileMenuDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigate = () => {
    setIsOpen(false);
  };
  
  return (
    <div className={className}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Mobile Menu Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="center"
        className="w-full max-w-full h-full bg-white p-0 rounded-none"
        overlayClass="bg-black/50"
        closeButton={true}
        closeButtonClass="absolute top-4 right-4 z-10"
        ariaLabel="Mobile navigation menu"
        ssr={false}
      >
        <nav className="h-full overflow-y-auto p-6 pt-16" aria-label="Mobile navigation">
          <ul className="space-y-1" role="menu">
            {items.map((item) => (
              <MobileMenuItem
                key={item.slug || item.id}
                {...item}
                onNavigate={handleNavigate}
              />
            ))}
          </ul>
        </nav>
      </Modal>
    </div>
  );
}