// src/components/Button/Button.tsx
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import PrimaryButton from './variants/PrimaryButton';
import SecondaryButton from './variants/SecondaryButton';
import GhostButton from './variants/GhostButton';
import LinkButton from './variants/LinkButton';

export interface BaseButtonProps {
  leftIcon?: string | ReactNode;
  rightIcon?: string | ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseButtonProps & 
  ButtonHTMLAttributes<HTMLButtonElement> & 
  { href?: never };

type ButtonAsLink = BaseButtonProps & 
  AnchorHTMLAttributes<HTMLAnchorElement> & 
  { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

// Base component that handles tag selection
export const ButtonBase = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ href, className = '', leftIcon, rightIcon, size = 'md', children, ...props }, ref) => {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
    const baseClasses = `btn-base ${sizeClass} ${className}`.trim();

    if (href) {
      // TypeScript knows this is an anchor
      const { href: linkHref, ...anchorProps } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          {...anchorProps}
        >
          {leftIcon}
          {children}
          {rightIcon}
        </a>
      );
    }

    // TypeScript knows this is a button
    const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={baseClasses}
        {...buttonProps}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

ButtonBase.displayName = 'ButtonBase';

// Variant map
const VARIANT_MAP = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  ghost: GhostButton,
  link: LinkButton,
};

export type ButtonVariant = keyof typeof VARIANT_MAP;

export type ButtonComponentProps = ButtonProps & {
  variant?: ButtonVariant;
};

// Main Button component
export default function Button({ 
  variant = 'primary',
  ...props 
}: ButtonComponentProps) {
  const VariantComponent = VARIANT_MAP[variant] || PrimaryButton;
  return <VariantComponent {...props} />;
}