// src/components/forms/useForm.ts
/**
 * Core Form Hook
 *
 * Manages form state, validation, and submission lifecycle.
 * Powers both single-step and multi-step forms.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { ZodSchema } from "zod";
import type {
  FormValues,
  FormErrors,
  FormTouched,
  FormStatus,
  FormState,
  FormActions,
  ValidationConfig,
  FieldValidator,
} from "../types";

interface UseFormOptions extends ValidationConfig {
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void> | void;
  resetOnSuccess?: boolean;
}

interface FieldValidators {
  [fieldName: string]: FieldValidator;
}

// Extended return type that includes internal methods
interface UseFormReturn extends FormState, FormActions {
  registerFieldValidator: (name: string, validator: FieldValidator) => void;
  unregisterFieldValidator: (name: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}

export function useForm(options: UseFormOptions): UseFormReturn {
  const {
    initialValues = {},
    onSubmit,
    validationSchema,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnMount = false,
    resetOnSuccess = false,
  } = options;

  // State
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);

  // Refs for field validators
  const fieldValidatorsRef = useRef<FieldValidators>({});

  // Derived state
  const isSubmitting = status === "submitting";
  const isValid = Object.keys(errors).length === 0;

  // Register field validator
  const registerFieldValidator = useCallback(
    (name: string, validator: FieldValidator) => {
      fieldValidatorsRef.current[name] = validator;
    },
    []
  );

  // Unregister field validator
  const unregisterFieldValidator = useCallback((name: string) => {
    delete fieldValidatorsRef.current[name];
  }, []);

  // Validate single field with Zod schema
  const validateFieldWithSchema = useCallback(
    async (name: string, value: any): Promise<string | null> => {
      if (!validationSchema) return null;

      try {
        await validationSchema.parseAsync({ [name]: value });
        return null;
      } catch (error: any) {
        const fieldError = error.errors?.find(
          (err: any) => err.path[0] === name
        );
        return fieldError?.message || null;
      }
    },
    [validationSchema]
  );

  // Validate single field
  const validateField = useCallback(
    async (name: string): Promise<boolean> => {
      const value = values[name];
      let error: string | null = null;

      // Try custom field validator first
      const fieldValidator = fieldValidatorsRef.current[name];
      if (fieldValidator) {
        error = await fieldValidator(value);
      }

      // Try schema validation if no custom validator or custom passed
      if (!error && validationSchema) {
        error = await validateFieldWithSchema(name, value);
      }

      // Update error state
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));

      return !error;
    },
    [values, validationSchema, validateFieldWithSchema]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    // Validate with schema first
    if (validationSchema) {
      try {
        await validationSchema.parseAsync(values);
      } catch (error: any) {
        error.errors?.forEach((err: any) => {
          const fieldName = err.path[0];
          if (fieldName) {
            newErrors[fieldName] = err.message;
          }
        });
      }
    }

    // Validate with custom field validators
    const fieldNames = Object.keys(fieldValidatorsRef.current);
    await Promise.all(
      fieldNames.map(async (name) => {
        const validator = fieldValidatorsRef.current[name];
        if (validator && !newErrors[name]) {
          const error = await validator(values[name]);
          if (error) {
            newErrors[name] = error;
          }
        }
      })
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  // Set field value
  const setFieldValue = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if enabled
      if (validateOnChange) {
        validateField(name);
      }
    },
    [validateOnChange, validateField]
  );

  // Set field error
  const setFieldError = useCallback(
    (name: string, error: string | undefined) => {
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    []
  );

  // Set field touched
  const setFieldTouched = useCallback(
    (name: string, isTouched: boolean) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));

      // Validate on blur if enabled and field is touched
      if (isTouched && validateOnBlur) {
        validateField(name);
      }
    },
    [validateOnBlur, validateField]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setMessage(null);
    setSubmitCount(0);
  }, [initialValues]);

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setSubmitCount((prev) => prev + 1);
      setStatus("submitting");
      setMessage(null);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate form
      const isFormValid = await validateForm();

      if (!isFormValid) {
        setStatus("error");
        setMessage("Please fix the errors before submitting");
        return;
      }

      // Submit
      try {
        await onSubmit(values);
        setStatus("success");

        if (resetOnSuccess) {
          setTimeout(() => resetForm(), 2000);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.message || "An error occurred while submitting the form"
        );
      }
    },
    [values, validateForm, onSubmit, resetOnSuccess, resetForm]
  );

  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount, validateForm]);

  return {
    // State
    values,
    errors,
    touched,
    status,
    isSubmitting,
    isValid,
    submitCount,
    message,

    // Actions
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setErrors,
    setValues,
    validateField,
    validateForm,
    resetForm,
    setStatus,
    setMessage,

    // Internal (exposed for Input components)
    registerFieldValidator,
    unregisterFieldValidator,
    handleSubmit,
  };
}
