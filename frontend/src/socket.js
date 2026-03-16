// frontend/src/socket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  // Only connect if not already connected
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL, {
      query: { userId },
      transports: ["polling", "websocket"], 
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 20000,
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
