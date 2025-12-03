
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
    const [coreWeight, setCoreWeight] = useState(0)
    const [strategicWeight, setStrategicWeight] = useState(0)
    const [supportWeight, setSupportWeight] = useState(0)
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
        var sums = coreWeight + supportWeight + strategicWeight
        console.log(positionName != "" && sums == 1)
        setValid(positionName != "" && sums  == 1)
    }
    async function handleSubmission(){
        try {
            setSubmission(true)
            const res = await createPosition({
                "name":  positionName,
                "core_weight": coreWeight,
                "strat_weight": strategicWeight,
                "support_weight": supportWeight,
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
    }, [positionName, supportWeight, strategicWeight, coreWeight])


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

                                <div className="mb-3">
                                    <label className="form-label fw-semibold d-flex justify-content-between">
                                        <span>Core Function Weight <span className="text-danger">*</span></span>

                                        <input 
                                            type="number"
                                            className="form-control"
                                            style={{ width: "20%" }}
                                            min={0}
                                            step={0.01}
                                            max={1}
                                            value={coreWeight}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // Prevent empty string from becoming uncontrolled
                                                if (value === "") {
                                                setCoreWeight(0);
                                                return;
                                                }

                                                setCoreWeight(Number(value));
                                            }}
                                        />
                                    </label>

                                    <Slider
                                        value={coreWeight}
                                        min={0}
                                        step={0.01}
                                        max={1}
                                        onChange={(e, newValue) => setCoreWeight(newValue)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold d-flex justify-content-between">
                                        <span>Strategic Function Weight <span className="text-danger">*</span></span>

                                        <input 
                                            type="number"
                                            className="form-control"
                                            style={{ width: "20%" }}
                                            min={0}
                                            step={0.01}
                                            max={1}
                                            value={strategicWeight}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // Prevent empty string from becoming uncontrolled
                                                if (value === "") {
                                                setStrategicWeight(0);
                                                return;
                                                }

                                                setStrategicWeight(Number(value));
                                            }}
                                        />
                                    </label>

                                    <Slider
                                        value={strategicWeight}
                                        min={0}
                                        step={0.01}
                                        max={1}
                                        onChange={(e, newValue) => setStrategicWeight(newValue)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold d-flex justify-content-between">
                                        <span>Support Function Weight <span className="text-danger">*</span></span>

                                        <input 
                                            type="number"
                                            className="form-control"
                                            style={{ width: "20%" }}
                                            min={0}
                                            step={0.01}
                                            max={1}
                                            value={supportWeight}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // Prevent empty string from becoming uncontrolled
                                                if (value === "") {
                                                setSupportWeight(0);
                                                return;
                                                }

                                                setSupportWeight(Number(value));
                                            }}
                                        />
                                    </label>

                                    <Slider
                                        value={supportWeight}
                                        min={0}
                                        step={0.01}
                                        max={1}
                                        onChange={(e, newValue) => setSupportWeight(newValue)}
                                    />
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
                        <small>You can add positions here as well as edit the weight of their average rating.</small>
                    </div>

                    <div className="options">
                        <button className="btn btn-primary d-flex gap-1"  data-bs-toggle="modal" data-bs-target="#add-position">
                            <span className="material-symbols-outlined">add</span>
                            <span>Add Position</span>
                        </button>
                    </div>

                </div>

                <div className="position-list">
                    {allPositions && allPositions.map((data) => (
                        <PositionItem position={data}></PositionItem>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Positions