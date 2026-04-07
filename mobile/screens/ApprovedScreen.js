/**
 * P2 - Screen 4: APPROVED
 * Final screen showing claim approval with confetti-like celebration
 */

import { useEffect, useRef } from "react";
import {
    Animated,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import StatusBadge from "../components/StatusBadge";

export default function ApprovedScreen({ navigation, route }) {
  const { claim } = route.params || {};
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous bounce for checkmark
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My insurance claim ${claim?.claim_id} has been approved! Amount: $${claim?.approved_amount?.toFixed(2)}`,
        title: "Claim Approved! 🎉",
      });
    } catch (e) {
      console.error("Share error:", e);
    }
  };

  const handleNewClaim = () => {
    navigation.navigate("Uninsured");
  };

  const isApproved = claim?.status === "approved";
  const isRejected = claim?.status === "rejected";

  return (
    <ScrollView
      style={[
        styles.container,
        isRejected && { backgroundColor: "#FEF2F2" },
      ]}
      contentContainerStyle={styles.content}
    >
      {/* Celebration Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: bounceAnim },
            ],
          },
        ]}
      >
        <Text style={styles.bigEmoji}>{isApproved ? "✅" : "❌"}</Text>
      </Animated.View>

      {/* Title */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.title, isRejected && { color: "#DC2626" }]}>
          {isApproved ? "Claim Approved!" : "Claim Rejected"}
        </Text>
        <Text style={styles.subtitle}>
          {isApproved
            ? "Great news! Your insurance claim has been approved."
            : "Unfortunately, your claim has been rejected."}
        </Text>
      </Animated.View>

      <StatusBadge status={claim?.status || "approved"} />

      {/* Approved Amount Card */}
      {isApproved && claim?.approved_amount && (
        <Animated.View style={[styles.amountCard, { opacity: fadeAnim }]}>
          <Text style={styles.amountCardLabel}>Approved Amount</Text>
          <Text style={styles.amountCardValue}>
            ${claim.approved_amount.toFixed(2)}
          </Text>
          <View style={styles.amountComparison}>
            <Text style={styles.comparisonText}>
              Claimed: ${claim.amount_claimed?.toFixed(2) || "N/A"}
            </Text>
            {claim.ocr_extracted_total && (
              <Text style={styles.comparisonText}>
                OCR Verified: ${claim.ocr_extracted_total.toFixed(2)}
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* Claim Summary */}
      <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Claim Summary</Text>

        <SummaryRow label="Claim ID" value={claim?.claim_id} />
        <SummaryRow label="Name" value={claim?.user_name} />
        <SummaryRow label="Description" value={claim?.description} />
        {claim?.reviewer_notes && (
          <SummaryRow label="Reviewer Notes" value={claim.reviewer_notes} />
        )}
        <SummaryRow
          label="Processed At"
          value={
            claim?.updated_at
              ? new Date(claim.updated_at).toLocaleString()
              : "—"
          }
        />
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isApproved && (
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>📤 Share</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.newClaimBtn} onPress={handleNewClaim}>
          <Text style={styles.newClaimBtnText}>➕ New Claim</Text>
        </TouchableOpacity>
      </View>

      {/* Decorative confetti dots */}
      {isApproved && (
        <View style={styles.confetti}>
          {["🎉", "🎊", "⭐", "💫", "🌟", "✨"].map((emoji, i) => (
            <Text key={i} style={[styles.confettiEmoji, { left: `${15 + i * 14}%` }]}>
              {emoji}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={3}>
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFDF5",
  },
  content: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  bigEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#059669",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  amountCardLabel: {
    fontSize: 14,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  amountCardValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#059669",
  },
  amountComparison: {
    marginTop: 12,
    alignItems: "center",
  },
  comparisonText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryLabel: {
    width: 110,
    fontSize: 13,
    color: "#6B7280",
  },
  summaryValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 24,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  shareBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  newClaimBtn: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  newClaimBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  confetti: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  confettiEmoji: {
    position: "absolute",
    top: 10,
    fontSize: 24,
    opacity: 0.6,
  },
});