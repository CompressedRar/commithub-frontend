import { useState } from "react";
import "../assets/styles/Department.css"

function Department(){
    
    return(
        <div className="department-container">
            <div className="all-departments-container">
                <div className="sidebar-title">
                    Departments
                </div>
                <div className = "all-departments">
                    <div className="department">
                        <span className="material-symbols-outlined">computer</span>
                        <span>Computing Studies</span>
                    </div>
                    <div className="department">
                        <span className="material-symbols-outlined">auto_stories</span>
                        <span>Education</span>
                    </div>
                    <div className="department">
                        <span className="material-symbols-outlined">flights_and_hotels</span>
                        <span>Hospitality Management</span>
                    </div>
                    <div className="department">
                        <span className="material-symbols-outlined">format_ink_highlighter</span>
                        <span>Registrar</span>
                    </div>
                    <div className="department">
                        <span className="material-symbols-outlined">local_library</span>
                        <span>Library</span>
                    </div>
                    <div className="department">
                        <span className="material-symbols-outlined">Groups</span>
                        <span>Student Affairs</span>
                    </div>
                </div>  
            </div>

            <div className="department-info-container">

                <div className="department-overview">
                    
                    <div className="image-container">
                        <div className="image"></div>
                    </div>
                    <div  className="department-stats">
                        <div className="profile-image-container">
                            
                            <span className="profile-title">
                                <div className="dept-name">Computing Studies</div>
                                <span className="dept-head-container">
                                    <div style={{fontWeight:"light"}}>Managed by: </div>
                                    <div className="dept-head">
                                        <div className="img-container">
                                            <img src="dummy.jpg" alt="" />
                                        </div>
                                        <div className="dept-head-name">
                                            John Doe
                                        </div>
                                    </div> 
                                </span>
                                
                            </span>
                           
                        </div>
                        
                        <div className="main-stats">
                            <div className="stats">
                                <span className="material-symbols-outlined">article</span>
                                <span className="count">12</span>
                                <span className="type">OPCR</span>
                            </div>
                            <div className="stats">
                                <span className="material-symbols-outlined">article_person</span>
                                <span className="count">12</span>
                                <span className="type">IPCR</span>
                            </div>

                            <div className="stats">
                                <span className="material-symbols-outlined">group</span>
                                <span className="count">12</span>
                                <span className="type">Members</span>
                            </div>

                            <div className="stats">
                                <span className="material-symbols-outlined">task</span>
                                <span className="count">12</span>
                                <span className="type">Tasks</span>
                            </div>                            
                        </div>

                        

                        
                    </div>
                </div>

                <div className="member-container">
                    <div className="table-header-container">

                        <div className="table-title">Department Members</div>
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
                            <input type="text" placeholder="Search member..."/>                        
                        </div>                        
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        FIRST NAME
                                    </th>
                                    <th>
                                        LAST NAME
                                    </th>
                                    <th>
                                        DEPARTMENT
                                    </th>
                                    <th>
                                        POSITION
                                    </th>
                                    <th>
                                        ROLE
                                    </th>
                                    <th>
                                       ACTIONS 
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>12</td>
                                    <td>John</td>
                                    <td>Doe</td>
                                    <td>Computing Studies</td>
                                    <td>Instructor</td>
                                    <td>Faculty</td>
                                    <td>Edit/Delete</td>
                                </tr>
                                <tr>
                                    <td>12</td>
                                    <td>John</td>
                                    <td>Doe</td>
                                    <td>Computing Studies</td>
                                    <td>Instructor</td>
                                    <td>Faculty</td>
                                    <td>Edit/Delete</td>
                                </tr>
                                <tr>
                                    <td>12</td>
                                    <td>John</td>
                                    <td>Doe</td>
                                    <td>Computing Studies</td>
                                    <td>Instructor</td>
                                    <td>Faculty</td>
                                    <td>Edit/Delete</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Department