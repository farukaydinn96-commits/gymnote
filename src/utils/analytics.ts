import { Exercise, MuscleGroup, SetEntry, WorkoutLog } from "../types/workout";
import { ensureExerciseSets } from "./sets";

export const normalizeExName = (name: string): string =>
  (name || "").trim().toLowerCase().replace(/\s+/g, " ");

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
      const key = normalizeExName(ex.name);
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

const MUSCLE_KEYWORDS: Array<{ muscles: MuscleGroup[]; patterns: RegExp }> = [
  {
    muscles: ["chest", "triceps", "shoulders"],
    patterns: /bench|incline|chest|pec|fly|push-up|pushup|dip/i,
  },
  {
    muscles: ["back", "biceps"],
    patterns: /row|pulldown|pull-up|pullup|chin-up|lat |deadlift|back/i,
  },
  {
    muscles: ["shoulders"],
    patterns:
      /overhead|shoulder|lateral raise|face pull|rear delt|military|arnold|shrug/i,
  },
  {
    muscles: ["biceps"],
    patterns: /curl/i,
  },
  {
    muscles: ["triceps"],
    patterns: /tricep|pushdown|skullcrusher|extension/i,
  },
  {
    muscles: ["quads", "glutes"],
    patterns: /squat|leg press|leg extension|lunge|split squat|hack/i,
  },
  {
    muscles: ["hamstrings", "glutes"],
    patterns: /romanian|rdl|leg curl|hamstring|hip thrust|glute/i,
  },
  {
    muscles: ["calves"],
    patterns: /calf|calves/i,
  },
  {
    muscles: ["core"],
    patterns: /plank|crunch|leg raise|ab |abs|core|sit-up/i,
  },
];

export const inferExerciseMuscles = (name: string): MuscleGroup[] => {
  const found = new Set<MuscleGroup>();
  for (const rule of MUSCLE_KEYWORDS) {
    if (rule.patterns.test(name)) {
      rule.muscles.forEach((m) => found.add(m));
    }
  }
  return Array.from(found);
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
      const muscles = inferExerciseMuscles(ex.name);
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
): Array<{ dateISO: string; est1RM: number }> => {
  const target = normalizeExName(exerciseName);
  const chronological = [...logs].reverse();
  const points: Array<{ dateISO: string; est1RM: number }> = [];

  for (const log of chronological) {
    const match = log.exercises.find((e) => normalizeExName(e.name) === target);
    if (!match) continue;
    const est1RM = calcExerciseBest1RM(match, true);
    if (est1RM > 0) {
      points.push({ dateISO: log.dateISO.slice(5), est1RM });
    }
  }

  return points.slice(-8);
};
