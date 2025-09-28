// src/components/Icon.tsx
import React from 'react';
import { getIconName } from '@/utils/iconLoader';

export interface IconProps {
  icon: any; // Will be typed from schema
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
  'aria-label'?: string;
}

const sizeMap = {
  sm: { width: 16, height: 16, fontSize: '0.875rem' },
  md: { width: 24, height: 24, fontSize: '1rem' },
  lg: { width: 32, height: 32, fontSize: '1.25rem' },
  xl: { width: 48, height: 48, fontSize: '1.5rem' },
};

export default function Icon({ 
  icon, 
  size = 'md', 
  className = '', 
  color,
  'aria-label': ariaLabel 
}: IconProps) {
  if (!icon) return null;

  const sizeStyles = sizeMap[size];
  
  // Handle string icons
  if (typeof icon === 'string') {
    // Check if it's an emoji
    if (/[\u{1F300}-\u{1FAD6}]/u.test(icon) || (icon.length <= 2 && !/^[a-zA-Z0-9]+$/.test(icon))) {
      return (
        <span 
          className={`inline-flex items-center justify-center ${className}`}
          style={{ fontSize: sizeStyles.fontSize, color }}
          role="img"
          aria-label={ariaLabel}
        >
          {icon}
        </span>
      );
    }
    
    // Use getIconName to normalize icon names
    const normalizedIcon = getIconName(icon);
    
    // Return a data attribute for client-side icon loading
    return (
      <span 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ fontSize: sizeStyles.fontSize, color }}
        data-icon={normalizedIcon}
        aria-label={ariaLabel}
      >
        {/* Placeholder while icon loads */}
        ○
      </span>
    );
  }
  
  // Handle Zod image type (has src property)
  if (icon.src) {
    return (
      <img
        src={icon.src}
        alt={ariaLabel || ''}
        className={className}
        width={sizeStyles.width}
        height={sizeStyles.height}
        style={{ color }}
      />
    );
  }
  
  // Handle object icons
  if (icon.type) {
    switch (icon.type) {
      case 'astro-icon':
        // Use getIconName for consistency
        const iconName = getIconName(icon.name);
        return (
          <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: sizeStyles.width, height: sizeStyles.height, color }}
            data-icon={iconName}
            aria-label={ariaLabel}
          >
            ○
          </span>
        );
        
      case 'svg':
        return (
          <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: sizeStyles.width, height: sizeStyles.height, color }}
            dangerouslySetInnerHTML={{ __html: icon.content }}
            aria-label={ariaLabel}
          />
        );
        
      case 'emoji':
        return (
          <span 
            className={`inline-flex items-center justify-center ${className}`}
            style={{ fontSize: sizeStyles.fontSize, color }}
            role="img"
            aria-label={ariaLabel}
          >
            {icon.content}
          </span>
        );
        
      case 'text':
        return (
          <span 
            className={`inline-flex items-center justify-center ${className}`}
            style={{ fontSize: sizeStyles.fontSize, color }}
          >
            {icon.content}
          </span>
        );
    }
  }
  
  return null;
}