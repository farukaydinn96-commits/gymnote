import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarDays, Dumbbell, User } from "lucide-react-native";

import {
  AccentKey,
  AppSettings,
  DayId,
  DayPlan,
  Exercise,
  Lang,
  TabKey,
  WorkoutLog,
} from "./src/types/workout";
import { ACCENTS, COLORS } from "./src/constants/theme";
import { DEFAULT_SETTINGS, INITIAL_WEEK } from "./src/constants/initialData";
import { BgPreset, resolveBackgroundSource } from "./src/constants/backgrounds";
import { DAY_NAMES, STRINGS } from "./src/constants/i18n";
import {
  getLocalISODate,
  getMondayOfCurrentWeekISO,
  getTodayDayId,
} from "./src/utils/date";
import {
  ensureExerciseSets,
  parseDetailToSets,
  summarizeSetsToDetail,
} from "./src/utils/sets";
import {
  calcExercisesVolumeKg,
  getHistoricalBest1RMMap,
} from "./src/utils/analytics";
import {
  notifyUser,
  safeLoadJSON,
  validateBackupPayload,
} from "./src/utils/storage";
import { findCatalogExercise } from "./src/constants/exercises";
import { ProgramScreen } from "./src/screens/ProgramScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { RestTimerPill } from "./src/components/RestTimerPill";
import { WorkoutSummaryModal } from "./src/components/WorkoutSummaryModal";
import { BackupModal } from "./src/components/BackupModal";

const STORAGE_KEYS = {
  WEEK: "@gymnote_week_v2",
  LOGS: "@gymnote_logs_v2",
  SETTINGS: "@gymnote_settings_v2",
  WEEK_START: "@gymnote_week_start_v2",
};

const TITLE_MAP: Record<string, { tr: string; en: string }> = {
  "Push (Göğüs & Omuz)": {
    tr: "Push (Göğüs & Omuz)",
    en: "Push (Chest & Shoulders)",
  },
  "Push (Chest & Shoulders)": {
    tr: "Push (Göğüs & Omuz)",
    en: "Push (Chest & Shoulders)",
  },
  "Pull (Sırt & Biceps)": {
    tr: "Pull (Sırt & Biceps)",
    en: "Pull (Back & Biceps)",
  },
  "Pull (Back & Biceps)": {
    tr: "Pull (Sırt & Biceps)",
    en: "Pull (Back & Biceps)",
  },
  "Legs (Bacak)": { tr: "Legs (Bacak)", en: "Legs" },
  Legs: { tr: "Legs (Bacak)", en: "Legs" },
  "Rest Day": { tr: "Dinlenme Günü", en: "Rest Day" },
  "Dinlenme Günü": { tr: "Dinlenme Günü", en: "Rest Day" },
};

