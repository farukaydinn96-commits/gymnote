export type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type AccentKey = "acid" | "crimson" | "ice" | "amber" | "cobalt";

export type ShiftType = "none" | "morning" | "evening" | "night" | "off";

export type Lang = "tr" | "en";

export interface Exercise {
  id: string;
  name: string;
  detail: string;
  lastDetail?: string;
  isPR?: boolean;
  completed: boolean;
}

export interface DayPlan {
  id: DayId;
  shortLabel: string;
  fullLabel: string;
  title: string;
  isRestDay: boolean;
  shift?: ShiftType;
  shiftHours?: string;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  dateISO: string;
  dayTitle: string;
  completedCount: number;
  totalCount: number;
  prCount?: number;
  exercises: Exercise[];
}

export interface AppSettings {
  accent: AccentKey;
  quote: string;
  presetBgId: string;
  bgOpacity: number;
  oledMode: boolean;
  bodyWeight?: string;
  lang: Lang;
}
