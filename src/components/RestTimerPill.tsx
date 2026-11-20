import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Timer, X, RotateCcw } from "lucide-react-native";
import { COLORS } from "../constants/theme";

interface Props {
  accentHex: string;
  label: string;
  autoTrigger?: { seconds: number; nonce: number } | null;
}

const PRESETS = [60, 90, 120, 180];

export const RestTimerPill: React.FC<Props> = ({
  accentHex,
  label,
  autoTrigger,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (autoTrigger && autoTrigger.nonce > 0 && autoTrigger.seconds > 0) {
      setSecondsLeft(autoTrigger.seconds);
      setRunning(true);
    }
  }, [autoTrigger]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => {
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
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  const startPreset = (sec: number) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSecondsLeft(sec);
    setRunning(true);
    setExpanded(false);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <View style={styles.wrapper}>
      {expanded && (
        <View style={styles.menu}>
          {PRESETS.map((sec) => (
            <TouchableOpacity
              key={sec}
              onPress={() => startPreset(sec)}
              style={styles.presetBtn}
            >
              <Text style={styles.presetText}>{sec}s</Text>
            </TouchableOpacity>
          ))}
          {secondsLeft > 0 && (
            <TouchableOpacity
              onPress={() => {
                setRunning(false);
                setSecondsLeft(0);
                setExpanded(false);
              }}
              style={styles.resetBtn}
            >
              <RotateCcw size={13} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded((p) => !p)}
        style={[
          styles.pill,
          running && { borderColor: accentHex, backgroundColor: "#11130A" },
        ]}
      >
        <Timer size={15} color={running ? accentHex : COLORS.textSecondary} />
        <Text style={[styles.pillText, running && { color: accentHex }]}>
          {secondsLeft > 0 ? formatTime(secondsLeft) : label}
        </Text>
        {expanded && <X size={13} color={COLORS.textSecondary} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    right: 18,
    bottom: 88,
    alignItems: "flex-end",
    gap: 8,
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
    borderRadius: 14,
    backgroundColor: "#121216",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#121216",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
});
