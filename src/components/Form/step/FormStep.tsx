// src/components/forms/FormStep.tsx
/**
 * FormStep Component
 *
 * Wraps a single step in a multi-step form.
 * Only visible when it's the current step.
 */

import type { FormStepProps } from "../types";

function FormStep({
  id,
  title,
  description,
  children,
  className = "",
}: FormStepProps) {
  return (
    <div
      id={`step-${id}`}
      className={className}
      role="tabpanel"
      aria-labelledby={`step-${id}-label`}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3
              id={`step-${id}-label`}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {title}
            </h3>
          )}
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      {children}
    </div>
  );
}

// Add displayName for detection in useMultiStep hook
FormStep.displayName = "FormStep";

export default FormStep;
