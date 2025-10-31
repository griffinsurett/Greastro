// src/components/forms/Checkbox.tsx
/**
 * Checkbox Component
 *
 * Consolidated checkbox with label and error handling.
 * Connects directly to form context.
 */

import { useFormContext } from "../FormContext";
import { useEffect } from "react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  name: string;
  label: string;
  required?: boolean;
  validate?: (value: any) => string | null | Promise<string | null>;

  // Styling
  containerClassName?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  errorClassName?: string;

  // Control
  showError?: boolean;
}

export default function Checkbox({
  name,
  label,
  required = false,
  validate,
  containerClassName = "mb-4",
  labelClassName = "flex items-center cursor-pointer",
  checkboxClassName = "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
  errorClassName = "text-red-600 text-sm mt-1 min-h-[1.25rem]",
  showError = true,
  className,
  ...checkboxProps
}: CheckboxProps) {
  const form = useFormContext();

  // Register validator
  useEffect(() => {
    if (validate) {
      (form as any).registerFieldValidator(name, validate);
      return () => (form as any).unregisterFieldValidator(name);
    }
  }, [name, validate, form]);

  const checked = form.values[name] ?? false;
  const error = form.touched[name] && form.errors[name];
  const finalCheckboxClassName = className || checkboxClassName;

  return (
    <div className={containerClassName}>
      {/* Checkbox + Label */}
      <label className={labelClassName}>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={(e) => {
            if (checkboxProps.onChange) checkboxProps.onChange(e);
            form.setFieldValue(name, e.target.checked);
          }}
          onBlur={(e) => {
            if (checkboxProps.onBlur) checkboxProps.onBlur(e);
            form.setFieldTouched(name, true);
          }}
          className={finalCheckboxClassName}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          aria-required={required}
          {...checkboxProps}
        />
        <span className="ml-2 text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>

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
