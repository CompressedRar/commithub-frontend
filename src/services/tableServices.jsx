import api from "../components/api"
import axios from "axios"

export async function getUserCount() {
    console.log("fetching user count")
    return api.get("/api/v1/auth/user-count")
}

export async function getTaskCount() {
    console.log("fetching task count")
    return api.get("/api/v1/task/count")
}


export async function getCategoryCount() {
    console.log("fetching category count")
    return api.get("/api/v1/category/count")
}