import { Exercise, SetEntry } from "../types/workout";

export const parseDetailToSets = (detail: string, exId: string): SetEntry[] => {
  const clean = (detail || "").trim();
  const match = clean.match(
    /(\d+)\s*[xX×]\s*(\d+(?:-\d+)?)\s*(?:[·•\-]?\s*([\d.,]+)\s*(?:kg|KG)?)?/,
  );

  const count = match ? Math.min(Math.max(parseInt(match[1], 10), 1), 10) : 3;
  const reps = match ? match[2] : "10";
  const weightMatch = clean.match(/([\d.,]+)\s*(?:kg|KG)/i);
  const weight = weightMatch
    ? weightMatch[1].replace(",", ".")
    : match?.[3]?.replace(",", ".") || "";

  return Array.from({ length: count }, (_, idx) => ({
    id: `${exId}_s${idx + 1}`,
    reps,
    weight,
    completed: false,
  }));
};

export const ensureExerciseSets = (ex: Exercise): SetEntry[] => {
  if (ex.sets && ex.sets.length > 0) return ex.sets;
  return parseDetailToSets(ex.detail, ex.id);
};

export const summarizeSetsToDetail = (
  sets: SetEntry[],
  fallback: string,
): string => {
  if (!sets.length) return fallback;
  const count = sets.length;
  const allSameReps = sets.every((s) => s.reps === sets[0].reps);
  const repsPart = allSameReps
    ? sets[0].reps || "0"
    : sets.map((s) => s.reps || "0").join("/");
  const maxWeight = sets.reduce((acc, s) => {
    const val = parseFloat((s.weight || "").replace(",", "."));
    return !isNaN(val) && val > acc ? val : acc;
  }, 0);

  if (maxWeight > 0) {
    return `${count} × ${repsPart} · ${maxWeight} kg`;
  }
  return `${count} × ${repsPart}`;
};
