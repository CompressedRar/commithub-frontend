import api from "../components/api"
import axios from "axios"

export async function getPositions() {
    console.log("fetching positions")
    return api.get("/api/v1/auth/positions")
}