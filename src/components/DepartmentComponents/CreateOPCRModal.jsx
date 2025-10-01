import { useEffect, useState } from "react"
import { getDepartmentIPCR } from "../../services/departmentService"
import IPCR from "../Faculty/IPCR"
import Swal from "sweetalert2"
import { createOPCR } from "../../services/pcrServices"
import { Modal } from "bootstrap"

function CreateOPCRModal(props){
    const [allIPCR, setAllIPCR] = useState(null)
    
    async function loadIPCR() {
        var res = await getDepartmentIPCR(props.deptid).then(data => data.data)
        setAllIPCR(res)
        console.log(res)
    }

    const submission = async () => {
            var allIPCRs = document.getElementsByClassName("ipcrs")
            var allChecked = []

            for(const ipcr of allIPCRs) {
                if(ipcr.checked){
                    allChecked.push(ipcr.id)
                }
            }
            var a = await createOPCR(props.deptid, {"ipcr_ids": allChecked})
            console.log(a)
            if(a.data.message == "OPCR successfully created.") {
                Swal.fire({
                    title:"Success",
                    text: "OPCR successfully created.",
                    icon:"success"
                })
                
            }
            else {
                Swal.fire({
                    title:"Error",
                    text: a.data.message,
                    icon:"error"
                })
            }

            const modalEl = document.getElementById("create-opcr");
            const modal = Modal.getOrCreateInstance(modalEl);

            modal.hide();

            // Cleanup leftover backdrop if any
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            document.body.classList.remove("modal-open");
            document.body.style.overflow = ""; // reset scroll lock

        }
    
        const handleSubmission = async ()=>{
            
            var allIPCRs = document.getElementsByClassName("ipcrs")
            var allChecked = []

            for(const ipcr of allIPCRs) {
                if(ipcr.checked){
                    allChecked.push(ipcr.id)
                }
            }

            if (allChecked.length == 0){
                console.log(allChecked)
                Swal.fire({
                    title:"Error",
                    text: "Select at least one ipcr.",
                    icon:"error"
                })
            }
            else {
                console.log(allChecked)
                Swal.fire({
                    title: 'Create OPCR',
                    text:"Do you want to create OPCR with the selected IPCR?",
                    showDenyButton: true,
                    confirmButtonText: 'Yes',
                    denyButtonText: 'No',
                    customClass: {
                        actions: 'my-actions',
                        cancelButton: 'order-1 right-gap',
                        confirmButton: 'order-2'
                    },
                    }).then(async (result) => {
                    if (result.isConfirmed) {
                        submission()
                    } else if (result.isDenied) {
                        
                    }
                })
            }


            console.log(allChecked.length == 0)
            
            
        }

    

    useEffect(()=> {
        loadIPCR()
    }, [])

    return (
        <div className="modal fade" id="create-opcr" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="staticBackdropLabel">Create OPCR</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <span className="desc">Click the IPCR you want to include.</span>
                        <div className="select-ipcr-container">
                
                            {allIPCR && allIPCR.map(ipcr => (
                                <div className="select-ipcr">
                                    <input type="radio" className="ipcrs" id = {ipcr.id} value = {ipcr.id} name = {ipcr.user.id} hidden/>
                                    <label htmlFor={ipcr.id}>
                                        <div>
                                            <span className="material-symbols-outlined">assignment_ind</span>
                                            <span className="id">IPCR #{ipcr.id}</span>
                                            {ipcr.isMain? <span className="is-main">MAIN</span>:""}
                                            <span className="status">{ipcr.form_status.toUpperCase()}</span>
                                        </div>
                                        
                                        <span>{ipcr.user.first_name + " " + ipcr.user.last_name}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" onClick={handleSubmission}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateOPCRModal