import React, { createContext, ReactNode, useContext, useState } from "react";

interface OnboardingData {
  // Screen 2: Style Assessment
  defaultStyle?:
    | "business-professional"
    | "business-casual"
    | "casual-weekend"
    | "creative-trendy";
  clothingChallenge?:
    | "matching"
    | "time-pressure"
    | "professional-look"
    | "variety";

  // Screen 3: Wardrobe Setup
  setupMethod?: "quick-start" | "essential-builder" | "full-setup";

  // Screen 4: Practical Preferences
  formalityLevel?:
    | "suit-required"
    | "business-casual"
    | "smart-casual"
    | "casual-no-dress-code";


  // Screen 5: Frequency Settings
  suggestionFrequency?:
    | "daily"
    | "weekdays-only"
    | "when-asked"
    | "special-occasions";
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
  isComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({});

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetData = () => {
    setData({});
  };

  const isComplete = Boolean(
    data.defaultStyle &&
      data.clothingChallenge &&
      data.setupMethod &&
      data.formalityLevel &&
      data.suggestionFrequency
  );

  return (
    <OnboardingContext.Provider
      value={{ data, updateData, resetData, isComplete }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

// Helper function to get smart defaults based on onboarding data
export function getSmartDefaults(data: OnboardingData) {
  const defaults = {
    // Default to business casual if no formality specified
    formalityHint: data.formalityLevel || "business-casual",

    // Style preference for AI prompts
    styleDirection: data.defaultStyle || "business-casual",

    // Frequency for notifications
    notificationFrequency: data.suggestionFrequency || "daily",

    // Setup method affects initial wardrobe approach
    useQuickStart: data.setupMethod === "quick-start",
  };

  return defaults;
}
