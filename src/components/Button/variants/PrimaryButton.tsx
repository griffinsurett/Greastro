// src/components/Button/PrimaryButton.tsx
import React from 'react';
import { ButtonBase, type ButtonProps } from '../Button';
import Icon from '@/components/Icon';

export default function PrimaryButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = `
    bg-blue-600 text-white 
    hover:bg-blue-700 
    focus:ring-blue-500
  `.trim();

  const renderIcon = (icon: any) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string') return <Icon icon={icon} size={props.size} />;
    return null;
  };

  return (
    <ButtonBase
      {...props}
      className={`${variantClasses} ${className}`}
      leftIcon={renderIcon(leftIcon)}
      rightIcon={renderIcon(rightIcon)}
    />
  );
}