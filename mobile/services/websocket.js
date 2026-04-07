cat > services/websocket.js << 'EOF'
import { WS_URL } from "../config";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(claimId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    const url = `${WS_URL}/ws/claims/${claimId}`;
    console.log("WebSocket connecting to:", url);

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.emit("connected", { claimId });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message:", data);
        this.emit("message", data);

        // Emit specific event types
        if (data.type) {
          this.emit(data.type, data);
        }
        if (data.status) {
          this.emit("statusUpdate", data);
        }
      } catch (error) {
        console.error("WebSocket parse error:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error.message);
      this.emit("error", error);
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      this.emit("disconnected", { code: event.code, reason: event.reason });

      // Auto-reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
        setTimeout(() => this.connect(claimId), this.reconnectDelay);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Stop reconnecting
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, cannot send");
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event).filter((cb) => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data));
    }
  }
}

export default new WebSocketService();
EOF