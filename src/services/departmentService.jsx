import api from "../components/api"
import axios from "axios"

export async function getDepartments() {
    console.log("fetching departments")
    return api.get("/api/v1/department/")
}

export async function getDepartment(id) {
    console.log("fetching department info")
    return api.get(`/api/v1/department/${id}`)
}

export async function getDepartmentMembers(id, offset, limit) {
    console.log("fetching department members")
    return api.get(`/api/v1/department/members/${id}?offset=${offset}&limit=${limit}`)
}

export async function registerDepartment(data) {
    console.log("registering department")
    return api.post("/api/v1/department/create", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}

export async function updateDepartment(data) {
    console.log("updating department")
    return api.post("/api/v1/department/update", data, {
        headers: {
            "Content-type": "multipart/form-data"
        }
    })
}

export async function archiveDepartment(id) {
    console.log("archiving department")
    return api.delete(`/api/v1/department/${id}`)
}