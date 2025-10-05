// src/components/LoopComponents/AccordionItem.tsx
/**
 * Accordion Item Component
 * 
 * Individual accordion item that can expand/collapse.
 * Used within the Accordion template to create FAQ sections, expandable content lists.
 * 
 * Features:
 * - Controlled expansion state (managed by parent Accordion)
 * - Optional description text
 * - Right-side content slot (for toggles, badges, etc.)
 * - Accessible with proper ARIA attributes
 * - Hidden checkbox for state management
 */

import type { ReactNode } from 'react';

export interface AccordionItemProps {
  id: string;                    // Unique identifier for this item
  title: string;                 // Item header text
  description?: string;          // Optional description shown when expanded
  children?: ReactNode;          // Main content shown when expanded
  isExpanded: boolean;           // Current expansion state
  onToggle: () => void;          // Callback when item is clicked
  rightContent?: ReactNode;      // Optional content in header (toggle switch, badge, etc.)
}

/**
 * Single accordion item with expand/collapse functionality
 */
export default function AccordionItem({
  id,
  title,
  description,
  children,
  isExpanded,
  onToggle,
  rightContent,
}: AccordionItemProps) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <label
          htmlFor={id}
          className="flex items-center gap-2 flex-1 cursor-pointer"
        >
          {/* Expand/collapse indicator */}
          <span className="text-gray-600 font-medium">
            {isExpanded ? '−' : '+'}
          </span>
          <span className="font-semibold text-gray-900">{title}</span>
        </label>
        
        {/* Optional right content (toggles, badges, etc.) */}
        {rightContent && (
          <div className="ml-4">
            {rightContent}
          </div>
        )}
      </div>
      
      {/* Hidden checkbox for state management */}
      <input
        type="checkbox"
        id={id}
        checked={isExpanded}
        onChange={onToggle}
        className="sr-only"
      />
      
      {/* Expandable content area */}
      {isExpanded && (
        <div
          id={`${id}-content`}
          className="p-4 bg-white border-t border-gray-300"
          aria-labelledby={id}
        >
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}