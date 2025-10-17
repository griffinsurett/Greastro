// src/components/HamburgerMenuDrawer.tsx
/**
 * Mobile Menu Drawer Template
 * 
 * Manages open/close state for mobile menu with animated hamburger button.
 */

import { useState } from 'react';
import Modal from '@/components/Modal';
import MobileMenuItem from '@/components/LoopComponents/Menu/MobileMenuItem';
import HamburgerButton from './HamburgerButton';

interface MobileMenuDrawerProps {
  items: any[];
  className?: string;
  hamburgerTransform?: boolean;
}

export default function MobileMenuDrawer({ 
  items, 
  className = '',
  hamburgerTransform = true,
}: MobileMenuDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigate = () => {
    setIsOpen(false);
  };
  
  return (
    <>
      {/* Hamburger Button */}
      <HamburgerButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        hamburgerTransform={hamburgerTransform}
        ariaLabel={isOpen ? 'Close menu' : 'Open menu'}
      />
      
      {/* Mobile Menu Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="center"
        className="w-full max-w-full h-full bg-white p-0 rounded-none pt-20"
        overlayClass="bg-black/50"
        closeButton={false}
        ariaLabel="Mobile navigation menu"
        ssr={false}
      >
        <nav className="h-full overflow-y-auto p-6" aria-label="Mobile navigation">
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
    </>
  );
}