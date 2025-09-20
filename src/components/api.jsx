import axios from "axios";
import { io } from "socket.io-client";



const token = localStorage.getItem("token");


export function objectToFormData(obj) {
  const formData = new FormData();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      formData.append(key, obj[key]);
    }
  }
  return formData;
}

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