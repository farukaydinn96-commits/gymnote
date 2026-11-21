import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronDown, ChevronUp, Flame, Trophy } from "lucide-react-native";
import { Lang, WorkoutLog } from "../types/workout";
import { COLORS } from "../constants/theme";
import { STRINGS, WEEKDAY_HEADERS } from "../constants/i18n";
import { getLocalISODate, getMondayOfCurrentWeekISO } from "../utils/date";
import { calcWeeklyMuscleSets } from "../utils/analytics";
import { MuscleMapCard } from "../components/MuscleMapCard";
import { StrengthChartCard } from "../components/StrengthChartCard";

interface Props {
  logs: WorkoutLog[];
  accentHex: string;
  lang: Lang;
}

export const ProgressScreen: React.FC<Props> = ({ logs, accentHex, lang }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const t = STRINGS[lang];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayISO = getLocalISODate(now);
  const mondayISO = getMondayOfCurrentWeekISO(now);

  const weeklyMuscleSets = useMemo(
    () => calcWeeklyMuscleSets(logs, mondayISO),
    [logs, mondayISO],
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayJs = new Date(year, month, 1).getDay();
  const leadingEmptyCount = firstDayJs === 0 ? 6 : firstDayJs - 1;

  const loggedDates = new Set(logs.map((l) => l.dateISO));
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  const thisMonthCount = new Set(
    logs.filter((l) => l.dateISO.startsWith(monthPrefix)).map((l) => l.dateISO),
  ).size;

  const thisWeekCount = new Set(
    logs
      .filter((l) => l.dateISO >= mondayISO && l.dateISO <= todayISO)
      .map((l) => l.dateISO),
  ).size;

  let streak = 0;
  const cursor = new Date(year, month, now.getDate());
  for (let i = 0; i < 90; i++) {
    const iso = getLocalISODate(cursor);
    if (loggedDates.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const calendarCells: Array<{ key: string; dayNum?: number; iso?: string }> =
    [];
  for (let i = 0; i < leadingEmptyCount; i++) {
    calendarCells.push({ key: `empty_${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${monthPrefix}-${String(d).padStart(2, "0")}`;
    calendarCells.push({ key: iso, dayNum: d, iso });
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push({ key: `trail_${calendarCells.length}` });
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>{t.progressTitle}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: accentHex }]}>
            {thisWeekCount}
          </Text>
          <Text style={styles.statLabel}>{t.thisWeek}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{thisMonthCount}</Text>
          <Text style={styles.statLabel}>{t.thisMonth}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.streakRow}>
            <Flame
              size={16}
              color={streak > 0 ? accentHex : COLORS.textMuted}
            />
            <Text style={styles.statValue}>{streak}</Text>
          </View>
          <Text style={styles.statLabel}>{t.dayStreak}</Text>
        </View>
      </View>

      {/* 2D Anatomik Kas Yoğunluğu Haritası */}
      <MuscleMapCard
        weeklySets={weeklyMuscleSets}
        accentHex={accentHex}
        lang={lang}
      />

      {/* Tahmini 1RM Gelişim Çizgi Grafiği */}
      <StrengthChartCard logs={logs} accentHex={accentHex} lang={lang} />

      {/* 7 Sütunlu Aylık Takvim */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.monthlyMatrix}</Text>

        <View style={styles.weekdayRow}>
          {WEEKDAY_HEADERS[lang].map((wd) => (
            <Text key={wd} style={styles.weekdayLabel}>
              {wd}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarCells.map((cell) => {
            if (!cell.dayNum || !cell.iso) {
              return <View key={cell.key} style={styles.cellWrap} />;
            }
            const active = loggedDates.has(cell.iso);
            const isToday = cell.iso === todayISO;

            return (
              <View key={cell.key} style={styles.cellWrap}>
                <View
                  style={[
                    styles.matrixCell,
                    active && {
                      backgroundColor: accentHex,
                      borderColor: accentHex,
                    },
                    isToday && !active && { borderColor: COLORS.textPrimary },
                  ]}
                >
                  <Text
                    style={[
                      styles.matrixText,
                      active && { color: "#000000", fontWeight: "800" },
                      isToday &&
                        !active && {
                          color: COLORS.textPrimary,
                          fontWeight: "800",
                        },
                    ]}
                  >
                    {cell.dayNum}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Antrenman Geçmişi */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.historyTitle}</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>{t.emptyHistory}</Text>
        ) : (
          logs.slice(0, 20).map((log) => {
            const isOpen = expandedLogId === log.id;
            return (
              <View key={log.id} style={styles.logItem}>
                <TouchableOpacity
                  onPress={() => setExpandedLogId(isOpen ? null : log.id)}
                  style={styles.logRow}
                  activeOpacity={0.7}
                >
                  <View>
                    <View style={styles.logTitleRow}>
                      <Text style={styles.logTitle}>{log.dayTitle}</Text>
                      {(log.prCount || 0) > 0 && (
                        <View
                          style={[styles.prMiniTag, { borderColor: accentHex }]}
                        >
                          <Trophy size={10} color={accentHex} />
                          <Text
                            style={[styles.prMiniText, { color: accentHex }]}
                          >
                            {log.prCount} PR
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.logDate}>
                      {log.dateISO}
                      {log.totalVolumeKg ? ` · ${log.totalVolumeKg} kg` : ""}
                      {log.durationMin
                        ? ` · ${log.durationMin} ${t.minShort}`
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.logRight}>
                    <Text style={[styles.logBadge, { color: accentHex }]}>
                      {log.completedCount}/{log.totalCount}
                    </Text>
                    {isOpen ? (
                      <ChevronUp size={15} color={COLORS.textSecondary} />
                    ) : (
                      <ChevronDown size={15} color={COLORS.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.logDetails}>
                    {log.exercises.map((ex) => (
                      <View key={ex.id} style={styles.logExRow}>
                        <Text
                          style={[
                            styles.logExName,
                            !ex.completed && { color: COLORS.textMuted },
                          ]}
                        >
                          {ex.completed ? "✓ " : "• "}
                          {ex.name}
                          {ex.isPR ? " 🏆" : ""}
                        </Text>
                        <Text style={styles.logExDetail}>
                          {ex.detail || "-"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayLabel: {
    width: "14.2857%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cellWrap: {
    width: "14.2857%",
    padding: 3,
    alignItems: "center",
  },
  matrixCell: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090C",
  },
  matrixText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  logTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  prMiniTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  prMiniText: {
    fontSize: 9,
    fontWeight: "800",
  },
  logDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  logRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logBadge: {
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  logDetails: {
    paddingBottom: 12,
    gap: 6,
  },
  logExRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logExName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logExDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
});
