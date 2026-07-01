"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const API_BASE =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL))
    ? (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL)?.trim().replace(/\/+$/, '')
    : 'https://unimart-backends-2.onrender.com';

const SOCKET_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WS_URL)
    || (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SOCKET_URL)
    || API_BASE;

function getSocketUrl() {
  return (SOCKET_URL || 'https://unimart-backends-2.onrender.com').replace(/\/+$/, '');
}

export function connectSocket(token?: string) {
  if (socket && socket.connected) {
    return socket;
  }

  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    try {
      authToken = localStorage.getItem('unimart:token') || undefined;
    } catch (e) {
      authToken = undefined;
    }
  }

  const url = getSocketUrl();
  const config: any = {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    reconnectionAttempts: Infinity, // Unlimited reconnection attempts
    upgrade: true,
    forceNew: false,
    multiplex: true,
    withCredentials: true,
    timeout: 20000,
    rejectUnauthorized: false,
  };

  if (authToken && typeof authToken === 'string' && authToken.trim()) {
    config.auth = { token: authToken };
  }

  console.log(`[socketClient] Connecting to ${url}`);

  try {
    socket = io(url, config);
  } catch (err) {
    console.error('[socketClient] failed to create socket', err);
    return socket;
  }

  if (!socket) {
    console.warn('[socketClient] socket is not available after io()');
    return socket;
  }

  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id, 'url:', url);
    reconnectAttempts = 0;
  });

  socket.on('connection_established', (data) => {
    console.log('✅ Socket connection established:', data);
  });

  socket.on('disconnect', (reason) => {
    console.warn('❌ WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error: any) => {
    console.error('⚠️ WebSocket connection error:', error.message || error);
    reconnectAttempts += 1;
    console.log(`Reconnect attempt ${reconnectAttempts}...`);
  });

  socket.on('error', (error: any) => {
    console.error('⚠️ WebSocket error:', error.message || error);
  });

  socket.on('connection_error', (data: any) => {
    console.error('🔴 Socket connection error event:', data);
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } catch (e) {
    console.warn('[socketClient] disconnect failed', e);
  }
  socket = null;
  reconnectAttempts = 0;
}

export function getSocket() {
  return socket;
}
