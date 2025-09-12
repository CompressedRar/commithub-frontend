import { useState } from "react";
import "../assets/styles/UserManagement.css"


function UserManagement(){
    return (
        <div className="user-management-container">
            
            <div className="user-table-container">

                <div className="table-header">                    
                    <div className="options">
                        <div className="table-title">User Management</div>
                        <button>
                            <span className="material-symbols-outlined">add</span>
                            <span>Add User</span>
                        </button>
                    </div>
                    <div className="search-container">
                        <input type="text" placeholder="Search User..."/>
                    </div>
                </div>

                <table>
                    <tr>
                                <th>
                                    ID
                                </th>
                                <th>
                                    EMAIL ADDRESS
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
                                <th style={{textAlign:"center"}} className="action-header">
                                   ACTIONS 
                                </th>
                            </tr>
                            <tr>
                                <td>12</td>                                    
                                <td>johndoe@gmail.com</td>
                                <td>John</td>
                                <td>Doe</td>
                                <td>Computing Studies</td>
                                <td>Instructor</td>
                                <td>Faculty</td>
                                <td className="actions">
                                    <span className="material-symbols-outlined">settings</span>    
                                    {/**
                                     * Edit Information
                                     * Assign Role
                                     * Deactivate
                                     * View Profile
                                     */}
                                </td>
                            </tr>
                            <tr>
                                <td>12</td>                                    
                                <td>johndoe@gmail.com</td>
                                <td>John</td>
                                <td>Doe</td>
                                <td>Computing Studies</td>
                                <td>Instructor</td>
                                <td>Faculty</td>
                                <td className="actions">
                                    <span className="material-symbols-outlined">settings</span>    
                                    {/**
                                     * Edit Information
                                     * Assign Role
                                     * Deactivate
                                     * View Profile
                                     */}
                                </td>
                            </tr>
                            <tr>
                                <td>12</td>                                    
                                <td>johndoe@gmail.com</td>
                                <td>John</td>
                                <td>Doe</td>
                                <td>Computing Studies</td>
                                <td>Instructor</td>
                                <td>Faculty</td>
                                <td className="actions">
                                    <span className="material-symbols-outlined">settings</span>    
                                    {/**
                                     * Edit Information
                                     * Assign Role
                                     * Deactivate
                                     * View Profile
                                     */}
                                </td>
                            </tr>
                            <tr>
                                <td>12</td>                                    
                                <td>johndoe@gmail.com</td>
                                <td>John</td>
                                <td>Doe</td>
                                <td>Computing Studies</td>
                                <td>Instructor</td>
                                <td>Faculty</td>
                                <td className="actions">
                                    <span className="material-symbols-outlined">settings</span>    
                                    {/**
                                     * Edit Information
                                     * Assign Role
                                     * Deactivate
                                     * View Profile
                                     */}
                                </td>
                            </tr>
                            <tr>
                                <td>12</td>                                    
                                <td>johndoe@gmail.com</td>
                                <td>John</td>
                                <td>Doe</td>
                                <td>Computing Studies</td>
                                <td>Instructor</td>
                                <td>Faculty</td>
                                <td className="actions">
                                    <span className="material-symbols-outlined">settings</span>    
                                    {/**
                                     * Edit Information
                                     * Assign Role
                                     * Deactivate
                                     * View Profile
                                     */}
                                </td>
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
    )
}
 
export default UserManagement