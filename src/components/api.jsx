import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";
import { io } from "socket.io-client";



const token = localStorage.getItem("token");


export function objectToFormData(obj) {
    const formData = new FormData();
    Object.entries(obj).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (value !== null && value !== undefined) {
            formData.append(key, value);
        }
    });
    return formData;
}


export function checkRole(){
  if (token){
    var payload = jwtDecode(token)
    if (payload.role == "faculty"){
      return <Navigate to = "/faculty/dashboard"></Navigate>
    }
    else if (payload.role == "administrator"){
      return <Navigate to = "/admin/dashboard"></Navigate>
    }
  }
}
const backend_url = import.meta.env.VITE_BACKEND_URL;

console.log("BACKEND: ", backend_url)
export var socket = io(backend_url)

const api = axios.create({
        baseURL: backend_url,
        headers: {
          Authorization: `Bearer ${token}`
        }
    })

if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Temporary debugging: log outgoing auth requests to find repeated login attempts
api.interceptors.request.use((config) => {
  try {
    const url = config.url || "";
    if (url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/verify-otp')) {
      console.debug('[Auth Request]', (config.method || '').toUpperCase(), url, { data: config.data, headers: config.headers });
      const stack = new Error().stack;
      if (stack) {
        // Show short stack to help locate caller (top 3 frames)
        console.debug('Stack (top frames):', stack.split('\n').slice(2,6).join('\n'));
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
}, (error) => Promise.reject(error));

export default api