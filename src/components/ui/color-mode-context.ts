"use client";

import * as React from "react";

export type ColorMode = "light" | "dark";

export type ColorModeCtxValue = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
};

export const ColorModeCtx = React.createContext<ColorModeCtxValue | null>(null);

export function useColorMode(): ColorModeCtxValue {
  const ctx = React.useContext(ColorModeCtx);
  if (!ctx)
    throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
}
