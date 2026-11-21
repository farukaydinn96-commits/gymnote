export type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type ShiftType = "none" | "morning" | "evening" | "night" | "off";
export type AccentKey = "lime" | "crimson" | "white" | "amber" | "blue";
export type Lang = "tr" | "en";
export type TabKey = "program" | "progress" | "profile";
export type SetType = "N" | "W" | "D" | "F";
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export interface SetEntry {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
  type?: SetType;
  prevReps?: string;
  prevWeight?: string;
}

export interface Exercise {
  id: string;
  name: string;
  detail: string;
  lastDetail?: string;
  note?: string;
  completed: boolean;
  isPR?: boolean;
  sets?: SetEntry[];
}

export interface DayPlan {
  id: DayId;
  shortLabel: string;
  fullLabel: string;
  title: string;
  isRestDay: boolean;
  shift: ShiftType;
  shiftHours: string;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  dateISO: string;
  dayId?: DayId;
  dayTitle: string;
  completedCount: number;
  totalCount: number;
  prCount?: number;
  totalVolumeKg?: number;
  durationMin?: number;
  exercises: Exercise[];
}

export interface AppSettings {
  accent: AccentKey;
  oledMode: boolean;
  presetBgId: string;
  bgOpacity: number;
  quote: string;
  lang: Lang;
  bodyWeight: string;
  userName?: string;
  userGoal?: string;
  autoRestSec?: number;
}
