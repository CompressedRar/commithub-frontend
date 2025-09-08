import { useState } from "react";
import "../assets/styles/dashboard.css"
import UsersPieChart from "../components/Piechart";
import SubmissionsChart from "../components/Barchart";
function Administrator(){
    
    return (
        <div className="admin-dashboard-container">
            <div className="quick-stats-container"> 

                <div className="total-users-container">

                    <div className="count-per-department">
                        <span className="department-stats cs">
                            <span className="material-symbols-outlined">computer</span>
                            <span className="department-count">120</span>
                            <span className="department-label">Computing Studies Users</span>
                        </span>
                        <span className="department-stats ed">
                            <span className="material-symbols-outlined">auto_stories</span>
                            <span className="department-count">120</span>
                            <span className="department-label">Education Users</span>
                        </span>
                        <span className="department-stats hm">
                            <span className="material-symbols-outlined">flights_and_hotels</span>
                            <span className="department-count">120</span>
                            <span className="department-label">Hospitality Management Users</span>
                        </span>
                        <span className="department-stats ad">
                            <span className="material-symbols-outlined">format_ink_highlighter</span>
                            <span className="department-count">120</span>
                            <span className="department-label">Administrative Office Users</span>
                        </span>                        
                                            
                    </div>

                    
                </div>  
                
                <div className="total-tasks">
                    <div className="total-count-container">
                        <span className="material-symbols-outlined">group</span>
                        <span className="count">120</span>
                        <span>Total Users</span>
                    </div>

                    <div className="total-count-container">
                        <span className="material-symbols-outlined">task</span>                        
                        <span className="count">120</span>
                        <span>Total Tasks</span>
                    </div>

                    <div className="total-count-container">
                        <span className="material-symbols-outlined">category</span>
                        <span className="count">17</span>
                        <span>Total Categories</span>
                    </div>
                </div>  
            </div>

            <div className="system-overview">
                <div className="shortcuts">
                    <div className="manage">
                        <span className="material-symbols-outlined">manage_accounts</span>
                        <span>Manage Users</span>
                    </div>
                    <div className="manage">
                        <span className="material-symbols-outlined">apartment</span>
                        <span>Manage Departments</span>
                    </div>
                    <div className="manage">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <span>Manage Roles</span>
                    </div>
                </div>

                <div className="graph-container">
                    <div className="submissions-per-department">
                        Submissions by Department
                        <SubmissionsChart></SubmissionsChart>
                    </div>
                    <div className="performance-submissions">
                        IPCR vs OPCR
                        <UsersPieChart></UsersPieChart>
                    </div>
                    
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