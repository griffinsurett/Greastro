// src/components/Button/variants/LinkButton.tsx
import { isValidElement, createElement } from 'react';
import type { ButtonProps } from '../Button';
import Icon from '@/components/Icon';

export default function LinkButton({
  leftIcon,
  rightIcon,
  className = '',
  size = 'md',
  href,
  children,
  ...props
}: ButtonProps) {
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href, ...props } : props;
  
  const sizeClass = size === 'sm' ? 'link-sm' : size === 'lg' ? 'link-lg' : 'link-md';

  const renderIcon = (icon: any) => {
    if (!icon) return null;
    if (isValidElement(icon)) return icon;
    if (typeof icon === 'string') return <Icon icon={icon} size={size} />;
    return null;
  };

  return createElement(
    Tag,
    {
      className: `link-base ${sizeClass} ${className}`.trim(),
      ...tagProps
    } as any,
    <>
      {renderIcon(leftIcon)}
      {children}
      {renderIcon(rightIcon)}
    </>
  );
}