import React from "react";
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
import { Download, Upload, UserCheck } from "lucide-react-native";
import { AccentKey, AppSettings, DayPlan, Lang } from "../types/workout";
import { ACCENTS, COLORS } from "../constants/theme";
import { SPLIT_TEMPLATES } from "../constants/templates";
import { BG_PRESETS, BgPreset } from "../constants/backgrounds";
import { STRINGS } from "../constants/i18n";

interface Props {
  settings: AppSettings;
  accentHex: string;
  totalSessions: number;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onChangeLang: (lang: Lang) => void;
  onApplyTemplate: (days: DayPlan[], name: string) => void;
  onSelectPresetBg: (preset: BgPreset) => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
}

export const ProfileScreen: React.FC<Props> = ({
  settings,
  accentHex,
  totalSessions,
  onUpdateSettings,
  onChangeLang,
  onApplyTemplate,
  onSelectPresetBg,
  onOpenExport,
  onOpenImport,
}) => {
  const lang = settings.lang || "en";
  const t = STRINGS[lang];

  const darknessLevels = [
    { label: t.light, val: 0.25 },
    { label: t.medium, val: 0.45 },
    { label: t.dark, val: 0.65 },
  ];

  const autoRestOptions = [0, 60, 90, 120];
  const initials = (settings.userName || "GY")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>{t.profileTitle}</Text>

      {/* Sporcu Profil Kartı */}
      <View style={styles.athleteCard}>
        <View style={[styles.avatar, { borderColor: accentHex }]}>
          <Text style={[styles.avatarText, { color: accentHex }]}>
            {initials}
          </Text>
        </View>

        <View style={styles.athleteInputs}>
          <TextInput
            value={settings.userName || ""}
            onChangeText={(userName) => onUpdateSettings({ userName })}
            placeholder={t.athleteNamePlaceholder}
            placeholderTextColor={COLORS.textMuted}
            style={styles.nameInput}
          />
          <TextInput
            value={settings.userGoal || ""}
            onChangeText={(userGoal) => onUpdateSettings({ userGoal })}
            placeholder={t.athleteGoalPlaceholder}
            placeholderTextColor={COLORS.textMuted}
            style={styles.goalInput}
          />
        </View>

        <View style={styles.weightBox}>
          <Text style={styles.weightPrefix}>KG</Text>
          <TextInput
            value={settings.bodyWeight || ""}
            onChangeText={(bodyWeight) => onUpdateSettings({ bodyWeight })}
            placeholder="78.5"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            style={[styles.weightInput, { color: accentHex }]}
          />
        </View>
      </View>

      {/* Hazır Split Şablonları */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t.splitTemplates}</Text>
        <View style={styles.templateList}>
          {SPLIT_TEMPLATES.map((tpl) => (
            <TouchableOpacity
              key={tpl.id}
              activeOpacity={0.75}
              onPress={() => onApplyTemplate(tpl.days, tpl.name[lang])}
              style={styles.templateRow}
            >
              <View style={styles.flex}>
                <Text style={styles.templateName}>{tpl.name[lang]}</Text>
                <Text style={styles.templateSub}>{tpl.sub[lang]}</Text>
              </View>
              <Text style={[styles.applyText, { color: accentHex }]}>
                {t.loadBtn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tema, Dil, Otomatik Sayaç ve Sahneler */}
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
                  onUpdateSettings({ accent: key });
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
          <Text style={styles.settingLabel}>{t.autoRestLabel}</Text>
          <View style={styles.darknessPills}>
            {autoRestOptions.map((sec) => {
              const current = settings.autoRestSec ?? 90;
              const active = current === sec;
              return (
                <TouchableOpacity
                  key={sec}
                  onPress={() => onUpdateSettings({ autoRestSec: sec })}
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
                    {sec === 0 ? "OFF" : `${sec}s`}
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
            onValueChange={(oledMode) => onUpdateSettings({ oledMode })}
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
                  <Text style={styles.presetLabel}>{bg.label[lang]}</Text>
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
                  onPress={() => onUpdateSettings({ bgOpacity: lvl.val })}
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

      {/* Yedekleme */}
      <View style={styles.sectionCard}>
        <View style={styles.backupHeader}>
          <Text style={styles.sectionTitle}>{t.backupTitle}</Text>
          <View style={styles.totalSessionsChip}>
            <UserCheck size={12} color={accentHex} />
            <Text style={styles.totalSessionsText}>{totalSessions}</Text>
          </View>
        </View>

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
  athleteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: "#09090B",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
  },
  athleteInputs: {
    flex: 1,
    gap: 2,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    paddingVertical: 2,
  },
  goalInput: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingVertical: 2,
  },
  weightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#09090B",
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
  templateList: {
    gap: 8,
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#09090B",
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
    gap: 8,
  },
  settingLabel: {
    flex: 1,
    fontSize: 13,
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
    backgroundColor: "rgba(0,0,0,0.72)",
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
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#09090B",
  },
  darkPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  backupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalSessionsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  totalSessionsText: {
    fontSize: 12,
    fontWeight: "800",
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
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backupBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});
