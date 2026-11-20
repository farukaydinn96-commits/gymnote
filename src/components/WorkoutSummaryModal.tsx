import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, Trophy, X } from "lucide-react-native";
import { Lang, WorkoutLog } from "../types/workout";
import { COLORS } from "../constants/theme";
import { STRINGS } from "../constants/i18n";

interface Props {
  log: WorkoutLog | null;
  quote: string;
  bgSource: ImageSourcePropType | null;
  accentHex: string;
  lang: Lang;
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<Props> = ({
  log,
  quote,
  bgSource,
  accentHex,
  lang,
  onClose,
}) => {
  if (!log) return null;
  const t = STRINGS[lang];
  const prCount = log.prCount || 0;

  return (
    <Modal
      visible={!!log}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, !bgSource && styles.solidCard]}>
          {bgSource && (
            <Image
              source={bgSource}
              style={styles.bgImage}
              resizeMode="cover"
            />
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.92)"] as const}
            style={styles.overlay}
          >
            <View style={styles.topRow}>
              <Text style={[styles.brand, { color: accentHex }]}>
                GYMNOTE // SESSION LOG
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.center}>
              <CheckCircle2 size={38} color={accentHex} strokeWidth={2.2} />
              <Text style={styles.date}>{log.dateISO}</Text>
              <Text style={styles.title}>{log.dayTitle}</Text>
              <Text style={styles.quote}>“{quote}”</Text>
            </View>

            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: accentHex }]}>
                  {log.completedCount}/{log.totalCount}
                </Text>
                <Text style={styles.statLabel}>{t.completedLabel}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <View style={styles.prRow}>
                  <Trophy
                    size={15}
                    color={prCount > 0 ? accentHex : COLORS.textPrimary}
                  />
                  <Text
                    style={[
                      styles.statVal,
                      prCount > 0 && { color: accentHex },
                    ]}
                  >
                    {prCount}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{t.prBrokenLabel}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <Text style={styles.statVal}>DONE</Text>
                <Text style={styles.statLabel}>{t.statusLabel}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={[styles.doneBtn, { backgroundColor: accentHex }]}
            >
              <Text style={styles.doneBtnText}>{t.continueBtn}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    height: 480,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    position: "relative",
    backgroundColor: "#0E0E11",
  },
  solidCard: {
    backgroundColor: "#0E0E11",
  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    padding: 22,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.6,
  },
  quote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  prRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statVal: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 3,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
});
