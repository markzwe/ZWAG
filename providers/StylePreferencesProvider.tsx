import React, { createContext, ReactNode, useContext, useState } from "react";

interface StylePreferences {
  avoidClothing: string;
  occasions: string[];
  brands: string;
  height: string;
  weight: string;
}

interface StylePreferencesContextType {
  preferences: StylePreferences | null;
  setPreferences: (preferences: StylePreferences) => void;
  clearPreferences: () => void;
}

const StylePreferencesContext = createContext<
  StylePreferencesContextType | undefined
>(undefined);

export function StylePreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferencesState] = useState<StylePreferences | null>(
    null
  );

  const setPreferences = (prefs: StylePreferences) => {
    setPreferencesState(prefs);
  };

  const clearPreferences = () => {
    setPreferencesState(null);
  };

  return (
    <StylePreferencesContext.Provider
      value={{
        preferences,
        setPreferences,
        clearPreferences,
      }}
    >
      {children}
    </StylePreferencesContext.Provider>
  );
}

export function useStylePreferences() {
  const context = useContext(StylePreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useStylePreferences must be used within a StylePreferencesProvider"
    );
  }
  return context;
}

export type { StylePreferences };
