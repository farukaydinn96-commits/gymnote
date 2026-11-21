import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import { X } from "lucide-react-native";
import { Lang } from "../types/workout";
import { COLORS } from "../constants/theme";
import { STRINGS } from "../constants/i18n";
import { calculatePlates } from "../utils/plates";

interface Props {
  visible: boolean;
  initialWeight: string;
  accentHex: string;
  lang: Lang;
  onApplyWeight?: (newWeight: string) => void;
  onClose: () => void;
}

export const PlateCalculatorModal: React.FC<Props> = ({
  visible,
  initialWeight,
  accentHex,
  lang,
  onApplyWeight,
  onClose,
}) => {
  const [weightInput, setWeightInput] = useState(initialWeight || "60");
  const [barKg, setBarKg] = useState<20 | 15>(20);

  useEffect(() => {
    if (visible) {
      setWeightInput(
        initialWeight && parseFloat(initialWeight) > 0 ? initialWeight : "60",
      );
    }
  }, [visible, initialWeight]);

  if (!visible) return null;

  const t = STRINGS[lang];
  const numericTarget = parseFloat((weightInput || "0").replace(",", ".")) || 0;
  const breakdown = calculatePlates(numericTarget, barKg);

  // Plakaları grupla (ör: 2 × 20kg)
  const grouped: Array<{
    weight: number;
    count: number;
    color: string;
    textColor: string;
  }> = [];
  for (const p of breakdown.perSide) {
    const existing = grouped.find((g) => g.weight === p.weight);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.push({
        weight: p.weight,
        count: 1,
        color: p.color,
        textColor: p.textColor,
      });
    }
  }

  // SVG koordinat hesabı (Sol bar mili + sağ manşon üzerine dizilen plakalar)
  let cursorX = 76;
  const plateRects = breakdown.perSide.map((p, idx) => {
    const x = cursorX;
    cursorX += p.width + 3;
    return { ...p, x, key: `${p.weight}_${idx}` };
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.plateModalTitle}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Ağırlık Girişi & 20kg / 15kg Bar Seçimi */}
          <View style={styles.controlsRow}>
            <View style={styles.targetInputBox}>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                style={[styles.targetInput, { color: accentHex }]}
              />
              <Text style={styles.kgUnit}>KG</Text>
            </View>

            <View style={styles.barToggleGroup}>
              {([20, 15] as Array<20 | 15>).map((b) => {
                const active = barKg === b;
                return (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBarKg(b)}
                    style={[
                      styles.barPill,
                      active && {
                        borderColor: accentHex,
                        backgroundColor: "rgba(255,255,255,0.06)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.barPillText,
                        active && { color: accentHex },
                      ]}
                    >
                      Bar {b}kg
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SVG Görsel Olimpik Bar Manşonu */}
          <View style={styles.svgStage}>
            <Svg width="100%" height={120} viewBox="0 0 280 120">
              {/* Bar İç Mili */}
              <Line
                x1="12"
                y1="60"
                x2="66"
                y2="60"
                stroke="#71717A"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Manşon Stoperi (Collar) */}
              <Rect x="66" y="42" width="8" height="36" rx="2" fill="#A1A1AA" />
              {/* Dış Yükleme Manşonu (Sleeve) */}
              <Rect
                x="74"
                y="53"
                width="190"
                height="14"
                rx="3"
                fill="#52525B"
              />

              {/* Renkli Olimpik Plakalar */}
              {plateRects.map((pr) => (
                <Rect
                  key={pr.key}
                  x={pr.x}
                  y={60 - pr.height / 2}
                  width={pr.width}
                  height={pr.height}
                  rx={3}
                  fill={pr.color}
                  stroke="#09090B"
                  strokeWidth={1}
                />
              ))}
            </Svg>
          </View>

          <Text style={styles.sectionSub}>{t.perSideLabel}</Text>

          {grouped.length === 0 ? (
            <Text style={styles.emptyMsg}>{t.onlyBarMsg}</Text>
          ) : (
            <View style={styles.chipsRow}>
              {grouped.map((g) => (
                <View
                  key={g.weight}
                  style={[styles.plateBadge, { borderColor: g.color }]}
                >
                  <View
                    style={[styles.plateColorDot, { backgroundColor: g.color }]}
                  />
                  <Text style={styles.plateBadgeText}>
                    {g.count} × {g.weight} kg
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              if (onApplyWeight && breakdown.achievedWeight > 0) {
                onApplyWeight(String(breakdown.achievedWeight));
              }
              onClose();
            }}
            style={[styles.doneBtn, { backgroundColor: accentHex }]}
          >
            <Text style={styles.doneBtnText}>
              {breakdown.achievedWeight} kg · OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  sheet: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  targetInputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#08080B",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  targetInput: {
    width: 64,
    fontSize: 20,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    padding: 0,
  },
  kgUnit: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },
  barToggleGroup: {
    flexDirection: "row",
    gap: 6,
  },
  barPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#08080B",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  barPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textSecondary,
  },
  svgStage: {
    borderRadius: 14,
    backgroundColor: "#07070A",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    alignItems: "center",
  },
  sectionSub: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: COLORS.textSecondary,
  },
  emptyMsg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingVertical: 4,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  plateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#08080B",
    borderWidth: 1,
  },
  plateColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  plateBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  doneBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    fontVariant: ["tabular-nums"],
  },
});
