import api from "../components/api"
import axios from "axios"

export async function getMainTasks() {
    console.log("fetching tasks")
    return api.get("/api/v1/task/")
}

export async function getMainTask(id) {
    console.log("fetching task info")
    return api.get(`/api/v1/task/${id}`)
}

export async function createMainTask(data){
    return api.post("/api/v1/task/", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}

