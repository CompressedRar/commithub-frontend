import { useEffect, useState } from "react"
import { getDepartmentIPCR, getDepartmentOPCR } from "../../services/departmentService"
import IPCR from "../Faculty/IPCR"

import EditIPCR from "../Faculty/EditIPCR"
import ManageSupportingDocuments from "../Faculty/ManageSupportingDocuments"
import OPCR from "./OPCR"
import { socket } from "../api"
import EditOPCR from "./EditOPCR"
import Swal from "sweetalert2"
import DeptIPCR from "./DeptIPCR"
import DeptOPCR from "./DeptOPCR"
import OPCRSupportingDocuments from "./OPCRSupportingDocuments"
import { createOPCR } from "../../services/pcrServices"


function PerformanceReviews(props){
    const [allIPCR, setAllIPCR] = useState(null)
    const [allOPCR, setAllOPCR] = useState(null)
    const [currentIPCRID, setCurrentIPCRID] = useState(null)
    const [currentOPCRID, setCurrentOPCRID] = useState(null)
    const [batchID, setBatchID] = useState(null)

    const [filteredID, setFilteredID] = useState(null)

    const [consolidating, setConsolidating] = useState(false)

    async function loadIPCR() {
      setAllIPCR(null)
        var res = await getDepartmentIPCR(props.deptid).then(data => data.data).catch(error => {
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        const data = res || [];

        

        const filtered = data.filter(
                (item) => item.ipcr && item.ipcr.status === 1 && item.ipcr.form_status === "submitted" && item.member.account_status == 1
            );

        var filtArray = []

        for(const i of filtered){
            filtArray.push(i.ipcr.id)
        }
        
        console.log("PReview",res)
        
        setFilteredID(filtArray)


        console.log("performance review",res)

        const filteredIPCR = data.filter(
                (item) => item.member.account_status == 1
            );
        setAllIPCR(filteredIPCR)
    }

    const handleSubmission = () => {
        
    
        if (filteredID.length === 0)
          return Swal.fire("Error", "The office must have at least one submitted IPCR.", "error");
    
        Swal.fire({
          title: "Create OPCR",
          text: "Do you want to consolidate all submitted IPCRs?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        }).then((res) => {
          if (res.isConfirmed) submission();
        });
      };

    async function submission() {
        setConsolidating(true)
        try {

          const res = await createOPCR(props.deptid, { "ipcr_ids": filteredID });
          const msg = res.data.message;
    

          setConsolidating(false)
        } catch (error) {
            console.log(error)
          Swal.fire("Error", error.response?.data?.error || "Failed to create OPCR", "error");
          setConsolidating(false)
        }
      }

    async function loadOPCR() {
      setAllOPCR(null)
      await submission()

        var res = await getDepartmentOPCR(props.deptid).then(data => data.data).catch(error => {
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

        var filter = []

        for(const opcr of res){
            if(opcr.status == 1) {
                filter.push(opcr)
                setCurrentOPCRID(opcr.id)
            }
        }
        console.log(res)
        setAllOPCR(filter)
    }
    useEffect(()=> {
        if (filteredID == null) return
        
        loadOPCR()
    }, [filteredID])

    useEffect(()=> {
        loadIPCR()

        socket.on("ipcr_create", ()=>{
            loadIPCR()

        })


        socket.on("ipcr", ()=>{
            loadIPCR()
        })

        socket.on("assign", ()=>{
            loadIPCR()
        })
        
        socket.on("ipcr_create", ()=>{
            loadIPCR()
        })

    }, [])

    //gawin yung highest performing deparmtent
    return (
        <div className="performance-reviews-container">


            {currentOPCRID? <OPCRSupportingDocuments key = {currentOPCRID} opcr_id = {currentOPCRID}></OPCRSupportingDocuments>:""}
            {batchID && currentIPCRID? <ManageSupportingDocuments  dept_mode = {true} key={currentIPCRID} ipcr_id = {currentIPCRID} batch_id = {batchID}></ManageSupportingDocuments>:""}
            <div className="modal fade" id="view-ipcr" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable modal-fullscreen" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {currentIPCRID && <EditIPCR dept_id = {props.deptid} key={currentIPCRID} ipcr_id = {currentIPCRID} mode = {"check"} switchPage={()=>{

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
                            {currentOPCRID && <EditOPCR key={currentOPCRID} dept_id = {props.deptid} opcr_id = {currentOPCRID} mode = {"dept"}></EditOPCR>}
                        </div>
                    </div>
                </div>
            </div>

            
            <h3 className="d-flex align-items-center gap-3">
                Office Performance Review and Commitment Form 
                <button className="btn btn-primary d-none" onClick={()=>{handleSubmission()}} disabled = {consolidating}>
                    {!consolidating ? <span className="d-flex gap-2">
                        <span className="material-symbols-outlined">compare_arrows</span>
                        <span>Consolidate IPCRs</span>
                    </span> : <span className="spinner-border spinner-border-sm me-2"></span>}
                </button>
            </h3>
            <div className="all-ipcr-container" style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                
                {allOPCR && allOPCR.map(opcr => (
                    <DeptOPCR opcr = {opcr} onClick={()=>{
                        setCurrentOPCRID(opcr.id)
                        console.log("CURRENT OPCR ID",opcr.id)
                        
                    }} onMouseOver = {()=>{setCurrentOPCRID(opcr.id)}}></DeptOPCR>
                ))}
            </div>
            {allOPCR && allOPCR.length == 0?
                    <div className="empty-symbols">
                        <span className="material-symbols-outlined">file_copy_off</span>    
                        <span className="desc">No OPCRs Found</span>
                    </div>:""} 

            <h3>Individual Performance Review and Commitment Forms</h3>
            <div className="all-ipcr-container" style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                
                {allIPCR && allIPCR.map(ipcr => (
                    <DeptIPCR onMouseOver = {()=>{
                        console.log(ipcr.ipcr.batch_id)
                        setBatchID(ipcr.ipcr.batch_id)
                        setCurrentIPCRID(ipcr.ipcr.id)
                    }} onClick={()=>{
                        setCurrentIPCRID(ipcr.ipcr.id)
                    }} ipcr = {ipcr} dept_mode = {true}></DeptIPCR>
                ))}

                 
            </div>
            {allIPCR && allIPCR.length == 0?
                    <div className="empty-symbols">
                        <span className="material-symbols-outlined">file_copy_off</span>    
                        <span className="desc">No IPCR Found</span>
            </div>:""} 
        </div>
    )
}
//iconvert lahat ng ipcr sa pendings katulad netong performance review 
export default PerformanceReviews