import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import {
  ArrowLeftRight,
  Briefcase,
  CheckCircle2,
  Copy,
  Flame,
  Moon,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  TrendingDown,
} from "lucide-react-native";
import {
  AppSettings,
  DayId,
  DayPlan,
  Exercise,
  ShiftType,
} from "../types/workout";
import { COLORS } from "../constants/theme";
import {
  DAY_NAMES,
  MUSCLE_LABELS,
  SHIFT_NAMES,
  STRINGS,
} from "../constants/i18n";
import { SPLIT_TEMPLATES } from "../constants/templates";
import { resolveBackgroundSource } from "../constants/backgrounds";
import { searchCatalogExercises } from "../constants/exercises";
import {
  calcExercisesVolumeKg,
  getExerciseHistoryKey,
} from "../utils/analytics";
import { MotivationCard } from "../components/MotivationCard";
import { DayStrip } from "../components/DayStrip";
import { ExerciseRow } from "../components/ExerciseRow";

interface Props {
  days: DayPlan[];
  selectedDayId: DayId;
  todayDayId: DayId;
  isLoggedToday: boolean;
  historicalBestMap: Record<string, number>;
  sessionStartMs: number | null;
  settings: AppSettings;
  accentHex: string;
  onSelectDay: (id: DayId) => void;
  onUpdateDay: (dayId: DayId, patch: Partial<DayPlan>) => void;
  onAddExercise: (
    dayId: DayId,
    name: string,
    detail: string,
    exerciseId?: string,
  ) => void;
  onUpdateExercise: (
    dayId: DayId,
    exId: string,
    patch: Partial<Exercise>,
  ) => void;
  onDeleteExercise: (dayId: DayId, exId: string) => void;
  onMoveExercise: (dayId: DayId, index: number, direction: -1 | 1) => void;
  onCopyDay: (fromDayId: DayId, toDayId: DayId) => void;
  onApplyDeload: (dayId: DayId) => void;
  onSwapWithRestDay: (dayId: DayId) => void;
  onApplyTemplate: (days: DayPlan[], name: string) => void;
  onFinishWorkout: (day: DayPlan) => void;
  onResetWeek: () => void;
  onChangeQuote: (quote: string) => void;
  onTriggerRestTimer: () => void;
}

const SHIFT_ORDER: ShiftType[] = ["none", "morning", "evening", "night", "off"];

