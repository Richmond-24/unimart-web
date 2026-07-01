"use client";

import { createContext, useContext } from "react";
import useSocket from "../../hooks/useSocket";

const SocketContext = createContext({
  status: 'disconnected',
  error: null,
  isConnected: false,
  transport: 'unknown',
  reconnectAttempts: 0,
  socket: null,
  connect: () => {},
  disconnect: () => {},
});

export function useSocketContext() {
  return useContext(SocketContext);
}

export default function SocketProvider({ children }) {
  const {
    status,
    error,
    isConnected,
    transport,
    reconnectAttempts,
    socket,
    connect,
    disconnect,
  } = useSocket({ autoConnect: true });

  return (
    <SocketContext.Provider
      value={{ status, error, isConnected, transport, reconnectAttempts, socket, connect, disconnect }}
    >
      {children}
    </SocketContext.Provider>
  );
}
