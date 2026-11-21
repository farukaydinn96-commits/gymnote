import React from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Platform,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 760;

  return (
    <View style={[styles.container, { height: isDesktop ? 210 : 165 }]}>
      {bgSource && (
        <Image
          source={bgSource}
          resizeMode="cover"
          style={[
            styles.bgImage,
            Platform.OS === "web"
              ? ({ objectPosition: "center 30%" } as any)
              : null,
          ]}
        />
      )}

      <View
        style={[
          styles.overlay,
          {
            backgroundColor: bgSource
              ? `rgba(0, 0, 0, ${Math.min(bgOpacity, 0.55)})`
              : "#070709",
          },
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    position: "relative",
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18,
  },
  tag: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  quoteInput: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    padding: 0,
  },
});
