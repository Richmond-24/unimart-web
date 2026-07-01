"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";

const STATUS = {
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
};

export default function useSocket({ autoConnect = true, token } = {}) {
  const [status, setStatus] = useState(STATUS.DISCONNECTED);
  const [error, setError] = useState(null);
  const [transport, setTransport] = useState('unknown');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const socket = useMemo(() => getSocket(), []);

  const handleConnect = useCallback(() => {
    setStatus(STATUS.CONNECTED);
    setError(null);
    const existingSocket = getSocket();
    setTransport(existingSocket?.io?.engine?.transport?.name || 'unknown');
    setReconnectAttempts(0);
  }, []);

  const handleDisconnect = useCallback(() => {
    setStatus(STATUS.DISCONNECTED);
  }, []);

  const handleConnectError = useCallback((err) => {
    setStatus(STATUS.ERROR);
    setError(err?.message || String(err));
  }, []);

  const handleReconnectAttempt = useCallback((attempt) => {
    setStatus(STATUS.RECONNECTING);
    setReconnectAttempts(attempt || ((prev) => prev + 1));
  }, []);

  const handleReconnectFailed = useCallback(() => {
    setStatus(STATUS.ERROR);
    setError('Maximum reconnect attempts reached');
  }, []);

  const handleReconnect = useCallback((attempt) => {
    setStatus(STATUS.CONNECTING);
    setReconnectAttempts(attempt);
  }, []);

  const handleUpgrade = useCallback(() => {
    const existingSocket = getSocket();
    setTransport(existingSocket?.io?.engine?.transport?.name || 'unknown');
  }, []);

  const attachListeners = useCallback(
    (socketInstance) => {
      if (!socketInstance) return;
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("connect_error", handleConnectError);
      socketInstance.off("reconnect_attempt", handleReconnectAttempt);
      socketInstance.off("reconnect_failed", handleReconnectFailed);
      socketInstance.off("reconnect", handleReconnect);
      socketInstance.off("upgrade", handleUpgrade);

      socketInstance.on("connect", handleConnect);
      socketInstance.on("disconnect", handleDisconnect);
      socketInstance.on("connect_error", handleConnectError);
      socketInstance.on("reconnect_attempt", handleReconnectAttempt);
      socketInstance.on("reconnect_failed", handleReconnectFailed);
      socketInstance.on("reconnect", handleReconnect);
      socketInstance.on("upgrade", handleUpgrade);
    },
    [handleConnect, handleConnectError, handleDisconnect, handleReconnect, handleReconnectAttempt, handleReconnectFailed, handleUpgrade]
  );

  const connect = useCallback(
    (manualToken) => {
      setStatus(STATUS.CONNECTING);
      const socketInstance = connectSocket(manualToken || token);
      attachListeners(socketInstance);
      return socketInstance;
    },
    [attachListeners, token]
  );

  const disconnect = useCallback(() => {
    disconnectSocket();
    setStatus(STATUS.DISCONNECTED);
    setTransport('unknown');
    setReconnectAttempts(0);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    status,
    error,
    transport,
    reconnectAttempts,
    socket: getSocket(),
    connect,
    disconnect,
    isConnected: status === STATUS.CONNECTED,
  };
}
