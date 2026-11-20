import React, { useEffect, useState } from "react";
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
import { getLocalISODate, getTodayDayId } from "./src/utils/date";
import { ensureExerciseSets, parseDetailToSets } from "./src/utils/sets";
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

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 760;

  const todayDayId = getTodayDayId();
  const todayISO = getLocalISODate();

  const [tab, setTab] = useState<TabKey>("program");
  const [days, setDays] = useState<DayPlan[]>(INITIAL_WEEK);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedDayId, setSelectedDayId] = useState<DayId>(todayDayId);
  const [summaryLog, setSummaryLog] = useState<WorkoutLog | null>(null);
  const [backupMode, setBackupMode] = useState<"export" | "import" | null>(
    null,
  );
  const [timerTrigger, setTimerTrigger] = useState<{
    seconds: number;
    nonce: number;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [w, l, s, legacyW, legacyL, legacyS] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.WEEK),
          AsyncStorage.getItem(STORAGE_KEYS.LOGS),
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
          AsyncStorage.getItem("@gymnote_week_v1"),
          AsyncStorage.getItem("@gymnote_logs_v1"),
          AsyncStorage.getItem("@gymnote_settings_v1"),
        ]);

        const rawWeek = w || legacyW;
        const rawLogs = l || legacyL;
        const rawSettings = s || legacyS;

        if (rawWeek) setDays(JSON.parse(rawWeek));
        if (rawLogs) setLogs(JSON.parse(rawLogs));
        if (rawSettings) {
          const parsed = JSON.parse(rawSettings);
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            presetBgId: parsed.presetBgId || "focus",
            lang: parsed.lang || "en",
          });
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.WEEK, JSON.stringify(days));
  }, [days, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, loaded]);

  const lang: Lang = settings.lang || "en";
  const t = STRINGS[lang];
  const accentHex = ACCENTS[settings.accent].hex;

  const isLoggedToday = logs.some(
    (l) => l.dateISO === todayISO && (!l.dayId || l.dayId === selectedDayId),
  );

  const handleUpdateDay = (dayId: DayId, patch: Partial<DayPlan>) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, ...patch } : d)),
    );
  };

  const handleAddExercise = (dayId: DayId, name: string, detail: string) => {
    const id = Date.now().toString();
    const newEx: Exercise = {
      id,
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

  const handleApplyTemplate = (templateDays: DayPlan[], name: string) => {
    setDays(
      templateDays.map((d) => ({
        ...d,
        title: TITLE_MAP[d.title] ? TITLE_MAP[d.title][lang] : d.title,
        shift: "none",
        shiftHours: "",
        exercises: d.exercises.map((e, i) => {
          const newId = `${d.id}_${Date.now()}_${i}`;
          return {
            ...e,
            id: newId,
            sets: parseDetailToSets(e.detail, newId),
          };
        }),
      })),
    );
    setSelectedDayId(todayDayId);
    setTab("program");
    if (Platform.OS === "web") {
      window.alert(`${t.templateLoaded}: ${name}`);
    } else {
      Alert.alert(t.templateLoaded, name);
    }
  };

  // Aynı gün aynı antrenman tekrar kaydedilirse çift kayıt oluşturmaz, günceller (upsert)
  const handleFinishWorkout = (day: DayPlan) => {
    const localISO = getLocalISODate();
    const prCount = day.exercises.filter((e) => e.isPR).length;
    const completedCount = day.exercises.filter(
      (e) => e.completed || (e.sets && e.sets.some((s) => s.completed)),
    ).length;

    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      dateISO: localISO,
      dayId: day.id,
      dayTitle: day.title || DAY_NAMES[lang][day.id].full,
      completedCount,
      totalCount: day.exercises.length,
      prCount,
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

    setSummaryLog(newLog);
  };

  const handleResetWeek = () => {
    const runReset = () => {
      setDays((prev) =>
        prev.map((d) => ({
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
        })),
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
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.days)) throw new Error("Invalid");
      setDays(parsed.days);
      if (Array.isArray(parsed.logs)) setLogs(parsed.logs);
      if (parsed.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }
      setBackupMode(null);
      Alert.alert("GYMNOTE", t.backupSuccess);
    } catch {
      Alert.alert("GYMNOTE", t.invalidJson);
    }
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
        {/* Masaüstünde Üst Bar Navigasyonu */}
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

        {/* Odaklı Tek Sayfa İçerik Alanı */}
        <View style={styles.pageContainer}>
          {tab === "program" && (
            <ProgramScreen
              days={days}
              selectedDayId={selectedDayId}
              todayDayId={todayDayId}
              isLoggedToday={isLoggedToday}
              settings={settings}
              accentHex={accentHex}
              onSelectDay={setSelectedDayId}
              onUpdateDay={handleUpdateDay}
              onAddExercise={handleAddExercise}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
              onMoveExercise={handleMoveExercise}
              onCopyDay={handleCopyDay}
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

        {/* Mobilde Alt Sekme Çubuğu */}
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
