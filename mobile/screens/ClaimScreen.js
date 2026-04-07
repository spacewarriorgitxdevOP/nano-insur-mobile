/**
 * P2 - Screen 3: CLAIM
 * Shows claim processing status with live OCR results
 * Real-time WebSocket updates
 */

import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import StatusBadge from "../components/StatusBadge";
import useWebSocket from "../hooks/useWebSocket";
import ClaimsAPI from "../services/api";

export default function ClaimScreen({ navigation, route }) {
  const { claim: initialClaim } = route.params || {};
  const [claim, setClaim] = useState(initialClaim);
  const [isProcessing, setIsProcessing] = useState(true);
  const [progressAnim] = useState(new Animated.Value(0));
  const { isConnected, subscribe } = useWebSocket();

  // ─── Processing animation ──────────────────────────
  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        })
      ).start();
    }
  }, [isProcessing]);

  // ─── WebSocket: listen for updates ─────────────────
  useEffect(() => {
    if (!claim) return;

    const unsubStatus = subscribe("status_update", (data) => {
      if (data.claim_id === claim.claim_id) {
        setClaim(data.claim);

        if (data.new_status === "approved" || data.new_status === "rejected") {
          setIsProcessing(false);
          navigation.navigate("Approved", { claim: data.claim });
        }
      }
    });

    const unsubOCR = subscribe("ocr_complete", (data) => {
      if (data.claim_id === claim.claim_id) {
        setClaim(data.claim);
      }
    });

    return () => {
      unsubStatus();
      unsubOCR();
    };
  }, [claim?.claim_id]);

  // ─── Simulate approval (for demo) ──────────────────
  const handleApprove = async () => {
    try {
      // First set to processing
      await ClaimsAPI.updateClaim(claim.claim_id, {
        status: "processing",
      });

      // Then approve after a short delay (simulating review)
      setTimeout(async () => {
        try {
          const approved = await ClaimsAPI.updateClaim(claim.claim_id, {
            status: "approved",
            approved_amount: claim.ocr_extracted_total || claim.amount_claimed || 1000,
            reviewer_notes: "Claim approved after OCR verification",
          });
          setClaim(approved);
          setIsProcessing(false);
          navigation.navigate("Approved", { claim: approved });
        } catch (e) {
          Alert.alert("Error", e.message);
        }
      }, 2000);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // ─── Refresh claim data ────────────────────────────
  const handleRefresh = async () => {
    try {
      const updated = await ClaimsAPI.getClaim(claim.claim_id);
      setClaim(updated);
    } catch (error) {
      Alert.alert("Error", "Failed to refresh: " + error.message);
    }
  };

  if (!claim) {
    return (
      <View style={styles.container}>
        <Text>No claim data</Text>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Connection indicator */}
      <View style={[styles.connectionDot, isConnected ? styles.connected : styles.disconnected]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>📋</Text>
        <Text style={styles.title}>Claim Details</Text>
        <StatusBadge status={claim.status} />
      </View>

      {/* Processing indicator */}
      {isProcessing && claim.status !== "approved" && (
        <View style={styles.processingCard}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={styles.processingText}>Processing your claim...</Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>
      )}

      {/* Claim Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Claim Information</Text>

        <InfoRow label="Claim ID" value={claim.claim_id} mono />
        <InfoRow label="Name" value={claim.user_name} />
        <InfoRow label="Description" value={claim.description} />
        {claim.email && <InfoRow label="Email" value={claim.email} />}
        {claim.phone && <InfoRow label="Phone" value={claim.phone} />}
      </View>

      {/* Financial Details */}
      <View style={styles.financialCard}>
        <Text style={styles.cardTitle}>💰 Financial Details</Text>

        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Claimed</Text>
            <Text style={styles.amountValue}>
              ${claim.amount_claimed?.toFixed(2) || "—"}
            </Text>
          </View>

          <View style={styles.amountDivider} />

          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>OCR Total</Text>
            <Text style={[styles.amountValue, { color: "#8B5CF6" }]}>
              ${claim.ocr_extracted_total?.toFixed(2) || "Pending..."}
            </Text>
          </View>

          <View style={styles.amountDivider} />

          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Approved</Text>
            <Text style={[styles.amountValue, { color: "#10B981" }]}>
              ${claim.approved_amount?.toFixed(2) || "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Reviewer Notes */}
      {claim.reviewer_notes && (
        <View style={styles.notesCard}>
          <Text style={styles.cardTitle}>📝 Reviewer Notes</Text>
          <Text style={styles.notesText}>{claim.reviewer_notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>

        {claim.status !== "approved" && claim.status !== "rejected" && (
          <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
            <Text style={styles.approveBtnText}>✅ Approve (Demo)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        <Text style={styles.cardTitle}>📅 Timeline</Text>
        <TimelineItem
          label="Created"
          time={claim.created_at}
          active
        />
        <TimelineItem
          label="Last Updated"
          time={claim.updated_at}
          active={claim.status !== "uninsured"}
        />
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ──────────────────────────────────

function InfoRow({ label, value, mono = false }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.mono]} numberOfLines={3}>
        {value || "—"}
      </Text>
    </View>
  );
}

function TimelineItem({ label, time, active }) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, active && styles.timelineDotActive]} />
      <View>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={styles.timelineTime}>
          {time
            ? new Date(time).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 40,
  },
  connectionDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  connected: { backgroundColor: "#10B981" },
  disconnected: { backgroundColor: "#EF4444" },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 8 },
  processingCard: {
    backgroundColor: "#F5F3FF",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  processingText: {
    color: "#7C3AED",
    fontWeight: "600",
    marginTop: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#DDD6FE",
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7C3AED",
    borderRadius: 2,
  },
  infoCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    width: 100,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  mono: { fontFamily: "monospace" },
  financialCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountItem: {
    flex: 1,
    alignItems: "center",
  },
  amountDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  amountLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  notesCard: {
    backgroundColor: "#FFFBEB",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  notesText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  refreshBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  timeline: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D1D5DB",
    marginRight: 12,
  },
  timelineDotActive: {
    backgroundColor: "#10B981",
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  timelineTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});