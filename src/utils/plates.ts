export interface PlateSpec {
  weight: number;
  color: string;
  textColor: string;
  height: number;
  width: number;
}

export const OLYMPIC_PLATES: PlateSpec[] = [
  { weight: 25, color: "#E11D48", textColor: "#FFFFFF", height: 96, width: 16 },
  { weight: 20, color: "#2563EB", textColor: "#FFFFFF", height: 96, width: 15 },
  { weight: 15, color: "#EAB308", textColor: "#000000", height: 84, width: 13 },
  { weight: 10, color: "#16A34A", textColor: "#FFFFFF", height: 74, width: 12 },
  { weight: 5, color: "#F4F4F5", textColor: "#000000", height: 60, width: 10 },
  { weight: 2.5, color: "#27272A", textColor: "#FFFFFF", height: 50, width: 9 },
  {
    weight: 1.25,
    color: "#71717A",
    textColor: "#FFFFFF",
    height: 42,
    width: 8,
  },
];

export interface PlateBreakdown {
  barWeight: number;
  targetWeight: number;
  achievedWeight: number;
  perSide: PlateSpec[];
}

export const calculatePlates = (
  targetWeight: number,
  barWeight = 20,
): PlateBreakdown => {
  const cleanTarget = Math.max(0, targetWeight || 0);
  if (cleanTarget <= barWeight) {
    return {
      barWeight,
      targetWeight: cleanTarget,
      achievedWeight: barWeight,
      perSide: [],
    };
  }

  let remainingSide = (cleanTarget - barWeight) / 2;
  const perSide: PlateSpec[] = [];

  for (const plate of OLYMPIC_PLATES) {
    while (remainingSide + 0.001 >= plate.weight && perSide.length < 8) {
      perSide.push(plate);
      remainingSide = Math.round((remainingSide - plate.weight) * 100) / 100;
    }
  }

  const sideSum = perSide.reduce((acc, p) => acc + p.weight, 0);
  return {
    barWeight,
    targetWeight: cleanTarget,
    achievedWeight: Math.round((barWeight + sideSum * 2) * 100) / 100,
    perSide,
  };
};
