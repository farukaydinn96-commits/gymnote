import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Copy, Check, X, Upload } from "lucide-react-native";
import { Lang } from "../types/workout";
import { COLORS } from "../constants/theme";
import { STRINGS } from "../constants/i18n";

interface Props {
  mode: "export" | "import" | null;
  exportJson: string;
  accentHex: string;
  lang: Lang;
  onImport: (raw: string) => void;
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
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);

  if (!mode) return null;
  const t = STRINGS[lang];
  const isExport = mode === "export";

  const handleCopy = async () => {
    if (
      Platform.OS === "web" &&
      typeof navigator !== "undefined" &&
      navigator.clipboard
    ) {
      await navigator.clipboard.writeText(exportJson);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isExport ? t.exportModalTitle : t.importModalTitle}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sub}>{isExport ? t.exportSub : t.importSub}</Text>

          <TextInput
            value={isExport ? exportJson : importText}
            onChangeText={isExport ? undefined : setImportText}
            editable={!isExport}
            multiline
            placeholder="{ ... }"
            placeholderTextColor={COLORS.textMuted}
            style={styles.jsonBox}
          />

          {isExport ? (
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.primaryBtn, { backgroundColor: accentHex }]}
            >
              {copied ? (
                <Check size={16} color="#000000" />
              ) : (
                <Copy size={16} color="#000000" />
              )}
              <Text style={styles.primaryBtnText}>
                {copied ? t.copied : t.copyJson}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                onImport(importText);
                setImportText("");
              }}
              style={[styles.primaryBtn, { backgroundColor: accentHex }]}
            >
              <Upload size={16} color="#000000" />
              <Text style={styles.primaryBtnText}>{t.restoreBtn}</Text>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  sheet: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 18,
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
  closeIcon: {
    padding: 4,
  },
  sub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  jsonBox: {
    height: 170,
    borderRadius: 12,
    backgroundColor: "#070709",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 11,
    textAlignVertical: "top",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
});
