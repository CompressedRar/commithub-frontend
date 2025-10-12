import { useEffect, useState } from "react";
import "../assets/styles/dashboard.css"

import { getCategoryCount, getTaskCount, getUserCount } from "../services/tableServices";
import PopulationPerDepartment from "../components/Charts/PopulationPerDepartment";
import PerformancePerDepartment from "../components/Charts/PerformancePerDepartment";
import PerformanceSummaryPerDepartment from "../components/Charts/PerformanceSummaryPerDepartment";
import ActivityTrendChart from "../components/Charts/ActivityTrendChart";
import { TopDepartmentChats } from "../components/Charts/CategoryPerformance";
import AllTaskAverages from "../components/Charts/AllTaskAverage";
import { downloadMasterOPCR } from "../services/pcrServices";

//gawin bukas yung graph sa category
//yung generation ng ipcr, i check yung mga individuals kung tama
//gawin yung presidnet module


function Administrator(){

    const [csCount, setCSCount] = useState(0)
    const [educCount, setEDCount] = useState(0)
    const [hmCount, setHMCount] = useState(0)
    const [otherCount, setOtherCount] = useState(0)
    const [allCount, setAllCount] = useState(0)

    const [taskCount, setTaskCount] = useState(0)
    const [categoryCount, setCategoryCount] = useState(0)
    const [downloading, setDownloading] = useState(false)

    async function download() {
        setDownloading(true)
        var res = await downloadMasterOPCR().then(data => data.data.link).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        window.open(res, "_blank", "noopener,noreferrer");
        setDownloading(false)
    }

    useEffect(()=> {
        getUserCount().then(data => {
            console.log(data.data.message)
            setCSCount(data.data.message.cs)
            setEDCount(data.data.message.educ)
            setHMCount(data.data.message.hm)
            setOtherCount(data.data.message.other)
            setAllCount(data.data.message.all)
        }).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: "An error occured while fetching count.",
                icon: "error"
            })
        })

        getTaskCount().then(data => {
            setTaskCount(data.data.message.count)
        }).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: "An error occured while fetching count.",
                icon: "error"
            })
        })

        getCategoryCount().then(data => {
            setCategoryCount(data.data.message.count)
        }).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: "An error occured while fetching count.",
                icon: "error"
            })
        })
        
    }, [])
    
    return (
        <div className="admin-dashboard-container">
            <div>
                <button style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"10px"}} className="btn btn-primary" onClick={()=>{download()}}>
                            <span className="material-symbols-outlined">{downloading? "refresh": "download"}</span>
                            {!downloading? <span>Download Master OPCR</span>:""}
                        </button>
            </div>
            <div className="quick-stats-container"> 

                <div className="total-users-container">

                    <div className="count-per-department">
                        <span className="department-stats cs">
                            <span className="material-symbols-outlined">computer</span>
                            <span className="department-count">{csCount}</span>
                            <span className="department-label">Computing Studies Users</span>
                        </span>
                        <span className="department-stats ed">
                            <span className="material-symbols-outlined">auto_stories</span>
                            <span className="department-count">{educCount}</span>
                            <span className="department-label">Education Users</span>
                        </span>
                        <span className="department-stats hm">
                            <span className="material-symbols-outlined">flights_and_hotels</span>
                            <span className="department-count">{hmCount}</span>
                            <span className="department-label">Hospitality Management Users</span>
                        </span>
                        <span className="department-stats ad">
                            <span className="material-symbols-outlined">format_ink_highlighter</span>
                            <span className="department-count">{otherCount}</span>
                            <span className="department-label">Administrative Offices Users</span>
                        </span>                        
                                            
                    </div>

                    
                </div>  
                
                <div className="total-tasks">
                    <div className="total-count-container">
                        <span className="material-symbols-outlined">group</span>
                        <span className="count">{allCount}</span>
                        <span>Total Users</span>
                    </div>

                    <div className="total-count-container">
                        <span className="material-symbols-outlined">task</span>                        
                        <span className="count">{taskCount}</span>
                        <span>Total Tasks</span>
                    </div>

                    <div className="total-count-container">
                        <span className="material-symbols-outlined">category</span>
                        <span className="count">{categoryCount}</span>
                        <span>Total Categories</span>
                    </div>
                </div>  
            </div>
            <div className="shortcuts" >
                    <a className="manage" href = "/admin/users">
                        <span className="material-symbols-outlined">manage_accounts</span>
                        <span>Manage Users</span>
                    </a>
                    <a className="manage" href = "/admin/department">
                        <span className="material-symbols-outlined">apartment</span>
                        <span>Manage Departments</span>
                    </a>
                    <a className="manage" href = "/admin/tasks">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <span>Manage Tasks</span>
                    </a>
                </div>
            <div className="system-overview">
                

                <div className="graph-container">
                    <ActivityTrendChart></ActivityTrendChart>
                    <PopulationPerDepartment></PopulationPerDepartment>
                    <PerformancePerDepartment></PerformancePerDepartment>
                    <PerformanceSummaryPerDepartment></PerformanceSummaryPerDepartment>
                    <TopDepartmentChats></TopDepartmentChats>
                    <AllTaskAverages></AllTaskAverages>
                </div>
            </div>

            <div className="logs-container">
                <div className="logs-options">
                    <button className="option">
                        <span className="material-symbols-outlined">history_2</span>
                        <span>All Logs</span>
                    </button>
                    <button className="option">
                        <span className="material-symbols-outlined">door_open</span>
                        <span>Recent Logins</span>
                    </button>
                    <button className="option">
                        <span className="material-symbols-outlined">browse_activity</span>
                        <span>Recent Activities</span>
                    </button>
                </div>
                <div className="logs">
                    <div className="activity">
                        
                        <span className="description">
                            <span className="material-symbols-outlined">login</span> 
                            User: "Jiovanni" logged into the system.
                        </span>
                        <span className="timestamp">Sept. 12, 2025 12:41pm</span>
                    </div>
                    <div className="activity">
                        
                        <span className="description"><span className="material-symbols-outlined">logout</span> User: "Jiovanni" logged out the system.</span>
                        <span className="timestamp">Sept. 12, 2025 12:41pm</span>
                    </div>
                    <div className="activity">
                        
                        <span className="description"><span className="material-symbols-outlined">assignment_add</span> User: "Jiovanni" created a new IPCR.</span>
                        <span className="timestamp">Sept. 12, 2025 12:41pm</span>
                    </div>
                    <div className="activity">
                        
                        <span className="description"><span className="material-symbols-outlined">assignment_turned_in</span> User: "Jiovanni" submitted IPCR.</span>
                        <span className="timestamp">Sept. 12, 2025 12:41pm</span>
                    </div>
                    <div className="activity">
                         
                        <span className="description"><span className="material-symbols-outlined">assignment_turned_in</span>User: "Jiovanni" submitted IPCR.</span>
                        <span className="timestamp">Sept. 12, 2025 12:41pm</span>
                    </div>
                    <div className="activity">

                        <span className="description"><span className="material-symbols-outlined">attach_file_add</span> User: "Jiovanni" attached supporting documents.</span>
                        <span className="timestamp">Sept. 12, 2025 12:41pm</span>
                    </div>
                </div>
            </div>
            
        </div>
    )
}
 
export default Administrator