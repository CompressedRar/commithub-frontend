import { useState } from "react";
import { approveIPCR, archiveIprc, downloadIPCR, reviewIPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";


function ReviewedIPCR(props) {

    //gawin bukas yung supporting documents 
    //gawin yung head module
    //generate OPCR bukas
    //review and approve opcr para sa admin at head
    //account settings

    const [optionsOpen, setOpen] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [archiving, setArchiving] = useState(false)

    async function handleApproval(){
            var res = await approveIPCR(props.ipcr.id).then(data => data.data.message).catch(error => {
                console.log(error.response.data.error)
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error"
                })
            })
                
            if (res == "This IPCR is successfully approved."){
                Swal.fire({
                    title:"Success",
                    text: res,
                    icon:"success"
                })
            }
        } 
        
        async function approvalIPCR(){
            Swal.fire({
                title:"Approve",
                text:"By approving this IPCR, you acknowledge that this IPCR can be consolidated for the OPCR. Do you wish to proceed?",
                showDenyButton: true,
                confirmButtonText:"Approve",
                confirmButtonColor:"green",
                denyButtonText:"No",
                denyButtonColor:"grey",
                icon:"question",
                customClass: {
                    actions: 'my-actions',
                    confirmButton: 'order-2',
                    denyButton: 'order-1 right-gap',
                },
            }).then((result)=> {
                if(result.isConfirmed){
                    handleApproval()
                }
            }) 
        }

    async function handleReview(){
            var res = await reviewIPCR(props.ipcr.id).then(data => data.data.message).catch(error => {
                console.log(error.response.data.error)
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error"
                })
            })
                
            if (res == "This IPCR is successfully reviewed."){
                Swal.fire({
                    title:"Success",
                    text: res,
                    icon:"success"
                })
            }
        } 
        
    async function reviewalIPCR(){
            Swal.fire({
                title:"Review",
                text:"Please confirm that you have thoroughly reviewed this IPCR. Do you want to proceed with marking it as reviewed?",
                showDenyButton: true,
                confirmButtonText:"Yes",
                confirmButtonColor:"blue",
                denyButtonText:"No",
                denyButtonColor:"grey",
                icon:"question",
                customClass: {
                    actions: 'my-actions',
                    confirmButton: 'order-2',
                    denyButton: 'order-1 right-gap',
                },
            }).then((result)=> {
                if(result.isConfirmed){
                    handleReview()
                }
            }) 
        }
    

    async function handleArchive(){
        setArchiving(true)
        var res = await archiveIprc(props.ipcr.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log(res)
        if (res == "IPCR was archived successfully."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        setArchiving(false)
    } 
        
    async function archiveIPCR(){
        Swal.fire({
            title:"Archive",
            text:"Do you want to archive this IPCR?",
            showDenyButton: true,
            confirmButtonText:"Archive",
            confirmButtonColor:"red",
            denyButtonText:"No",
            denyButtonColor:"grey",
            icon:"warning",
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-1 right-gap',
            },
        }).then((result)=> {
            if(result.isConfirmed){
                handleArchive()
            }
        }) 
    }

    async function download() {
        setDownloading(true)
        var res = await downloadIPCR(props.ipcr.id).then(data => data.data.link).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            window.open(res, "_blank", "noopener,noreferrer");
            setDownloading(false)
        }
    return (
        <div className="ipcr-wrapper "> 
            {optionsOpen && <div className="popup" onMouseLeave={()=>{setOpen(false)}}>
                <div className="choices" onClick={()=> {download()}} style={{justifyContent:"center"}}>
                    <span className="material-symbols-outlined">{downloading ? "refresh": "download"}</span>
                    {!downloading && <span>Download</span>}
                </div>
                <div className="choices" onClick={()=>{archiveIPCR()}}>
                    <span className="material-symbols-outlined">archive</span>
                    {!archiving && <span>Archive</span>}
                </div>

                <div className="choices"  data-bs-toggle="modal" data-bs-target={props.dept_mode? "#manage-docs":""}>
                    <span className="material-symbols-outlined">attach_file</span>
                    <span>Documents</span>
                </div>

                
            </div>}
            

            <div className="dept-ipcr"  onMouseOver={props.dept_mode? props.onMouseOver:null}>                                                
                <div className="description">                        
                    <div className="ipcr-info">
                        <div className="ipcr-profile" style={{backgroundImage:`url('${props.ipcr.user.profile_picture_link}')`}}></div>
                        <span >{ props.ipcr && "IPCR - "}</span>
                        <span>{props.ipcr.user.first_name + " " + props.ipcr.user.last_name}</span>
                    </div>
                    <div style={{gap:"10px", display:"flex"}}> 
                        {props.ipcr&& <span className="form-status">{props.ipcr && props.ipcr.form_status.toUpperCase()}</span>}
                    </div>
                </div> 

                {
                    props.ipcr?
                    <div className="status-container">                                                 
                        <button className="choices btn btn-primary" onClick={()=> {download()}} style={{justifyContent:"center"}}>
                            <span className="material-symbols-outlined">{downloading ? "refresh": "download"}</span>
                            {!downloading && <span>Download</span>}
                        </button>
                        <button className="choices btn btn-primary"  data-bs-toggle="modal" data-bs-target={props.dept_mode? "#manage-docs":""}>
                            <span className="material-symbols-outlined">attach_file</span>
                            <span>Documents</span>
                        </button>
                        <button className="choices btn btn-success" onClick={props.onClick}  data-bs-toggle="modal" data-bs-target="#view-ipcr">
                            <span className="material-symbols-outlined">view_list</span>
                            <span>View</span>
                        </button>

                        <button className="btn btn-primary" onClick={()=> {approvalIPCR()}} style={{display:"flex", flexDirection:"row", alignItems:"center", padding:"10px", gap:"10px"}}>
                            <span className="material-symbols-outlined">approval_delegation</span>    
                            <span>Approve</span>
                        </button>                   
                    </div>:
                    <span style={{display:"flex", flexDirection:"row", justifyContent:"flex-end", fontStyle:"italic"}}>Awaiting Submission</span>
                }
            </div>
        </div>
    )
}

export default ReviewedIPCR