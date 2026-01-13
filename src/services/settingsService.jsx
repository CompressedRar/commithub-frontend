
import api from "../components/api"
import axios from "axios"

export async function getSettings() {
    console.log("fetching settings")
    return api.get("/api/v1/settings/")
}

export async function updateSettings(data) {
    console.log("updating settings")
    return api.patch("/api/v1/settings/", data)
}

export async function verifyAdminPassword(data) {
    console.log("verifying admin password")
    return api.post("/api/v1/auth/verify-admin-password", data)
}
export async function validateFormula(data) {
    console.log("validating formula")
    return api.post("/api/v1/settings/validate-formula", data)
}