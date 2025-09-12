import { useEffect, useState } from "react";
import { getDepartments, getDepartment, getDepartmentMembers } from "../services/departmentService";
import DepartmentMemberTable from "./DepartmentMemberTable";
function DepartmentInfo(props){

    const [deptInfo, setDeptinfo] = useState({})
    const [managerInfo, setManagerInfo] = useState(null)

    async function loadDepartmentInfo(id){
        var res = await getDepartment(id).then(data => data.data)
        await setDeptinfo(res)
        await setManagerInfo(res.manager)
        
    }
    
    useEffect(()=>{
        loadDepartmentInfo(1)
    },[])

    

    return (
        <div className="department-info-container">
                <div className="department-overview">
                    
                    <div className="image-container">
                        <div className="image"></div>
                    </div>
                    <div  className="department-stats">
                        <div className="profile-image-container">
                            
                            <span className="profile-title">

                                <div className="dept-name">{deptInfo? deptInfo.name: ""}</div>

                                <span className="dept-head-container">
                                    <div style={{fontWeight:"light"}}>Managed by: </div>
                                    {managerInfo? <div className="dept-head">
                                        <div className="img-container">
                                            <img src="dummy.jpg" alt="" />
                                        </div>
                                        <div className="dept-head-name">
                                            John Doe
                                        </div>
                                    </div>: <span>None</span> }
                                </span>
                                
                            </span>
                           
                        </div>
                        
                        <div className="main-stats">
                            <div className="stats">
                                <span className="material-symbols-outlined">article</span>
                                <span className="count">{deptInfo? deptInfo.opcr_count: ""}</span>
                                <span className="type">OPCR</span>
                            </div>
                            <div className="stats">
                                <span className="material-symbols-outlined">article_person</span>
                                <span className="count">{deptInfo? deptInfo.ipcr_count: ""}</span>
                                <span className="type">IPCR</span>
                            </div>

                            <div className="stats">
                                <span className="material-symbols-outlined">group</span>
                                <span className="count">{deptInfo? deptInfo.user_count: ""}</span>
                                <span className="type">Members</span>
                            </div>

                            <div className="stats">
                                <span className="material-symbols-outlined">task</span>
                                <span className="count">{deptInfo? deptInfo.main_tasks_count: ""}</span>
                                <span className="type">Tasks</span>
                            </div>                            
                        </div>

                                                
                    </div>
                </div>

                                       
                <DepartmentMemberTable deptid ={1} ></DepartmentMemberTable>

                <div className="member-container">
                    <div className="table-header-container">

                        <div className="table-title">Department Tasks</div>
                        {/**<div className="add-members">
                            <button>
                                <span className="material-symbols-outlined">add</span>
                                <span>Add Members</span>
                            </button>
                        </div>
                        <div className="sorting-container">
                            <label htmlFor="sort">Sort By: </label>
                            <select name="sort" id="sort">
                                <option value="">First Name</option>
                                <option value="">Last Name</option>
                                <option value="">Role</option>
                                <option value="">Date Created</option>
                            </select>
                            <select name="sort" id="sort">
                                <option value="">Ascending</option>
                                <option value="">Descending</option>
                            </select>
                        </div> */
                            
                        }
                        <div className="search-members">
                            <input type="text" placeholder="Search task..."/>                        
                        </div>                        
                    </div>

                    <div className="table-container">
                        <table>
                            <tbody>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        TASK NAME
                                    </th>
                                    <th>
                                        TARGET
                                    </th>
                                    <th>
                                        ACTUAL
                                    </th>
                                    <th>
                                        CATEGORY
                                    </th>
                                    <th>
                                        INDIVIDUALS ACCOUNTABLE
                                    </th>
                                    <th>
                                    ACTIONS 
                                    </th>
                                </tr>
                                <tr>
                                    <td>12</td>                                    
                                    <td>Board of Trustees meeting</td>
                                    <td>Prepares agenda, invitation letter, budget for Board of Trustees meeting in</td>
                                    <td>Prepares agenda, invitation letter, budget for Board of Trustees meeting in</td>
                                    <td>School Leadership and Management Services</td>
                                    <td>Dr. Ma. Liberty DG. Pascual</td>
                                    <td>
                                        <span className="material-symbols-outlined">more_vert
                                            {/**
                                             * remove task
                                             * assign member
                                             */}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>

                               
                        </table>
                        
                    </div>
                    <div className="pagination">
                            
                    </div>
                </div>
            </div>
    )
}

export default DepartmentInfo