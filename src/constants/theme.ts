import { AccentKey } from "../types/workout";

export const COLORS = {
  bg: "#000000",
  surface: "#111113",
  surfaceGlass: "rgba(18, 18, 20, 0.72)",
  border: "#242428",
  borderSpecular: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textMuted: "#52525B",
  danger: "#FF453A",
};

export const ACCENTS: Record<
  AccentKey,
  { name: string; hex: string; soft: string }
> = {
  acid: {
    name: "Asit Yeşili",
    hex: "#D4FF00",
    soft: "rgba(212, 255, 0, 0.14)",
  },
  crimson: {
    name: "Kan Kırmızısı",
    hex: "#FF2D55",
    soft: "rgba(255, 45, 85, 0.14)",
  },
  ice: {
    name: "Buz Beyazı",
    hex: "#F4F4F5",
    soft: "rgba(244, 244, 245, 0.14)",
  },
  amber: { name: "Kehribar", hex: "#FF9F0A", soft: "rgba(255, 159, 10, 0.14)" },
  cobalt: {
    name: "Elektrik Mavi",
    hex: "#0A84FF",
    soft: "rgba(10, 132, 255, 0.14)",
  },
};
