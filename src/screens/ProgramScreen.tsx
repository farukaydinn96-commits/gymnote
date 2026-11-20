import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  Plus,
  CheckCircle2,
  Moon,
  RotateCcw,
  Copy,
  Briefcase,
} from "lucide-react-native";
import {
  DayId,
  DayPlan,
  Exercise,
  AppSettings,
  ShiftType,
} from "../types/workout";
import { COLORS } from "../constants/theme";
import { resolveBackgroundSource } from "../constants/backgrounds";
import { DAY_NAMES, SHIFT_META, STRINGS } from "../constants/i18n";
import { DayStrip } from "../components/DayStrip";
import { MotivationCard } from "../components/MotivationCard";
import { ExerciseRow } from "../components/ExerciseRow";

interface Props {
  days: DayPlan[];
  selectedDayId: DayId;
  settings: AppSettings;
  accentHex: string;
  onSelectDay: (id: DayId) => void;
  onUpdateDay: (dayId: DayId, patch: Partial<DayPlan>) => void;
  onAddExercise: (dayId: DayId, name: string, detail: string) => void;
  onUpdateExercise: (
    dayId: DayId,
    exId: string,
    patch: Partial<Exercise>,
  ) => void;
  onDeleteExercise: (dayId: DayId, exId: string) => void;
  onMoveExercise: (dayId: DayId, index: number, direction: -1 | 1) => void;
  onCopyDay: (fromDayId: DayId, toDayId: DayId) => void;
  onFinishWorkout: (day: DayPlan) => void;
  onResetWeek: () => void;
  onChangeQuote: (quote: string) => void;
}

const SHIFT_OPTIONS: ShiftType[] = [
  "none",
  "morning",
  "evening",
  "night",
  "off",
];

