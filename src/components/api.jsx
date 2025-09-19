import axios from "axios";
import { io } from "socket.io-client";


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
        baseURL: "http://127.0.0.1:5000"
    })

export default api