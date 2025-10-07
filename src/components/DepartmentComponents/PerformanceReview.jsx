import { useEffect, useState } from "react"
import { getDepartmentIPCR, getDepartmentOPCR } from "../../services/departmentService"
import IPCR from "../Faculty/IPCR"

import EditIPCR from "../Faculty/EditIPCR"
import ManageSupportingDocuments from "../Faculty/ManageSupportingDocuments"
import OPCR from "./OPCR"
import { socket } from "../api"
import EditOPCR from "./EditOPCR"
import Swal from "sweetalert2"


function PerformanceReviews(props){
    const [allIPCR, setAllIPCR] = useState(null)
    const [allOPCR, setAllOPCR] = useState(null)
    const [currentIPCRID, setCurrentIPCRID] = useState(null)
    const [currentOPCRID, setCurrentOPCRID] = useState(null)
    const [batchID, setBatchID] = useState(null)

    async function loadIPCR() {
        var res = await getDepartmentIPCR(props.deptid).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setAllIPCR(res)
        console.log("IPCRS: ",res)
    }

    async function loadOPCR() {
        var res = await getDepartmentOPCR(props.deptid).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setAllOPCR(res)
        console.log("OPCRS: ", res)
    }

    useEffect(()=> {
        loadIPCR()
        loadOPCR()

        socket.on("ipcr_create", ()=>{
            loadIPCR()
            loadOPCR()

            console.log("SDOMERTHING CHANGED")
        })

        socket.on("opcr", ()=>{
            loadIPCR()
            loadOPCR()
        })

        socket.on("ipcr", ()=>{
            loadIPCR()
            loadOPCR()
        })


    }, [])

    //gawin yung highest performing deparmtent
    return (
        <div className="performance-reviews-container">
            {batchID && currentIPCRID? <ManageSupportingDocuments  dept_mode = {true} key={currentIPCRID} ipcr_id = {currentIPCRID} batch_id = {batchID}></ManageSupportingDocuments>:""}
            <div className="modal fade" id="view-ipcr" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable modal-fullscreen" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {currentIPCRID && <EditIPCR dept_id = {props.deptid} key={currentIPCRID} ipcr_id = {currentIPCRID} dept_mode = {true} switchPage={()=>{

                            }}></EditIPCR>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="view-opcr" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-fullscreen" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {currentOPCRID && <EditOPCR opcr_id = {currentOPCRID}></EditOPCR>}
                        </div>
                    </div>
                </div>
            </div>
            <h3>Office Performance Review and Commitment Forms</h3>
            <div className="all-ipcr-container">
                
                {allOPCR && allOPCR.map(opcr => (
                    opcr.status == 1 ?<OPCR opcr = {opcr} onClick={()=>{
                        setCurrentOPCRID(opcr.id)
                    }}></OPCR> :""
                ))}
            </div>
            {allOPCR && allOPCR.length == 0?
                    <div className="empty-symbols">
                        <span className="material-symbols-outlined">file_copy_off</span>    
                        <span className="desc">No OPCRs Found</span>
                    </div>:""} 

            <h3>Individual Performance Review and Commitment Forms</h3>
            <div className="all-ipcr-container">
                
                {allIPCR && allIPCR.map(ipcr => (
                    ipcr.status == 1? <IPCR onMouseOver = {()=>{
                        setBatchID(ipcr.batch_id)
                        setCurrentIPCRID(ipcr.id)
                        console.log(ipcr.id)
                    }} onClick={()=>{
                        setCurrentIPCRID(ipcr.id)
                    }} ipcr = {ipcr} dept_mode = {true}></IPCR> :""
                ))}

                 
            </div>
            {allIPCR && allIPCR.length == 0?
                    <div className="empty-symbols">
                        <span className="material-symbols-outlined">file_copy_off</span>    
                        <span className="desc">No IPCRs Found</span>
            </div>:""} 
        </div>
    )
}

export default PerformanceReviews