// src/components/Icon.tsx
import type { ReactNode } from 'react';
import { renderIcon, type IconSize } from '@/utils/iconLoader';
import type { IconType } from '@/content/schema';

export interface IconProps {
  icon: IconType;
  size?: IconSize;
  className?: string;
  color?: string;
  'aria-label'?: string;
}

export default function Icon({ 
  icon, 
  size = 'md', 
  className = '', 
  color,
  'aria-label': ariaLabel 
}: IconProps): ReactNode {
  return renderIcon(icon, {
    size,
    className,
    color,
    ariaLabel,
  });
}