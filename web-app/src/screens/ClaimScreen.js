import React, { useState } from 'react';
import ClaimsAPI from '../services/api';

const ClaimScreen = ({ claim, onNavigate, onClaimUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // First set to processing
      await ClaimsAPI.updateClaim(claim.claim_id, {
        status: 'processing',
      });

      // Simulate review delay
      setTimeout(async () => {
        try {
          const approved = await ClaimsAPI.updateClaim(claim.claim_id, {
            status: 'approved',
            approved_amount: claim.ocr_extracted_total || claim.amount_claimed || 25000,
            reviewer_notes: 'Claim approved after OCR verification',
          });
          onClaimUpdate(approved);
          onNavigate('approved', approved);
        } catch (e) {
          alert('Error: ' + e.message);
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      alert('Error: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const updated = await ClaimsAPI.getClaim(claim.claim_id);
      onClaimUpdate(updated);
    } catch (error) {
      alert('Failed to refresh: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toFixed(2)}` : '—';
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-emoji">📋</span>
        <h2 className="screen-title">Claim Details</h2>
        <div className={`status-badge ${claim.status}`}>
          {claim.status.replace('_', ' ')}
        </div>
      </div>

      {isProcessing && (
        <div className="card" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
            <div className="loader"></div>
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>Processing your claim...</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Claim Information</div>
        <div className="info-row">
          <span className="info-label">Claim ID</span>
          <span className="info-value" style={{ fontFamily: 'monospace' }}>{claim.claim_id}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Name</span>
          <span className="info-value">{claim.user_name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Description</span>
          <span className="info-value">{claim.description}</span>
        </div>
        {claim.email && (
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{claim.email}</span>
          </div>
        )}
        {claim.phone && (
          <div className="info-row">
            <span className="info-label">Phone</span>
            <span className="info-value">{claim.phone}</span>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">💰 Financial Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Claimed</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{formatCurrency(claim.amount_claimed)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>OCR Total</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#8b5cf6' }}>
              {formatCurrency(claim.ocr_extracted_total) || 'Pending...'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Approved</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(claim.approved_amount)}</div>
          </div>
        </div>
      </div>

      {claim.reviewer_notes && (
        <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <div className="card-title">📝 Reviewer Notes</div>
          <p style={{ color: '#92400e', lineHeight: 1.6 }}>{claim.reviewer_notes}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button onClick={handleRefresh} className="btn btn-secondary" style={{ flex: 1 }}>
          🔄 Refresh
        </button>
        {claim.status !== 'approved' && claim.status !== 'rejected' && (
          <button onClick={handleApprove} className="btn btn-success" style={{ flex: 1 }} disabled={isProcessing}>
            ✅ Approve (Demo)
          </button>
        )}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-title">📅 Timeline</div>
        <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', marginTop: '0.25rem' }}></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Created</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {new Date(claim.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            background: claim.status !== 'uninsured' ? '#10b981' : '#d1d5db',
            marginTop: '0.25rem' 
          }}></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Last Updated</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {new Date(claim.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimScreen;
