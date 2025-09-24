import IPCRContainer from "../components/Faculty/IPCRContainer"
import "../assets/styles/Faculty.css"
import { useState } from "react"
import EditIPCR from "../components/Faculty/EditIPCR"

function Faculty(){
    const [currentPage, setCurrentPage] = useState(0)
    const [currentIPCRID, setCurrentIPCRID] = useState(0)
    return(
        <div className="faculty-container">
            {currentPage == 0? <IPCRContainer switchPage={(ipcr_id)=>{
                setCurrentPage(1)
                setCurrentIPCRID(ipcr_id)
            }}></IPCRContainer>: 
            <EditIPCR ipcr_id = {currentIPCRID} switchPage = {()=> {
                setCurrentPage(0)
                setCurrentIPCRID(0)
            }}></EditIPCR>}
            
        </div>
    )
}

export default Faculty