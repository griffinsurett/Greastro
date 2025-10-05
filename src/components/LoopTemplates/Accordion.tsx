// src/components/LoopTemplates/Accordion.tsx
/**
 * Accordion Template Component
 * 
 * Container for multiple accordion items with:
 * - Single or multiple expansion modes
 * - State management for all items
 * - Automatic item ID generation from slug or title
 * 
 * Used for FAQ sections, collapsible content lists.
 * Renders AccordionItem components for each item.
 */

import { useState } from "react";
import AccordionItem from "../LoopComponents/AccordionItem";

interface AccordionProps {
  items: Array<{
    slug?: string;              // Unique identifier (falls back to title)
    title: string;              // Item header
    description?: string;       // Shown when expanded
    content?: React.ReactNode;  // Main content when expanded
    rightContent?: React.ReactNode; // Header right side (toggles, etc.)
    [key: string]: any;         // Allow additional properties
  }>;
  allowMultiple?: boolean;      // Allow multiple items expanded at once
  className?: string;
}

/**
 * Accordion container managing expansion state of multiple items
 */
export default function Accordion({
  items,
  allowMultiple = false,
  className = "",
}: AccordionProps) {
  // Track which items are currently expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  /**
   * Toggle an item's expansion state
   * If allowMultiple is false, collapses other items first
   */
  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      
      if (next.has(id)) {
        // Item is expanded, collapse it
        next.delete(id);
      } else {
        // Item is collapsed, expand it
        if (!allowMultiple) {
          // Single mode: collapse all others first
          next.clear();
        }
        next.add(id);
      }
      
      return next;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        // Use slug as ID, fall back to title
        const itemId = item.slug || item.title;

        return (
          <AccordionItem
            key={itemId}
            id={itemId}
            title={item.title}
            description={item.description}
            isExpanded={expandedItems.has(itemId)}
            onToggle={() => toggleItem(itemId)}
            rightContent={item.rightContent}
          >
            {item.content}
          </AccordionItem>
        );
      })}
    </div>
  );
}