import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Svg, { Polyline, Circle, Line } from "react-native-svg";
import { Lang, WorkoutLog } from "../types/workout";
import { COLORS } from "../constants/theme";
import { STRINGS } from "../constants/i18n";
import { getExercise1RMSeries, normalizeExName } from "../utils/analytics";

interface Props {
  logs: WorkoutLog[];
  accentHex: string;
  lang: Lang;
}

export const StrengthChartCard: React.FC<Props> = ({
  logs,
  accentHex,
  lang,
}) => {
  const t = STRINGS[lang];

  const exerciseNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of logs) {
      for (const ex of log.exercises) {
        const key = normalizeExName(ex.name);
        if (key && !map.has(key)) {
          map.set(key, ex.name);
        }
      }
    }
    return Array.from(map.values());
  }, [logs]);

  const [selectedEx, setSelectedEx] = useState<string>("");
  const activeName = selectedEx || exerciseNames[0] || "";

  const series = useMemo(
    () => (activeName ? getExercise1RMSeries(logs, activeName) : []),
    [logs, activeName],
  );

  const chartW = 300;
  const chartH = 115;
  const padX = 20;
  const padY = 18;

  const minVal = series.length ? Math.min(...series.map((p) => p.est1RM)) : 0;
  const maxVal = series.length ? Math.max(...series.map((p) => p.est1RM)) : 100;
  const span = Math.max(maxVal - minVal, 5);

  const coords = series.map((pt, idx) => {
    const x =
      series.length === 1
        ? chartW / 2
        : padX + (idx / (series.length - 1)) * (chartW - padX * 2);
    const y =
      chartH - padY - ((pt.est1RM - minVal) / span) * (chartH - padY * 2);
    return { ...pt, x, y };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const latest1RM = series.length ? series[series.length - 1].est1RM : 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t.strengthChartTitle}</Text>
        {latest1RM > 0 && (
          <Text style={[styles.bestBadge, { color: accentHex }]}>
            {t.est1RmLabel}: {latest1RM} kg
          </Text>
        )}
      </View>

      {exerciseNames.length === 0 ? (
        <Text style={styles.emptyText}>{t.chartEmptyHint}</Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {exerciseNames.slice(0, 12).map((name) => {
              const active =
                normalizeExName(name) === normalizeExName(activeName);
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => setSelectedEx(name)}
                  style={[
                    styles.exPill,
                    active && {
                      borderColor: accentHex,
                      backgroundColor: "rgba(255,255,255,0.06)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.exPillText,
                      active && { color: COLORS.textPrimary },
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {coords.length === 0 ? (
            <Text style={styles.emptyText}>{t.chartEmptyHint}</Text>
          ) : (
            <View style={styles.chartBox}>
              <Svg
                width="100%"
                height={chartH}
                viewBox={`0 0 ${chartW} ${chartH}`}
              >
                <Line
                  x1={padX}
                  y1={padY}
                  x2={chartW - padX}
                  y2={padY}
                  stroke="#1E1E26"
                  strokeDasharray="4,4"
                />
                <Line
                  x1={padX}
                  y1={chartH - padY}
                  x2={chartW - padX}
                  y2={chartH - padY}
                  stroke="#1E1E26"
                />
                {coords.length > 1 && (
                  <Polyline
                    fill="none"
                    stroke={accentHex}
                    strokeWidth={2.5}
                    points={polylinePoints}
                  />
                )}
                {coords.map((c, i) => (
                  <Circle
                    key={`${c.dateISO}_${i}`}
                    cx={c.x}
                    cy={c.y}
                    r={4.5}
                    fill={accentHex}
                    stroke="#08080B"
                    strokeWidth={2}
                  />
                ))}
              </Svg>

              <View style={styles.axisRow}>
                {coords.map((c, i) => (
                  <View key={`${c.dateISO}_lbl_${i}`} style={styles.axisItem}>
                    <Text style={styles.axisVal}>{c.est1RM}kg</Text>
                    <Text style={styles.axisDate}>{c.dateISO}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
  },
  bestBadge: {
    fontSize: 12,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  pillsRow: {
    gap: 6,
    paddingBottom: 12,
  },
  exPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#09090C",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  chartBox: {
    borderRadius: 12,
    backgroundColor: "#08080B",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginTop: 4,
  },
  axisItem: {
    alignItems: "center",
  },
  axisVal: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  axisDate: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontVariant: ["tabular-nums"],
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingVertical: 8,
  },
});
