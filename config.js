/**
 * P2 - Configuration
 * BASE_URL is provided by P1 before T+0
 */

// ⚠️ P1 WILL GIVE YOU THIS URL AFTER RAILWAY DEPLOY
// Replace with actual Railway URL before demo
const CONFIG = {
  // REST API base URL (P1 provides this)
  BASE_URL: "https://your-app.railway.app",  // ← P1 gives this

  // WebSocket URL (derived from BASE_URL)
  get WS_URL() {
    const wsProtocol = this.BASE_URL.startsWith("https") ? "wss" : "ws";
    const host = this.BASE_URL.replace(/^https?:\/\//, "");
    return `${wsProtocol}://${host}/ws`;
  },

  // API version prefix
  API_PREFIX: "/api/v1",

  // Full API URL helper
  get API_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}`;
  },

  // WebSocket reconnect settings
  WS_RECONNECT_INTERVAL: 3000,    // 3 seconds
  WS_MAX_RECONNECT_ATTEMPTS: 10,
  WS_HEARTBEAT_INTERVAL: 25000,   // 25 seconds

  // App settings
  APP_NAME: "InsureClaim",
  VERSION: "1.0.0",
};

export default CONFIG;