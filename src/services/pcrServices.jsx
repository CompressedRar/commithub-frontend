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

export async function getMasterOPCR() {
    console.log("fetching master opcr")
    return api.get(`/api/v1/pcr/master-opcr/`)
}

export async function downloadIPCR(ipcr_id) {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/download/${ipcr_id}`)
}

export async function downloadOPCR(opcr_id) {
    console.log("fetching opcr")
    return api.get(`/api/v1/pcr/opcr/download/${opcr_id}`)
}

export async function downloadMasterOPCR() {
    console.log("fetching opcr")
    return api.get(`/api/v1/pcr/master-opcr/download/`)
}

export async function approveOPCR(opcr_id) {
    console.log("approving opcr")
    return api.post(`/api/v1/pcr/opcr/approve/${opcr_id}`)
}

export async function reviewOPCR(opcr_id) {
    console.log("reviewing opcr")
    return api.post(`/api/v1/pcr/opcr/review/${opcr_id}`)
}

export async function approveIPCR(ipcr_id) {
    console.log("approving opcr")
    return api.post(`/api/v1/pcr/ipcr/approve/${ipcr_id}`)
}

export async function reviewIPCR(ipcr_id) {
    console.log("reviewing opcr")
    return api.post(`/api/v1/pcr/ipcr/review/${ipcr_id}`)
}

export async function rejectIPCR(ipcr_id) {
    console.log("reviewing ipcr")
    return api.post(`/api/v1/pcr/ipcr/reject/${ipcr_id}`)
}

export async function rejectOPCR(opcr_id) {
    console.log("rejecting opcr")
    return api.post(`/api/v1/pcr/opcr/reject/${opcr_id}`)
}

export async function updateSubTask(sub_task_id, field, value) {
    console.log("updating sub task")
    return api.patch(`/api/v1/task/sub_task/${sub_task_id}?field=${field}&value=${value}`)
}

export async function assignMainIPCR(ipcr_id, user_id) {
    console.log("assigning ipcr")
    return api.patch(`/api/v1/pcr/ipcr/${ipcr_id}&${user_id}`)
}

export async function assignPresIPCR(ipcr_id, user_id) {
    console.log("assigning ipcr")
    return api.patch(`/api/v1/pcr/ipcr-pres/${ipcr_id}&${user_id}`)
}

export async function assignMainOPCR(opcr_id, dept_id) {
    console.log("assigning opcr")
    return api.patch(`/api/v1/pcr/opcr/${opcr_id}&${dept_id}`)
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

export async function getOPCRSupportingDocuments(opcr_id) {
    return api.get(`/api/v1/pcr/opcr/documents/${opcr_id}`)
}

export async function recordFileUploadInfo(data) {
    return api.post(`/api/v1/pcr/record`, data)
}

export async function createOPCR(dept_id, data) {
    return api.post(`/api/v1/pcr/opcr/${dept_id}`, data)
}


export async function getFacultyPending(dept_id) {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/faculty/pending/${dept_id}`)
}

export async function getFacultyReviewed() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/faculty/reviewed`)
}

export async function getFacultyApproved() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/faculty/approved`)
}

export async function getHeadPending() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/head/pending`)
}

export async function getHeadReviewed() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/head/reviewed`)
}

export async function getHeadApproved() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/ipcr/head/approved`)
}

export async function getOPCRPending() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/opcr/pending`)
}

export async function getOPCRReviewed() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/opcr/reviewed`)
}

export async function getOPCRApproved() {
    console.log("fetching ipcr")
    return api.get(`/api/v1/pcr/opcr/approved`)
}
