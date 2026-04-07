import { useState, useEffect, useCallback, useRef } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const listenersRef = useRef({});
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        
        // Emit connection event
        if (listenersRef.current['connection']) {
          listenersRef.current['connection'].forEach(cb => 
            cb({ status: 'connected' })
          );
        }
        
        // Start heartbeat
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'ping', data: {} }));
          }
        }, 30000);
        
        ws.heartbeat = heartbeat;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { event: eventType, data } = message;
          
          console.log('📨 WebSocket message:', eventType, data);
          
          // Call specific event listeners
          if (listenersRef.current[eventType]) {
            listenersRef.current[eventType].forEach(callback => callback(data));
          }
          
          // Call wildcard listeners
          if (listenersRef.current['*']) {
            listenersRef.current['*'].forEach(callback => callback(message));
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        
        if (ws.heartbeat) {
          clearInterval(ws.heartbeat);
        }
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Reconnecting WebSocket...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      if (wsRef.current.heartbeat) {
        clearInterval(wsRef.current.heartbeat);
      }
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const subscribe = useCallback((event, callback) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }
    listenersRef.current[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      listenersRef.current[event] = listenersRef.current[event].filter(
        cb => cb !== callback
      );
    };
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    subscribe,
    disconnect,
  };
};

export default useWebSocket;
