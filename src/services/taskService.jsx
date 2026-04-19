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

/**
 * Create a main task with a form template
 * @param {Object} taskData - Task data including form_template_id
 * @returns {Promise} - Created task with ID
 */
export async function createMainTaskWithForm(taskData) {
    try {
        console.log("Creating task with form template:", taskData)
        const response = await api.post("/api/v1/task/with-form", taskData, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        return response.data
    } catch (error) {
        console.error("Error creating task with form:", error.response?.data || error.message)
        throw error.response?.data || { error: "Failed to create task with form" }
    }
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

/**
 * Submit user response to a form-based task
 * @param {number} taskId - ID of the main task
 * @param {Object} responseData - User's response data
 * @returns {Promise} - Response from server
 */
export async function submitFormTaskResponse(taskId, responseData) {
    try {
        console.log("Submitting form task response:", { taskId, responseData })
        const response = await api.post(`/api/v1/task/${taskId}/submit-form-response`, responseData)
        return response.data
    } catch (error) {
        console.error("Error submitting form task response:", error.response?.data || error.message)
        throw error.response?.data || { error: "Failed to submit form task response" }
    }
}



