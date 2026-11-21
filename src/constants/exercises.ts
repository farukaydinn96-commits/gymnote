import { MuscleGroup } from "../types/workout";

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  aliases: string[];
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
  defaultDetail: string;
}

export const EXERCISE_CATALOG: ExerciseCatalogItem[] = [
  // CHEST
  {
    id: "bench_press",
    name: "Flat Barbell Bench Press",
    aliases: [
      "bench press",
      "barbell bench",
      "göğüs press",
      "gogus press",
      "bench",
    ],
    primary: "chest",
    secondary: ["triceps", "shoulders"],
    defaultDetail: "4 × 8 · 80 kg",
  },
  {
    id: "incline_db_press",
    name: "Incline Dumbbell Press",
    aliases: ["incline press", "incline dumbbell", "üst göğüs", "ust gogus"],
    primary: "chest",
    secondary: ["shoulders", "triceps"],
    defaultDetail: "4 × 8 · 32.5 kg",
  },
  {
    id: "chest_fly",
    name: "Cable Chest Fly",
    aliases: [
      "pec deck",
      "dumbbell fly",
      "cable fly",
      "göğüs açış",
      "gogus acis",
    ],
    primary: "chest",
    defaultDetail: "3 × 12 · 15 kg",
  },
  {
    id: "dips",
    name: "Weighted Dips",
    aliases: ["chest dips", "triceps dips", "dips"],
    primary: "chest",
    secondary: ["triceps", "shoulders"],
    defaultDetail: "3 × 10",
  },

  // BACK
  {
    id: "lat_pulldown",
    name: "Lat Pulldown",
    aliases: ["pulldown", "sırt çekiş", "sirt cekis", "kanat"],
    primary: "back",
    secondary: ["biceps"],
    defaultDetail: "4 × 10 · 65 kg",
  },
  {
    id: "barbell_row",
    name: "Barbell Row",
    aliases: ["bent over row", "pendlay row", "sırt row", "sirt row"],
    primary: "back",
    secondary: ["biceps"],
    defaultDetail: "4 × 8 · 75 kg",
  },
  {
    id: "seated_cable_row",
    name: "Seated Cable Row",
    aliases: ["cable row", "seated row", "oturarak çekiş"],
    primary: "back",
    secondary: ["biceps"],
    defaultDetail: "4 × 10 · 60 kg",
  },
  {
    id: "pull_up",
    name: "Pull-Up",
    aliases: ["pullup", "chin-up", "chinup", "barfiks"],
    primary: "back",
    secondary: ["biceps"],
    defaultDetail: "4 × 8",
  },
  {
    id: "deadlift",
    name: "Conventional Deadlift",
    aliases: ["deadlift", "sumo deadlift"],
    primary: "back",
    secondary: ["hamstrings", "glutes"],
    defaultDetail: "3 × 5 · 120 kg",
  },

  // SHOULDERS
  {
    id: "overhead_press",
    name: "Overhead Press",
    aliases: ["ohp", "shoulder press", "military press", "omuz press"],
    primary: "shoulders",
    secondary: ["triceps"],
    defaultDetail: "4 × 8 · 50 kg",
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise",
    aliases: ["cable lateral raise", "side raise", "yan omuz"],
    primary: "shoulders",
    defaultDetail: "4 × 15 · 12.5 kg",
  },
  {
    id: "face_pull",
    name: "Face Pull",
    aliases: ["rear delt", "arka omuz"],
    primary: "shoulders",
    secondary: ["back"],
    defaultDetail: "3 × 15 · 20 kg",
  },

  // ARMS
  {
    id: "barbell_curl",
    name: "Barbell Curl",
    aliases: [
      "biceps curl",
      "dumbbell curl",
      "ez bar curl",
      "ön kol",
      "biceps",
    ],
    primary: "biceps",
    defaultDetail: "3 × 10 · 30 kg",
  },
  {
    id: "hammer_curl",
    name: "Hammer Curl",
    aliases: ["çekiç curl", "cekic curl"],
    primary: "biceps",
    defaultDetail: "3 × 12 · 16 kg",
  },
  {
    id: "triceps_pushdown",
    name: "Cable Triceps Pushdown",
    aliases: ["pushdown", "rope pushdown", "triceps", "arka kol"],
    primary: "triceps",
    defaultDetail: "3 × 12 · 25 kg",
  },
  {
    id: "skullcrusher",
    name: "Skullcrusher",
    aliases: ["overhead triceps extension", "triceps extension"],
    primary: "triceps",
    defaultDetail: "3 × 10 · 25 kg",
  },

  // LEGS
  {
    id: "barbell_squat",
    name: "Barbell Squat",
    aliases: ["back squat", "front squat", "squat", "bacak squat"],
    primary: "quads",
    secondary: ["glutes", "hamstrings"],
    defaultDetail: "4 × 6 · 100 kg",
  },
  {
    id: "leg_press",
    name: "Leg Press",
    aliases: ["bacak press"],
    primary: "quads",
    secondary: ["glutes"],
    defaultDetail: "4 × 10 · 180 kg",
  },
  {
    id: "leg_extension",
    name: "Leg Extension",
    aliases: ["ön bacak", "on bacak"],
    primary: "quads",
    defaultDetail: "3 × 12 · 55 kg",
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift",
    aliases: ["rdl", "stiff leg deadlift", "arka bacak rdl"],
    primary: "hamstrings",
    secondary: ["glutes", "back"],
    defaultDetail: "3 × 10 · 85 kg",
  },
  {
    id: "leg_curl",
    name: "Lying Leg Curl",
    aliases: ["seated leg curl", "hamstring curl", "arka bacak"],
    primary: "hamstrings",
    defaultDetail: "4 × 12 · 45 kg",
  },
  {
    id: "hip_thrust",
    name: "Barbell Hip Thrust",
    aliases: ["hip thrust", "kalça", "kalca"],
    primary: "glutes",
    secondary: ["hamstrings"],
    defaultDetail: "4 × 10 · 100 kg",
  },
  {
    id: "calf_raise",
    name: "Standing Calf Raise",
    aliases: ["seated calf raise", "calf", "kalf"],
    primary: "calves",
    defaultDetail: "4 × 15 · 60 kg",
  },

  // CORE
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise",
    aliases: ["leg raise", "plank", "crunch", "karın", "karin", "abs"],
    primary: "core",
    defaultDetail: "4 × 12",
  },
];

const cleanStr = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export const findCatalogExercise = (
  name: string,
  exerciseId?: string,
): ExerciseCatalogItem | undefined => {
  if (exerciseId) {
    const byId = EXERCISE_CATALOG.find((c) => c.id === exerciseId);
    if (byId) return byId;
  }
  const q = cleanStr(name);
  if (!q) return undefined;

  return EXERCISE_CATALOG.find(
    (c) =>
      cleanStr(c.name) === q ||
      c.aliases.some((a) => cleanStr(a) === q) ||
      cleanStr(c.name).includes(q) ||
      c.aliases.some((a) => q.includes(cleanStr(a))),
  );
};

export const searchCatalogExercises = (
  query: string,
): ExerciseCatalogItem[] => {
  const q = cleanStr(query);
  if (q.length < 2) return [];
  return EXERCISE_CATALOG.filter(
    (c) =>
      cleanStr(c.name).includes(q) ||
      c.aliases.some((a) => cleanStr(a).includes(q)),
  ).slice(0, 5);
};
