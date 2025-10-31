// src/components/forms/Form.tsx
/**
 * Form Component
 *
 * Main wrapper component that provides form context and handles submission.
 * Automatically detects multi-step forms and manages step navigation.
 */
import { useMemo, Children, isValidElement } from "react";
import { useForm } from "./hooks/useForm";
import { FormContext } from "./FormContext";
import { useMultiStep } from "./hooks/useMultiStep";
import type { FormProps } from "./types";

export default function Form({
  children,
  onSubmit,
  initialValues = {},
  validationSchema,
  validateOnChange = false,
  validateOnBlur = true,
  validateOnMount = false,
  successMessage,
  successMessageClassName,
  errorMessageClassName,
  showMessageIcon = true,
  messagePosition = "top",
  className = "",
  formClassName = "",
  resetOnSuccess = false,
  scrollToError = true,
  ariaLabel,
  ariaDescribedBy,
}: FormProps) {
  // Initialize form state
  const form = useForm({
    initialValues,
    onSubmit,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    validateOnMount,
    resetOnSuccess,
  });

  // Detect if this is a multi-step form by looking for FormStep children
  const isMultiStep = useMemo(() => {
    return Children.toArray(children).some(
      (child) =>
        isValidElement(child) && (child.type as any).displayName === "FormStep"
    );
  }, [children]);

  // Initialize multi-step functionality if needed
  const multiStep = useMultiStep({
    enabled: isMultiStep,
    children,
    validateForm: form.validateForm,
  });

  // Scroll to first error on submit if enabled
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await (form as any).handleSubmit(e);

    if (scrollToError && !form.isValid) {
      // Find first error field and scroll to it
      const firstErrorField = Object.keys(form.errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Combine form state with multi-step state
  const contextValue = useMemo(
    () => ({
      ...form,
      isMultiStep,
      currentStep: multiStep.currentStep,
      totalSteps: multiStep.totalSteps,
      goToStep: multiStep.goToStep,
      nextStep: multiStep.nextStep,
      previousStep: multiStep.previousStep,
      isFirstStep: multiStep.isFirstStep,
      isLastStep: multiStep.isLastStep,
    }),
    [form, multiStep, isMultiStep]
  );

  // Render children - filter to current step if multi-step
  const renderedChildren = useMemo(() => {
    if (!isMultiStep) return children;

    // Get all FormStep children
    const steps = Children.toArray(children).filter(
      (child) =>
        isValidElement(child) && (child.type as any).displayName === "FormStep"
    );

    // Get other children (like FormMessages, FormNavigation)
    const otherChildren = Children.toArray(children).filter(
      (child) =>
        !isValidElement(child) || (child.type as any).displayName !== "FormStep"
    );

    // Return current step + other children
    return [
      ...otherChildren.filter((child) => {
        // Show FormMessages and similar components at the top
        return (
          isValidElement(child) &&
          (child.type as any).displayName !== "FormNavigation"
        );
      }),
      steps[multiStep.currentStep],
      ...otherChildren.filter((child) => {
        // Show FormNavigation at the bottom
        return (
          isValidElement(child) &&
          (child.type as any).displayName === "FormNavigation"
        );
      }),
    ];
  }, [children, isMultiStep, multiStep.currentStep]);

  return (
    <FormContext.Provider value={contextValue}>
      <form
        onSubmit={handleSubmit}
        className={className}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        noValidate
      >
        {renderedChildren}
      </form>
    </FormContext.Provider>
  );
}
