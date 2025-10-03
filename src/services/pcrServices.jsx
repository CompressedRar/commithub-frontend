import api from "../components/api"
import axios from "axios"

//remove and add task in ipcr edit

export async function getIPCR(ipcr_id) {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/${ipcr_id}`)
}

export async function getOPCR(opcr_id) {
    console.log("fetching opcr")
    return api.get(`/api/v1/pcr/opcr/${opcr_id}`)
}

export async function downloadIPCR(ipcr_id) {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/download/${ipcr_id}`)
}

export async function downloadOPCR(opcr_id) {
    console.log("fetching opcr")
    return api.get(`/api/v1/pcr/opcr/download/${opcr_id}`)
}

export async function approveIPCR(ipcr_id) {
    console.log("approving opcr")
    return api.post(`/api/v1/pcr/ipcr/approve/${ipcr_id}`)
}

export async function updateSubTask(sub_task_id, field, value) {
    console.log("updating sub task")
    return api.patch(`/api/v1/task/sub_task/${sub_task_id}?field=${field}&value=${value}`)
}

export async function assignMainIPCR(ipcr_id, user_id) {
    console.log("assigning ipcr")
    return api.patch(`/api/v1/pcr/ipcr/${ipcr_id}&${user_id}`)
}

export async function archiveIprc(ipcr_id) {
    console.log("archiving ipcr")
    return api.delete(`/api/v1/pcr/ipcr/${ipcr_id}`)
}

export async function archiveOprc(opcr_id) {
    console.log("archiving opcr")
    return api.delete(`/api/v1/pcr/opcr/${opcr_id}`)
}

export async function removeSubTaskInIprc(main_task_id, batch_id) {
    return api.delete(`/api/v1/pcr/ipcr/task/${main_task_id}&${batch_id}`)
}

export async function archiveDocument(document_id) {
    return api.delete(`/api/v1/pcr/ipcr/documents/${document_id}`)
}

export async function addSubTaskInIprc(main_task_id, batch_id, user_id, ipcr_id) {
    return api.post(`/api/v1/pcr/ipcr/task/${main_task_id}&${batch_id}&${user_id}&${ipcr_id}`)
}

export async function generatePreSignedURL(data) {
    return api.post(`/api/v1/pcr/generate_presigned_url`, data)
}

export async function getSupportingDocuments(ipcr_id) {
    return api.get(`/api/v1/pcr/ipcr/documents/${ipcr_id}`)
}

export async function recordFileUploadInfo(data) {
    return api.post(`/api/v1/pcr/record`, data)
}

export async function createOPCR(dept_id, data) {
    return api.post(`/api/v1/pcr/opcr/${dept_id}`, data)
}
