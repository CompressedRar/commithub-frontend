import api from "../components/api"
import axios from "axios"

export async function getPositions() {
    console.log("fetching positions")
    return api.get("/api/v1/auth/positions")
}

export async function getPositionInfo() {
    console.log("fetching positions")
    return api.get("/api/v1/positions/info")
}

export async function createPosition(data) {
    console.log("fetching positions")
    return api.post("/api/v1/positions/", data)
}

export async function updatePosition(data) {
    console.log("updating positions")
    return api.patch("/api/v1/positions/", data)
}

export async function archivePosition(id) {
    console.log("archive positions")
    return api.delete(`/api/v1/positions/archive/${id}`)
}


export async function restorePosition(id) {
    console.log("restoring positions")
    return api.patch(`/api/v1/positions/restoring/${id}`)
}