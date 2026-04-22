// frontend/src/socket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  // Only connect if not already connected
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
    socket = io(socketUrl, {
      query: { userId },
      transports: ["websocket", "polling"], 
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000, 
      timeout: 30000,
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error, trying fallback:", err.message);
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
