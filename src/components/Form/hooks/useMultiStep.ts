// src/components/forms/useMultiStep.ts
/**
 * Multi-Step Form Hook
 * 
 * Manages step navigation and validation for multi-step forms.
 * Only active when Form detects FormStep children.
 */

import { useState, useMemo, Children, isValidElement, type ReactNode } from 'react';

interface UseMultiStepOptions {
  enabled: boolean;
  children: ReactNode;
  validateForm: () => Promise<boolean>;
}

interface StepInfo {
  id: string;
  title?: string;
  validate?: () => Promise<boolean> | boolean;
}

export function useMultiStep({ enabled, children, validateForm }: UseMultiStepOptions) {
  const [currentStep, setCurrentStep] = useState(0);

  // Extract step information from children
  const steps = useMemo(() => {
    if (!enabled) return [];

    const stepChildren = Children.toArray(children).filter(
      (child) => isValidElement(child) && (child.type as any).displayName === 'FormStep'
    );

    return stepChildren.map((child: any) => ({
      id: child.props.id,
      title: child.props.title,
      validate: child.props.validate,
    })) as StepInfo[];
  }, [enabled, children]);

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Navigate to specific step
  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  // Go to next step (with optional validation)
  const nextStep = async () => {
    // Validate current step if it has a custom validator
    const currentStepInfo = steps[currentStep];
    if (currentStepInfo?.validate) {
      const isValid = await currentStepInfo.validate();
      if (!isValid) return;
    }

    // Otherwise validate the entire form
    const isValid = await validateForm();
    if (!isValid) return;

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Go to previous step
  const previousStep = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    previousStep,
  };
}