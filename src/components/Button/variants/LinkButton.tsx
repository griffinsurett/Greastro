// src/components/Button/variants/LinkButton.tsx
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
  const sizeClass = size === 'sm' ? 'link-sm' : size === 'lg' ? 'link-lg' : 'link-md';
  const baseClasses = `link-base ${sizeClass} ${className}`.trim();

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