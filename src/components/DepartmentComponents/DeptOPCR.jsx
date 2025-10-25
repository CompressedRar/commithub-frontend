import { useState } from "react";
import { archiveIprc, archiveOprc, downloadIPCR, downloadOPCR, updateRating } from "../../services/pcrServices";
import Swal from "sweetalert2";


function DeptOPCR(props) {

    //gawin bukas yung supporting documents 
    //gawin yung head module
    //generate OPCR bukas
    //review and approve opcr para sa admin at head
    //account settings

    const [optionsOpen, setOpen] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [archiving, setArchiving] = useState(false)
    

    async function handleArchive(){
            setArchiving(true)
            var res = await archiveOprc(props.opcr.id).then(data => data.data.message).catch(error => {
                console.log(error.response.data.error)
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error"
                })
            })
            console.log(res)
            if (res == "OPCR was archived successfully."){
                Swal.fire({
                    title:"Success",
                    text: res,
                    icon:"success"
                })
            }
            else {
                Swal.fire({
                    title:"Error",  
                    text: "Archiving OPCR failed",
                    icon:"error"
                })
            }
            setArchiving(false)
        } 
            
        async function archiveOPCR(){
            Swal.fire({
                title:"Archive",
                text:"Do you want to archive this OPCR?",
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
            var res = await downloadOPCR(props.opcr.id).then(data => data.data.link).catch(error => {
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
            

            <div className="dept-ipcr" >                                                
                <div className="description">                        
                    <div className="ipcr-info">
                        
                        <span >{ props.opcr && "OPCR - "}</span>
                        <span>{props.opcr.department}</span>
                    </div>
                    <div style={{gap:"10px", display:"flex"}}> 
                        {props.opcr && <span className="form-status">{props.opcr && props.opcr.form_status.toUpperCase()}</span>}
                    </div>
                </div> 

                {
                    props.opcr ?
                    <div className="status-container">                                                 
                        <button className="choices btn btn-primary" onClick={()=> {download()}} style={{justifyContent:"center"}}>
                            <span className="material-symbols-outlined">{downloading ? "refresh": "download"}</span>
                            {!downloading && <span>Download</span>}
                        </button>
                        <button className="choices btn btn-success" onClick={props.onClick} data-bs-toggle="modal" data-bs-target="#view-opcr" onMouseOver={props.dept_mode? props.onMouseOver:null}>
                            <span className="material-symbols-outlined">view_list</span>
                            <span>View</span>
                        </button>
                        <button className="choices btn btn-danger" onClick={()=>{archiveOPCR()}}>
                            <span className="material-symbols-outlined">{!archiving? "archive":"refresh"}</span>
                        </button>                        
                    </div>:
                    <span style={{display:"flex", flexDirection:"row", justifyContent:"flex-end", fontStyle:"italic"}}>Awaiting Submission</span>
                }
            </div>
        </div>
    )
}

export default DeptOPCR