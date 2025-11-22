import api from "../components/api"
import axios from "axios"

export async function getCategories() {
    console.log("fetching categories")
    return api.get("/api/v1/category/")
}

export async function getCategoriesWithTasks() {
    console.log("fetching categories")
    return api.get("/api/v1/category/tasks")
}


export async function getCategory(id) {
    console.log("fetching category info")
    return api.get(`/api/v1/category/${id}`)
}

export async function registerCategory(data) {
    console.log("registering category")
    return api.post("/api/v1/category/", data)
}

export async function archiveCategory(id) {
    console.log("archiving category")
    return api.delete(`/api/v1/category/${id}`)
}

export async function updateCategory(data){
    return api.patch("/api/v1/category/", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}