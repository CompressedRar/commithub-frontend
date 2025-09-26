import api from "../components/api"
import axios from "axios"

//remove and add task in ipcr edit

export async function getIPCR(ipcr_id) {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/${ipcr_id}`)
}


export async function updateSubTask(sub_task_id, field, value) {
    console.log("updating sub task")
    return api.patch(`/api/v1/task/sub_task/${sub_task_id}?field=${field}&value=${value}`)
}

export async function assignMainIPCR(ipcr_id, user_id) {
    console.log("assigning ipcr")
    return api.patch(`/api/v1/pcr/ipcr/${ipcr_id}&${user_id}`)
}


export async function removeSubTaskInIprc(main_task_id, batch_id) {
    return api.delete(`/api/v1/pcr/ipcr/task/${main_task_id}&${batch_id}`)
}


export async function addSubTaskInIprc(main_task_id, batch_id, user_id, ipcr_id) {
    return api.post(`/api/v1/pcr/ipcr/task/${main_task_id}&${batch_id}&${user_id}&${ipcr_id}`)
}