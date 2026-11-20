import { ImageSourcePropType } from "react-native";
import { AppSettings } from "../types/workout";

export interface BgPreset {
  id: string;
  label: string;
  defaultQuote: string;
  source: ImageSourcePropType;
}

export const BG_PRESETS: BgPreset[] = [
  {
    id: "chalk",
    label: "Magnezyum",
    defaultQuote: "calm mind. heavy iron.",
    source: require("../../assets/bg/bg-chalk.jpg"),
  },
  {
    id: "rain",
    label: "04:00 AM",
    defaultQuote: "nobody cares. work harder.",
    source: require("../../assets/bg/bg-rain.jpg"),
  },
  {
    id: "focus",
    label: "Odak",
    defaultQuote: "what discipline actually looks like.",
    source: require("../../assets/bg/bg-focus.jpg"),
  },
  {
    id: "grit",
    label: "Azim",
    defaultQuote: "earn your rest.",
    source: require("../../assets/bg/bg-grit.jpg"),
  },
];

export const resolveBackgroundSource = (
  settings: AppSettings,
): ImageSourcePropType | null => {
  if (settings.oledMode) return null;
  const found = BG_PRESETS.find((p) => p.id === settings.presetBgId);
  return found ? found.source : BG_PRESETS[2].source;
};
