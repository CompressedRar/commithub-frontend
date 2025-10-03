import { useEffect, useState } from "react";
import { archiveDocument, generatePreSignedURL, getSupportingDocuments, recordFileUploadInfo } from "../../services/pcrServices";
import axios from "axios";
import Swal from "sweetalert2";
import { socket } from "../api";

function ManageSupportingDocuments(props) {
    const [file, setFile] = useState(null);
    const [documents, setDocuments] = useState(null)

    async function loadDocuments(){
        var res = await getSupportingDocuments(props.ipcr_id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        setDocuments(res)
        console.log("documents dito", res)
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadFile = async () => {
        if (!file) return Swal.fire({
            title:"Empty File", 
            text:"You must add a file to upload.",
            icon:"error"
        });

        try {
        // Step 1: Request pre-signed URL from Flask
            const res = await generatePreSignedURL({fileName: file.name,
                fileType: file.type}).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })

            const  uploadUrl  = res.data.link;
            console.log(uploadUrl)

            // Step 2: Upload directly to S3 with axios
            await axios.put(uploadUrl, file, {
                headers: { "Content-Type": file.type },
                onUploadProgress: (progressEvent) => {
                let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percent}%`);
                },
            }).catch(error => {
                console.log(error.response.data.error)
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error"
                })
            });
            
            var uploadRes = await recordFileUploadInfo({
                fileName: file.name,
                fileType: file.type,
                ipcrID: props.ipcr_id,
                batchID: props.batch_id
            }).then(data => data.data.message).catch(error => {
                console.log(error.response.data.error)
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error"
                })
            })

            if (uploadRes == "File successfully uploaded."){
                Swal.fire({
                    title:"Success",
                    text:uploadRes,
                    icon: "success"
                })

                document.getElementById("support").value = null
                setFile(null)
            }
            
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed.");
        }
    };

    async function download(link) {
        window.open(link, "_blank", "noopener,noreferrer");
    
    }

    async function handleRemove(document_id){
        var res = await archiveDocument(document_id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
                
        if (res == "Document successfully archived."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
        else {
            Swal.fire({
                title:"Error",
                text: "Submission of IPCR failed",
                icon:"error"
            })
        }
    } 
        
    async function removeDocument(document_id){
        Swal.fire({
            title:"Remove",
            text:"Do you want to remove this document?",
            showDenyButton: true,
            confirmButtonText:"Remove",
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
                handleRemove(document_id)
            }
        }) 
    }

    useEffect(()=> {
        loadDocuments()

        socket.on("document", ()=> {
            loadDocuments()
        })


    }, [])

    return (
        <div className="modal fade" id="manage-docs" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-xl" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Manage Document</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="add-docu-header">
                                <input type="file" name="support" id="support" onChange={handleFileChange}/>
                                <button className="btn btn-primary" onClick={()=>{uploadFile()}}>
                                    <span className="material-symbols-outlined">upload</span>
                                    <span>Upload Document</span>
                                </button>
                                
                            </div>

                            <div className="uploaded-documents-container">
                                <h4>Uploaded Files</h4>
                                <div  className="uploaded-documents">
                                    {documents && documents.map(document => (
                                        document.status == 1?<div className="document">
                                        
                                            <div className="document-info">
                                                <span className="material-symbols-outlined">description</span>
                                                <span style={{display:"flex", flexDirection:"column"}}>
                                                    <span>{document.file_name}</span>                                                    
                                                    <span className="file-type">{document.file_type}</span>
                                                </span>
                                                
                                            </div>
                                            <div className="document-options">
                                                <button className="btn btn-primary" onClick={()=> {download(document.download_url)}}>
                                                    <span className="material-symbols-outlined">download</span>
                                                    <span>Download</span>
                                                </button>
                                                <button className="btn btn-danger" onClick={()=>{removeDocument(document.id)}}>
                                                    <span className="material-symbols-outlined">remove</span>
                                                    <span>Remove</span>
                                                </button>
                                            </div>  
                                            
                                        </div> : ""
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
    )
}

export default ManageSupportingDocuments