
import { useEffect, useState } from "react"

import Slider from '@mui/material/Slider';
import Swal from "sweetalert2";
import { socket } from "../../api";
import { getAssignedDepartmentTask, updateAssignedDepartmentTask } from "../../../services/departmentService";



function TaskWeights({dept_id}) {

    const [allTasks, setAllTasks] = useState(null)

    const [taskData, setTaskData] = useState(null)

    const [totalWeight, setTotalWeight] = useState(0.0)

    const [updating, setUpdating] = useState(false)

    const [isDirty, setDirty] = useState(false)

    const [currentTaskData, setCurrentTaskData] = useState(null)


    async function loadAssignedTasks(){
        try {
            var res = await getAssignedDepartmentTask(dept_id);
            setAllTasks(res.data)
            console.log(res.data)


            var weights = res.data.reduce((acc, task) => {
                    acc[task.id] = task.task_weight
                    return acc
                }, {})
            var total_w  = res.data.reduce((acc, task) => {
                    acc += task.task_weight
                    return acc
                }, 0)
            
            setTotalWeight(total_w)
            console.log(total_w)


            console.log(weights)

            setTaskData(weights)
            setCurrentTaskData(weights)

        }
        catch(error){
            Swal.fire("Error", error.response?.data?.error || "Failed to fetch assigned tasks.", "error");
        }
    }

    function numericKeyDown(e) {
        const allowed = [
            "Backspace","Tab","ArrowLeft","ArrowRight","Delete","Enter","Home","End"
        ]
        if (allowed.includes(e.key)) return
        // allow digits and single dot
        const isDigit = /^[0-9]$/.test(e.key)
        const isDot = e.key === "."
        if (!isDigit && !isDot) {
            e.preventDefault()
            return
        }
        // prevent multiple dots
        if (isDot && e.target.value.includes(".")) {
            e.preventDefault()
        }
    }

    function sanitizeNumberInput(e) {
        // remove any non-digit/non-dot characters and trim multiple dots
        let v = e.target.value.replace(/[^0-9.]/g, "")
        const parts = v.split(".")
        if (parts.length > 2) v = parts.shift() + "." + parts.join("")
        if (v !== e.target.value) {
            e.target.value = v
        }
    }

    async function handleUpdate() {
        setUpdating(true)
        try {
            var res = await updateAssignedDepartmentTask(taskData);
            Swal.fire("Success", res.data.message, "error")
            setUpdating(false)
        }
        catch(error){
            Swal.fire("Error", error.response?.data?.error || "Failed to update weights.", "error");
            setUpdating(false)
        }
    } 

    

    useEffect(()=> {
        loadAssignedTasks()
    }, [])

    useEffect(()=> {
        if (taskData != null){
            const total_w = Object.values(taskData).reduce(
                (sum, v) => sum + Math.round(v * 100),
                0
                ) / 100            
            setTotalWeight(total_w)

            
        }
        console.log(totalWeight)
    }, [taskData])

    const onNumberInput = (e) => {
        sanitizeNumberInput(e)
        handleDataChange(e)
    }

    function handlePasteNumeric(e) {
        e.preventDefault()
        const pasted = (e.clipboardData || window.clipboardData).getData("text")
        const sanitized = pasted.replace(/[^0-9.]/g, "")
        if (!sanitized) return
        // insert sanitized text at cursor
        const start = e.target.selectionStart
        const end = e.target.selectionEnd
        const value = e.target.value
        e.target.value = value.slice(0, start) + sanitized + value.slice(end)
        // dispatch input event so React picks up change
        const evt = new Event("input", { bubbles: true })
        e.target.dispatchEvent(evt)
    }

    const handleDataChange = (e) => {

        setDirty(currentTaskData[e.target.id] != e.target.value)
        setTaskData({
            ...taskData,
            [e.target.id]: e.target.value
        })
        console.log("Changing")
    }



    return (
        <div className="positions-container">            

            <div className="all-positions-container">  
                <div className="header">
                    
                    <div className="title">
                        <h3>Task Weights</h3>
                        <small>You can adjust weights here for the OPCR.</small>
                    </div>
                </div>

                <div className="position-list my-3">

                    <div className="d-grid">
                        <div className="row border-bottom p-2">
                            <span className="col-9 fs-5 fw-semibold">Task Name</span>
                            <span className="col-3 fs-5 fw-semibold">Weight</span>
                        </div>
                        {allTasks ? allTasks.map((task) => (
                            <div className="my-3 row" key={`task-${task.id}`}>
                                <label className="col-9 ">
                                    <span> {task.task_name}</span>
                                </label>
                                
                                <input 
                                    type="number"
                                    className="form-control w-25 no-spinner"
                                    min={0}
                                    step={0.01}
                                    max={1}
                                    id = {task.id}
                                    onKeyDown={numericKeyDown}
                                    onPaste={handlePasteNumeric}
                                    onInput={onNumberInput}
                                    value={taskData[task.id]}
                                />

                            </div>
                        )) : <div>There is no assigned task for this department</div>}

                        <div className="my-3 row fs-6 fw-bold border-top p-2">
                                <label className="col-9 ">
                                    <span> Total Weight</span>
                                </label>

                                <span className="col-3">{totalWeight}</span>                            
                            </div>
                    </div>
                    
                </div>

                <button className="btn btn-success" disabled={totalWeight != 1 || updating || !isDirty} onClick={()=>{handleUpdate()}}>
                    {updating ? <span className="spinner-border spinner-border-sm me-2"></span> : totalWeight != 1 ? "Weights need to add up to 100%" : "Save Changes"}                    
                </button>
            </div>
        </div>
    )
}

export default TaskWeights