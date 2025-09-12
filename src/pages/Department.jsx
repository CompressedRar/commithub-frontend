import { useEffect, useState } from "react";
import "../assets/styles/Department.css"
import { getDepartments } from "../services/departmentService";
import DepartmentInfo from "../components/DepartmentInfo";

function Department(){
    const [departments, setDepartments] = useState([])
    const [firstDepartment, setFirstDepartment] = useState()

    async function loadAllDepartments(){
        var res = await  getDepartments().then(data => data.data)
        setDepartments(res)
    }

    async function loadFirstDepartment() {
        
    }

    useEffect(()=>{
        loadAllDepartments()
    },[])
    return(
        <div className="department-container">
            <div className="all-departments-container">
                <div className="sidebar-title">
                    Departments
                </div>
                <div className="add-container">
                    <button>
                        <span className="material-symbols-outlined">add</span>
                        <span>Add Departments</span>
                    </button>
                </div>
                <div className = "all-departments">
                    {departments.map(dept => (
                        <div className="department" key={dept.id}>
                            <span className="material-symbols-outlined">{dept.icon}</span>
                            <span>{dept.name}</span>
                        </div>
                    ))}

                </div>  
            </div>

            <DepartmentInfo></DepartmentInfo>
        </div>
    )
}

export default Department