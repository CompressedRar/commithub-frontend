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