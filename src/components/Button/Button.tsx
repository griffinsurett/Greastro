// src/components/Button/Button.tsx
import { createElement } from 'react';
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
  
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
  
  return createElement(
    Tag,
    {
      className: `btn-base ${sizeClass} ${className}`.trim(),
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