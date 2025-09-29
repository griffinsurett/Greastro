// src/components/Button/Button.tsx
import React from 'react';
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

export type ButtonProps = BaseButtonProps & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
);

// Base component that handles tag selection
export const ButtonBase = ({
  href,
  className = '',
  leftIcon,
  rightIcon,
  size = 'md',
  children,
  ...props
}: ButtonProps) => {
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href, ...props } : props;
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
  `.trim();

  return React.createElement(
    Tag,
    {
      className: `${baseClasses} ${className}`.trim(),
      ...tagProps
    } as any,
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );
};

// Variant map
const VARIANT_MAP = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  ghost: GhostButton,
  link: LinkButton,
};

export type ButtonVariant = keyof typeof VARIANT_MAP;

// Fix: Use intersection type instead of extends
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