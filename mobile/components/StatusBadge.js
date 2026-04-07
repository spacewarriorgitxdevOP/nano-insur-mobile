cat > components/StatusBadge.js << 'EOF'
import { StyleSheet, Text, View } from "react-native";

const STATUS_COLORS = {
  pending: { bg: "#fff3cd", text: "#856404", label: "Pending" },
  uploading: { bg: "#cce5ff", text: "#004085", label: "Uploading" },
  processing: { bg: "#d4edda", text: "#155724", label: "Processing" },
  under_review: { bg: "#e2e3f1", text: "#383d6e", label: "Under Review" },
  approved: { bg: "#d4edda", text: "#155724", label: "Approved" },
  rejected: { bg: "#f8d7da", text: "#721c24", label: "Rejected" },
  paid: { bg: "#d1ecf1", text: "#0c5460", label: "Paid" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
EOF