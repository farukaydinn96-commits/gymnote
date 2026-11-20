import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Timer, Play, Pause, RotateCcw, X } from "lucide-react-native";
import { COLORS } from "../constants/theme";

interface Props {
  accentHex: string;
  isDesktop: boolean;
  label: string;
}

const PRESETS = [60, 90, 120];

export const RestTimerPill: React.FC<Props> = ({
  accentHex,
  isDesktop,
  label,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [selectedPreset, setSelectedPreset] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const selectPreset = (sec: number) => {
    setSelectedPreset(sec);
    setSecondsLeft(sec);
    setRunning(true);
  };

  if (!expanded) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded(true)}
        style={[
          styles.collapsedPill,
          isDesktop ? styles.posDesktop : styles.posMobile,
          running && { borderColor: accentHex },
        ]}
      >
        <Timer size={15} color={running ? accentHex : COLORS.textPrimary} />
        <Text style={[styles.collapsedText, running && { color: accentHex }]}>
          {running ? formatTime(secondsLeft) : label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.expandedCard,
        isDesktop ? styles.posDesktop : styles.posMobile,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.timerDisplay}>
          <Timer size={16} color={accentHex} />
          <Text
            style={[styles.timeText, secondsLeft === 0 && { color: accentHex }]}
          >
            {formatTime(secondsLeft)}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => {
              if (secondsLeft === 0) setSecondsLeft(selectedPreset);
              setRunning((r) => !r);
            }}
            style={[styles.ctrlBtn, { backgroundColor: accentHex }]}
          >
            {running ? (
              <Pause size={13} color="#000000" fill="#000000" />
            ) : (
              <Play size={13} color="#000000" fill="#000000" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setRunning(false);
              setSecondsLeft(selectedPreset);
            }}
            style={styles.iconBtn}
          >
            <RotateCcw size={13} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setExpanded(false)}
            style={styles.iconBtn}
          >
            <X size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.presetsRow}>
        {PRESETS.map((sec) => {
          const active = selectedPreset === sec;
          return (
            <TouchableOpacity
              key={sec}
              onPress={() => selectPreset(sec)}
              style={[
                styles.presetBtn,
                active && {
                  borderColor: accentHex,
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              ]}
            >
              <Text style={[styles.presetText, active && { color: accentHex }]}>
                {sec}s
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  posMobile: {
    position: "absolute",
    right: 16,
    bottom: 86,
    zIndex: 50,
  },
  posDesktop: {
    position: "absolute",
    right: 28,
    bottom: 28,
    zIndex: 50,
  },
  collapsedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#141417",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  collapsedText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  expandedCard: {
    width: 224,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#121215",
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ctrlBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  presetsRow: {
    flexDirection: "row",
    gap: 6,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  presetText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },
});
