import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { Lang, MuscleGroup } from "../types/workout";
import { COLORS } from "../constants/theme";
import { MUSCLE_LABELS, STRINGS } from "../constants/i18n";

interface Props {
  weeklySets: Record<MuscleGroup, number>;
  accentHex: string;
  lang: Lang;
}

export const MuscleMapCard: React.FC<Props> = ({
  weeklySets,
  accentHex,
  lang,
}) => {
  const t = STRINGS[lang];
  const mLabels = MUSCLE_LABELS[lang];

  const fillFor = (muscle: MuscleGroup) => {
    const sets = weeklySets[muscle] || 0;
    if (sets <= 0) return "#1B1B22";
    return accentHex;
  };

  const opacityFor = (muscle: MuscleGroup) => {
    const sets = weeklySets[muscle] || 0;
    if (sets <= 0) return 1;
    if (sets <= 4) return 0.42;
    if (sets <= 9) return 0.72;
    return 1;
  };

  const sortedActive = (Object.keys(weeklySets) as MuscleGroup[])
    .filter((m) => weeklySets[m] > 0)
    .sort((a, b) => weeklySets[b] - weeklySets[a]);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t.muscleMapTitle}</Text>

      <View style={styles.figuresRow}>
        {/* ÖN ANATOMİK GÖRÜNÜM */}
        <View style={styles.figureCol}>
          <Svg width={125} height={215} viewBox="0 0 120 220">
            <G stroke="#2E2E38" strokeWidth={1.2}>
              {/* Baş & Boyun */}
              <Circle cx="60" cy="20" r="13" fill="#16161C" />
              <Rect x="54" y="33" width="12" height="7" rx="3" fill="#16161C" />

              {/* Omuzlar (Deltoids) */}
              <Path
                d="M27 44 Q35 38 44 42 L42 58 Q30 57 26 49 Z"
                fill={fillFor("shoulders")}
                fillOpacity={opacityFor("shoulders")}
              />
              <Path
                d="M93 44 Q85 38 76 42 L78 58 Q90 57 94 49 Z"
                fill={fillFor("shoulders")}
                fillOpacity={opacityFor("shoulders")}
              />

              {/* Göğüs (Pectorals) */}
              <Path
                d="M43 42 L59 42 L59 64 Q48 66 42 59 Z"
                fill={fillFor("chest")}
                fillOpacity={opacityFor("chest")}
              />
              <Path
                d="M77 42 L61 42 L61 64 Q72 66 78 59 Z"
                fill={fillFor("chest")}
                fillOpacity={opacityFor("chest")}
              />

              {/* Biceps & Ön Kol */}
              <Rect
                x="23"
                y="59"
                width="13"
                height="26"
                rx="6"
                fill={fillFor("biceps")}
                fillOpacity={opacityFor("biceps")}
              />
              <Rect
                x="84"
                y="59"
                width="13"
                height="26"
                rx="6"
                fill={fillFor("biceps")}
                fillOpacity={opacityFor("biceps")}
              />
              <Rect
                x="20"
                y="88"
                width="11"
                height="26"
                rx="5"
                fill="#16161C"
              />
              <Rect
                x="89"
                y="88"
                width="11"
                height="26"
                rx="5"
                fill="#16161C"
              />

              {/* Karın (Core / Abs) */}
              <Rect
                x="45"
                y="67"
                width="30"
                height="40"
                rx="7"
                fill={fillFor("core")}
                fillOpacity={opacityFor("core")}
              />

              {/* Ön Bacak (Quads) */}
              <Path
                d="M42 111 L58 111 L56 158 L40 158 Z"
                fill={fillFor("quads")}
                fillOpacity={opacityFor("quads")}
              />
              <Path
                d="M62 111 L78 111 L80 158 L64 158 Z"
                fill={fillFor("quads")}
                fillOpacity={opacityFor("quads")}
              />

              {/* Kalf (Ön Tibia/Calf) */}
              <Rect
                x="41"
                y="163"
                width="13"
                height="38"
                rx="6"
                fill={fillFor("calves")}
                fillOpacity={opacityFor("calves")}
              />
              <Rect
                x="66"
                y="163"
                width="13"
                height="38"
                rx="6"
                fill={fillFor("calves")}
                fillOpacity={opacityFor("calves")}
              />
            </G>
          </Svg>
          <Text style={styles.figureCaption}>{t.frontView}</Text>
        </View>

        {/* ARKA ANATOMİK GÖRÜNÜM */}
        <View style={styles.figureCol}>
          <Svg width={125} height={215} viewBox="0 0 120 220">
            <G stroke="#2E2E38" strokeWidth={1.2}>
              {/* Baş & Boyun */}
              <Circle cx="60" cy="20" r="13" fill="#16161C" />
              <Rect x="54" y="33" width="12" height="7" rx="3" fill="#16161C" />

              {/* Arka Omuz */}
              <Path
                d="M27 44 Q35 38 43 42 L41 56 Q30 55 26 49 Z"
                fill={fillFor("shoulders")}
                fillOpacity={opacityFor("shoulders")}
              />
              <Path
                d="M93 44 Q85 38 77 42 L79 56 Q90 55 94 49 Z"
                fill={fillFor("shoulders")}
                fillOpacity={opacityFor("shoulders")}
              />

              {/* Sırt (Lats & Traps) */}
              <Path
                d="M43 41 L77 41 L80 72 L68 96 L52 96 L40 72 Z"
                fill={fillFor("back")}
                fillOpacity={opacityFor("back")}
              />

              {/* Triceps & Ön Kol */}
              <Rect
                x="23"
                y="58"
                width="13"
                height="27"
                rx="6"
                fill={fillFor("triceps")}
                fillOpacity={opacityFor("triceps")}
              />
              <Rect
                x="84"
                y="58"
                width="13"
                height="27"
                rx="6"
                fill={fillFor("triceps")}
                fillOpacity={opacityFor("triceps")}
              />
              <Rect
                x="20"
                y="88"
                width="11"
                height="26"
                rx="5"
                fill="#16161C"
              />
              <Rect
                x="89"
                y="88"
                width="11"
                height="26"
                rx="5"
                fill="#16161C"
              />

              {/* Kalça (Glutes) */}
              <Rect
                x="42"
                y="99"
                width="36"
                height="22"
                rx="9"
                fill={fillFor("glutes")}
                fillOpacity={opacityFor("glutes")}
              />

              {/* Arka Bacak (Hamstrings) */}
              <Path
                d="M42 124 L58 124 L56 160 L41 160 Z"
                fill={fillFor("hamstrings")}
                fillOpacity={opacityFor("hamstrings")}
              />
              <Path
                d="M62 124 L78 124 L79 160 L64 160 Z"
                fill={fillFor("hamstrings")}
                fillOpacity={opacityFor("hamstrings")}
              />

              {/* Kalf (Gastrocnemius) */}
              <Rect
                x="41"
                y="164"
                width="14"
                height="37"
                rx="7"
                fill={fillFor("calves")}
                fillOpacity={opacityFor("calves")}
              />
              <Rect
                x="65"
                y="164"
                width="14"
                height="37"
                rx="7"
                fill={fillFor("calves")}
                fillOpacity={opacityFor("calves")}
              />
            </G>
          </Svg>
          <Text style={styles.figureCaption}>{t.backView}</Text>
        </View>
      </View>

      {/* Aktif Kas Set Rozetleri */}
      <View style={styles.chipsWrap}>
        {(Object.keys(mLabels) as MuscleGroup[]).map((m) => {
          const count = weeklySets[m] || 0;
          const active = count > 0;
          return (
            <View
              key={m}
              style={[
                styles.muscleChip,
                active && {
                  borderColor: accentHex,
                  backgroundColor: "rgba(255,255,255,0.05)",
                },
              ]}
            >
              <Text
                style={[
                  styles.muscleChipText,
                  active && { color: COLORS.textPrimary },
                ]}
              >
                {mLabels[m]}
              </Text>
              <Text
                style={[
                  styles.muscleChipCount,
                  { color: active ? accentHex : COLORS.textMuted },
                ]}
              >
                {count} {t.setsDone}
              </Text>
            </View>
          );
        })}
      </View>

      {sortedActive.length === 0 && (
        <Text style={styles.hintText}>{t.chartEmptyHint}</Text>
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  figuresRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#08080B",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  figureCol: {
    alignItems: "center",
    gap: 4,
  },
  figureCaption: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  muscleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#09090C",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  muscleChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  muscleChipCount: {
    fontSize: 11,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 10,
    textAlign: "center",
  },
});
