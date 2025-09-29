import { useState } from "react";
import { archiveIprc, downloadIPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";


function IPCR(props) {

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
                var res = await archiveIprc(props.ipcr.id).then(data => data.data.message)
                console.log(res)
                if (res == "IPCR was archived successfully."){
                    Swal.fire({
                        title:"Success",
                        text: res,
                        icon:"success"
                    })
                }
                else {
                    Swal.fire({
                        title:"Error",  
                        text: "Archiving IPCR failed",
                        icon:"error"
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
            var res = await downloadIPCR(props.ipcr.id).then(data => data.data.link)
            window.open(res, "_blank", "noopener,noreferrer");
            setDownloading(false)
        }
    return (
        <div className="ipcr-wrapper"> 
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
            

            <div className="ipcr"  onMouseOver={props.dept_mode? props.onMouseOver:null}>
                
                <div className="status-container">                             
                    <div style={{gap:"10px", display:"flex"}}> 
                        <span className="form-status">{props.ipcr.form_status.toUpperCase()}</span>
                        {props.ipcr.isMain == 1? <span className="main-form">MAIN</span>: ""}      
                    </div>
                    <span className="material-symbols-outlined" style={{fontSize: "1.5rem", cursor:"pointer"}} onClick={()=> {setOpen(!optionsOpen)}}>more_vert</span>
                </div>
                
                
                {
                    !props.dept_mode?
                    <div className="description"onClick={props.onClick}>
                        <span className="material-symbols-outlined">contract</span>
                        <span className="title">IPCR #{props.ipcr.id}</span>
                        <span className="created">{props.ipcr.created_at}</span>
                    </div>: 
                    <div className="description"onClick={props.onClick} data-bs-toggle="modal" data-bs-target="#view-ipcr">
                        
                        <span className="material-symbols-outlined">contract</span>
                        <div className="ipcr-info">
                            <div className="ipcr-profile" style={{backgroundImage:`url('${props.ipcr.user.profile_picture_link}')`}}></div>
                            <div className="ipcr-details">
                                <span className="title">IPCR #{props.ipcr.id}</span>
                                <span className="created">{props.ipcr.user.first_name + " " + props.ipcr.user.last_name}</span>
                            </div>
                        </div>
                    </div> 
                }
            </div>
        </div>
    )
}

export default IPCR