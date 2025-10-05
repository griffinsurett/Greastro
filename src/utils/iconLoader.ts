// src/utils/iconLoader.ts
/**
 * Icon Loading and Rendering System
 * 
 * Comprehensive icon system supporting:
 * - Multiple icon libraries (Lucide, Feather, Font Awesome, Simple Icons, etc.)
 * - String identifiers ("lu:search", "fa:home")
 * - Emoji icons (direct Unicode)
 * - Custom SVG/image icons
 * - Size management (sm, md, lg, xl)
 * - Accessibility (aria-labels)
 * 
 * Used throughout the app for consistent icon rendering in React components.
 */

import { isValidElement, type ReactNode, createElement } from 'react';
import * as LuIcons from 'react-icons/lu';
import * as FiIcons from 'react-icons/fi';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import * as BiIcons from 'react-icons/bi';
import * as AiIcons from 'react-icons/ai';
import * as MdIcons from 'react-icons/md';

/**
 * Map icon size names to pixel values
 */
export const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof iconSizeMap;

/**
 * Options for rendering an icon
 */
export interface IconRenderOptions {
  size: IconSize;           // Size preset
  className?: string;       // Additional CSS classes
  color?: string;          // Icon color
  ariaLabel?: string;      // Accessibility label
}

/**
 * Map of library name variations to standardized prefixes
 */
const libraryPrefixes: Record<string, string> = {
  'lucide': 'lu',
  'simple-icons': 'si',
  'fa6-brands': 'fa6-brands',
  'fa6-solid': 'fa6-solid',
  'feather': 'fi',
  'font-awesome': 'fa',
  'bi': 'bi',
  'ai': 'ai',
  'md': 'md',
  'lu': 'lu',
  'si': 'si',
  'fi': 'fi',
  'fa': 'fa',
};

/**
 * Map of prefixes to their imported icon libraries
 */
const iconLibraries: Record<string, any> = {
  'lu': LuIcons,
  'lucide': LuIcons,
  'fi': FiIcons,
  'feather': FiIcons,
  'fa': FaIcons,
  'font-awesome': FaIcons,
  'si': SiIcons,
  'simple-icons': SiIcons,
  'bi': BiIcons,
  'ai': AiIcons,
  'md': MdIcons,
};

/**
 * Parse icon string to extract library and icon name
 * 
 * @param icon - Icon string like "lu:search" or just "search"
 * @returns Object with library and name
 * @example
 * parseIconString("lu:search") // { library: 'lu', name: 'search' }
 * parseIconString("search") // { library: 'lu', name: 'search' }
 */
export function parseIconString(icon: string): { library: string; name: string } {
  if (icon.includes(':')) {
    const [library, name] = icon.split(':');
    return { library, name };
  }
  // Default to Lucide icons if no library specified
  return { library: 'lu', name: icon };
}

/**
 * Check if a string is an emoji
 * 
 * Uses Unicode range for emoji detection
 * 
 * @param str - String to check
 * @returns True if string appears to be an emoji
 */
export function isEmoji(str: string): boolean {
  return /[\u{1F300}-\u{1FAD6}]/u.test(str) || (str.length <= 2 && !/^[a-zA-Z0-9]+$/.test(str));
}

/**
 * Validate icon identifier string format
 * 
 * @param icon - Icon identifier to validate
 * @returns True if valid format
 */
export function isValidIconString(icon: string): boolean {
  if (!icon || typeof icon !== 'string') return false;
  if (isEmoji(icon)) return true;
  return /^([a-z0-9-]+:)?[a-z0-9-]+$/i.test(icon);
}

/**
 * Convert kebab-case icon name to PascalCase component name
 * 
 * @param name - Icon name in kebab-case
 * @returns Component name in PascalCase
 * @example
 * toComponentName('arrow-right') // 'ArrowRight'
 */
export function toComponentName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Get React component for an icon from a library
 * 
 * @param library - Library prefix (lu, fa, etc.)
 * @param iconName - Icon name in kebab-case
 * @returns React icon component or null if not found
 * @example
 * getIconComponent('lu', 'arrow-right') // LuArrowRight component
 */
export function getIconComponent(library: string, iconName: string): any {
  const lib = iconLibraries[library];
  if (!lib) {
    console.warn(`Unknown icon library: ${library}`);
    return null;
  }

  // Build component name: Lu + ArrowRight = LuArrowRight
  const componentName = toComponentName(iconName);
  const shortPrefix = libraryPrefixes[library].charAt(0).toUpperCase() + libraryPrefixes[library].slice(1);
  const IconComponent = lib[`${shortPrefix}${componentName}`];

  if (!IconComponent) {
    console.warn(`Icon not found: ${library}:${iconName}`);
  }

  return IconComponent;
}

/**
 * Render an emoji or text as an icon
 * 
 * @param icon - Emoji or text string
 * @param options - Render options
 * @returns React element displaying the emoji/text
 */
