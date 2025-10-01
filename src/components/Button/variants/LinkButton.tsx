// src/components/Button/variants/LinkButton.tsx
import { createElement } from 'react';
import type { ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

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

  return createElement(
    Tag,
    {
      className: `link-base ${sizeClass} ${className}`.trim(),
      ...tagProps
    } as any,
    <>
      {renderButtonIcon(leftIcon, size)}
      {children}
      {renderButtonIcon(rightIcon, size)}
    </>
  );
}