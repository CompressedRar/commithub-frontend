import { useEffect, useState } from "react"

import EditIPCR from "../Faculty/EditIPCR"
import ManageSupportingDocuments from "../Faculty/ManageSupportingDocuments"
import { socket } from "../api"
import EditOPCR from "./EditOPCR"
import Swal from "sweetalert2"
import { getFacultyPending, getHeadPending, getOPCRPending, reviewIPCR } from "../../services/pcrServices"
import PendingIPCR from "./PendingPCR"
import { jwtDecode } from "jwt-decode"


function HeadPendingReviews(){
    const [allIPCR, setAllIPCR] = useState(null)
    const [allOPCR, setAllOPCR] = useState(null)
    const [currentIPCRID, setCurrentIPCRID] = useState(null)
    const [currentOPCRID, setCurrentOPCRID] = useState(null)
    const [batchID, setBatchID] = useState(null)

    const [currentDeptID, setCurrentDeptID] = useState(null)
    const [userInfo, setUserInfo] = useState(null)
    const token = localStorage.getItem("token")

    function readTokenInformation(){
            let payload = {}
            try {
                payload = jwtDecode(token)
                console.log("token: ",payload)
                setUserInfo(payload)
                
            }
            catch(err){
                console.log(err)
            }
        }

    async function loadIPCR() {
        if (!userInfo) return;
        
        var res = await getFacultyPending(userInfo.department.id).then(data => data.data).catch(error => {
          
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log("IPCRS",res)
        setAllIPCR(res)
    }

    async function loadOPCR() {
        var res = await getOPCRPending().then(data => data.data).catch(error => {
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
    }, [userInfo])

    useEffect(()=> {
        loadIPCR()
        readTokenInformation()

        socket.on("ipcr_create", ()=>{
            loadIPCR()

            console.log("SDOMERTHING CHANGED")
        })

        socket.on("opcr", ()=>{
            loadIPCR()
        })

        socket.on("ipcr", ()=>{
            loadIPCR()
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
                            {currentIPCRID && currentDeptID && <EditIPCR mode = {"HEHEH"} dept_id = {currentDeptID} key={currentIPCRID} ipcr_id = {currentIPCRID} dept_mode = {true} switchPage={()=>{

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
            
            <h3>Individual Performance Review and Commitment Forms</h3>
            <div className="all-ipcr-container" style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                
                {allIPCR && allIPCR.map(ipcr => (
                    ipcr.status == 1? <PendingIPCR onMouseOver = {()=>{
                        setBatchID(ipcr.batch_id)
                        setCurrentIPCRID(ipcr.id)
                        setCurrentDeptID(ipcr.user.department_id)
                        console.log(ipcr.id)
                    }} onClick={()=>{
                        setCurrentIPCRID(ipcr.id)
                    }} ipcr = {ipcr} dept_mode = {true}></PendingIPCR> :""
                ))}

                 
            </div>
            
            {allIPCR && allIPCR.length == 0?
                    <div className="empty-symbols" >
                        <span className="material-symbols-outlined">file_copy_off</span>    
                        <span className="desc">No Pending Head IPCRs Found</span>
            </div>:""} 
            
        </div>
    )
}

export default HeadPendingReviews