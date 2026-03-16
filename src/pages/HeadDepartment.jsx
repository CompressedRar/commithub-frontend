import { useEffect, useState } from "react";
import "../assets/styles/Department.css"
import { jwtDecode } from "jwt-decode";
import DepartmentDetails from "../components/DepartmentComponents/DepartmentPage/DepartmentDetails";


function HeadDepartment(){
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

            {currentDepartment && <DepartmentDetails headMode={true} departmentId={currentDepartment} ></DepartmentDetails>}
        </div>
    )
}

export default HeadDepartment