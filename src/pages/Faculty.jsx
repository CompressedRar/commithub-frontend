import IPCRContainer from "../components/Faculty/IPCRContainer"
import "../assets/styles/Faculty.css"
import { useState } from "react"
import EditIPCR from "../components/Faculty/EditIPCR"

function Faculty(){
    const [currentPage, setCurrentPage] = useState(0)
    const [currentIPCRID, setCurrentIPCRID] = useState(0)
    const [departmentID, setDepartmentID] = useState(0)
    return(
        <div className="faculty-container">
            {currentPage == 0? <IPCRContainer switchPage={(ipcr_id, dept_id)=>{

                setTimeout(()=> {
                    setCurrentPage(1)
                    setCurrentIPCRID(ipcr_id)
                    setDepartmentID(dept_id)
                    console.log("switching dept id: ", dept_id)
                }, 500)
                
            }}></IPCRContainer>: 
            <EditIPCR 
                dept_id = {departmentID} mode = {"faculty"} ipcr_id = {currentIPCRID} 
                switchPage = {()=> {
                setCurrentPage(0)
                setCurrentIPCRID(null)
            }}></EditIPCR>}
            
        </div>
    )
}

export default Faculty