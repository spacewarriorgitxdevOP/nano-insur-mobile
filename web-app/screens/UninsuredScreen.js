import React, { useState } from 'react';
import ClaimsAPI from '../services/api';

const UninsuredScreen = ({ onClaimCreated }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    description: '',
    amount_claimed: '',
  });
  const [documentBase64, setDocumentBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.user_name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please describe your claim');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        user_name: formData.user_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        description: formData.description.trim(),
        amount_claimed: formData.amount_claimed ? parseFloat(formData.amount_claimed) : null,
        document_base64: documentBase64,
      };

      const claim = await ClaimsAPI.createClaim(payload);
      console.log('✅ Claim created:', claim.claim_id);
      onClaimCreated(claim);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-emoji">🚨</span>
        <h2 className="screen-title">File a New Claim</h2>
        <div className="status-badge uninsured">Uninsured</div>
        <p className="screen-subtitle">
          Submit your insurance claim with supporting documents
        </p>
      </div>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="user_name"
            className="form-input"
            placeholder="Rajesh Kumar"
            value={formData.user_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="rajesh@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            className="form-input"
            placeholder="+91-9876543210"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Claim Description *</label>
          <textarea
            name="description"
            className="form-textarea"
            placeholder="Describe the incident and what you're claiming..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amount Claimed (₹)</label>
          <input
            type="number"
            name="amount_claimed"
            className="form-input"
            placeholder="25000"
            value={formData.amount_claimed}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Upload Hospital Bill / Document</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="form-input"
            style={{ padding: '0.5rem' }}
          />
          {documentBase64 && (
            <p style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              ✅ Document uploaded
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <div className="loader"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Claim</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UninsuredScreen;
