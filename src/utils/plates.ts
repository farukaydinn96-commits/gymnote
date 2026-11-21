import { Platform } from "react-native";

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

// Spotify veya arka plan müziğini kesmeden Web Audio API ile çift tonlu bitiş zili çalar
export const playRestFinishedChime = (): void => {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const playTone = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(
        0.18,
        ctx.currentTime + startOffset + 0.02,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + startOffset + duration,
      );

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + duration);
    };

    playTone(660, 0, 0.18);
    playTone(880, 0.16, 0.32);
  } catch {}
};
