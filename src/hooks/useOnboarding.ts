import React from "react";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  placement?: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

export interface OnboardingTour {
  id: string;
  name: string;
  steps: OnboardingStep[];
}

const ONBOARDING_KEY = "sapphillon-onboarding";

interface OnboardingState {
  completedTours: string[];
  skippedTours: string[];
  currentTour: string | null;
  currentStep: number;
}

function getInitialState(): OnboardingState {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load onboarding state:", e);
  }
  return {
    completedTours: [],
    skippedTours: [],
    currentTour: null,
    currentStep: 0,
  };
}

export function useOnboarding() {
  const [state, setState] = React.useState<OnboardingState>(getInitialState);

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save onboarding state:", e);
    }
  }, [state]);

  const startTour = React.useCallback((tourId: string) => {
    setState((prev) => ({
      ...prev,
      currentTour: tourId,
      currentStep: 0,
    }));
  }, []);

  const nextStep = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  }, []);

  const prevStep = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const goToStep = React.useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const completeTour = React.useCallback((tourId: string) => {
    setState((prev) => ({
      ...prev,
      currentTour: null,
      currentStep: 0,
      completedTours: prev.completedTours.includes(tourId)
        ? prev.completedTours
        : [...prev.completedTours, tourId],
    }));
  }, []);

  const skipTour = React.useCallback((tourId: string) => {
    setState((prev) => ({
      ...prev,
      currentTour: null,
      currentStep: 0,
      skippedTours: prev.skippedTours.includes(tourId)
        ? prev.skippedTours
        : [...prev.skippedTours, tourId],
    }));
  }, []);

  const resetTour = React.useCallback((tourId: string) => {
    setState((prev) => ({
      ...prev,
      completedTours: prev.completedTours.filter((id) => id !== tourId),
      skippedTours: prev.skippedTours.filter((id) => id !== tourId),
    }));
  }, []);

  const resetAllTours = React.useCallback(() => {
    setState({
      completedTours: [],
      skippedTours: [],
      currentTour: null,
      currentStep: 0,
    });
  }, []);

  const isTourCompleted = React.useCallback(
    (tourId: string) => state.completedTours.includes(tourId),
    [state.completedTours]
  );

  const isTourSkipped = React.useCallback(
    (tourId: string) => state.skippedTours.includes(tourId),
    [state.skippedTours]
  );

  const shouldShowTour = React.useCallback(
    (tourId: string) =>
      !state.completedTours.includes(tourId) &&
      !state.skippedTours.includes(tourId),
    [state.completedTours, state.skippedTours]
  );

  return {
    currentTour: state.currentTour,
    currentStep: state.currentStep,
    completedTours: state.completedTours,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    completeTour,
    skipTour,
    resetTour,
    resetAllTours,
    isTourCompleted,
    isTourSkipped,
    shouldShowTour,
  } as const;
}


