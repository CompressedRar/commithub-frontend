import api from "../components/api"
import axios from "axios"

export async function getUserCount() {
    console.log("fetching user count")
    return api.get("/api/v1/auth/user-count")
}