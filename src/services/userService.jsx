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

