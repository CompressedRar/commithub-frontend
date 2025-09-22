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

export async function removeUserFromDepartment(user_id) {
    console.log("removing user from department")
    return api.post(`/api/v1/department/remove/${user_id}`, {
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

export async function getDepartmentTasks(id) {
    console.log("fetching department tasks")
    return api.get(`/api/v1/department/tasks/${id}`)
}

export async function getAssignedUsers(dept_id, task_id) {
    console.log("fetching assigned users ")
    return api.get(`/api/v1/department/assigned/${dept_id}&${task_id}`)
}

export async function assignUsers(user_id, task_id) {
    console.log("fetching assigned users ")
    return api.post(`/api/v1/department/assigned/${user_id}&${task_id}`)
}

export async function unAssignUsers(user_id, task_id) {
    console.log("fetching assigned users ")
    return api.post(`/api/v1/department/unassign/${user_id}&${task_id}`)
}

export async function assignDepartment(task_id, dept_id){
    return api.post(`/api/v1/department/tasks/${task_id}&${dept_id}`)
}

export async function removeTask(task_id) {
    console.log("removing task")
    return api.delete(`/api/v1/department/remove/${task_id}`)
}