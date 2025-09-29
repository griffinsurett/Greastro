// src/components/Icon.tsx
import { isValidElement } from 'react';
import * as LuIcons from 'react-icons/lu'; // Lucide
import * as FiIcons from 'react-icons/fi'; // Feather  
import * as FaIcons from 'react-icons/fa'; // Font Awesome
import * as SiIcons from 'react-icons/si'; // Simple Icons
import * as BiIcons from 'react-icons/bi'; // Box Icons
import * as AiIcons from 'react-icons/ai'; // Ant Design
import * as MdIcons from 'react-icons/md'; // Material Design

export interface IconProps {
  icon: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
  'aria-label'?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export default function Icon({ 
  icon, 
  size = 'md', 
  className = '', 
  color,
  'aria-label': ariaLabel 
}: IconProps) {
  if (!icon) return null;

  // Handle React elements
  if (isValidElement(icon)) {
    return <>{icon}</>;
  }

  // Handle string icons with library prefix
  if (typeof icon === 'string') {
    // Check if it's an emoji
    if (/[\u{1F300}-\u{1FAD6}]/u.test(icon) || (icon.length <= 2 && !/^[a-zA-Z0-9]+$/.test(icon))) {
      return (
        <span 
          className={`inline-flex items-center justify-center ${className}`}
          style={{ fontSize: sizeMap[size], color }}
          role="img"
          aria-label={ariaLabel}
        >
          {icon}
        </span>
      );
    }

    // Parse library:iconName format
    let library = 'lu'; // Default to Lucide
    let iconName = icon;
    
    if (icon.includes(':')) {
      [library, iconName] = icon.split(':');
    }

    // Convert kebab-case to PascalCase
    const componentName = iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    let IconComponent: any;

    // Map library prefixes to react-icons libraries
    switch (library) {
      case 'lucide':
      case 'lu':
        IconComponent = (LuIcons as any)[`Lu${componentName}`];
        break;
      case 'feather':
      case 'fi':
        IconComponent = (FiIcons as any)[`Fi${componentName}`];
        break;
      case 'fa':
      case 'font-awesome':
        IconComponent = (FaIcons as any)[`Fa${componentName}`];
        break;
      case 'simple-icons':
      case 'si':
        IconComponent = (SiIcons as any)[`Si${componentName}`];
        break;
      case 'bi':
        IconComponent = (BiIcons as any)[`Bi${componentName}`];
        break;
      case 'ai':
        IconComponent = (AiIcons as any)[`Ai${componentName}`];
        break;
      case 'md':
        IconComponent = (MdIcons as any)[`Md${componentName}`];
        break;
      default:
        console.warn(`Unknown icon library: ${library}`);
        IconComponent = null;
    }

    if (!IconComponent) {
      console.warn(`Icon not found: ${icon}`);
      return null;
    }

    return (
      <IconComponent 
        size={sizeMap[size]} 
        className={className}
        color={color}
        aria-label={ariaLabel}
      />
    );
  }

  // Handle Zod image type
  if (icon.src) {
    return (
      <img
        src={icon.src}
        alt={ariaLabel || ''}
        className={className}
        width={sizeMap[size]}
        height={sizeMap[size]}
        style={{ color }}
      />
    );
  }

  // Handle object icons with type
  if (icon.type) {
    switch (icon.type) {
      case 'svg':
        return (
          <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: sizeMap[size], height: sizeMap[size], color }}
            dangerouslySetInnerHTML={{ __html: icon.content }}
            aria-label={ariaLabel}
          />
        );
      case 'emoji':
        return (
          <span 
            className={`inline-flex items-center justify-center ${className}`}
            style={{ fontSize: sizeMap[size], color }}
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
            style={{ fontSize: sizeMap[size], color }}
          >
            {icon.content}
          </span>
        );
    }
  }

  return null;
}