
import { useEffect, useState } from "react"
import "../assets/styles/Positions.css"
import PositionItem from "../components/PositionItem"
import { createPosition, getPositionInfo } from "../services/positionService"
import Slider from '@mui/material/Slider';
import Swal from "sweetalert2";
import { socket } from "../components/api";


function Positions() {

    const [allPositions, setPositions] = useState(null)

    const [positionName, setPositionName] = useState("")
    const [submitting , setSubmission] = useState(false) 
    
    const [valid, setValid] = useState(false)

    async function loadAllPositions() {
        try {
            const res = await getPositionInfo()
            const data = res.data
            console.log(data)
            setPositions(data)
        }
        catch(error){
            console.log(error)
        }
    }

    async function validateInputs(){
        setValid(positionName != "")
    }
    async function handleSubmission(){
        try {
            setSubmission(true)
            const res = await createPosition({
                "name":  positionName,
                "core_weight": 1,
                "strat_weight": 1,
                "support_weight": 1,
            })

            const msg = res.data?.message;
            msg === "Position created successfully."
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
        loadAllPositions()
        socket.on("position", loadAllPositions);
        
    }, [])

    useEffect(()=> {
        validateInputs()
    }, [positionName])


    return (
        <div className="positions-container">

            <div className="modal fade" id="add-position" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg" >
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title" id="staticBackdropLabel">Create Position</h5>
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
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary px-4" onClick={handleSubmission} disabled={submitting || !valid}>
                                {submitting ? (
                                <span className="material-symbols-outlined spin me-2 align-middle">progress_activity</span>
                                ) : (
                                <span className="me-2 align-middle material-symbols-outlined">add_circle</span>
                                )}
                                {submitting ? "Processing..." : "Create Position"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="all-positions-container">  
                <div className="header">
                    
                    <div className="title">
                        <h3>Positions</h3>
                        <small>You can add positions here as well as edit positions here.</small>
                    </div>

                    <div className="options">
                        <button className="btn btn-primary d-flex gap-1"  data-bs-toggle="modal" data-bs-target="#add-position">
                            <span className="material-symbols-outlined">add</span>
                            <span>Add Position</span>
                        </button>
                    </div>

                </div>

                <div className="position-list d-grid">
                    <div className="row">
                        {allPositions && allPositions.map((data) => (
                            <PositionItem position={data}></PositionItem>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Positions