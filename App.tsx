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
import { Dumbbell, User } from "lucide-react-native";

import {
  AccentKey,
  AppSettings,
  DayId,
  DayPlan,
  Exercise,
  Lang,
  WorkoutLog,
} from "./src/types/workout";
import { ACCENTS, COLORS } from "./src/constants/theme";
import { DEFAULT_SETTINGS, INITIAL_WEEK } from "./src/constants/initialData";
import { BgPreset, resolveBackgroundSource } from "./src/constants/backgrounds";
import { STRINGS } from "./src/constants/i18n";
import { ProgramScreen } from "./src/screens/ProgramScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { RestTimerPill } from "./src/components/RestTimerPill";
import { WorkoutSummaryModal } from "./src/components/WorkoutSummaryModal";
import { BackupModal } from "./src/components/BackupModal";

const STORAGE_KEYS = {
  WEEK: "@gymnote_week_v1",
  LOGS: "@gymnote_logs_v1",
  SETTINGS: "@gymnote_settings_v1",
};

export default function App() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 850;

  const [tab, setTab] = useState<"program" | "profile">("program");
  const [days, setDays] = useState<DayPlan[]>(INITIAL_WEEK);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedDayId, setSelectedDayId] = useState<DayId>("mon");
  const [summaryLog, setSummaryLog] = useState<WorkoutLog | null>(null);
  const [backupMode, setBackupMode] = useState<"export" | "import" | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [w, l, s] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.WEEK),
          AsyncStorage.getItem(STORAGE_KEYS.LOGS),
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        ]);
        if (w) setDays(JSON.parse(w));
        if (l) setLogs(JSON.parse(l));
        if (s) {
          const parsed = JSON.parse(s);
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed,
            presetBgId: parsed.presetBgId || "focus",
            lang: parsed.lang || "tr",
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

  const lang: Lang = settings.lang || "tr";
  const t = STRINGS[lang];
  const accentHex = ACCENTS[settings.accent].hex;

  const handleUpdateDay = (dayId: DayId, patch: Partial<DayPlan>) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, ...patch } : d)),
    );
  };

  const handleAddExercise = (dayId: DayId, name: string, detail: string) => {
    const newEx: Exercise = {
      id: Date.now().toString(),
      name,
      detail,
      completed: false,
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
              exercises: source.exercises.map((e, i) => ({
                ...e,
                id: `${Date.now()}_${i}`,
                completed: false,
              })),
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
        shift: "none",
        shiftHours: "",
        exercises: d.exercises.map((e, i) => ({
          ...e,
          id: `${d.id}_${Date.now()}_${i}`,
        })),
      })),
    );
    setSelectedDayId("mon");
    Alert.alert(t.templateLoaded, name);
  };

  const handleFinishWorkout = (day: DayPlan) => {
    const todayISO = new Date().toISOString().split("T")[0];
    const prCount = day.exercises.filter((e) => e.isPR).length;
    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      dateISO: todayISO,
      dayTitle: day.title || day.fullLabel,
      completedCount: day.exercises.filter((e) => e.completed).length,
      totalCount: day.exercises.length,
      prCount,
      exercises: day.exercises,
    };
    setLogs((prev) => [newLog, ...prev]);
    setSummaryLog(newLog);
  };

  const handleResetWeek = () => {
    const runReset = () => {
      setDays((prev) =>
        prev.map((d) => ({
          ...d,
          exercises: d.exercises.map((e) => ({
            ...e,
            lastDetail: e.detail || e.lastDetail,
            isPR: false,
            completed: false,
          })),
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
      a.download = `gymnote-backup-${new Date().toISOString().split("T")[0]}.json`;
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

  const programView = (
    <ProgramScreen
      days={days}
      selectedDayId={selectedDayId}
      settings={settings}
      accentHex={accentHex}
      onSelectDay={setSelectedDayId}
      onUpdateDay={handleUpdateDay}
      onAddExercise={handleAddExercise}
      onUpdateExercise={handleUpdateExercise}
      onDeleteExercise={handleDeleteExercise}
      onMoveExercise={handleMoveExercise}
      onCopyDay={handleCopyDay}
      onFinishWorkout={handleFinishWorkout}
      onResetWeek={handleResetWeek}
      onChangeQuote={(quote) => setSettings((p) => ({ ...p, quote }))}
    />
  );

  const profileView = (
    <ProfileScreen
      logs={logs}
      settings={settings}
      accentHex={accentHex}
      onChangeAccent={(accent: AccentKey) =>
        setSettings((p) => ({ ...p, accent }))
      }
      onToggleOled={(oledMode) => setSettings((p) => ({ ...p, oledMode }))}
      onChangeLang={(nextLang: Lang) =>
        setSettings((p) => ({ ...p, lang: nextLang }))
      }
      onChangeBodyWeight={(bodyWeight) =>
        setSettings((p) => ({ ...p, bodyWeight }))
      }
      onApplyTemplate={handleApplyTemplate}
      onSelectPresetBg={(preset: BgPreset) =>
        setSettings((p) => ({
          ...p,
          presetBgId: preset.id,
          quote: preset.defaultQuote,
          oledMode: false,
        }))
      }
      onChangeBgOpacity={(bgOpacity) =>
        setSettings((p) => ({ ...p, bgOpacity }))
      }
      onOpenExport={handleOpenExport}
      onOpenImport={() => setBackupMode("import")}
    />
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        {isDesktop ? (
          <View style={styles.desktopWrap}>
            <View style={styles.desktopLeft}>{programView}</View>
            <View style={styles.desktopDivider} />
            <View style={styles.desktopRight}>{profileView}</View>
          </View>
        ) : (
          <>
            <View style={styles.body}>
              {tab === "program" ? programView : profileView}
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setTab("program")}
                activeOpacity={0.7}
              >
                <Dumbbell
                  size={20}
                  color={tab === "program" ? accentHex : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    tab === "program" && { color: accentHex },
                  ]}
                >
                  {t.tabProgram}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setTab("profile")}
                activeOpacity={0.7}
              >
                <User
                  size={20}
                  color={tab === "profile" ? accentHex : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    tab === "profile" && { color: accentHex },
                  ]}
                >
                  {t.tabProfile}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <RestTimerPill
          accentHex={accentHex}
          isDesktop={isDesktop}
          label={t.restTimer}
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
  body: {
    flex: 1,
  },
  desktopWrap: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  desktopLeft: {
    flex: 1.35,
  },
  desktopDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  desktopRight: {
    flex: 1,
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
