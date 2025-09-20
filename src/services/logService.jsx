import api from "../components/api"
import axios from "axios"

export async function getLogs() {
    console.log("fetching logs")
    return api.get("/api/v1/log/")
}