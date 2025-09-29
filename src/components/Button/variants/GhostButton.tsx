// src/components/Button/GhostButton.tsx
import { isValidElement } from 'react';
import { ButtonBase, type ButtonProps } from '../Button';
import Icon from '@/components/Icon';

export default function GhostButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = `
    bg-transparent text-gray-700 
    hover:bg-gray-100 
    focus:ring-gray-500
  `.trim();

  const renderIcon = (icon: any) => {
    if (!icon) return null;
    if (isValidElement(icon)) return icon;
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