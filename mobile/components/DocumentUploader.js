cat > components/DocumentUploader.js << 'EOF'
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DocumentUploader({ onFileSelected, uploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          name: asset.fileName || `document_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        };
        setSelectedFile(fileData);
        setPreview(asset.uri);
        onFileSelected(fileData);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: "image/jpeg",
        };
        setSelectedFile(fileData);
        setPreview(asset.uri);
        onFileSelected(fileData);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Document</Text>
      <Text style={styles.subtitle}>
        Upload a photo of your insurance document, medical bill, or accident report
      </Text>

      {preview ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: preview }} style={styles.preview} />
          <Text style={styles.fileName}>{selectedFile?.name}</Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📄</Text>
          <Text style={styles.placeholderText}>No document selected</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.galleryButton]}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={styles.buttonText}>Gallery</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Text style={styles.buttonIcon}>📷</Text>
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 12,
    color: "#666",
  },
  placeholder: {
    height: 150,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  galleryButton: {
    backgroundColor: "#1a73e8",
  },
  cameraButton: {
    backgroundColor: "#34a853",
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
EOF