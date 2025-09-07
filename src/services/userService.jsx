import api from "../components/api"
import axios from "axios"

export async function registerAccount(data) {
    console.log("registering")
    return api.post("/api/v1/auth/register", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}

export async function checkEmail(email) {
    console.log("checking email")
    return api.get(`/api/v1/auth/check/${email}`, {
        headers: {
            "Content-type": "application/json"
        }
    })
}

export async function authenticateAccount(data) {
    console.log("authenticating")
    return api.post("/api/v1/auth/login", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}