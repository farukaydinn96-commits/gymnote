import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { CheckCircle2, Trophy } from "lucide-react-native";
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

  const cardInner = (
    <View style={styles.inner}>
      <View style={styles.badgeRow}>
        <CheckCircle2 size={14} color={accentHex} />
        <Text style={[styles.badgeText, { color: accentHex }]}>
          {t.summaryBadge}
        </Text>
      </View>

      <Text style={styles.dayTitle}>{log.dayTitle}</Text>
      <Text style={styles.dateText}>{log.dateISO}</Text>

      <View style={styles.statsBox}>
        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: accentHex }]}>
            {log.completedCount}/{log.totalCount}
          </Text>
          <Text style={styles.statLabel}>{t.completedStat}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCol}>
          <View style={styles.prRow}>
            <Trophy size={16} color={accentHex} />
            <Text style={styles.statNum}>{log.prCount || 0}</Text>
          </View>
          <Text style={styles.statLabel}>{t.newPrStat}</Text>
        </View>
      </View>

      <Text style={styles.quoteText}>“{quote}”</Text>

      <TouchableOpacity
        onPress={onClose}
        style={[styles.closeBtn, { backgroundColor: accentHex }]}
      >
        <Text style={styles.closeBtnText}>{t.closeBtn}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {bgSource ? (
            <ImageBackground
              source={bgSource}
              resizeMode="cover"
              imageStyle={styles.bgImg}
            >
              {cardInner}
            </ImageBackground>
          ) : (
            cardInner
          )}
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
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  bgImg: {
    opacity: 0.28,
  },
  inner: {
    padding: 22,
    backgroundColor: "rgba(8,8,10,0.82)",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  statsBox: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  prRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statNum: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: COLORS.textSecondary,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: "italic",
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 18,
  },
  closeBtn: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
});
