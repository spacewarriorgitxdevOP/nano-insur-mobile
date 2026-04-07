cat > services/api.js << 'EOF'
import axios from "axios";
import { BASE_URL } from "../../config";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Upload document and start claim
export const uploadDocument = async (fileUri, fileName, fileType) => {
  try {
    const formData = new FormData();
    formData.append("document", {
      uri: fileUri,
      name: fileName || "document.jpg",
      type: fileType || "image/jpeg",
    });

    const response = await api.post("/api/claims/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload error:", error.response?.data || error.message);
    throw error;
  }
};

// Submit a new claim with form data
export const submitClaim = async (claimData) => {
  try {
    const response = await api.post("/api/claims", claimData);
    return response.data;
  } catch (error) {
    console.error("Submit claim error:", error.response?.data || error.message);
    throw error;
  }
};

// Get claim by ID
export const getClaim = async (claimId) => {
  try {
    const response = await api.get(`/api/claims/${claimId}`);
    return response.data;
  } catch (error) {
    console.error("Get claim error:", error.response?.data || error.message);
    throw error;
  }
};

// Get all claims
export const getAllClaims = async () => {
  try {
    const response = await api.get("/api/claims");
    return response.data;
  } catch (error) {
    console.error("Get all claims error:", error.response?.data || error.message);
    throw error;
  }
};

// Update claim status
export const updateClaimStatus = async (claimId, status) => {
  try {
    const response = await api.patch(`/api/claims/${claimId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Update status error:", error.response?.data || error.message);
    throw error;
  }
};

export default api;
EOF