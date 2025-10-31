// src/components/forms/Input.tsx
/**
 * Input Component
 *
 * Consolidated input with label and error handling.
 * Connects directly to form context.
 */

import { useFormContext } from "../FormContext";
import { useEffect } from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label?: string;
  required?: boolean;
  validate?: (value: any) => string | null | Promise<string | null>;

  // Styling
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;

  // Control
  showError?: boolean;
  showLabel?: boolean;
}

export default function Input({
  name,
  label,
  required = false,
  validate,
  containerClassName = "mb-4",
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
  inputClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
  errorClassName = "text-red-600 text-sm mt-1 min-h-[1.25rem]",
  showError = true,
  showLabel = true,
  className,
  ...inputProps
}: InputProps) {
  const form = useFormContext();

  // Register validator
  useEffect(() => {
    if (validate) {
      (form as any).registerFieldValidator(name, validate);
      return () => (form as any).unregisterFieldValidator(name);
    }
  }, [name, validate, form]);

  const value = form.values[name] ?? "";
  const error = form.touched[name] && form.errors[name];
  const finalInputClassName = className || inputClassName;

  return (
    <div className={containerClassName}>
      {/* Label */}
      {showLabel && label && (
        <label htmlFor={name} className={labelClassName}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Input */}
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => {
          if (inputProps.onChange) inputProps.onChange(e);
          form.setFieldValue(name, e.target.value);
        }}
        onBlur={(e) => {
          if (inputProps.onBlur) inputProps.onBlur(e);
          form.setFieldTouched(name, true);
        }}
        className={finalInputClassName}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
        {...inputProps}
      />

      {/* Error */}
      {showError && (
        <div
          id={`${name}-error`}
          className={errorClassName}
          role="alert"
          aria-live="polite"
        >
          {error || ""}
        </div>
      )}
    </div>
  );
}
