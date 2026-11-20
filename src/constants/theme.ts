import { AccentKey } from "../types/workout";

export const COLORS = {
  bg: "#000000",
  surface: "#0D0D10",
  surfaceAlt: "#141419",
  border: "#24242C",
  textPrimary: "#F5F5F7",
  textSecondary: "#A8A8B3",
  textMuted: "#787885",
};

export const ACCENTS: Record<AccentKey, { label: string; hex: string }> = {
  lime: { label: "Lime", hex: "#D4FF00" },
  crimson: { label: "Crimson", hex: "#FF2D55" },
  white: { label: "Pure White", hex: "#FFFFFF" },
  amber: { label: "Amber", hex: "#FF9F0A" },
  blue: { label: "Electric Blue", hex: "#0A84FF" },
};
