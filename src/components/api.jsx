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


export function checkRole() {
  if (token) {
    var payload = jwtDecode(token)
    if (payload.role == "faculty") {
      return <Navigate to="/faculty/dashboard"></Navigate>
    }
    else if (payload.role == "administrator") {
      return <Navigate to="/sadmin/dashboard"></Navigate>
    }
  }
}
const backend_url = import.meta.env.VITE_BACKEND_URL;

console.log("BACKEND: ", backend_url)
export var socket = io(backend_url)

const api = axios.create({
  baseURL: backend_url || "",
  withCredentials: true,   // <-- sends the HttpOnly cookie automatically
});

if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check if token is expired
        if (payload.exp < currentTime) {
          localStorage.removeItem("token");
          window.location.href = "/"; 
        }
      } catch (e) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token"); 
      if (token){
         localStorage.removeItem("token"); 
         window.location.href = "/";
      }      
    }
    return Promise.reject(error);
  }
);

export default api