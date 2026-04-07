/**
 * P2 - Screen 2: PROTECTED
 * Claim has been submitted, user sees confirmation
 * WebSocket listens for processing updates
 */

import { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import StatusBadge from "../components/StatusBadge";
import useWebSocket from "../hooks/useWebSocket";
import ClaimsAPI from "../services/api";

export default function ProtectedScreen({ navigation, route }) {
  const { claim: initialClaim } = route.params || {};
  const [claim, setClaim] = useState(initialClaim);
  const [pulseAnim] = useState(new Animated.Value(1));
  const { isConnected, subscribe } = useWebSocket();

  // ─── Pulse animation for shield icon ────────────────
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ─── Listen for WebSocket status updates ────────────
  useEffect(() => {
    if (!claim) return;

    const unsubStatus = subscribe("status_update", (data) => {
      if (data.claim_id === claim.claim_id) {
        console.log(`📡 Status update for ${claim.claim_id}:`, data.new_status);
        setClaim(data.claim);

        // Auto-navigate based on new status
        if (data.new_status === "claim_submitted" || data.new_status === "processing") {
          navigation.navigate("Claim", { claim: data.claim });
        } else if (data.new_status === "approved") {
          navigation.navigate("Approved", { claim: data.claim });
        }
      }
    });

    const unsubOCR = subscribe("ocr_complete", (data) => {
      if (data.claim_id === claim.claim_id) {
        setClaim(data.claim);
        Alert.alert(
          "📄 Document Processed",
          `OCR extracted total: $${data.ocr_extracted_total?.toFixed(2) || "N/A"}`
        );
      }
    });

    return () => {
      unsubStatus();
      unsubOCR();
    };
  }, [claim?.claim_id]);

  // ─── Advance to Claim screen ───────────────────────
  const handleSubmitClaim = async () => {
    try {
      const updated = await ClaimsAPI.updateClaim(claim.claim_id, {
        status: "claim_submitted",
      });
      setClaim(updated);
      navigation.navigate("Claim", { claim: updated });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (!claim) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No claim data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Connection indicator */}
      <View style={[styles.connectionDot, isConnected ? styles.connected : styles.disconnected]} />

      {/* Shield animation */}
      <Animated.View style={[styles.shieldContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.shieldEmoji}>🛡️</Text>
      </Animated.View>

      <Text style={styles.title}>You're Protected!</Text>
      <StatusBadge status={claim.status} />

      {/* Claim Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.claimId}>{claim.claim_id}</Text>
        <Text style={styles.summaryName}>{claim.user_name}</Text>
        <Text style={styles.summaryDesc} numberOfLines={2}>
          {claim.description}
        </Text>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Claimed</Text>
          <Text style={styles.summaryValue}>
            ${claim.amount_claimed?.toFixed(2) || "N/A"}
          </Text>
        </View>

        {claim.ocr_extracted_total && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>OCR Extracted</Text>
            <Text style={[styles.summaryValue, { color: "#8B5CF6" }]}>
              ${claim.ocr_extracted_total.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Status</Text>
          <Text style={[styles.summaryValue, { color: "#3B82F6" }]}>
            {claim.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={handleSubmitClaim}
        activeOpacity={0.8}
      >
        <Text style={styles.actionBtnText}>Submit for Review</Text>
        <Text style={styles.actionBtnArrow}>→</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        💡 Your claim will be reviewed by our team. You'll receive real-time updates.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  connectionDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: { backgroundColor: "#10B981" },
  disconnected: { backgroundColor: "#EF4444" },
  shieldContainer: {
    marginBottom: 16,
  },
  shieldEmoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E40AF",
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  claimId: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  summaryDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  actionBtn: {
    backgroundColor: "#2563EB",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  actionBtnArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    marginLeft: 8,
  },
  hint: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
});