function renderEmojiIcon(
  icon: string,
  options: IconRenderOptions
): ReactNode {
  const { size, className = '', color, ariaLabel } = options;
  
  return createElement('span', {
    className: `inline-flex items-center justify-center ${className}`,
    style: { fontSize: iconSizeMap[size], color },
    role: 'img',
    'aria-label': ariaLabel,
    children: icon,
  });
}

/**
 * Render an icon from a library (Lucide, FA, etc.)
 * 
 * @param library - Library prefix
 * @param iconName - Icon name
 * @param options - Render options
 * @returns React icon component or null
 */
function renderLibraryIcon(
  library: string,
  iconName: string,
  options: IconRenderOptions
): ReactNode {
  const { size, className = '', color, ariaLabel } = options;
  const IconComponent = getIconComponent(library, iconName);

  if (!IconComponent) {
    return null;
  }

  return createElement(IconComponent, {
    size: iconSizeMap[size],
    className,
    color,
    'aria-label': ariaLabel,
  });
}

/**
 * Render a string icon (emoji or library icon)
 * 
 * @param icon - Icon string
 * @param options - Render options
 * @returns Rendered icon element
 */
export function renderStringIcon(
  icon: string,
  options: IconRenderOptions
): ReactNode {
  // Render as emoji if it looks like one
  if (isEmoji(icon)) {
    return renderEmojiIcon(icon, options);
  }

  // Validate format
  if (!isValidIconString(icon)) {
    console.warn(`Invalid icon string: ${icon}`);
    return null;
  }

  // Parse and render from library
  const { library, name } = parseIconString(icon);
  return renderLibraryIcon(library, name, options);
}

/**
 * Render an object-based icon (image, SVG, emoji, text)
 * 
 * @param icon - Icon object with type or src
 * @param options - Render options
 * @returns Rendered icon element
 */
export function renderObjectIcon(
  icon: any,
  options: IconRenderOptions
): ReactNode {
  const { size, className = '', color, ariaLabel } = options;
  const sizeValue = iconSizeMap[size];

  // Image object with src
  if ('src' in icon) {
    return createElement('img', {
      src: icon.src,
      alt: ariaLabel || '',
      className,
      width: sizeValue,
      height: sizeValue,
      style: { color },
    });
  }

  // Typed icon objects
  if ('type' in icon) {
    switch (icon.type) {
      case 'svg':
        // Raw SVG content
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { width: sizeValue, height: sizeValue, color },
          dangerouslySetInnerHTML: { __html: icon.content },
          'aria-label': ariaLabel,
        });
      
      case 'emoji':
        // Emoji content
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { fontSize: sizeValue, color },
          role: 'img',
          'aria-label': ariaLabel,
          children: icon.content,
        });
      
      case 'text':
        // Plain text icon
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { fontSize: sizeValue, color },
          children: icon.content,
        });
    }
  }

  return null;
}

/**
 * Main render function - handles any icon type
 * 
 * Universal entry point for icon rendering.
 * Detects type and delegates to appropriate renderer.
 * 
 * @param icon - Icon of any supported type
 * @param options - Render options
 * @returns Rendered icon or null
 * @example
 * renderIcon("lu:search", { size: 'md' })
 * renderIcon("🔍", { size: 'lg' })
 * renderIcon(<CustomIcon />, { size: 'sm' })
 */
export function renderIcon(
  icon: any,
  options: IconRenderOptions
): ReactNode {
  if (!icon) return null;

  // Already a React element - return as-is
  if (isValidElement(icon)) {
    return icon;
  }

  // String icon (library or emoji)
  if (typeof icon === 'string') {
    return renderStringIcon(icon, options);
  }

  // Object icon (image, SVG, etc.)
  if (typeof icon === 'object') {
    return renderObjectIcon(icon, options);
  }

  return null;
}

/**
 * Get fully-qualified icon name with library prefix
 * 
 * @param icon - Icon name
 * @param library - Optional library name
 * @returns Prefixed icon name
 * @example
 * getIconName('search', 'lu') // 'lu:search'
 */
export function getIconName(icon: string, library?: string): string {
  if (icon.includes(':')) return icon;
  const prefix = library ? libraryPrefixes[library] || 'lu' : 'lu';
  return `${prefix}:${icon}`;
}

/**
 * Get human-readable library name from prefix
 * 
 * @param prefix - Library prefix
 * @returns Display name
 * @example
 * getLibraryName('lu') // 'Lucide'
 */
export function getLibraryName(prefix: string): string {
  const names: Record<string, string> = {
    'lu': 'Lucide',
    'si': 'Simple Icons',
    'fi': 'Feather',
    'fa': 'Font Awesome',
    'fa6-brands': 'Font Awesome 6 Brands',
    'fa6-solid': 'Font Awesome 6 Solid',
    'bi': 'Bootstrap Icons',
    'ai': 'Ant Design Icons',
    'md': 'Material Design Icons',
  };
  return names[prefix] || prefix;
}