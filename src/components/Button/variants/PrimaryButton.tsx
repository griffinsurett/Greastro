// src/components/Button/variants/PrimaryButton.tsx
/**
 * Primary Button Variant
 * 
 * Solid blue button - the default and most prominent button style.
 * Used for primary actions like form submissions, main CTAs.
 */

import { ButtonBase, type ButtonProps } from '../Button';
import { renderButtonIcon } from '../utils';

/**
 * Primary button with blue background and white text
 */
export default function PrimaryButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  // Primary button styling
  const variantClasses = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';

  return (
    <ButtonBase
      {...props}
      className={`${variantClasses} ${className}`}
      leftIcon={renderButtonIcon(leftIcon, props.size)}
      rightIcon={renderButtonIcon(rightIcon, props.size)}
    />
  );
}