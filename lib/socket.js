"use client";

import { io } from "socket.io-client";

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 12;
const RECONNECT_DELAY = 1000;
const RECONNECT_DELAY_MAX = 30000;
const SOCKET_PATH = "/socket.io/";

function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "https://unimart-backend-6pld.onrender.com";
  }
  return rawUrl.trim().replace(/\s+/g, '').replace(/\/+$/, '');
}

const BACKEND_URL = normalizeUrl(
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    : undefined
);

function getAuthToken(token) {
  if (token && typeof token === "string" && token.trim()) return token.trim();
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("unimart:token");
      return stored && stored.trim() ? stored.trim() : undefined;
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}

function buildSocketConfig(token) {
  const authToken = getAuthToken(token);
  const config = {
    path: SOCKET_PATH,
    transports: ["websocket", "polling"],
    timeout: 60000,
    connectTimeout: 45000,
    pingInterval: 25000,
    pingTimeout: 60000,
    reconnection: true,
    reconnectionDelay: RECONNECT_DELAY,
    reconnectionDelayMax: RECONNECT_DELAY_MAX,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    autoConnect: true,
    upgrade: true,
    forceNew: false,
    multiplex: true,
    withCredentials: true,
    transportOptions: {
      polling: {
        extraHeaders: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    },
  };

  if (authToken) {
    config.auth = { token: authToken };
    config.query = { token: authToken };
  }

  return config;
}

function getSocketUrl() {
  return BACKEND_URL;
}

export function connectSocket(token) {
  if (socket && socket.connected) {
    return socket;
  }

  const url = getSocketUrl();
  const config = buildSocketConfig(token);

  try {
    socket = io(url, config);
  } catch (err) {
    console.error('[socket] failed to initialize socket', err);
    socket = null;
    return socket;
  }

  if (!socket) {
    console.warn('[socket] io() returned no socket instance');
    return socket;
  }

  socket.on("connect", () => {
    reconnectAttempts = 0;
    console.log("✅ Socket connected", socket.id, "via", url, "transport:", socket.io.engine.transport.name);
    socket.emit('health:ping');
  });

  socket.on("disconnect", (reason) => {
    console.warn("❌ Socket disconnected", reason);
  });

  socket.on("connect_error", (err) => {
    reconnectAttempts += 1;
    const attempt = reconnectAttempts;
    console.error("⚠️ Socket connect_error", err?.message || err);
    if (attempt < MAX_RECONNECT_ATTEMPTS) {
      const wait = Math.min(RECONNECT_DELAY * 2 ** attempt, RECONNECT_DELAY_MAX);
      console.log(`⏳ Reconnect attempt ${attempt} scheduled in ${wait}ms`);
    }
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.log(`🔄 Socket reconnect attempt ${attempt}`);
  });

  socket.on("reconnect_error", (err) => {
    console.error("⚠️ Socket reconnect_error", err?.message || err);
  });

  socket.on("reconnect_failed", () => {
    console.error("🚫 Socket reconnect failed after maximum attempts");
  });

  socket.on("upgrade", () => {
    console.log("🔄 Socket transport upgraded", socket.io.engine.transport.name);
  });

  socket.on("error", (err) => {
    console.error("Socket error", err);
  });

  socket.on('health:pong', (payload) => {
    console.log('🟢 Socket health pong', payload);
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } catch (err) {
    console.warn("disconnectSocket error", err);
  }
  socket = null;
  reconnectAttempts = 0;
}

export function getSocket() {
  return socket;
}
