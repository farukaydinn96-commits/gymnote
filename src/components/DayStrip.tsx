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
import { DAY_NAMES } from "../constants/i18n";

interface Props {
  days: DayPlan[];
  selectedDayId: DayId;
  todayDayId: DayId;
  accentHex: string;
  lang: Lang;
  onSelect: (id: DayId) => void;
}

export const DayStrip: React.FC<Props> = ({
  days,
  selectedDayId,
  todayDayId,
  accentHex,
  lang,
  onSelect,
}) => {
  return (
    <View style={styles.row}>
      {days.map((day) => {
        const active = day.id === selectedDayId;
        const isToday = day.id === todayDayId;
        const hasShift = day.shift !== "none";
        const allDone =
          !day.isRestDay &&
          day.exercises.length > 0 &&
          day.exercises.every((e) => e.completed);

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
              active && {
                borderColor: accentHex,
                backgroundColor: "rgba(255,255,255,0.06)",
              },
            ]}
          >
            <Text
              style={[
                styles.shortText,
                active && { color: COLORS.textPrimary, fontWeight: "800" },
                isToday && !active && { color: accentHex },
              ]}
            >
              {DAY_NAMES[lang][day.id].short}
            </Text>

            <View style={styles.dotsRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: day.isRestDay
                      ? "transparent"
                      : allDone
                        ? accentHex
                        : COLORS.textMuted,
                  },
                ]}
              />
              {hasShift && (
                <View
                  style={[styles.shiftDot, { backgroundColor: "#38BDF8" }]}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
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
  shortText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  shiftDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
