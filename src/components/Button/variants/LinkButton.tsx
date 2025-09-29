// src/components/Button/LinkButton.tsx
import { isValidElement } from 'react';
import { ButtonBase, type ButtonProps } from '../Button';
import Icon from '@/components/Icon';

export default function LinkButton({
  leftIcon,
  rightIcon,
  className = '',
  size,
  ...props
}: ButtonProps) {
  const variantClasses = `
    bg-transparent text-blue-600 
    hover:text-blue-700 hover:underline 
    p-0
    focus:ring-0 focus:ring-offset-0
  `.trim();

  const renderIcon = (icon: any) => {
    if (!icon) return null;
    if (isValidElement(icon)) return icon;
    if (typeof icon === 'string') return <Icon icon={icon} size={size} />;
    return null;
  };

  return (
    <ButtonBase
      {...props}
      size={size}
      className={`${variantClasses} ${className}`}
      leftIcon={renderIcon(leftIcon)}
      rightIcon={renderIcon(rightIcon)}
    />
  );
}