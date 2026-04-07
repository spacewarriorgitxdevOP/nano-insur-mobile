import React from 'react';
import ClaimsAPI from '../services/api';

const ProtectedScreen = ({ claim, onNavigate }) => {
  const handleSubmitClaim = async () => {
    try {
      const updated = await ClaimsAPI.updateClaim(claim.claim_id, {
        status: 'claim_submitted',
      });
      onNavigate('claim', updated);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toFixed(2)}` : 'N/A';
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-emoji" style={{ animation: 'bounce 2s infinite' }}>🛡️</span>
        <h2 className="screen-title">You're Protected!</h2>
        <div className="status-badge protected">{claim.status.replace('_', ' ')}</div>
        <p className="screen-subtitle">
          Your ₹2 trip coverage is now active for 24 hours
        </p>
      </div>

      <div className="card">
        <div className="card-title">{claim.claim_id}</div>
        <div className="info-row">
          <span className="info-label">Name</span>
          <span className="info-value">{claim.user_name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Description</span>
          <span className="info-value">{claim.description}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Amount Claimed</span>
          <span className="info-value">{formatCurrency(claim.amount_claimed)}</span>
        </div>
        {claim.ocr_extracted_total && (
          <div className="info-row">
            <span className="info-label">OCR Extracted</span>
            <span className="info-value" style={{ color: '#8b5cf6' }}>
              {formatCurrency(claim.ocr_extracted_total)}
            </span>
          </div>
        )}
        <div className="info-row">
          <span className="info-label">Status</span>
          <span className="info-value" style={{ color: '#3b82f6' }}>
            {claim.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <button onClick={handleSubmitClaim} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
        <span>Submit for Review</span>
        <span>→</span>
      </button>

      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
        💡 Your claim will be reviewed by our team. You'll receive real-time updates.
      </p>
    </div>
  );
};

export default ProtectedScreen;
