import React, { useState, useEffect } from 'react';

const CoverageTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return null;

  return (
    <div style={{
      background: expired ? '#fee2e2' : '#dbeafe',
      color: expired ? '#991b1b' : '#1e40af',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      marginTop: '1rem',
      textAlign: 'center',
      fontWeight: 600
    }}>
      {expired ? (
        <>⏰ Coverage Expired</>
      ) : (
        <>
          🛡️ Coverage Active: {timeLeft}
        </>
      )}
    </div>
  );
};

export default CoverageTimer;
