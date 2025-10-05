// src/components/Button/variants/GhostButton.tsx
/**
 * Ghost Button Variant
 * 
 * Transparent button that shows background on hover.
 * Used for tertiary actions or when subtle interaction is needed.
 */

import { ButtonBase, type ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

export default function GhostButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  // Transparent with hover effect
  const variantClasses = 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500';

  return (
    <ButtonBase
      {...props}
      className={`${variantClasses} ${className}`}
      leftIcon={renderButtonIcon(leftIcon, props.size)}
      rightIcon={renderButtonIcon(rightIcon, props.size)}
    />
  );
}