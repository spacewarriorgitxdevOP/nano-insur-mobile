import React, { useState, useEffect } from 'react';
import './App.css';
import UninsuredScreen from './screens/UninsuredScreen';
import ProtectedScreen from './screens/ProtectedScreen';
import ClaimScreen from './screens/ClaimScreen';
import ApprovedScreen from './screens/ApprovedScreen';
import useWebSocket from './hooks/useWebSocket';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentScreen, setCurrentScreen] = useState('uninsured');
  const [currentClaim, setCurrentClaim] = useState(null);
  const { isConnected, subscribe } = useWebSocket();

  useEffect(() => {
    console.log('🚀 Nano-Insur Web App');
    console.log('📡 Backend:', BACKEND_URL);
  }, []);

  // WebSocket listeners
  useEffect(() => {
    const unsubStatus = subscribe('status_update', (data) => {
      if (currentClaim && data.claim_id === currentClaim.claim_id) {
        setCurrentClaim(data.claim);
        
        // Auto-navigate based on status
        if (data.new_status === 'claim_submitted' || data.new_status === 'processing') {
          setCurrentScreen('claim');
        } else if (data.new_status === 'approved' || data.new_status === 'rejected') {
          setCurrentScreen('approved');
        }
      }
    });

    return () => unsubStatus();
  }, [currentClaim, subscribe]);

  const handleClaimCreated = (claim) => {
    setCurrentClaim(claim);
    setCurrentScreen('protected');
  };

  const handleNavigate = (screen, claim) => {
    if (claim) setCurrentClaim(claim);
    setCurrentScreen(screen);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <span className="logo">🛡️</span>
            <h1>Nano-Insur</h1>
            <span className="version">v1.0</span>
          </div>
          <div className="header-right">
            <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="dot"></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {currentScreen === 'uninsured' && (
          <UninsuredScreen onClaimCreated={handleClaimCreated} />
        )}
        {currentScreen === 'protected' && currentClaim && (
          <ProtectedScreen 
            claim={currentClaim} 
            onNavigate={handleNavigate}
          />
        )}
        {currentScreen === 'claim' && currentClaim && (
          <ClaimScreen 
            claim={currentClaim} 
            onNavigate={handleNavigate}
            onClaimUpdate={setCurrentClaim}
          />
        )}
        {currentScreen === 'approved' && currentClaim && (
          <ApprovedScreen 
            claim={currentClaim} 
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>₹2 per trip • 24-hour coverage • Instant claim settlement</p>
      </footer>
    </div>
  );
}

export default App;