export const ProgramScreen: React.FC<Props> = ({
  days,
  selectedDayId,
  settings,
  accentHex,
  onSelectDay,
  onUpdateDay,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onMoveExercise,
  onCopyDay,
  onFinishWorkout,
  onResetWeek,
  onChangeQuote,
}) => {
  const [quickText, setQuickText] = useState("");
  const [copyOpen, setCopyOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);

  const lang = settings.lang || "tr";
  const t = STRINGS[lang];

  const currentDay = days.find((d) => d.id === selectedDayId) || days[0];
  const totalCount = currentDay.exercises.length;
  const completedCount = currentDay.exercises.filter((e) => e.completed).length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const activeShift = currentDay.shift || "none";

  const handleQuickAdd = () => {
    const trimmed = quickText.trim();
    if (!trimmed) return;
    const match = trimmed.match(/^(.*?)(\s+\d+x\d+.*)$/i);
    const name = match ? match[1].trim() : trimmed;
    const detail = match ? match[2].trim() : "";

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAddExercise(currentDay.id, name, detail);
    setQuickText("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          accentHex={accentHex}
          lang={lang}
          onSelect={(id) => {
            setCopyOpen(false);
            setShiftOpen(false);
            onSelectDay(id);
          }}
        />

        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <View style={styles.dayMetaRow}>
              <Text style={styles.daySub}>
                {DAY_NAMES[lang][currentDay.id].full}
              </Text>
              {activeShift !== "none" && (
                <View style={[styles.shiftChip, { borderColor: accentHex }]}>
                  <Text style={[styles.shiftChipText, { color: accentHex }]}>
                    {SHIFT_META[activeShift][lang]}
                    {currentDay.shiftHours ? ` • ${currentDay.shiftHours}` : ""}
                  </Text>
                </View>
              )}
            </View>

            <TextInput
              value={currentDay.title}
              onChangeText={(title) => onUpdateDay(currentDay.id, { title })}
              style={styles.dayTitleInput}
              placeholder={t.dayTitlePlaceholder}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => {
                setCopyOpen(false);
                setShiftOpen((v) => !v);
              }}
              style={[
                styles.iconBtn,
                (shiftOpen || activeShift !== "none") && {
                  borderColor: accentHex,
                },
              ]}
            >
              <Briefcase
                size={14}
                color={
                  shiftOpen || activeShift !== "none"
                    ? accentHex
                    : COLORS.textSecondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShiftOpen(false);
                setCopyOpen((v) => !v);
              }}
              style={[styles.iconBtn, copyOpen && { borderColor: accentHex }]}
            >
              <Copy
                size={14}
                color={copyOpen ? accentHex : COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                onUpdateDay(currentDay.id, {
                  isRestDay: !currentDay.isRestDay,
                });
              }}
              style={[
                styles.smallBtn,
                currentDay.isRestDay && { borderColor: accentHex },
              ]}
            >
              <Moon
                size={14}
                color={currentDay.isRestDay ? accentHex : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.smallBtnText,
                  currentDay.isRestDay && { color: accentHex },
                ]}
              >
                {t.restMode}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onResetWeek} style={styles.iconBtn}>
              <RotateCcw size={14} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vardiya & Çalışma Planlayıcı Çubuğu */}
        {shiftOpen && (
          <View style={styles.toolPanel}>
            <View style={styles.shiftPillsRow}>
              {SHIFT_OPTIONS.map((st) => {
                const selected = activeShift === st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() =>
                      onUpdateDay(currentDay.id, {
                        shift: st,
                        shiftHours:
                          st === "none"
                            ? ""
                            : currentDay.shiftHours ||
                              SHIFT_META[st].defaultHours,
                      })
                    }
                    style={[
                      styles.copyPill,
                      selected && {
                        borderColor: accentHex,
                        borderWidth: 1,
                        backgroundColor: "rgba(255,255,255,0.08)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.copyPillText,
                        selected && { color: accentHex },
                      ]}
                    >
                      {SHIFT_META[st][lang]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeShift !== "none" && (
              <TextInput
                value={currentDay.shiftHours || ""}
                onChangeText={(shiftHours) =>
                  onUpdateDay(currentDay.id, { shiftHours })
                }
                placeholder={t.shiftHoursPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                style={styles.shiftHoursInput}
              />
            )}
          </View>
        )}

        {/* Günü Başka Güne Kopyala Çubuğu */}
        {copyOpen && (
          <View style={styles.copyBar}>
            <Text style={styles.copyLabel}>{t.copyTo}</Text>
            <View style={styles.copyDays}>
              {days
                .filter((d) => d.id !== currentDay.id)
                .map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => {
                      onCopyDay(currentDay.id, d.id);
                      setCopyOpen(false);
                    }}
                    style={styles.copyPill}
                  >
                    <Text style={styles.copyPillText}>
                      {DAY_NAMES[lang][d.id].short}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {!currentDay.isRestDay && totalCount > 0 && (
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%`, backgroundColor: accentHex },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        )}

        {currentDay.isRestDay ? (
          <View style={styles.restBox}>
            <Moon size={28} color={COLORS.textMuted} />
            <Text style={styles.restTitle}>{t.restTitle}</Text>
            <Text style={styles.restSub}>{t.restSub}</Text>
          </View>
        ) : (
          <View>
            {currentDay.exercises.map((ex, idx) => (
              <ExerciseRow
                key={ex.id}
                index={idx}
                isFirst={idx === 0}
                isLast={idx === currentDay.exercises.length - 1}
                exercise={ex}
                accentHex={accentHex}
                lastPrefix={t.lastPrefix}
                onToggle={() =>
                  onUpdateExercise(currentDay.id, ex.id, {
                    completed: !ex.completed,
                  })
                }
                onUpdate={(patch) =>
                  onUpdateExercise(currentDay.id, ex.id, patch)
                }
                onDelete={() => onDeleteExercise(currentDay.id, ex.id)}
                onMoveUp={() => onMoveExercise(currentDay.id, idx, -1)}
                onMoveDown={() => onMoveExercise(currentDay.id, idx, 1)}
              />
            ))}

            <View style={styles.quickAddRow}>
              <Plus size={16} color={COLORS.textMuted} />
              <TextInput
                value={quickText}
                onChangeText={setQuickText}
                onSubmitEditing={handleQuickAdd}
                placeholder={t.quickAddPlaceholder}
                placeholderTextColor={COLORS.textMuted}
                style={styles.quickInput}
                returnKeyType="done"
              />
              {quickText.trim().length > 0 && (
                <TouchableOpacity onPress={handleQuickAdd}>
                  <Text style={[styles.addAction, { color: accentHex }]}>
                    {t.addBtn}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {totalCount > 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success,
                    );
                  }
                  onFinishWorkout(currentDay);
                }}
                style={[styles.finishBtn, { backgroundColor: accentHex }]}
              >
                <CheckCircle2 size={18} color="#000000" strokeWidth={2.5} />
                <Text style={styles.finishBtnText}>{t.finishBtn}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  dayMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  daySub: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
  },
  shiftChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  shiftChipText: {
    fontSize: 10,
    fontWeight: "800",
  },
  dayTitleInput: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    padding: 0,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  toolPanel: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    gap: 10,
  },
  shiftPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  shiftHoursInput: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0A0A0C",
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  copyBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    gap: 8,
  },
  copyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  copyDays: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  copyPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#1C1C20",
  },
  copyPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
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
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  quickAddRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    marginTop: 4,
  },
  quickInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  addAction: {
    fontSize: 13,
    fontWeight: "700",
  },
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 18,
  },
  finishBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000000",
  },
  restBox: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  restTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  restSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
});
