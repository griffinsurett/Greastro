// src/components/forms/FormContext.tsx
/**
 * Form Context
 * 
 * Provides form state and actions to all child components.
 * Supports both single-step and multi-step forms.
 */

import { createContext, useContext } from 'react';
import type { FormContextValue } from './types';

export const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error(
      'Form components must be used within a <Form> component. ' +
      'Wrap your form fields with <Form>...</Form>'
    );
  }
  
  return context;
}

// Convenience hook for accessing just form state
export function useFormState() {
  const context = useFormContext();
  return {
    values: context.values,
    errors: context.errors,
    touched: context.touched,
    status: context.status,
    isSubmitting: context.isSubmitting,
    isValid: context.isValid,
    message: context.message,
  };
}

// Convenience hook for multi-step forms
export function useFormSteps() {
  const context = useFormContext();
  return {
    isMultiStep: context.isMultiStep,
    currentStep: context.currentStep,
    totalSteps: context.totalSteps,
    isFirstStep: context.isFirstStep,
    isLastStep: context.isLastStep,
    goToStep: context.goToStep,
    nextStep: context.nextStep,
    previousStep: context.previousStep,
  };
}