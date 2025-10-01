// src/components/Button/utils.tsx
import { isValidElement, type ReactNode } from 'react';
import Icon from '@/components/Icon';

export function renderButtonIcon(
  icon: string | ReactNode | undefined,
  size?: 'sm' | 'md' | 'lg'
): ReactNode {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'string') return <Icon icon={icon} size={size} />;
  return null;
}