import React from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { COLORS } from "../constants/theme";

interface Props {
  quote: string;
  bgSource: ImageSourcePropType | null;
  bgOpacity: number;
  accentHex: string;
  onChangeQuote: (quote: string) => void;
}

export const MotivationCard: React.FC<Props> = ({
  quote,
  bgSource,
  bgOpacity,
  accentHex,
  onChangeQuote,
}) => {
  const inner = (
    <View
      style={[
        styles.overlay,
        { backgroundColor: bgSource ? `rgba(0,0,0,${bgOpacity})` : "#070709" },
      ]}
    >
      <Text style={[styles.tag, { color: accentHex }]}>GYMNOTE // FOCUS</Text>
      <TextInput
        value={quote}
        onChangeText={onChangeQuote}
        placeholder="discipline."
        placeholderTextColor={COLORS.textMuted}
        style={styles.quoteInput}
      />
    </View>
  );

  if (!bgSource) {
    return <View style={styles.container}>{inner}</View>;
  }

  return (
    <ImageBackground
      source={bgSource}
      style={styles.container}
      imageStyle={styles.img}
      resizeMode="cover"
    >
      {inner}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 156,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  img: {
    borderRadius: 18,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  tag: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  quoteInput: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    padding: 0,
  },
});
