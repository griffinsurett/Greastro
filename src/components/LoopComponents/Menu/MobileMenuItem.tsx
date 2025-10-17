// src/components/LoopComponents/MobileMenuItem.tsx
/**
 * Mobile Menu Item Component
 * 
 * Collapsible menu item for mobile navigation.
 * Similar to AccordionItem but for navigation.
 */

import { useState } from 'react';

interface MobileMenuItemProps {
  title: string;
  url?: string;
  slug: string;
  children?: any[];
  openInNewTab?: boolean;
  onNavigate: () => void;
  level?: number;
}

export default function MobileMenuItem({ 
  title, 
  url, 
  children = [],
  openInNewTab = false,
  onNavigate,
  level = 0,
}: MobileMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = children.length > 0;
  const indent = level * 16; // 16px per level
  
  if (hasChildren) {
    return (
      <li role="none">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left py-3 px-4 flex justify-between items-center hover:bg-gray-50 rounded-md transition-colors"
          aria-expanded={isExpanded}
          style={{ paddingLeft: `${indent + 16}px` }}
          type="button"
        >
          <span className="font-medium text-gray-900">{title}</span>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <ul className="mt-1 space-y-1" role="menu">
            {children.map(child => (
              <MobileMenuItem 
                key={child.slug || child.id}
                {...child} 
                onNavigate={onNavigate}
                level={level + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }
  
  return (
    <li role="none">
      <a 
        href={url || '#'} 
        onClick={onNavigate}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
        style={{ paddingLeft: `${indent + 16}px` }}
        role="menuitem"
      >
        {title}
      </a>
    </li>
  );
}