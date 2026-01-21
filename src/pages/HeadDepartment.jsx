import { useEffect, useState } from "react";
import "../assets/styles/Department.css"
import Swal from "sweetalert2";
import HeadDepartmentInfo from "../components/DepartmentComponents/HeadDepartmentInfo";
import { jwtDecode } from "jwt-decode";
import DepartmentInfo from "../components/DepartmentComponents/DepartmentInfo";


function HeadDepartment(){
    const [departments, setDepartments] = useState([])
    const [currentDepartment, setCurrentDepartment] = useState(null)
    const token = localStorage.getItem("token")

    function readTokenInformation(){
        let payload = {}
        try {
            payload = jwtDecode(token)
            setCurrentDepartment(payload.department.id)

        }
        catch(err){
            console.log(err)
        }
    }

    

    useEffect(()=>{
        readTokenInformation()
    },[])


    return(

        <div className="department-container" style={{gridTemplateColumns:"1fr"}}>
            

            
            {currentDepartment && <DepartmentInfo key = {currentDepartment} id = {currentDepartment} ></DepartmentInfo>}
        </div>
    )
}

export default HeadDepartment