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

export async function updatePassword(user_id,data){
    return api.patch(`/api/v1/users/change-password/${user_id}`, data)
}

export async function resetAccountPasssword(id) {
    console.log("resetting password")
    return api.patch(`/api/v1/users/reset-password/${id}`)
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

export async function doesPresidentExists() {
    console.log("registering")
    return api.get("/api/v1/users/pres-exists")
}


export async function getAccountInfo(id) {
    return api.get(`/api/v1/users/${id}`)
}

export async function getAccountTasks(id) {
    return api.get(`/api/v1/users/tasks/${id}`)
}

export async function getAssignedAccountTasks(id) {
    return api.get(`/api/v1/users/assigned/${id}`)
}

export async function getAccountNotification(id) {
    return api.get(`/api/v1/users/notification/${id}`)
}

export async function readNotification(id_array) {
    return api.patch(`/api/v1/users/notifications/`, {"id": id_array})
}



export async function createUserTasks(user_id, id_array){
    console.log("creawting user tasks")
    return api.post(`/api/v1/users/tasks/${user_id}`, {"task_ids": id_array}, {
        headers: {
            "Content-Type": "application/json"
        }
    })
}
