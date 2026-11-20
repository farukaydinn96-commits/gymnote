import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { DayId, DayPlan, Lang } from "../types/workout";
import { COLORS } from "../constants/theme";
import { DAY_NAMES, SHIFT_META } from "../constants/i18n";

interface Props {
  days: DayPlan[];
  selectedDayId: DayId;
  accentHex: string;
  lang: Lang;
  onSelect: (id: DayId) => void;
}

export const DayStrip: React.FC<Props> = ({
  days,
  selectedDayId,
  accentHex,
  lang,
  onSelect,
}) => {
  return (
    <View style={styles.strip}>
      {days.map((day) => {
        const active = day.id === selectedDayId;
        const hasWorkout = !day.isRestDay && day.exercises.length > 0;
        const allDone = hasWorkout && day.exercises.every((e) => e.completed);
        const shiftCode =
          day.shift && day.shift !== "none" ? SHIFT_META[day.shift].code : "";

        return (
          <TouchableOpacity
            key={day.id}
            activeOpacity={0.75}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              onSelect(day.id);
            }}
            style={[
              styles.pill,
              active && { borderColor: accentHex, backgroundColor: "#121216" },
            ]}
          >
            <Text
              style={[
                styles.label,
                active && { color: COLORS.textPrimary, fontWeight: "800" },
              ]}
            >
              {DAY_NAMES[lang][day.id].short}
            </Text>

            {shiftCode ? (
              <Text style={[styles.shiftBadge, active && { color: accentHex }]}>
                {shiftCode}
              </Text>
            ) : (
              <View
                style={[
                  styles.dot,
                  hasWorkout && { backgroundColor: COLORS.textMuted },
                  allDone && { backgroundColor: accentHex },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 18,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  shiftBadge: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});
