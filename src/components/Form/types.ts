// src/components/forms/types.ts
/**
 * Form System Type Definitions
 * 
 * Complete type safety for the flexible form system.
 * Supports single-step and multi-step forms with full customization.
 */

import type { ReactNode } from 'react';
import type { ZodSchema } from 'zod';

// ─── Core Form Types ────────────────────────────────────────────

export interface FormValues {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormTouched {
  [key: string]: boolean;
}

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// ─── Validation ─────────────────────────────────────────────────

export type FieldValidator = (value: any) => string | null | Promise<string | null>;

export interface ValidationConfig {
  validationSchema?: ZodSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
}

// ─── Form State ─────────────────────────────────────────────────

export interface FormState {
  values: FormValues;
  errors: FormErrors;
  touched: FormTouched;
  status: FormStatus;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
  message: string | null;
}

// ─── Form Actions ───────────────────────────────────────────────

export interface FormActions {
  setFieldValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string | undefined) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  setErrors: (errors: FormErrors) => void;
  setValues: (values: FormValues) => void;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  setStatus: (status: FormStatus) => void;
  setMessage: (message: string | null) => void;
}

// ─── Form Context ───────────────────────────────────────────────

export interface FormContextValue extends FormState, FormActions {
  // Multi-step specific
  isMultiStep: boolean;
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// ─── Component Props ────────────────────────────────────────────

export interface FormProps extends ValidationConfig {
  children: ReactNode;
  onSubmit: (values: FormValues) => Promise<void> | void;
  initialValues?: FormValues;
  
  // Messages
  successMessage?: string | ReactNode;
  successMessageClassName?: string;
  errorMessageClassName?: string;
  showMessageIcon?: boolean;
  messagePosition?: 'top' | 'bottom' | 'inline';
  
  // Styling
  className?: string;
  formClassName?: string;
  
  // Behavior
  resetOnSuccess?: boolean;
  scrollToError?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface FormMessagesProps {
  className?: string;
  successClassName?: string;
  errorClassName?: string;
  showIcon?: boolean;
  position?: 'top' | 'bottom';
  children?: (state: {
    success: string | null;
    error: string | null;
    isSubmitting: boolean;
  }) => ReactNode;
}

// ─── Multi-Step Types ───────────────────────────────────────────

export interface FormStepProps {
  id: string;
  title?: string;
  description?: string;
  children: ReactNode;
  validate?: () => Promise<boolean> | boolean;
  className?: string;
}

export interface FormNavigationProps {
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  previousButtonClassName?: string;
  nextButtonClassName?: string;
  submitButtonClassName?: string;
  navigationContainerClassName?: string;
  showStepIndicator?: boolean;
  stepIndicatorClassName?: string;
  disablePrevious?: boolean;
  disableNext?: boolean;
  hideOnFirstStep?: 'previous' | 'all' | 'none';
  hideOnLastStep?: 'next' | 'all' | 'none';
}

export interface FormStepIndicatorProps {
  className?: string;
  activeClassName?: string;
  completedClassName?: string;
  inactiveClassName?: string;
  showNumbers?: boolean;
  showTitles?: boolean;
}