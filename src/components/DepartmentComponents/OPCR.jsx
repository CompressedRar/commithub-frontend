import { useState } from "react";
import { archiveIprc, archiveOprc, downloadIPCR, downloadOPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";


function OPCR(props) {

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
        <div className="ipcr-wrapper"> 
            {optionsOpen && <div className="popup" onMouseLeave={()=>{setOpen(false)}}>
                <div className="choices" onClick={()=> {download()}} style={{justifyContent:"center"}}>
                    <span className="material-symbols-outlined">{downloading ? "refresh": "download"}</span>
                    {!downloading && <span>Download</span>}
                </div>
                <div className="choices" onClick={()=>{archiveOPCR()}}>
                    <span className="material-symbols-outlined">archive</span>
                    {!archiving && <span>Archive</span>}
                </div>
            </div>}
            

            <div className="ipcr" data-bs-toggle="modal" data-bs-target="#view-opcr" onMouseOver={props.dept_mode? props.onMouseOver:null}>
                
                <div className="status-container">                             
                    <div style={{gap:"10px", display:"flex"}}> 
                        <span className="form-status">{props.opcr.form_status.toUpperCase()}</span>
                        {props.opcr.isMain == 1? <span className="main-form">MAIN</span>: ""}      
                    </div>
                    <span className="material-symbols-outlined" style={{fontSize: "1.5rem", cursor:"pointer"}} onClick={()=> {setOpen(!optionsOpen)}}>more_vert</span>
                </div>
                
                
                <div className="description"onClick={props.onClick}>
                        <span className="material-symbols-outlined">contract</span>
                        <span className="title">OPCR #{props.opcr.id}</span>
                        <span className="created">{props.opcr.created_at}</span>
                    </div>
            </div>
        </div>
    )
}

export default OPCR