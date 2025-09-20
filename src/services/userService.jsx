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

export async function updateMemberInfo(data){
    return api.patch("/api/v1/users/", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}

export async function archiveAccount(id) {
    console.log("archiving")
    return api.delete(`/api/v1/users/${id}`)
}

export async function unarchiveAccount(id) {
    console.log("unarchiving")
    return api.post(`/api/v1/users/${id}`)
}

export async function getAccounts() {
    console.log("registering")
    return api.get("/api/v1/users/")
}

export async function getAccountInfo(id) {
    return api.get(`/api/v1/users/${id}`)
}
