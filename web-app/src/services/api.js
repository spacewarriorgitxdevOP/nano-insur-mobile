import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ClaimsAPI = {
  // Create a new claim
  createClaim: async (claimData) => {
    try {
      const response = await api.post('/claims', claimData);
      return response.data;
    } catch (error) {
      console.error('Create claim error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message);
    }
  },

  // Get all claims
  getAllClaims: async () => {
    try {
      const response = await api.get('/claims');
      return response.data;
    } catch (error) {
      console.error('Get all claims error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message);
    }
  },

  // Get a specific claim
  getClaim: async (claimId) => {
    try {
      const response = await api.get(`/claims/${claimId}`);
      return response.data;
    } catch (error) {
      console.error('Get claim error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message);
    }
  },

  // Update claim status
  updateClaim: async (claimId, updateData) => {
    try {
      const response = await api.patch(`/claims/${claimId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update claim error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message);
    }
  },

  // Process OCR on a document
  processOCR: async (claimId, imageBase64) => {
    try {
      const response = await api.post(`/claims/${claimId}/ocr`, {
        image_base64: imageBase64,
      });
      return response.data;
    } catch (error) {
      console.error('OCR error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message);
    }
  },
};

export default ClaimsAPI;
