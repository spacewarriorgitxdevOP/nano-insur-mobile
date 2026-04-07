cat > components/ClaimCard.js << 'EOF'
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "./StatusBadge";

export default function ClaimCard({ claim, onPress }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "$0.00";
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;
  };

  // Safely get claim ID
  const claimId = claim?.id || claim?._id || "Unknown";

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(claim)}>
      <View style={styles.header}>
        <Text style={styles.claimId}>Claim #{claimId}</Text>
        <StatusBadge status={claim?.status} />
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{claim?.type || "General"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.amount}>{formatAmount(claim?.amount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(claim?.createdAt)}</Text>
        </View>

        {claim?.description && (
          <Text style={styles.description} numberOfLines={2}>
            {claim.description}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  claimId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  body: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: "#666",
  },
  value: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  amount: {
    fontSize: 14,
    color: "#1a73e8",
    fontWeight: "bold",
  },
  description: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  viewDetails: {
    color: "#1a73e8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
});
EOF