import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { X } from "lucide-react-native";
import { COLORS } from "../constants/theme";
import { Lang } from "../types/workout";
import { STRINGS } from "../constants/i18n";

interface Props {
  mode: "export" | "import" | null;
  exportJson: string;
  accentHex: string;
  lang: Lang;
  onImport: (rawJson: string) => void;
  onClose: () => void;
}

export const BackupModal: React.FC<Props> = ({
  mode,
  exportJson,
  accentHex,
  lang,
  onImport,
  onClose,
}) => {
  const [text, setText] = useState("");
  const t = STRINGS[lang];

  useEffect(() => {
    if (mode === "export") setText(exportJson);
    if (mode === "import") setText("");
  }, [mode, exportJson]);

  if (!mode) return null;

  return (
    <Modal
      visible={!!mode}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === "export" ? t.backupModalExport : t.backupModalImport}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            editable={mode === "import"}
            selectTextOnFocus={mode === "export"}
            placeholder='{"days": [...], "logs": [...]}'
            placeholderTextColor={COLORS.textMuted}
            style={styles.textArea}
          />

          {mode === "import" ? (
            <TouchableOpacity
              onPress={() => onImport(text)}
              style={[styles.primaryBtn, { backgroundColor: accentHex }]}
            >
              <Text style={styles.primaryBtnText}>{t.applyBackup}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onClose}
              style={[styles.primaryBtn, { backgroundColor: accentHex }]}
            >
              <Text style={styles.primaryBtnText}>{t.close}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#101014",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSpecular,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  textArea: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#08080A",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 12,
    textAlignVertical: "top",
  },
  primaryBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
});
