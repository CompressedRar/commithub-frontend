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
export var socket = io("http://127.0.0.1:5000")

const api = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: {
          Authorization: `Bearer ${token}`
        }
    })

if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default api