
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