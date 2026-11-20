import React from "react";
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
  Trash2,
  ChevronUp,
  ChevronDown,
  Trophy,
} from "lucide-react-native";
import { Exercise } from "../types/workout";
import { COLORS } from "../constants/theme";

interface Props {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  exercise: Exercise;
  accentHex: string;
  lastPrefix: string;
  onToggle: () => void;
  onUpdate: (patch: Partial<Exercise>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const ExerciseRow: React.FC<Props> = ({
  index,
  isFirst,
  isLast,
  exercise,
  accentHex,
  lastPrefix,
  onToggle,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const num = String(index + 1).padStart(2, "0");

  return (
    <View
      style={[
        styles.row,
        exercise.isPR && { borderColor: accentHex },
        exercise.completed && styles.rowDone,
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onToggle();
        }}
        style={[
          styles.indexBox,
          exercise.completed && {
            backgroundColor: accentHex,
            borderColor: accentHex,
          },
        ]}
        activeOpacity={0.7}
      >
        {exercise.completed ? (
          <Check size={14} color="#000000" strokeWidth={3} />
        ) : (
          <Text style={styles.indexText}>{num}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.middle}>
        <View style={styles.nameRow}>
          <TextInput
            value={exercise.name}
            onChangeText={(name) => onUpdate({ name })}
            style={[
              styles.nameInput,
              exercise.completed && styles.strikethrough,
            ]}
            placeholder="..."
            placeholderTextColor={COLORS.textMuted}
          />
          {exercise.isPR && (
            <View style={[styles.prBadge, { backgroundColor: accentHex }]}>
              <Text style={styles.prBadgeText}>PR</Text>
            </View>
          )}
        </View>
        {exercise.lastDetail ? (
          <Text style={styles.ghostText}>
            {lastPrefix} {exercise.lastDetail}
          </Text>
        ) : null}
      </View>

      <TextInput
        value={exercise.detail}
        onChangeText={(detail) => onUpdate({ detail })}
        style={styles.detailInput}
        placeholder="4x10"
        placeholderTextColor={COLORS.textMuted}
        textAlign="right"
      />

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          onUpdate({ isPR: !exercise.isPR });
        }}
        hitSlop={6}
        style={styles.prBtn}
      >
        <Trophy
          size={14}
          color={exercise.isPR ? accentHex : COLORS.textMuted}
        />
      </TouchableOpacity>

      <View style={styles.reorderCol}>
        <TouchableOpacity onPress={onMoveUp} disabled={isFirst} hitSlop={6}>
          <ChevronUp
            size={13}
            color={isFirst ? "#27272A" : COLORS.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMoveDown} disabled={isLast} hitSlop={6}>
          <ChevronDown
            size={13}
            color={isLast ? "#27272A" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
        <Trash2 size={14} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceGlass,
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    marginBottom: 8,
    gap: 8,
  },
  rowDone: {
    opacity: 0.58,
  },
  indexBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  middle: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nameInput: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    padding: 0,
  },
  prBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  prBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.4,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: COLORS.textSecondary,
  },
  ghostText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  detailInput: {
    width: 74,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
    padding: 0,
  },
  prBtn: {
    paddingHorizontal: 2,
  },
  reorderCol: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  deleteBtn: {
    paddingLeft: 2,
  },
});
