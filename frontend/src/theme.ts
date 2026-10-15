// ZERO TRACE — dark-first tactical theme. Dark only (forced).
// Keys mirror the "color" block of /app/design_guidelines.json.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const dark = {
  // Surfaces
  surface: "#0E0E12",
  onSurface: "#E5E7EB",
  surfaceSecondary: "#1A1C23",
  onSurfaceSecondary: "#D1D5DB",
  surfaceTertiary: "#252832",
  onSurfaceTertiary: "#9CA3AF",
  surfaceInverse: "#F3F4F6",
  onSurfaceInverse: "#000000",
  muted: "#6B7280",

  // Brand (tactical amber) — changed from neon green, see GAME_SPEC.md
  brand: "#F59E0B",
  onBrand: "#000000",
  brandPrimary: "#F59E0B",
  onBrandPrimary: "#000000",
  brandSecondary: "#D97706",
  onBrandSecondary: "#000000",
  brandTertiary: "#451A03",
  onBrandTertiary: "#FDE68A",

  // Status
  success: "#10B981",
  onSuccess: "#000000",
  warning: "#F59E0B",
  onWarning: "#000000",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#9CA3AF",
  onInfo: "#FFFFFF",

  // Lines
  border: "#252832",
  borderStrong: "#374151",
  divider: "#1F222A",

  // Extra tokens used across the game UI
  overlay: "rgba(0,0,0,0.8)",
  warningSoft: "rgba(245,158,11,0.12)",
  errorSoft: "rgba(239,68,68,0.14)",
  infoSoft: "rgba(156,163,175,0.12)",
  successSoft: "rgba(16,185,129,0.12)",
};

export type ThemeColors = typeof dark;

// Static palette (app is dark-only) for places outside of hooks.
export const colors: ThemeColors = dark;

export const defaultScheme = "dark" satisfies ColorScheme;

// Force dark everywhere: both schemes resolve to the same palette.
export const themes: { light: ThemeColors; dark?: ThemeColors } = {
  light: dark,
  dark,
};

export const fonts = {
  display: "Rajdhani",
  displayBold: "Rajdhani-Bold",
  mono: "SpaceMono",
  monoBold: "SpaceMono-Bold",
};

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.("dark");

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
