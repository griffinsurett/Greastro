// src/components/forms/FormMessages.tsx
/**
 * FormMessages Component
 * 
 * Displays form-level messages (success, error, loading).
 * Can be customized with Tailwind classes or render props.
 */

import { useFormContext } from './FormContext';
import type { FormMessagesProps } from './types';

export default function FormMessages({
  className = '',
  successClassName = 'bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-4',
  errorClassName = 'bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4',
  showIcon = true,
  position = 'top',
  children,
}: FormMessagesProps) {
  const form = useFormContext();

  const success = form.status === 'success' ? form.message : null;
  const error = form.status === 'error' ? form.message : null;
  const isSubmitting = form.isSubmitting;

  // Custom render function
  if (children) {
    return (
      <div className={className}>
        {children({ success, error, isSubmitting })}
      </div>
    );
  }

  // Don't render if no messages
  if (!success && !error && !isSubmitting) {
    return null;
  }

  return (
    <div className={className} role="status" aria-live="polite">
      {/* Success Message */}
      {success && (
        <div className={successClassName}>
          {showIcon && (
            <span className="inline-block mr-2" aria-hidden="true">
              ✓
            </span>
          )}
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={errorClassName}>
          {showIcon && (
            <span className="inline-block mr-2" aria-hidden="true">
              ⚠️
            </span>
          )}
          {error}
        </div>
      )}

      {/* Loading State */}
      {isSubmitting && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-700">Submitting...</span>
        </div>
      )}
    </div>
  );
}

FormMessages.displayName = 'FormMessages';