export const ProgramScreen: React.FC<Props> = ({
  days,
  selectedDayId,
  todayDayId,
  isLoggedToday,
  historicalBestMap,
  sessionStartMs,
  settings,
  accentHex,
  onSelectDay,
  onUpdateDay,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onMoveExercise,
  onCopyDay,
  onApplyDeload,
  onSwapWithRestDay,
  onApplyTemplate,
  onFinishWorkout,
  onResetWeek,
  onChangeQuote,
  onTriggerRestTimer,
}) => {
  const [quickInput, setQuickInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showShiftBar, setShowShiftBar] = useState(false);
  const [showCopyBar, setShowCopyBar] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!sessionStartMs) {
      setElapsedSec(0);
      return;
    }
    const update = () =>
      setElapsedSec(
        Math.max(0, Math.floor((Date.now() - sessionStartMs) / 1000)),
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [sessionStartMs]);

  const lang = settings.lang || "en";
  const t = STRINGS[lang];
  const day = days.find((d) => d.id === selectedDayId) || days[0];

  const totalCount = day.exercises.length;
  const completedCount = day.exercises.filter((e) => e.completed).length;
  const hasAnyCompletedSet = day.exercises.some(
    (e) => e.completed || (e.sets && e.sets.some((s) => s.completed)),
  );
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const liveVolumeKg = calcExercisesVolumeKg(day.exercises);
  const hasRestDayAvailable = days.some((d) => d.isRestDay && d.id !== day.id);
  const catalogSuggestions = searchCatalogExercises(quickInput);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const parseQuickAdd = () => {
    const raw = quickInput.trim();
    if (!raw) return;

    const match = raw.match(/^(.*?)\s+(\d+\s*[xX×]\s*\d+.*)$/);
    if (match) {
      onAddExercise(day.id, match[1].trim(), match[2].trim());
    } else {
      onAddExercise(day.id, raw, "3 × 10");
    }
    setQuickInput("");
  };

  const handlePressFinish = () => {
    if (!hasAnyCompletedSet) return;

    if (completedCount < totalCount) {
      const msg = t.partialFinishMsg
        .replace("{done}", String(completedCount))
        .replace("{total}", String(totalCount));

      if (Platform.OS === "web") {
        if (window.confirm(msg)) onFinishWorkout(day);
        return;
      }

      Alert.alert(t.partialFinishTitle, msg, [
        { text: t.cancel, style: "cancel" },
        { text: t.saveAnyway, onPress: () => onFinishWorkout(day) },
      ]);
      return;
    }

    onFinishWorkout(day);
  };

  const cycleShift = () => {
    const nextIdx = (SHIFT_ORDER.indexOf(day.shift) + 1) % SHIFT_ORDER.length;
    onUpdateDay(day.id, { shift: SHIFT_ORDER[nextIdx] });
    setShowShiftBar(true);
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <MotivationCard
        quote={settings.quote}
        bgSource={resolveBackgroundSource(settings)}
        bgOpacity={settings.bgOpacity}
        accentHex={accentHex}
        onChangeQuote={onChangeQuote}
      />

      <DayStrip
        days={days}
        selectedDayId={selectedDayId}
        todayDayId={todayDayId}
        accentHex={accentHex}
        lang={lang}
        onSelect={onSelectDay}
      />

      {hasAnyCompletedSet && !day.isRestDay && (
        <View style={[styles.liveBar, { borderColor: accentHex }]}>
          <View style={styles.liveLeft}>
            <Flame size={14} color={accentHex} />
            <Text style={[styles.liveTag, { color: accentHex }]}>
              {t.liveSessionLabel}
            </Text>
          </View>
          <View style={styles.liveMetrics}>
            {sessionStartMs && (
              <Text style={styles.liveMetricText}>
                ⏱ {formatElapsed(elapsedSec)}
              </Text>
            )}
            {liveVolumeKg > 0 && (
              <Text style={styles.liveMetricText}>
                {t.volumeLabel}: {liveVolumeKg} kg
              </Text>
            )}
          </View>
        </View>
      )}

      {day.shift === "night" && !day.isRestDay && day.exercises.length > 0 && (
        <View style={styles.smartShiftBanner}>
          <Text style={styles.smartShiftTitle}>
            🌙 {t.nightShiftAlertTitle}
          </Text>
          <Text style={styles.smartShiftSub}>{t.nightShiftAlertSub}</Text>
          <View style={styles.smartShiftActions}>
            <TouchableOpacity
              onPress={() => onApplyDeload(day.id)}
              style={[styles.smartShiftBtn, { borderColor: "#38BDF8" }]}
            >
              <TrendingDown size={13} color="#38BDF8" />
              <Text style={[styles.smartShiftBtnText, { color: "#38BDF8" }]}>
                {t.applyDeloadBtn}
              </Text>
            </TouchableOpacity>

            {hasRestDayAvailable && (
              <TouchableOpacity
                onPress={() => onSwapWithRestDay(day.id)}
                style={[styles.smartShiftBtn, { borderColor: accentHex }]}
              >
                <ArrowLeftRight size={13} color={accentHex} />
                <Text style={[styles.smartShiftBtnText, { color: accentHex }]}>
                  {t.swapRestBtn}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.dayHeader}>
        <View style={styles.dayTitleWrap}>
          <View style={styles.dayLabelRow}>
            <Text style={styles.fullDayLabel}>
              {DAY_NAMES[lang][day.id].full}
            </Text>
            {day.shift !== "none" && (
              <Text style={styles.shiftBadge}>
                {SHIFT_NAMES[lang][day.shift]}
                {day.shiftHours ? ` · ${day.shiftHours}` : ""}
              </Text>
            )}
            {isLoggedToday && day.id === todayDayId && (
              <Text style={[styles.loggedTag, { color: accentHex }]}>
                ✓ {t.loggedTodayBadge}
              </Text>
            )}
          </View>

          <TextInput
            value={day.title}
            onChangeText={(title) => onUpdateDay(day.id, { title })}
            placeholder={t.dayTitlePlaceholder}
            placeholderTextColor={COLORS.textMuted}
            style={styles.dayTitleInput}
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={cycleShift}
            style={[
              styles.toolBtn,
              day.shift !== "none" && { borderColor: "#38BDF8" },
            ]}
          >
            <Briefcase
              size={14}
              color={day.shift !== "none" ? "#38BDF8" : COLORS.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onUpdateDay(day.id, { isRestDay: !day.isRestDay })}
            style={[
              styles.toolPill,
              day.isRestDay && { borderColor: accentHex },
            ]}
          >
            <Moon
              size={13}
              color={day.isRestDay ? accentHex : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.toolPillText,
                day.isRestDay && { color: accentHex },
              ]}
            >
              {t.rest}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEditMode((p) => !p)}
            style={[
              styles.toolPill,
              editMode && {
                backgroundColor: accentHex,
                borderColor: accentHex,
              },
            ]}
          >
            <SlidersHorizontal
              size={13}
              color={editMode ? "#000000" : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.toolPillText,
                editMode && { color: "#000000", fontWeight: "800" },
              ]}
            >
              {editMode ? t.doneEditing : t.editMode}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showShiftBar && day.shift !== "none" && (
        <View style={styles.subToolbar}>
          <TextInput
            value={day.shiftHours}
            onChangeText={(shiftHours) => onUpdateDay(day.id, { shiftHours })}
            placeholder={t.shiftHoursPlaceholder}
            placeholderTextColor={COLORS.textMuted}
            style={styles.shiftInput}
          />
        </View>
      )}

      {editMode && (
        <View style={styles.editPanel}>
          <View style={styles.editTopActions}>
            <TouchableOpacity
              onPress={() => setShowCopyBar((p) => !p)}
              style={styles.editSubBtn}
            >
              <Copy size={13} color={COLORS.textPrimary} />
              <Text style={styles.editSubBtnText}>{t.copyDayLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onResetWeek} style={styles.editSubBtn}>
              <RotateCcw size={13} color={accentHex} />
              <Text style={[styles.editSubBtnText, { color: accentHex }]}>
                {t.resetWeekTitle}
              </Text>
            </TouchableOpacity>
          </View>

          {showCopyBar && (
            <View style={styles.copyTargetsRow}>
              {days
                .filter((d) => d.id !== day.id)
                .map((target) => (
                  <TouchableOpacity
                    key={target.id}
                    onPress={() => {
                      onCopyDay(day.id, target.id);
                      setShowCopyBar(false);
                    }}
                    style={styles.copyChip}
                  >
                    <Text style={styles.copyChipText}>
                      {DAY_NAMES[lang][target.id].short}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          <Text style={styles.templateHeader}>{t.splitTemplates}</Text>
          <View style={styles.templateList}>
            {SPLIT_TEMPLATES.map((tpl) => (
              <TouchableOpacity
                key={tpl.id}
                onPress={() => onApplyTemplate(tpl.days, tpl.name[lang])}
                style={styles.templateItem}
              >
                <View style={styles.flex}>
                  <Text style={styles.templateName}>{tpl.name[lang]}</Text>
                  <Text style={styles.templateSub}>{tpl.sub[lang]}</Text>
                </View>
                <Text style={[styles.templateLoad, { color: accentHex }]}>
                  {t.loadBtn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {day.isRestDay ? (
        <View style={styles.restCard}>
          <Moon size={26} color={accentHex} />
          <Text style={styles.restTitle}>{t.restDayTitle}</Text>
          <Text style={styles.restSub}>{t.restDaySub}</Text>
        </View>
      ) : (
        <>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressRatio * 100}%`,
                    backgroundColor: accentHex,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>
              {completedCount}/{totalCount}
            </Text>
          </View>

          {day.exercises.length === 0 ? (
            <Text style={styles.emptyText}>{t.emptyExercises}</Text>
          ) : (
            day.exercises.map((ex, idx) => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                index={idx}
                total={day.exercises.length}
                editMode={editMode}
                historicalBest1RM={
                  historicalBestMap[getExerciseHistoryKey(ex)] || 0
                }
                accentHex={accentHex}
                lang={lang}
                onUpdate={(patch) => onUpdateExercise(day.id, ex.id, patch)}
                onDelete={() => onDeleteExercise(day.id, ex.id)}
                onMove={(dir) => onMoveExercise(day.id, idx, dir)}
                onSetCompleted={onTriggerRestTimer}
              />
            ))
          )}

          <View style={styles.quickAddBox}>
            <Plus size={16} color={COLORS.textSecondary} />
            <TextInput
              value={quickInput}
              onChangeText={setQuickInput}
              onSubmitEditing={parseQuickAdd}
              placeholder={t.quickAddPlaceholder}
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="done"
              style={styles.quickAddInput}
            />
            {quickInput.trim().length > 0 && (
              <TouchableOpacity onPress={parseQuickAdd} style={styles.addBtn}>
                <Text style={[styles.addBtnText, { color: accentHex }]}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          {catalogSuggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              {catalogSuggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    onAddExercise(
                      day.id,
                      item.name,
                      item.defaultDetail,
                      item.id,
                    );
                    setQuickInput("");
                  }}
                  style={styles.suggestionRow}
                >
                  <Text style={styles.suggestionName}>{item.name}</Text>
                  <Text style={[styles.suggestionMuscle, { color: accentHex }]}>
                    {MUSCLE_LABELS[lang][item.primary]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {day.exercises.length > 0 && (
            <View style={styles.finishWrap}>
              <TouchableOpacity
                activeOpacity={hasAnyCompletedSet ? 0.85 : 1}
                disabled={!hasAnyCompletedSet}
                onPress={handlePressFinish}
                style={[
                  styles.finishBtn,
                  hasAnyCompletedSet
                    ? { backgroundColor: accentHex }
                    : styles.finishBtnDisabled,
                ]}
              >
                <CheckCircle2
                  size={18}
                  color={hasAnyCompletedSet ? "#000000" : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.finishBtnText,
                    !hasAnyCompletedSet && { color: COLORS.textMuted },
                  ]}
                >
                  {isLoggedToday && day.id === todayDayId
                    ? t.updateWorkout
                    : t.finishWorkout}
                </Text>
              </TouchableOpacity>

              {!hasAnyCompletedSet && (
                <Text style={styles.disabledHint}>{t.completeAtLeastOne}</Text>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
  },
  liveBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    marginBottom: 14,
  },
  liveLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveTag: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  liveMetrics: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveMetricText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  smartShiftBanner: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(56,189,248,0.06)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.35)",
    marginBottom: 14,
    gap: 6,
  },
  smartShiftTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  smartShiftSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  smartShiftActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  smartShiftBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#08080B",
    borderWidth: 1,
  },
  smartShiftBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  dayTitleWrap: {
    flex: 1,
  },
  dayLabelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  fullDayLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: COLORS.textSecondary,
  },
  shiftBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#38BDF8",
    backgroundColor: "rgba(56,189,248,0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  loggedTag: {
    fontSize: 10,
    fontWeight: "800",
  },
  dayTitleInput: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    paddingVertical: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  toolPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  subToolbar: {
    marginBottom: 12,
  },
  shiftInput: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  editPanel: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    gap: 10,
  },
  editTopActions: {
    flexDirection: "row",
    gap: 8,
  },
  editSubBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editSubBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  copyTargetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  copyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  templateHeader: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  templateList: {
    gap: 6,
  },
  templateItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  templateName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  templateSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  templateLoad: {
    fontSize: 12,
    fontWeight: "800",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingVertical: 18,
    textAlign: "center",
  },
  quickAddBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.textMuted,
    backgroundColor: "rgba(255,255,255,0.02)",
    marginTop: 4,
  },
  quickAddInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  addBtn: {
    paddingHorizontal: 8,
  },
  addBtnText: {
    fontSize: 20,
    fontWeight: "800",
  },
  suggestionsList: {
    marginTop: 6,
    gap: 6,
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  suggestionMuscle: {
    fontSize: 11,
    fontWeight: "700",
  },
  finishWrap: {
    marginTop: 16,
    gap: 6,
  },
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  finishBtnDisabled: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  finishBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
  },
  disabledHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  restCard: {
    padding: 28,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  restTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  restSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
});
