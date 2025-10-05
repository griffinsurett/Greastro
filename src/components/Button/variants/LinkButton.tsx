// src/components/Button/variants/LinkButton.tsx
/**
 * Link Button Variant
 * 
 * Styled as an underlined text link rather than a button.
 * Uses link-specific styling classes instead of button classes.
 * Can still render as either <a> or <button> based on href.
 */

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
  // Map size to link-specific classes (no padding like buttons)
  const sizeClass = size === 'sm' ? 'link-sm' : size === 'lg' ? 'link-lg' : 'link-md';
  const baseClasses = `link-base ${sizeClass} ${className}`.trim();

  // Render as anchor if href provided
  if (href) {
    return (
      <a 
        href={href} 
        className={baseClasses} 
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {renderButtonIcon(leftIcon, size)}
        {children}
        {renderButtonIcon(rightIcon, size)}
      </a>
    );
  }

  // Render as button otherwise
  return (
    <button 
      className={baseClasses} 
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {renderButtonIcon(leftIcon, size)}
      {children}
      {renderButtonIcon(rightIcon, size)}
    </button>
  );
}