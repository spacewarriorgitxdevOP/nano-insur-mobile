/**
 * P2 - Screen 1: UNINSURED
 * Starting screen - User creates a new insurance claim
 * Shows upload form and transitions to Protected
 */

import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DocumentUploader from "../components/DocumentUploader";
import StatusBadge from "../components/StatusBadge";
import ClaimsAPI from "../services/api";

export default function UninsuredScreen({ navigation }) {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone: "",
    description: "",
    amount_claimed: "",
  });
  const [documentBase64, setDocumentBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.user_name.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Required", "Please describe your claim");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_name: formData.user_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        description: formData.description.trim(),
        amount_claimed: formData.amount_claimed
          ? parseFloat(formData.amount_claimed)
          : null,
        document_base64: documentBase64,
      };

      const claim = await ClaimsAPI.createClaim(payload);
      console.log("✅ Claim created:", claim.claim_id);

      // Navigate to Protected screen with the new claim
      navigation.navigate("Protected", { claim });
    } catch (error) {
      Alert.alert("Error", `Failed to submit claim: ${error.message}`);
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🚨</Text>
          <Text style={styles.title}>File a New Claim</Text>
          <StatusBadge status="uninsured" />
          <Text style={styles.subtitle}>
            Submit your insurance claim with supporting documents
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={formData.user_name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, user_name: text }))
              }
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Claim Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the incident and what you're claiming..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount Claimed ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="1500.00"
              value={formData.amount_claimed}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, amount_claimed: text }))
              }
              keyboardType="decimal-pad"
            />
          </View>

          {/* Document Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Receipt / Document</Text>
            <DocumentUploader
              onImageSelected={(base64) => setDocumentBase64(base64)}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Submit Claim</Text>
              <Text style={styles.submitBtnArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  submitBtnArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    marginLeft: 8,
  },
});