import { useEffect, useState } from "react"
import SubmissionsChart from "../Barchart"
import UsersPieChart from "../Piechart"
import Swal from "sweetalert2"

import { archiveMainTask, getMainTask, updateMainTaskInfo } from "../../services/taskService"
import { objectToFormData } from "../api"

function TaskInfo(props){

    const [taskInfo, setTaskInfo] = useState({})

    const [taskEditable, setTaskEditable] = useState(false);
    const [targetEditable, setTargetEditable] = useState(false);
    const [actualEditable, setActualEditable] = useState(false);
    const [timeEditable, setTimeEditable] = useState(false);
    const [modEditable, setModEditable] = useState(false);
    const [formData, setFormData] = useState({"id": props.id})

    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.textContent})        
    }

    async function loadTaskInfo(){
        var res = await getMainTask(props.id).then(data => data.data)
        setTaskInfo(res)
        console.log(res)
        return res
    }
    const handleSubmission = async () => {
        const newFormData = objectToFormData(formData);
        var a = await updateMainTaskInfo(newFormData)
        console.log(a)
        if(a.data.message == "Task successfully updated.") {
            Swal.fire({
                title:"Success",
                text: a.data.message,
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
    }

    const handleArch = async () => {
        var a = await archiveMainTask(props.id)
        console.log(a)
        if(a.data.message == "Task successfully archived.") {
            Swal.fire({
                title:"Success",
                text: "Task successfully archived",
                icon:"success"
            })
            
            props.backAfterArchive()
        }
        else {
            Swal.fire({
                title:"Error",
                text: a.data.message,
                icon:"error"
            })
        }
    }

    const handleArchive = async ()=>{
        
        Swal.fire({
            title: 'Do you want to archive the task?',
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
                handleArch()
            } else if (result.isDenied) {
                
            }
        })
    }



    useEffect(()=>{
        if (props.id) loadTaskInfo();
    },[props.id])

    useEffect(()=>{
        console.log(formData)
    }, [formData])

    return(
        <div className="task-info-container">
            
            <div className="main-task-info">
                
                <div className="task-description">
                    <div className="task-options">
                        <span className="back" onClick={()=>{props.backToPage()}}>
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span>Back to Tasks</span> 
                        </span>
                        <button className="btn btn-danger" style={{display: "flex", alignItems:"center", gap: "10px"}} onClick={handleArchive}>
                            <span className="material-symbols-outlined">archive</span>
                            <span>Archive Task</span>
                        </button>  
                    </div>                  
                    <div className="description-container">
                        <div className="task-title"  >
                            <span id = "name" onInput={handleDataChange} contentEditable = {taskEditable}>{ taskInfo && taskInfo.name} </span>
                            <span className="material-symbols-outlined edit-toggle" onClick={()=>{
                                setTaskEditable(!taskEditable);
                                if (taskEditable) handleSubmission();
                                }}>edit</span>
                        </div>
                        <div className="description">
                            <div className="title">Target Output <span className="material-symbols-outlined edit-toggle" onClick={()=>{
                                setTargetEditable(!targetEditable);
                                if (targetEditable) handleSubmission();
                                }}>edit</span></div>
                            <div className="content" id = "target_accomplishment" onInput={handleDataChange}  contentEditable = {targetEditable}>{taskInfo.target_accomplishment? taskInfo.target_accomplishment: "N/A"}</div>
                        </div>
                        <div className="description">
                            <div className="title">Actual Output <span className="material-symbols-outlined edit-toggle" onClick={()=>{
                                setActualEditable(!actualEditable);
                                if (actualEditable) handleSubmission();
                                }}>edit</span></div>
                            <div className="content" id = "actual_accomplishment" onInput={handleDataChange} contentEditable = {actualEditable}>{taskInfo.actual_accomplishment? taskInfo.actual_accomplishment: "N/A"}</div>
                        </div>
                    </div>

                    <div className="task-measurements">
                        <div className="description">
                            <div className="title">Time Measurement <span className="material-symbols-outlined edit-toggle" onClick={()=>{
                                setTimeEditable(!timeEditable);
                                if (timeEditable) handleSubmission();
                                }}>edit</span></div>
                            <div className="content" id = "time_description" onInput={handleDataChange} contentEditable = {timeEditable}>{taskInfo.time_measurement? taskInfo.time_measurement: "N/A"}</div>
                        </div>
                        <div className="description">
                            <div className="title">Modification <span className="material-symbols-outlined edit-toggle" onClick={()=>{
                                setModEditable(!modEditable);
                                if (modEditable) handleSubmission();
                                }}>edit</span></div>
                            <div className="content" id = "modification" onInput={handleDataChange} contentEditable = {modEditable}>{taskInfo.modifications? taskInfo.modifications: "N/A"}</div>
                        </div>
                    </div>

                    

                    <div className="IPCRs">

                    </div>
                </div>

                <div className="task-stats">
                    <div>
                        <h1>Insights</h1>
                    </div>
                    <div className="graph-container">
                        Average Rating per Assigned Member
                        <SubmissionsChart></SubmissionsChart>
                    </div>
                    <div className="graph-container">
                        Department Ratio of Assigned Member
                        <UsersPieChart></UsersPieChart>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default TaskInfo