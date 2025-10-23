import { useState } from "react";
import { archiveIprc, downloadIPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";


function DeptIPCR(props) {

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
        var res = await archiveIprc(props.ipcr.ipcr.id).then(data => data.data.message).catch(error => {
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
        var res = await downloadIPCR(props.ipcr.ipcr.id).then(data => data.data.link).catch(error => {
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
                        <div className="ipcr-profile" style={{backgroundImage:`url('${props.ipcr.member.profile_picture_link}')`}}></div>
                        <span >{ props.ipcr.ipcr && "IPCR - "}</span>
                        <span>{props.ipcr.member.first_name + " " + props.ipcr.member.last_name}</span>
                    </div>
                </div> 

                {
                    props.ipcr.ipcr ?
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
                    </div>:
                    <span style={{display:"flex", flexDirection:"row", justifyContent:"flex-end", fontStyle:"italic"}}>Awaiting Submission</span>
                }
            </div>
        </div>
    )
}

export default DeptIPCR