const rolloverWeekDays = (prevDays: DayPlan[]): DayPlan[] =>
  prevDays.map((d) => ({
    ...d,
    exercises: d.exercises.map((e) => {
      const currentSets = ensureExerciseSets(e);
      return {
        ...e,
        lastDetail: e.detail || e.lastDetail,
        isPR: false,
        completed: false,
        sets: currentSets.map((s) => ({
          ...s,
          prevReps: s.reps || s.prevReps,
          prevWeight: s.weight || s.prevWeight,
          completed: false,
        })),
      };
    }),
  }));

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 760;

  const todayDayId = getTodayDayId();
  const todayISO = getLocalISODate();
  const currentMondayISO = getMondayOfCurrentWeekISO();

  const [tab, setTab] = useState<TabKey>("program");
  const [days, setDays] = useState<DayPlan[]>(INITIAL_WEEK);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedDayId, setSelectedDayId] = useState<DayId>(todayDayId);
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [summaryLog, setSummaryLog] = useState<WorkoutLog | null>(null);
  const [backupMode, setBackupMode] = useState<"export" | "import" | null>(
    null,
  );
  const [timerTrigger, setTimerTrigger] = useState<{
    seconds: number;
    nonce: number;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const corruptedKeysRef = useRef({
    week: false,
    logs: false,
    settings: false,
  });

  useEffect(() => {
    (async () => {
      const [weekRes, logsRes, settingsRes, storedMonday] = await Promise.all([
        safeLoadJSON<DayPlan[]>(STORAGE_KEYS.WEEK, "@gymnote_week_v1"),
        safeLoadJSON<WorkoutLog[]>(STORAGE_KEYS.LOGS, "@gymnote_logs_v1"),
        safeLoadJSON<Partial<AppSettings>>(
          STORAGE_KEYS.SETTINGS,
          "@gymnote_settings_v1",
        ),
        AsyncStorage.getItem(STORAGE_KEYS.WEEK_START).catch(() => null),
      ]);

      corruptedKeysRef.current = {
        week: weekRes.corrupted,
        logs: logsRes.corrupted,
        settings: settingsRes.corrupted,
      };

      if (weekRes.data && Array.isArray(weekRes.data)) {
        const shouldRollover = storedMonday && storedMonday < currentMondayISO;
        setDays(shouldRollover ? rolloverWeekDays(weekRes.data) : weekRes.data);
      }

      if (!storedMonday || storedMonday < currentMondayISO) {
        AsyncStorage.setItem(STORAGE_KEYS.WEEK_START, currentMondayISO).catch(
          () => {},
        );
      }

      if (logsRes.data && Array.isArray(logsRes.data)) {
        setLogs(logsRes.data);
      }

      if (settingsRes.data) {
        const parsed = settingsRes.data;
        const safeAccent: AccentKey =
          parsed.accent && ACCENTS[parsed.accent as AccentKey]
            ? (parsed.accent as AccentKey)
            : "lime";
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          accent: safeAccent,
          presetBgId: parsed.presetBgId || "focus",
          lang: parsed.lang || "en",
        });
      }

      setLoaded(true);
    })();
  }, [currentMondayISO]);

  useEffect(() => {
    if (!loaded || corruptedKeysRef.current.week) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEYS.WEEK, JSON.stringify(days)).catch(
        () => {},
      );
    }, 400);
    return () => clearTimeout(id);
  }, [days, loaded]);

  useEffect(() => {
    if (!loaded || corruptedKeysRef.current.logs) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)).catch(
        () => {},
      );
    }, 400);
    return () => clearTimeout(id);
  }, [logs, loaded]);

  useEffect(() => {
    if (!loaded || corruptedKeysRef.current.settings) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings),
      ).catch(() => {});
    }, 400);
    return () => clearTimeout(id);
  }, [settings, loaded]);

  const lang: Lang = settings.lang || "en";
  const t = STRINGS[lang];
  const accentHex = ACCENTS[settings.accent]?.hex || ACCENTS.lime.hex;

  const historicalBestMap = useMemo(
    () => getHistoricalBest1RMMap(logs, todayISO),
    [logs, todayISO],
  );

  const isLoggedToday = logs.some(
    (l) => l.dateISO === todayISO && (!l.dayId || l.dayId === selectedDayId),
  );

  const handleUpdateDay = (dayId: DayId, patch: Partial<DayPlan>) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, ...patch } : d)),
    );
  };

  const handleAddExercise = (
    dayId: DayId,
    name: string,
    detail: string,
    exerciseId?: string,
  ) => {
    const id = Date.now().toString();
    const matched = findCatalogExercise(name, exerciseId);
    const newEx: Exercise = {
      id,
      exerciseId: matched?.id || exerciseId,
      name,
      detail,
      completed: false,
      sets: parseDetailToSets(detail, id),
    };
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d,
      ),
    );
  };

  const handleUpdateExercise = (
    dayId: DayId,
    exId: string,
    patch: Partial<Exercise>,
  ) => {
    if (
      !sessionStartMs &&
      (patch.completed === true ||
        (patch.sets && patch.sets.some((s) => s.completed)))
    ) {
      setSessionStartMs(Date.now());
    }

    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exId ? { ...e, ...patch } : e,
              ),
            }
          : d,
      ),
    );
  };

  const handleDeleteExercise = (dayId: DayId, exId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) }
          : d,
      ),
    );
  };

  const handleMoveExercise = (
    dayId: DayId,
    index: number,
    direction: -1 | 1,
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        const target = index + direction;
        if (target < 0 || target >= d.exercises.length) return d;
        const next = [...d.exercises];
        [next[index], next[target]] = [next[target], next[index]];
        return { ...d, exercises: next };
      }),
    );
  };

  const handleCopyDay = (fromDayId: DayId, toDayId: DayId) => {
    const source = days.find((d) => d.id === fromDayId);
    if (!source) return;
    setDays((prev) =>
      prev.map((d) =>
        d.id === toDayId
          ? {
              ...d,
              title: source.title,
              isRestDay: source.isRestDay,
              exercises: source.exercises.map((e, i) => {
                const newId = `${Date.now()}_${i}`;
                return {
                  ...e,
                  id: newId,
                  completed: false,
                  sets: ensureExerciseSets(e).map((s, si) => ({
                    ...s,
                    id: `${newId}_s${si}`,
                    completed: false,
                  })),
                };
              }),
            }
          : d,
      ),
    );
    setSelectedDayId(toDayId);
  };

  const handleApplyDeload = (dayId: DayId) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== dayId) return d;
        return {
          ...d,
          exercises: d.exercises.map((e) => {
            const nextSets = ensureExerciseSets(e).map((s) => {
              const w = parseFloat((s.weight || "").replace(",", "."));
              if (isNaN(w) || w <= 0) return s;
              const reduced = Math.max(2.5, Math.round((w * 0.9) / 2.5) * 2.5);
              return { ...s, weight: String(reduced) };
            });
            return {
              ...e,
              sets: nextSets,
              detail: summarizeSetsToDetail(nextSets, e.detail),
            };
          }),
        };
      }),
    );
    notifyUser("GYMNOTE", t.deloadAppliedMsg);
  };

  const handleSwapWithRestDay = (dayId: DayId) => {
    setDays((prev) => {
      const currentIdx = prev.findIndex((d) => d.id === dayId);
      const restIdx = prev.findIndex((d) => d.isRestDay && d.id !== dayId);
      if (currentIdx < 0 || restIdx < 0) return prev;

      const cur = prev[currentIdx];
      const rest = prev[restIdx];
      const next = [...prev];

      next[currentIdx] = {
        ...cur,
        title: rest.title,
        isRestDay: true,
        exercises: [],
      };
      next[restIdx] = {
        ...rest,
        title: cur.title,
        isRestDay: false,
        exercises: cur.exercises,
      };
      return next;
    });
  };

  const handleApplyTemplate = (templateDays: DayPlan[], name: string) => {
    setDays(
      templateDays.map((d) => ({
        ...d,
        title: TITLE_MAP[d.title] ? TITLE_MAP[d.title][lang] : d.title,
        shift: "none",
        shiftHours: "",
        exercises: d.exercises.map((e, i) => {
          const newId = `${d.id}_${Date.now()}_${i}`;
          const matched = findCatalogExercise(e.name);
          return {
            ...e,
            id: newId,
            exerciseId: matched?.id,
            sets: parseDetailToSets(e.detail, newId),
          };
        }),
      })),
    );
    setSelectedDayId(todayDayId);
    setTab("program");
    notifyUser(t.templateLoaded, name);
  };

  const handleFinishWorkout = (day: DayPlan) => {
    const localISO = getLocalISODate();
    const prCount = day.exercises.filter((e) => e.isPR).length;
    const completedCount = day.exercises.filter(
      (e) => e.completed || (e.sets && e.sets.some((s) => s.completed)),
    ).length;
    const totalVolumeKg = calcExercisesVolumeKg(day.exercises);
    const durationMin = sessionStartMs
      ? Math.max(1, Math.round((Date.now() - sessionStartMs) / 60000))
      : undefined;

    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      dateISO: localISO,
      dayId: day.id,
      dayTitle: day.title || DAY_NAMES[lang][day.id].full,
      completedCount,
      totalCount: day.exercises.length,
      prCount,
      totalVolumeKg,
      durationMin,
      exercises: day.exercises,
    };

    setLogs((prev) => {
      const existingIdx = prev.findIndex(
        (l) =>
          l.dateISO === localISO &&
          (l.dayId === day.id || l.dayTitle === newLog.dayTitle),
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...newLog, id: copy[existingIdx].id };
        return copy;
      }
      return [newLog, ...prev];
    });

    setSessionStartMs(null);
    setSummaryLog(newLog);
  };

  const handleResetWeek = () => {
    const runReset = () => {
      setSessionStartMs(null);
      setDays((prev) => rolloverWeekDays(prev));
      AsyncStorage.setItem(STORAGE_KEYS.WEEK_START, currentMondayISO).catch(
        () => {},
      );
    };

    if (Platform.OS === "web") {
      if (window.confirm(t.resetWeekMsg)) runReset();
      return;
    }

    Alert.alert(t.resetWeekTitle, t.resetWeekMsg, [
      { text: t.cancel, style: "cancel" },
      { text: t.reset, onPress: runReset },
    ]);
  };

  const exportPayload = JSON.stringify({ days, logs, settings }, null, 2);

  const handleOpenExport = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const blob = new Blob([exportPayload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gymnote-backup-${getLocalISODate()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setBackupMode("export");
  };

  const handleImportBackup = (raw: string) => {
    const result = validateBackupPayload(raw);
    if (!result.valid) {
      notifyUser("GYMNOTE", t.invalidJson);
      return;
    }
    corruptedKeysRef.current = { week: false, logs: false, settings: false };
    setDays(result.days);
    setLogs(result.logs);
    if (result.settings) {
      const safeAccent: AccentKey =
        result.settings.accent && ACCENTS[result.settings.accent as AccentKey]
          ? result.settings.accent
          : "lime";
      setSettings({
        ...DEFAULT_SETTINGS,
        ...result.settings,
        accent: safeAccent,
      });
    }
    setBackupMode(null);
    notifyUser("GYMNOTE", t.backupSuccess);
  };

  const navItems: Array<{ key: TabKey; label: string; Icon: typeof Dumbbell }> =
    [
      { key: "program", label: t.tabProgram, Icon: Dumbbell },
      { key: "progress", label: t.tabProgress, Icon: CalendarDays },
      { key: "profile", label: t.tabProfile, Icon: User },
    ];

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        {isDesktop && (
          <View style={styles.topNavWrap}>
            <View style={styles.topNavInner}>
              <Text style={styles.brandText}>
                GYM<Text style={{ color: accentHex }}>NOTE</Text>
              </Text>

              <View style={styles.topTabs}>
                {navItems.map(({ key, label, Icon }) => {
                  const active = tab === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setTab(key)}
                      style={[
                        styles.topTabPill,
                        active && {
                          borderColor: accentHex,
                          backgroundColor: "rgba(255,255,255,0.06)",
                        },
                      ]}
                    >
                      <Icon
                        size={15}
                        color={active ? accentHex : COLORS.textSecondary}
                      />
                      <Text
                        style={[
                          styles.topTabText,
                          active && { color: COLORS.textPrimary },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        <View style={styles.pageContainer}>
          {tab === "program" && (
            <ProgramScreen
              days={days}
              selectedDayId={selectedDayId}
              todayDayId={todayDayId}
              isLoggedToday={isLoggedToday}
              historicalBestMap={historicalBestMap}
              sessionStartMs={sessionStartMs}
              settings={settings}
              accentHex={accentHex}
              onSelectDay={setSelectedDayId}
              onUpdateDay={handleUpdateDay}
              onAddExercise={handleAddExercise}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
              onMoveExercise={handleMoveExercise}
              onCopyDay={handleCopyDay}
              onApplyDeload={handleApplyDeload}
              onSwapWithRestDay={handleSwapWithRestDay}
              onApplyTemplate={handleApplyTemplate}
              onFinishWorkout={handleFinishWorkout}
              onResetWeek={handleResetWeek}
              onChangeQuote={(quote) => setSettings((p) => ({ ...p, quote }))}
              onTriggerRestTimer={() =>
                setTimerTrigger({
                  seconds: settings.autoRestSec ?? 90,
                  nonce: Date.now(),
                })
              }
            />
          )}

          {tab === "progress" && (
            <ProgressScreen logs={logs} accentHex={accentHex} lang={lang} />
          )}

          {tab === "profile" && (
            <ProfileScreen
              settings={settings}
              accentHex={accentHex}
              totalSessions={logs.length}
              onUpdateSettings={(patch) =>
                setSettings((p) => ({ ...p, ...patch }))
              }
              onChangeLang={(nextLang: Lang) => {
                setSettings((p) => ({ ...p, lang: nextLang }));
                setDays((prev) =>
                  prev.map((d) =>
                    TITLE_MAP[d.title]
                      ? { ...d, title: TITLE_MAP[d.title][nextLang] }
                      : d,
                  ),
                );
              }}
              onApplyTemplate={handleApplyTemplate}
              onSelectPresetBg={(preset: BgPreset) =>
                setSettings((p) => ({
                  ...p,
                  presetBgId: preset.id,
                  quote: preset.defaultQuote,
                  oledMode: false,
                }))
              }
              onOpenExport={handleOpenExport}
              onOpenImport={() => setBackupMode("import")}
            />
          )}
        </View>

        {!isDesktop && (
          <View style={styles.tabBar}>
            {navItems.map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.tabItem}
                  onPress={() => setTab(key)}
                  activeOpacity={0.7}
                >
                  <Icon
                    size={20}
                    color={active ? accentHex : COLORS.textSecondary}
                  />
                  <Text
                    style={[styles.tabLabel, active && { color: accentHex }]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <RestTimerPill
          accentHex={accentHex}
          label={t.restTimer}
          autoTrigger={timerTrigger}
        />

        <WorkoutSummaryModal
          log={summaryLog}
          quote={settings.quote}
          bgSource={resolveBackgroundSource(settings)}
          accentHex={accentHex}
          lang={lang}
          onClose={() => setSummaryLog(null)}
        />

        <BackupModal
          mode={backupMode}
          exportJson={exportPayload}
          accentHex={accentHex}
          lang={lang}
          onImport={handleImportBackup}
          onClose={() => setBackupMode(null)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topNavWrap: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "#070709",
  },
  topNavInner: {
    width: "100%",
    maxWidth: 740,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.textPrimary,
  },
  topTabs: {
    flexDirection: "row",
    gap: 8,
  },
  topTabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  topTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  pageContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 740,
    alignSelf: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "#08080A",
    paddingTop: 10,
    paddingBottom: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
});
