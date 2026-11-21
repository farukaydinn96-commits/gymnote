import { Exercise, MuscleGroup, SetEntry, WorkoutLog } from "../types/workout";
import { ensureExerciseSets } from "./sets";
import { findCatalogExercise } from "../constants/exercises";

export const normalizeExName = (name: string): string =>
  (name || "").trim().toLowerCase().replace(/\s+/g, " ");

export const getExerciseHistoryKey = (
  ex: Pick<Exercise, "name" | "exerciseId">,
): string => {
  const catalog = findCatalogExercise(ex.name, ex.exerciseId);
  return catalog ? catalog.id : normalizeExName(ex.name);
};

export const calcSet1RM = (weightStr: string, repsStr: string): number => {
  const w = parseFloat((weightStr || "").replace(",", "."));
  const r = parseInt(repsStr || "0", 10);
  if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0) return 0;
  if (r === 1) return Math.round(w * 10) / 10;
  return Math.round(w * (1 + r / 30) * 10) / 10;
};

export const calcExerciseBest1RM = (
  ex: Exercise,
  onlyCompleted = false,
): number => {
  const sets = ensureExerciseSets(ex);
  let best = 0;
  for (const s of sets) {
    if (s.type === "W") continue;
    if (onlyCompleted && !s.completed && !ex.completed) continue;
    const est = calcSet1RM(s.weight, s.reps);
    if (est > best) best = est;
  }
  return best;
};

export const getHistoricalBest1RMMap = (
  logs: WorkoutLog[],
  excludeDateISO?: string,
): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const log of logs) {
    if (excludeDateISO && log.dateISO === excludeDateISO) continue;
    for (const ex of log.exercises) {
      const key = getExerciseHistoryKey(ex);
      if (!key) continue;
      const best = calcExerciseBest1RM(ex, true);
      if (best > (map[key] || 0)) {
        map[key] = best;
      }
    }
  }
  return map;
};

export const calcExercisesVolumeKg = (exercises: Exercise[]): number => {
  let total = 0;
  for (const ex of exercises) {
    const sets = ensureExerciseSets(ex);
    for (const s of sets) {
      if (s.type === "W") continue;
      if (!s.completed && !ex.completed) continue;
      const w = parseFloat((s.weight || "").replace(",", "."));
      const r = parseInt(s.reps || "0", 10);
      if (!isNaN(w) && w > 0 && !isNaN(r) && r > 0) {
        total += w * r;
      }
    }
  }
  return Math.round(total);
};

// Katalog dışı özel isimler için kelime sınırlı (\b) ve çakışmasız yedek kurallar
const FALLBACK_RULES: Array<{ muscles: MuscleGroup[]; pattern: RegExp }> = [
  {
    muscles: ["quads", "glutes"],
    pattern: /\b(squat|leg press|leg extension|lunge|bacak)\b/i,
  },
  {
    muscles: ["hamstrings", "glutes"],
    pattern: /\b(rdl|romanian|leg curl|hamstring|arka bacak)\b/i,
  },
  { muscles: ["back", "hamstrings", "glutes"], pattern: /\bdeadlift\b/i },
  {
    muscles: ["chest", "triceps", "shoulders"],
    pattern: /\b(bench|chest|pec|fly|göğüs|gogus)\b/i,
  },
  {
    muscles: ["back", "biceps"],
    pattern: /\b(row|pulldown|pull-?up|chin-?up|lat|sırt|sirt|kanat)\b/i,
  },
  {
    muscles: ["shoulders"],
    pattern: /\b(overhead|shoulder|lateral|face pull|delt|omuz)\b/i,
  },
  { muscles: ["biceps"], pattern: /\b(curl|biceps)\b/i },
  {
    muscles: ["triceps"],
    pattern: /\b(triceps?|pushdown|skullcrusher|arka kol)\b/i,
  },
  { muscles: ["glutes"], pattern: /\b(glute|hip thrust|kalça|kalca)\b/i },
  { muscles: ["calves"], pattern: /\b(calf|calves|kalf)\b/i },
  {
    muscles: ["core"],
    pattern: /\b(plank|crunch|leg raise|abs?|core|karın|karin)\b/i,
  },
];

export const inferExerciseMuscles = (
  name: string,
  exerciseId?: string,
): MuscleGroup[] => {
  const catalog = findCatalogExercise(name, exerciseId);
  if (catalog) {
    return [catalog.primary, ...(catalog.secondary || [])];
  }

  for (const rule of FALLBACK_RULES) {
    if (rule.pattern.test(name)) {
      return rule.muscles;
    }
  }
  return [];
};

export const calcWeeklyMuscleSets = (
  logs: WorkoutLog[],
  mondayISO: string,
): Record<MuscleGroup, number> => {
  const counts: Record<MuscleGroup, number> = {
    chest: 0,
    back: 0,
    shoulders: 0,
    biceps: 0,
    triceps: 0,
    quads: 0,
    hamstrings: 0,
    glutes: 0,
    calves: 0,
    core: 0,
  };

  for (const log of logs) {
    if (log.dateISO < mondayISO) continue;
    for (const ex of log.exercises) {
      const muscles = inferExerciseMuscles(ex.name, ex.exerciseId);
      if (!muscles.length) continue;
      const sets: SetEntry[] = ensureExerciseSets(ex);
      const completedWorkingSets = sets.filter(
        (s) => s.type !== "W" && (s.completed || ex.completed),
      ).length;
      if (completedWorkingSets <= 0) continue;

      muscles.forEach((m, idx) => {
        counts[m] +=
          idx === 0
            ? completedWorkingSets
            : Math.ceil(completedWorkingSets * 0.5);
      });
    }
  }

  return counts;
};

export const getExercise1RMSeries = (
  logs: WorkoutLog[],
  exerciseName: string,
  exerciseId?: string,
): Array<{ dateISO: string; est1RM: number }> => {
  const targetKey = getExerciseHistoryKey({ name: exerciseName, exerciseId });
  const chronological = [...logs].reverse();
  const points: Array<{ dateISO: string; est1RM: number }> = [];

  for (const log of chronological) {
    const match = log.exercises.find(
      (e) => getExerciseHistoryKey(e) === targetKey,
    );
    if (!match) continue;
    const est1RM = calcExerciseBest1RM(match, true);
    if (est1RM > 0) {
      points.push({ dateISO: log.dateISO.slice(5), est1RM });
    }
  }

  return points.slice(-8);
};
