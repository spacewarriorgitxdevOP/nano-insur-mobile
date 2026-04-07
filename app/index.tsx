import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NGROK_URL = 'https://nonportentous-frumentaceous-fiona.ngrok-free.dev'; 

// 1. Define an Interface for your Result (Stops errors on result.extracted_total)
interface ScanResult {
  extracted_total?: string | number;
  status?: string;
}

export default function Index() {
  // 2. Add types to your Usestate (Stops errors on setImage and setResult)
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Required", "We need access to your photos.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const selectedImage = pickerResult.assets[0];
      setImage(selectedImage);
      uploadImage(selectedImage.uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    setResult(null);

    // 3. Fix the FormData "Any" error
    const formData = new FormData();
    
    // We use 'any' here to bypass the strict React Native Blob type check
    const fileToUpload: any = {
      uri: uri,
      name: 'hospital_bill.jpg',
      type: 'image/jpeg',
    };
    
    formData.append('file', fileToUpload);

    try {
      const response = await axios.post(`${NGROK_URL}/claims/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setResult(response.data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Upload Failed', 'Check if Ngrok/Uvicorn is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Nano-Insur Scan</Text>
      
      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Processing..." : "Pick Hospital Bill"}</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image.uri }} style={styles.image} />}
      
      {loading && <ActivityIndicator size="large" color="#4ade80" style={{ marginVertical: 20 }} />}
      
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultText}>✅ Scan Complete!</Text>
          <Text style={styles.amount}>Total: ₹{result.extracted_total || '0.00'}</Text>
          <Text style={styles.id}>Status: {result.status || 'Verified'}</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#0f172a', 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#4ade80', 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  button: { 
    backgroundColor: '#4ade80', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 20, 
    elevation: 5 
  },
  buttonText: { 
    color: '#0f172a', 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  image: { 
    width: '100%', 
    height: 250, 
    borderRadius: 12, 
    marginBottom: 20, 
    resizeMode: 'cover' 
  },
  result: { 
    backgroundColor: '#1e293b', 
    padding: 20, 
    borderRadius: 12, 
    borderLeftWidth: 5, 
    borderLeftColor: '#4ade80' 
  },
  resultText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#4ade80', 
    marginBottom: 10 
  },
  amount: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#f1f5f9', 
    marginBottom: 5 
  },
  id: { 
    fontSize: 14, 
    color: '#94a3b8', 
    fontFamily: 'monospace' 
  },
});
// ... styles stay exactly the same