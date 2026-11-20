import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants/theme";

interface Props {
  quote: string;
  bgSource: ImageSourcePropType | null;
  bgOpacity: number;
  accentHex: string;
  onChangeQuote: (text: string) => void;
}

export const MotivationCard: React.FC<Props> = ({
  quote,
  bgSource,
  bgOpacity,
  accentHex,
  onChangeQuote,
}) => {
  const [editing, setEditing] = useState(false);

  const topAlpha = Math.max(0.05, bgOpacity - 0.3);
  const midAlpha = Math.max(0.1, bgOpacity - 0.2);
  const bottomAlpha = Math.min(0.88, bgOpacity + 0.3);

  return (
    <View style={[styles.card, !bgSource && styles.oledCard]}>
      {bgSource && (
        <Image source={bgSource} style={styles.bgImage} resizeMode="cover" />
      )}

      <LinearGradient
        colors={
          [
            `rgba(0,0,0,${topAlpha})`,
            `rgba(0,0,0,${midAlpha})`,
            `rgba(0,0,0,${bottomAlpha})`,
          ] as const
        }
        locations={[0, 0.5, 1] as const}
        style={styles.overlay}
      >
        <View style={styles.topRow}>
          <Text style={[styles.tag, { color: accentHex }]}>
            GYMNOTE // FOCUS
          </Text>
        </View>

        {editing ? (
          <TextInput
            value={quote}
            onChangeText={onChangeQuote}
            onBlur={() => setEditing(false)}
            autoFocus
            style={styles.quoteInput}
            placeholder="Motivasyon sözün..."
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity
            onPress={() => setEditing(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.quote}>{quote}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    marginBottom: 16,
    position: "relative",
    backgroundColor: "#0A0A0C",
  },
  oledCard: {
    height: 124,
    backgroundColor: COLORS.surface,
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
    padding: 16,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  quote: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  quoteInput: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    padding: 0,
  },
});
