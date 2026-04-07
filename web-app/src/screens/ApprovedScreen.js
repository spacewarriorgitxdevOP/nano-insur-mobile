import React from 'react';

const ApprovedScreen = ({ claim, onNavigate }) => {
  const handleNewClaim = () => {
    onNavigate('uninsured', null);
  };

  const isApproved = claim.status === 'approved';

  return (
    <div className="screen">
      <div className="screen-header">
        <span className="screen-emoji">{isApproved ? '🎉' : '❌'}</span>
        <h2 className="screen-title">
          {isApproved ? 'Claim Approved!' : 'Claim Rejected'}
        </h2>
        <div className={`status-badge ${claim.status}`}>
          {claim.status}
        </div>
        <p className="screen-subtitle">
          {isApproved 
            ? 'Your claim has been approved. Payment will be transferred to your account.'
            : 'Unfortunately, your claim was rejected. Please review the details below.'
          }
        </p>
      </div>

      {isApproved && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
          border: 'none',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💵</div>
          <div style={{ fontSize: '0.875rem', color: '#065f46', marginBottom: '0.5rem' }}>Approved Amount</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#047857' }}>
            ₹{claim.approved_amount?.toFixed(2) || '0.00'}
          </div>
          <div style={{ marginTop: '1rem', color: '#065f46', fontWeight: 600 }}>
            ⚡ Payment via UPI in 90 seconds
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Claim Summary</div>
        <div className="info-row">
          <span className="info-label">Claim ID</span>
          <span className="info-value" style={{ fontFamily: 'monospace' }}>{claim.claim_id}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Name</span>
          <span className="info-value">{claim.user_name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Amount Claimed</span>
          <span className="info-value">₹{claim.amount_claimed?.toFixed(2) || 'N/A'}</span>
        </div>
        {claim.ocr_extracted_total && (
          <div className="info-row">
            <span className="info-label">OCR Extracted</span>
            <span className="info-value">₹{claim.ocr_extracted_total.toFixed(2)}</span>
          </div>
        )}
        {claim.approved_amount && (
          <div className="info-row">
            <span className="info-label">Approved Amount</span>
            <span className="info-value" style={{ color: '#10b981', fontWeight: 700 }}>
              ₹{claim.approved_amount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {claim.reviewer_notes && (
        <div className="card" style={{ background: isApproved ? '#fffbeb' : '#fee2e2', borderColor: isApproved ? '#fde68a' : '#fecaca' }}>
          <div className="card-title">📝 Reviewer Notes</div>
          <p style={{ color: isApproved ? '#92400e' : '#991b1b', lineHeight: 1.6 }}>
            {claim.reviewer_notes}
          </p>
        </div>
      )}

      <button onClick={handleNewClaim} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
        <span>File New Claim</span>
        <span>→</span>
      </button>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          🔒 Your coverage continues for the next trip
        </p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Just ₹2 per trip • 24-hour protection
        </p>
      </div>
    </div>
  );
};

export default ApprovedScreen;
