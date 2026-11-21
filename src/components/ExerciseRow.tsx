import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Trophy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
} from "lucide-react-native";
import { Exercise, Lang, SetEntry, SetType } from "../types/workout";
import { COLORS } from "../constants/theme";
import { STRINGS } from "../constants/i18n";
import { ensureExerciseSets, summarizeSetsToDetail } from "../utils/sets";
import { calcExerciseBest1RM, calcSet1RM } from "../utils/analytics";

interface Props {
  exercise: Exercise;
  index: number;
  total: number;
  editMode: boolean;
  historicalBest1RM: number;
  accentHex: string;
  lang: Lang;
  onUpdate: (patch: Partial<Exercise>) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onSetCompleted: () => void;
}

const SET_TYPE_CYCLE: SetType[] = ["N", "W", "D", "F"];

const SET_TYPE_COLORS: Record<SetType, string> = {
  N: COLORS.textSecondary,
  W: "#38BDF8",
  D: "#BF5AF2",
  F: "#FF453A",
};

export const ExerciseRow: React.FC<Props> = ({
  exercise,
  index,
  total,
  editMode,
  historicalBest1RM,
  accentHex,
  lang,
  onUpdate,
  onDelete,
  onMove,
  onSetCompleted,
}) => {
  const [expanded, setExpanded] = useState(false);
  const t = STRINGS[lang];
  const sets = ensureExerciseSets(exercise);
  const doneSetsCount = sets.filter((s) => s.completed).length;
  const currentEst1RM = calcExerciseBest1RM(exercise, false);

  const checkAutoPR = (
    nextSets: SetEntry[],
    fallbackManual?: boolean,
  ): boolean => {
    if (historicalBest1RM <= 0) return Boolean(fallbackManual);
    const bestCompleted = nextSets.reduce((acc, s) => {
      if (!s.completed || s.type === "W") return acc;
      const est = calcSet1RM(s.weight, s.reps);
      return est > acc ? est : acc;
    }, 0);
    return bestCompleted > historicalBest1RM ? true : Boolean(fallbackManual);
  };

  const toggleAllCompleted = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextCompleted = !exercise.completed;
    const nextSets = sets.map((s) => ({ ...s, completed: nextCompleted }));
    const autoPR = checkAutoPR(nextSets, exercise.isPR);

    onUpdate({
      completed: nextCompleted,
      sets: nextSets,
      isPR: nextCompleted ? autoPR : false,
      detail: summarizeSetsToDetail(nextSets, exercise.detail),
    });
    if (nextCompleted) onSetCompleted();
  };

  const updateSingleSet = (setId: string, patch: Partial<SetEntry>) => {
    const nextSets = sets.map((s) => (s.id === setId ? { ...s, ...patch } : s));
    const allDone = nextSets.length > 0 && nextSets.every((s) => s.completed);
    const isPR = checkAutoPR(nextSets, exercise.isPR);

    onUpdate({
      sets: nextSets,
      completed: allDone,
      isPR,
      detail: summarizeSetsToDetail(nextSets, exercise.detail),
    });

    if (patch.completed === true) {
      if (Platform.OS !== "web") Haptics.selectionAsync();
      onSetCompleted();
    }
  };

  const cycleSetType = (setObj: SetEntry) => {
    const cur: SetType = setObj.type || "N";
    const nextType =
      SET_TYPE_CYCLE[(SET_TYPE_CYCLE.indexOf(cur) + 1) % SET_TYPE_CYCLE.length];
    updateSingleSet(setObj.id, { type: nextType });
  };

  const bumpLastSetWeight = (delta: number) => {
    const target = sets.find((s) => !s.completed) || sets[sets.length - 1];
    if (!target) return;
    const current = parseFloat((target.weight || "0").replace(",", ".")) || 0;
    const nextVal = Math.max(0, Math.round((current + delta) * 100) / 100);
    updateSingleSet(target.id, { weight: String(nextVal) });
  };

  const handleAddSet = () => {
    const last = sets[sets.length - 1];
    const newSet: SetEntry = {
      id: `${exercise.id}_s${Date.now()}`,
      reps: last?.reps || "8",
      weight: last?.weight || "",
      completed: false,
      type: "N",
      prevReps: last?.prevReps,
      prevWeight: last?.prevWeight,
    };
    const nextSets = [...sets, newSet];
    onUpdate({
      sets: nextSets,
      completed: false,
      detail: summarizeSetsToDetail(nextSets, exercise.detail),
    });
  };

  const handleRemoveSet = () => {
    if (sets.length <= 1) return;
    const nextSets = sets.slice(0, -1);
    const allDone = nextSets.every((s) => s.completed);
    onUpdate({
      sets: nextSets,
      completed: allDone,
      detail: summarizeSetsToDetail(nextSets, exercise.detail),
    });
  };

  return (
    <View
      style={[
        styles.card,
        exercise.completed && { borderColor: "rgba(255,255,255,0.18)" },
        expanded && { borderColor: COLORS.textMuted },
      ]}
    >
      <View style={styles.mainRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={toggleAllCompleted}
          style={[
            styles.checkbox,
            exercise.completed && {
              backgroundColor: accentHex,
              borderColor: accentHex,
            },
          ]}
        >
          {exercise.completed ? (
            <Check size={16} color="#000000" strokeWidth={3} />
          ) : (
            <View style={styles.checkboxInnerDot} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => !editMode && setExpanded((p) => !p)}
          style={styles.infoArea}
        >
          {editMode ? (
            <TextInput
              value={exercise.name}
              onChangeText={(name) => onUpdate({ name })}
              style={styles.nameInput}
              placeholder="Exercise name"
              placeholderTextColor={COLORS.textMuted}
            />
          ) : (
            <View style={styles.titleLine}>
              <Text
                style={[
                  styles.nameText,
                  exercise.completed && styles.completedText,
                ]}
              >
                {exercise.name}
              </Text>
              {exercise.isPR && (
                <View style={[styles.prChip, { borderColor: accentHex }]}>
                  <Text style={[styles.prChipText, { color: accentHex }]}>
                    PR
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.detailText}>{exercise.detail || "3 × 10"}</Text>

            {currentEst1RM > 0 && (
              <Text style={styles.estText}>
                {t.est1RmLabel} {currentEst1RM}kg
              </Text>
            )}

            {doneSetsCount > 0 && !exercise.completed && (
              <Text style={[styles.partialBadge, { color: accentHex }]}>
                {doneSetsCount}/{sets.length} {t.setsDone}
              </Text>
            )}

            {exercise.lastDetail ? (
              <Text style={styles.prevText}>
                {t.prevPrefix} {exercise.lastDetail}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {editMode ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={() => onMove(-1)}
              disabled={index === 0}
              style={[styles.iconBtn, index === 0 && { opacity: 0.25 }]}
            >
              <ArrowUp size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onMove(1)}
              disabled={index === total - 1}
              style={[styles.iconBtn, index === total - 1 && { opacity: 0.25 }]}
            >
              <ArrowDown size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
              <Trash2 size={15} color="#FF453A" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.workoutActions}>
            <TouchableOpacity
              onPress={() => onUpdate({ isPR: !exercise.isPR })}
              style={[
                styles.prBtn,
                exercise.isPR && {
                  borderColor: accentHex,
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              ]}
            >
              <Trophy
                size={14}
                color={exercise.isPR ? accentHex : COLORS.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setExpanded((p) => !p)}
              style={styles.expandBtn}
            >
              {expanded ? (
                <ChevronUp size={16} color={COLORS.textSecondary} />
              ) : (
                <ChevronDown size={16} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {expanded && !editMode && (
        <View style={styles.setsDrawer}>
          <View style={styles.setsHeader}>
            <Text style={[styles.setColLabel, { width: 42 }]}>SET</Text>
            <Text style={[styles.setColLabel, { flex: 1 }]}>
              {t.prevPrefix}
            </Text>
            <Text
              style={[styles.setColLabel, { width: 66, textAlign: "center" }]}
            >
              {t.kgLabel}
            </Text>
            <Text
              style={[styles.setColLabel, { width: 60, textAlign: "center" }]}
            >
              {t.repsLabel}
            </Text>
            <Text
              style={[styles.setColLabel, { width: 38, textAlign: "right" }]}
            >
              ✓
            </Text>
          </View>

          {sets.map((s, sIdx) => {
            const sType: SetType = s.type || "N";
            return (
              <View
                key={s.id}
                style={[
                  styles.setRow,
                  s.completed && { backgroundColor: "rgba(255,255,255,0.04)" },
                ]}
              >
                <TouchableOpacity
                  onPress={() => cycleSetType(s)}
                  style={styles.setTypeBadge}
                >
                  <Text
                    style={[
                      styles.setTypeText,
                      { color: SET_TYPE_COLORS[sType] },
                    ]}
                  >
                    {sType === "N" ? sIdx + 1 : sType}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.setPrev} numberOfLines={1}>
                  {s.prevWeight || s.prevReps
                    ? `${s.prevWeight ? `${s.prevWeight}kg × ` : ""}${s.prevReps || "-"}`
                    : historicalBest1RM > 0
                      ? `Best 1RM: ${historicalBest1RM}kg`
                      : "—"}
                </Text>

                <TextInput
                  value={s.weight}
                  onChangeText={(weight) => updateSingleSet(s.id, { weight })}
                  placeholder="-"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                  style={styles.setInput}
                />

                <TextInput
                  value={s.reps}
                  onChangeText={(reps) => updateSingleSet(s.id, { reps })}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  style={styles.setInput}
                />

                <TouchableOpacity
                  onPress={() =>
                    updateSingleSet(s.id, { completed: !s.completed })
                  }
                  style={[
                    styles.setCheck,
                    s.completed && {
                      backgroundColor: accentHex,
                      borderColor: accentHex,
                    },
                  ]}
                >
                  <Check
                    size={13}
                    color={s.completed ? "#000000" : COLORS.textMuted}
                    strokeWidth={2.8}
                  />
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.setFooterRow}>
            <TouchableOpacity
              onPress={handleAddSet}
              style={styles.setActionPill}
            >
              <Plus size={12} color={accentHex} />
              <Text style={[styles.setActionText, { color: accentHex }]}>
                {t.addSet}
              </Text>
            </TouchableOpacity>

            {sets.length > 1 && (
              <TouchableOpacity
                onPress={handleRemoveSet}
                style={styles.setActionPill}
              >
                <Minus size={12} color={COLORS.textSecondary} />
                <Text style={styles.setActionText}>{t.removeSet}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.quickBumpGroup}>
              <TouchableOpacity
                onPress={() => bumpLastSetWeight(-2.5)}
                style={styles.bumpPill}
              >
                <Text style={styles.bumpText}>-2.5kg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => bumpLastSetWeight(2.5)}
                style={[styles.bumpPill, { borderColor: accentHex }]}
              >
                <Text style={[styles.bumpText, { color: accentHex }]}>
                  +2.5kg
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.setTypeHint}>{t.setTypeHint}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 13,
    gap: 12,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: COLORS.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090B",
  },
  checkboxInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  infoArea: {
    flex: 1,
    gap: 4,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  nameText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  prChip: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
  },
  prChipText: {
    fontSize: 9,
    fontWeight: "900",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },
  nameInput: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  estText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    fontVariant: ["tabular-nums"],
  },
  partialBadge: {
    fontSize: 11,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  prevText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontVariant: ["tabular-nums"],
  },
  workoutActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  prBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  expandBtn: {
    width: 30,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#0A0A0C",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  setsDrawer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "#08080B",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  setsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
    gap: 8,
  },
  setColLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: COLORS.textMuted,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  setTypeBadge: {
    width: 34,
    height: 28,
    borderRadius: 7,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  setTypeText: {
    fontSize: 11,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  setPrev: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    fontVariant: ["tabular-nums"],
  },
  setInput: {
    width: 60,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  setCheck: {
    width: 32,
    height: 30,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  setFooterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  setActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  setActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  quickBumpGroup: {
    flexDirection: "row",
    gap: 6,
    marginLeft: "auto",
  },
  bumpPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bumpText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  setTypeHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
