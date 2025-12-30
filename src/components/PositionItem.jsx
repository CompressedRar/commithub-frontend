
import { useEffect, useState } from "react";
import Slider from '@mui/material/Slider';
import { archivePosition, updatePosition } from "../services/positionService";
import Swal from "sweetalert2";

export default function PositionItem({position}){

    const [positionName, setPositionName] = useState(position.name)
    const [coreWeight, setCoreWeight] = useState(position.core_weight)
    const [strategicWeight, setStrategicWeight] = useState(position.strategic_weight)
    const [supportWeight, setSupportWeight] = useState(position.support_weight)
    const [submitting , setSubmission] = useState(false) 
    
    const [valid, setValid] = useState(false)

    function reloadData(){
        setCoreWeight(position.core_weight)
        setPositionName(position.name)
        setStrategicWeight(position.strategic_weight)
        setSupportWeight(position.support_weight)
    }

    const handleArch = async () => {
        try {
          const a = await archivePosition(position.id);
          const msg = a.data?.message;
          if (msg === "Position archived successfully.") {
            Swal.fire("Success", msg, "success");
          } else Swal.fire("Error", msg || "Failed to archive", "error");
        } catch (error) {
          console.error(error);
          Swal.fire("Error", error.response?.data?.error || "Archive failed", "error");
        }
      };
    
      const handleArchive = () => {
        Swal.fire({
          title: "Do you want to archive this Position?",
          showDenyButton: true,
          confirmButtonText: "Yes",
          denyButtonText: "No",
        }).then(async (r) => r.isConfirmed && (await handleArch()));
      };

    async function validateInputs(){
        var sums = coreWeight + supportWeight + strategicWeight
        console.log(positionName != "" && sums == 1)
        setValid(positionName != "" && sums  == 1)
    }

    async function handleSubmission(){
            try {
                setSubmission(true)
                const res = await updatePosition({
                    "id": position.id,
                    "name":  positionName,
                    "core_weight": coreWeight,
                    "strat_weight": strategicWeight,
                    "support_weight": supportWeight,
                })
    
                const msg = res.data?.message;
                msg === "Position updated successfully."
                        ? Swal.fire("Success", msg, "success")
                        : Swal.fire("Error", msg || "Failed to create", "error");         
                        
                setSubmission(false)
            }
             catch(error){
                Swal.fire("Error", error.response?.data?.error || "Failed to create output", "error");
                console.log(error)
                setSubmission(false)
             }
        }

    useEffect(()=> {
        validateInputs()
    }, [positionName, supportWeight, strategicWeight, coreWeight])

    return (
        <div className="position-item p-3 border rounded mb-3 d-flex justify-content-between align-items-start">

            <div className="modal fade" id={position.id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" >
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title" id="staticBackdropLabel">Edit Position</h5>
                            <button type="button text-white" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form noValidate>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Position Name <span className="text-danger">*</span></label>
                                    <input type="text" name="task_name" className="form-control"
                                        placeholder="e.g., Instructor I" value={positionName} onInput={(e) => {setPositionName(e.target.value)}}  required />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={()=> {reloadData()}}>Close</button>
                            <button type="button" className="btn btn-primary px-4" onClick={handleSubmission} disabled={submitting || !valid}>
                                {submitting ? (
                                <span className="material-symbols-outlined spin me-2 align-middle">progress_activity</span>
                                ) : (
                                <span className="me-2 align-middle material-symbols-outlined">add_circle</span>
                                )}
                                {submitting ? "Processing..." : "Update Position"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="position-name d-flex fw-semibold fs-5">
                {position.name}
            </div>

            <div className="weights d-flex gap-3 align-items-center">

                <button className="btn btn-primary d-flex align-items-center gap-1" data-bs-toggle="modal" data-bs-target={`#${position.id}`}>
                    <span className="material-symbols-outlined">edit</span>
                    <span>Edit</span>
                </button>

                <button className="btn btn-danger d-flex align-items-center gap-1" onClick={()=> {handleArchive()}}>
                    <span className="material-symbols-outlined">archive</span>
                </button>

            </div>

        </div>

    )
}