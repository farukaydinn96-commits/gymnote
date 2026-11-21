import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DayPlan, WorkoutLog } from "../types/workout";

export interface SafeLoadResult<T> {
  data: T | null;
  corrupted: boolean;
}

export const safeLoadJSON = async <T>(
  primaryKey: string,
  legacyKey?: string,
): Promise<SafeLoadResult<T>> => {
  try {
    const rawPrimary = await AsyncStorage.getItem(primaryKey);
    const raw =
      rawPrimary ?? (legacyKey ? await AsyncStorage.getItem(legacyKey) : null);
    if (!raw) return { data: null, corrupted: false };
    const parsed = JSON.parse(raw) as T;
    return { data: parsed, corrupted: false };
  } catch {
    return { data: null, corrupted: true };
  }
};

export const notifyUser = (title: string, message: string): void => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(`${title}: ${message}`);
    return;
  }
  Alert.alert(title, message);
};

export const validateBackupPayload = (
  raw: string,
):
  | {
      valid: true;
      days: DayPlan[];
      logs: WorkoutLog[];
      settings?: Record<string, any>;
    }
  | { valid: false } => {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { valid: false };
    if (!Array.isArray(parsed.days) || parsed.days.length === 0)
      return { valid: false };

    const validDays = parsed.days.every(
      (d: any) =>
        d &&
        typeof d.id === "string" &&
        typeof d.title === "string" &&
        Array.isArray(d.exercises),
    );
    if (!validDays) return { valid: false };

    const logs: WorkoutLog[] = Array.isArray(parsed.logs)
      ? parsed.logs.filter(
          (l: any) =>
            l &&
            typeof l.id === "string" &&
            typeof l.dateISO === "string" &&
            Array.isArray(l.exercises),
        )
      : [];

    const settings =
      parsed.settings && typeof parsed.settings === "object"
        ? parsed.settings
        : undefined;

    return { valid: true, days: parsed.days, logs, settings };
  } catch {
    return { valid: false };
  }
};
