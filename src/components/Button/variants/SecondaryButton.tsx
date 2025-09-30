// src/components/Button/variants/SecondaryButton.tsx
import { isValidElement } from 'react';
import { ButtonBase, type ButtonProps } from '../Button';
import Icon from '@/components/Icon';

export default function SecondaryButton({
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500';

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