// src/api/axios.js
import axios from "axios";

// Set baseURL to the root of the server
const base = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
const instance = axios.create({
  baseURL: base,
  withCredentials: true, 
});

export default instance;

// Add a request interceptor to include the token in headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      // Prevent redirect loop if already on login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
