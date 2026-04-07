import { useCallback, useEffect, useRef, useState } from "react";
import websocketService from "../services/websocket";
export default function useWebSocket(claimId) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [claimStatus, setClaimStatus] = useState(null);
  const claimIdRef = useRef(claimId);

  useEffect(() => {
    claimIdRef.current = claimId;
  }, [claimId]);

  useEffect(() => {
    if (!claimId) return;

    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);
    const onMessage = (data) => setLastMessage(data);
    const onStatusUpdate = (data) => {
      setClaimStatus(data.status);
    };

    websocketService.on("connected", onConnected);
    websocketService.on("disconnected", onDisconnected);
    websocketService.on("message", onMessage);
    websocketService.on("statusUpdate", onStatusUpdate);

    websocketService.connect(claimId);

    return () => {
      websocketService.off("connected", onConnected);
      websocketService.off("disconnected", onDisconnected);
      websocketService.off("message", onMessage);
      websocketService.off("statusUpdate", onStatusUpdate);
      websocketService.disconnect();
    };
  }, [claimId]);

  const sendMessage = useCallback((data) => {
    websocketService.send(data);
  }, []);

  return {
    isConnected,
    lastMessage,
    claimStatus,
    sendMessage,
  };
}
