// src/utils/iconLoader.ts
import { isValidElement, type ReactNode, createElement } from 'react';
import * as LuIcons from 'react-icons/lu';
import * as FiIcons from 'react-icons/fi';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import * as BiIcons from 'react-icons/bi';
import * as AiIcons from 'react-icons/ai';
import * as MdIcons from 'react-icons/md';

/**
 * Icon size mapping
 */
export const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof iconSizeMap;

/**
 * Icon render options
 */
export interface IconRenderOptions {
  size: IconSize;
  className?: string;
  color?: string;
  ariaLabel?: string;
}

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
 */
export function parseIconString(icon: string): { library: string; name: string } {
  if (icon.includes(':')) {
    const [library, name] = icon.split(':');
    return { library, name };
  }
  return { library: 'lu', name: icon };
}

/**
 * Check if a string is an emoji
 */
export function isEmoji(str: string): boolean {
  return /[\u{1F300}-\u{1FAD6}]/u.test(str) || (str.length <= 2 && !/^[a-zA-Z0-9]+$/.test(str));
}

/**
 * Check if a string is a valid icon identifier
 */
export function isValidIconString(icon: string): boolean {
  if (!icon || typeof icon !== 'string') return false;
  if (isEmoji(icon)) return true;
  return /^([a-z0-9-]+:)?[a-z0-9-]+$/i.test(icon);
}

/**
 * Convert icon name to component name (kebab-case to PascalCase)
 */
export function toComponentName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Get icon component from library
 */
export function getIconComponent(library: string, iconName: string): any {
  const lib = iconLibraries[library];
  if (!lib) {
    console.warn(`Unknown icon library: ${library}`);
    return null;
  }

  const componentName = toComponentName(iconName);
  const shortPrefix = libraryPrefixes[library].charAt(0).toUpperCase() + libraryPrefixes[library].slice(1);
  const IconComponent = lib[`${shortPrefix}${componentName}`];

  if (!IconComponent) {
    console.warn(`Icon not found: ${library}:${iconName}`);
  }

  return IconComponent;
}

/**
 * Render an emoji or simple text as an icon
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
 * Render an icon from a library (lucide, fa, etc)
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
 */
export function renderStringIcon(
  icon: string,
  options: IconRenderOptions
): ReactNode {
  if (isEmoji(icon)) {
    return renderEmojiIcon(icon, options);
  }

  if (!isValidIconString(icon)) {
    console.warn(`Invalid icon string: ${icon}`);
    return null;
  }

  const { library, name } = parseIconString(icon);
  return renderLibraryIcon(library, name, options);
}

/**
 * Render an object-based icon (image, svg, emoji, text)
 */
export function renderObjectIcon(
  icon: any,
  options: IconRenderOptions
): ReactNode {
  const { size, className = '', color, ariaLabel } = options;
  const sizeValue = iconSizeMap[size];

  // Image object
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
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { width: sizeValue, height: sizeValue, color },
          dangerouslySetInnerHTML: { __html: icon.content },
          'aria-label': ariaLabel,
        });
      
      case 'emoji':
        return createElement('span', {
          className: `inline-flex items-center justify-center ${className}`,
          style: { fontSize: sizeValue, color },
          role: 'img',
          'aria-label': ariaLabel,
          children: icon.content,
        });
      
      case 'text':
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
 */
export function renderIcon(
  icon: any,
  options: IconRenderOptions
): ReactNode {
  if (!icon) return null;

  // React element - return as-is
  if (isValidElement(icon)) {
    return icon;
  }

  // String icon
  if (typeof icon === 'string') {
    return renderStringIcon(icon, options);
  }

  // Object icon
  if (typeof icon === 'object') {
    return renderObjectIcon(icon, options);
  }

  return null;
}

/**
 * Get icon name with library prefix
 */
export function getIconName(icon: string, library?: string): string {
  if (icon.includes(':')) return icon;
  const prefix = library ? libraryPrefixes[library] || 'lu' : 'lu';
  return `${prefix}:${icon}`;
}

/**
 * Get icon library display name
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