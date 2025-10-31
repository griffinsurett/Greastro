// src/components/forms/Select.tsx
/**
 * Select Component
 *
 * Consolidated select with label and error handling.
 * Connects directly to form context.
 */

import { useFormContext } from "../FormContext";
import { useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  name: string;
  label?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  validate?: (value: any) => string | null | Promise<string | null>;

  // Styling
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;

  // Control
  showError?: boolean;
  showLabel?: boolean;
}

export default function Select({
  name,
  label,
  required = false,
  options,
  placeholder = "Select an option",
  validate,
  containerClassName = "mb-4",
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
  selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
  errorClassName = "text-red-600 text-sm mt-1 min-h-[1.25rem]",
  showError = true,
  showLabel = true,
  className,
  ...selectProps
}: SelectProps) {
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
  const finalSelectClassName = className || selectClassName;

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

      {/* Select */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => {
          if (selectProps.onChange) selectProps.onChange(e);
          form.setFieldValue(name, e.target.value);
        }}
        onBlur={(e) => {
          if (selectProps.onBlur) selectProps.onBlur(e);
          form.setFieldTouched(name, true);
        }}
        className={finalSelectClassName}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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
