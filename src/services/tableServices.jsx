import api from "../components/api"

export async function getUserCount() {
    console.log("fetching user count")
    return api.get("/api/v1/auth/user-count")
}

export async function getTaskCount() {
    console.log("fetching task count")
    return api.get("/api/v1/task/count")
}


export async function getCategoryCount() {
    console.log("fetching category count")
    return api.get("/api/v1/category/count")
}

export async function getPopulationCount() {
    console.log("fetching category count")
    return api.get("/api/v1/chart/pie/population-per-department")
}

export async function getPerformancePerDepartment() {
    console.log("fetching performance")
    return api.get("/api/v1/chart/bar/performance-per-department")
}

export async function getUserPerformanceInDepartment(dept_id) {
    console.log("fetching performance")
    return api.get(`/api/v1/chart/bar/performance/${dept_id}`)
}

export async function getPerformanceSummary() {
    console.log("fetching performance")
    return api.get(`/api/v1/chart/bar/summary/`)
}

export async function getActivityTrend() {
    console.log("fetching activity trend")
    return api.get(`/api/v1/chart/line/activity/`)
}

export async function getLogsByHour() {
    console.log("fetching activity trend")
    return api.get(`/api/v1/chart/line/logs-by-hour/`)
}

export async function getActivityScatter() {
    console.log("fetching activity trend")
    return api.get(`/api/v1/chart/scatter/logs/`)
}