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
//assign department sa task dito
//connect yung route dito



export async function updateMainTaskInfo(data){
    return api.patch("/api/v1/task/", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}

export async function archiveMainTask(id) {
    console.log("archiving task info")
    return api.delete(`/api/v1/task/${id}`)
}

export async function convertTense(sentence) {
    console.log("archiving task info")
    return api.post("/api/v1/ai/tense-converter", {"sentence": sentence})

}



