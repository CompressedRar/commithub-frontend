import { useState } from "react";
import "../assets/styles/AuditLogs.css"


function AuditLogs() {
    return (
        <div className="audit-logs-container">
            <div className="audit-table-container">
                <div className=" table-headers">
                    <span className="table-title">Audit Logs</span>

                    <div className="options">
                        <div className="filter-modes">
                            <label htmlFor="filter">Filter By</label>
                            <select name="filter" id="filter">
                                <option value="alphabetical">Date</option>
                                <option value="alphabetical">Role</option>
                                <option value="alphabetical">Department</option>
                                <option value="alphabetical">Action</option>
                            </select>
                            <div className="modes">
                                <div className="pair">                                    
                                    <label htmlFor="from">From</label>
                                    <input type="text" placeholder="Start"/>
                                </div>
                                <span>-</span>
                                <div className="pair">                                    
                                    <label htmlFor="from">To</label>
                                    <input type="text" placeholder="End"/>
                                </div>
                            </div>
                        </div>
                        <input type="text" placeholder="Search" className="search-bar"/>
                    </div>
                    
                </div>

                <div className="table-container">
                    <table>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Department</th>
                            <th>Action</th>
                            <th>Target</th>
                        </tr>
                        <tr>
                            <td>2025-08-20 09:32 AM</td>
                            <td>User: John Doe</td>
                            <td>Computing Studies</td>
                            <td>Created IPCR</td>
                            <td>IPCR ID 21</td>
                        </tr>
                        <tr>
                            <td>2025-08-20 09:32 AM</td>
                            <td>User: John Doe</td>
                            <td>Computing Studies</td>
                            <td>Created IPCR</td>
                            <td>IPCR ID 21</td>
                        </tr>
                        <tr>
                            <td>2025-08-20 09:32 AM</td>
                            <td>User: John Doe</td>
                            <td>Computing Studies</td>
                            <td>Created IPCR</td>
                            <td>IPCR ID 21</td>
                        </tr>
                        <tr>
                            <td>2025-08-20 09:32 AM</td>
                            <td>User: John Doe</td>
                            <td>Computing Studies</td>
                            <td>Created IPCR</td>
                            <td>IPCR ID 21</td>
                        </tr>
                        
                    </table>
                    <div className="pagination">
                            <span className="pages">Previous</span>
                            <span className="pages active"> 1 </span>
                            <span className="pages"> 2 </span>
                            <span className="pages"> 3 </span>
                            <span className="pages">Next</span>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AuditLogs