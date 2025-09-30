// src/components/LoopComponents/AccordionItem.tsx
import type { ReactNode } from 'react';

export interface AccordionItemProps {
  id: string;
  title: string;
  description?: string;
  children?: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  rightContent?: ReactNode;
}

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
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <label
          htmlFor={id}
          className="flex items-center gap-2 flex-1 cursor-pointer"
        >
          <span className="text-gray-600 font-medium">
            {isExpanded ? '−' : '+'}
          </span>
          <span className="font-semibold text-gray-900">{title}</span>
        </label>
        {rightContent && (
          <div className="ml-4">
            {rightContent}
          </div>
        )}
      </div>
      
      {/* Always use checkbox since we manage single/multiple in JS */}
      <input
        type="checkbox"
        id={id}
        checked={isExpanded}
        onChange={onToggle}
        className="sr-only"
      />
      
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