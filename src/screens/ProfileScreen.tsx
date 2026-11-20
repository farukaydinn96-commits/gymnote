import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  ChevronDown,
  ChevronUp,
  Flame,
  Download,
  Upload,
  Trophy,
} from "lucide-react-native";
import {
  AccentKey,
  AppSettings,
  DayPlan,
  Lang,
  WorkoutLog,
} from "../types/workout";
import { ACCENTS, COLORS } from "../constants/theme";
import { SPLIT_TEMPLATES } from "../constants/templates";
import { BG_PRESETS, BgPreset } from "../constants/backgrounds";
import { STRINGS } from "../constants/i18n";

interface Props {
  logs: WorkoutLog[];
  settings: AppSettings;
  accentHex: string;
  onChangeAccent: (accent: AccentKey) => void;
  onToggleOled: (val: boolean) => void;
  onChangeLang: (lang: Lang) => void;
  onChangeBodyWeight: (val: string) => void;
  onApplyTemplate: (days: DayPlan[], name: string) => void;
  onSelectPresetBg: (preset: BgPreset) => void;
  onChangeBgOpacity: (val: number) => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
}

export const ProfileScreen: React.FC<Props> = ({
  logs,
  settings,
  accentHex,
  onChangeAccent,
  onToggleOled,
  onChangeLang,
  onChangeBodyWeight,
  onApplyTemplate,
  onSelectPresetBg,
  onChangeBgOpacity,
  onOpenExport,
  onOpenImport,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const lang = settings.lang || "tr";
  const t = STRINGS[lang];

  const darknessLevels = [
    { label: t.light, val: 0.25 },
    { label: t.medium, val: 0.45 },
    { label: t.dark, val: 0.65 },
  ];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const loggedDates = new Set(logs.map((l) => l.dateISO));

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const thisMonthCount = logs.filter((l) =>
    l.dateISO.startsWith(monthPrefix),
  ).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thisWeekCount = logs.filter(
    (l) => new Date(l.dateISO) >= sevenDaysAgo,
  ).length;

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const iso = cursor.toISOString().split("T")[0];
    if (loggedDates.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>{t.profileTitle}</Text>
        <View style={styles.weightBox}>
          <Text style={styles.weightPrefix}>KG</Text>
          <TextInput
            value={settings.bodyWeight || ""}
            onChangeText={onChangeBodyWeight}
            placeholder="78.5"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            style={[styles.weightInput, { color: accentHex }]}
          />
        </View>
      </View>

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

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.monthlyMatrix}</Text>
        <View style={styles.matrixGrid}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const iso = `${monthPrefix}-${String(dayNum).padStart(2, "0")}`;
            const active = loggedDates.has(iso);
            const isToday = dayNum === now.getDate();

            return (
              <View
                key={iso}
                style={[
                  styles.matrixCell,
                  active && {
                    backgroundColor: accentHex,
                    borderColor: accentHex,
                  },
                  isToday && !active && { borderColor: COLORS.textSecondary },
                ]}
              >
                <Text
                  style={[
                    styles.matrixText,
                    active && { color: "#000000", fontWeight: "800" },
                  ]}
                >
                  {dayNum}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.splitTemplates}</Text>
        <View style={styles.templateList}>
          {SPLIT_TEMPLATES.map((tpl) => (
            <TouchableOpacity
              key={tpl.id}
              activeOpacity={0.75}
              onPress={() => onApplyTemplate(tpl.days, tpl.name)}
              style={styles.templateRow}
            >
              <View style={styles.flex}>
                <Text style={styles.templateName}>{tpl.name}</Text>
                <Text style={styles.templateSub}>{tpl.sub}</Text>
              </View>
              <Text style={[styles.applyText, { color: accentHex }]}>
                {t.loadBtn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.themeAtmosphere}</Text>

        <View style={styles.accentRow}>
          {(Object.keys(ACCENTS) as AccentKey[]).map((key) => {
            const item = ACCENTS[key];
            const selected = settings.accent === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  onChangeAccent(key);
                }}
                style={[
                  styles.colorDot,
                  { backgroundColor: item.hex },
                  selected && styles.colorDotSelected,
                ]}
              />
            );
          })}
        </View>

        {/* Dil Seçici */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t.languageLabel}</Text>
          <View style={styles.darknessPills}>
            {(["tr", "en"] as Lang[]).map((code) => {
              const active = lang === code;
              return (
                <TouchableOpacity
                  key={code}
                  onPress={() => onChangeLang(code)}
                  style={[
                    styles.darkPill,
                    active && {
                      borderColor: accentHex,
                      backgroundColor: "rgba(255,255,255,0.06)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.darkPillText,
                      active && { color: accentHex },
                    ]}
                  >
                    {code.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t.oledMode}</Text>
          <Switch
            value={settings.oledMode}
            onValueChange={onToggleOled}
            trackColor={{ false: COLORS.border, true: accentHex }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.subLabel}>{t.motivationScenes}</Text>
        <View style={styles.presetGrid}>
          {BG_PRESETS.map((bg) => {
            const active = !settings.oledMode && settings.presetBgId === bg.id;
            return (
              <TouchableOpacity
                key={bg.id}
                onPress={() => onSelectPresetBg(bg)}
                activeOpacity={0.8}
                style={[
                  styles.presetThumb,
                  active && { borderColor: accentHex, borderWidth: 2 },
                ]}
              >
                <Image
                  source={bg.source}
                  style={styles.presetImg}
                  resizeMode="cover"
                />
                <View style={styles.presetLabelWrap}>
                  <Text style={styles.presetLabel}>{bg.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.darknessRow}>
          <Text style={styles.subLabel}>{t.darkness}</Text>
          <View style={styles.darknessPills}>
            {darknessLevels.map((lvl) => {
              const active = Math.abs(settings.bgOpacity - lvl.val) < 0.05;
              return (
                <TouchableOpacity
                  key={lvl.label}
                  onPress={() => onChangeBgOpacity(lvl.val)}
                  style={[
                    styles.darkPill,
                    active && {
                      borderColor: accentHex,
                      backgroundColor: "rgba(255,255,255,0.06)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.darkPillText,
                      active && { color: accentHex },
                    ]}
                  >
                    {lvl.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Veri Yedekleme & Geri Yükleme */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.backupTitle}</Text>
        <View style={styles.backupRow}>
          <TouchableOpacity onPress={onOpenExport} style={styles.backupBtn}>
            <Download size={15} color={accentHex} />
            <Text style={styles.backupBtnText}>{t.exportBtn}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onOpenImport} style={styles.backupBtn}>
            <Upload size={15} color={COLORS.textPrimary} />
            <Text style={styles.backupBtnText}>{t.importBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.historyTitle}</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>{t.emptyHistory}</Text>
        ) : (
          logs.slice(0, 12).map((log) => {
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
                    <Text style={styles.logDate}>{log.dateISO}</Text>
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
    paddingBottom: 110,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  weightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weightPrefix: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },
  weightInput: {
    width: 44,
    fontSize: 14,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    padding: 0,
    textAlign: "right",
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
  subLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  matrixGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  matrixCell: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0C",
  },
  matrixText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    fontVariant: ["tabular-nums"],
  },
  templateList: {
    gap: 8,
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#0A0A0C",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  templateName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  templateSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  applyText: {
    fontSize: 12,
    fontWeight: "800",
  },
  accentRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  presetGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  presetThumb: {
    flex: 1,
    height: 62,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetImg: {
    width: "100%",
    height: "100%",
  },
  presetLabelWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.68)",
    paddingVertical: 3,
    alignItems: "center",
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  darknessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  darknessPills: {
    flexDirection: "row",
    gap: 6,
  },
  darkPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#0A0A0C",
  },
  darkPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  backupRow: {
    flexDirection: "row",
    gap: 10,
  },
  backupBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#0A0A0C",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backupBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
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
    color: COLORS.textMuted,
    fontVariant: ["tabular-nums"],
  },
});
