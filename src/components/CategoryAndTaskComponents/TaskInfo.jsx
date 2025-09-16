import { useEffect, useState } from "react"
import SubmissionsChart from "../Barchart"
import UsersPieChart from "../Piechart"
import { getMainTask } from "../../services/taskService"

function TaskInfo(props){

    const [taskInfo, setTaskInfo] = useState({})

    async function loadTaskInfo(){
        var res = await getMainTask(props.id).then(data => data.data)
        setTaskInfo(res)
        console.log(res)
        return res
    }

    useEffect(()=>{
        if (props.id) loadTaskInfo();
        
        //lagay mo na yung data sa container
    },[props.id])

    return(
        <div className="task-info-container">
            
            <div className="main-task-info">
                
                <div className="task-description">
                    <span className="back" onClick={()=>{props.backToPage()}}>
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>Back to Tasks</span>
                    </span>                    
                    <div className="description-container">
                        <div className="task-title">{ taskInfo && taskInfo.name}</div>
                        <div className="description">
                            <div className="title">Target Output</div>
                            <div className="content">{taskInfo.target_accomplishment? taskInfo.target_accomplishment: "N/A"}</div>
                        </div>
                        <div className="description">
                            <div className="title">Actual Output</div>
                            <div className="content">{taskInfo.actual_accomplishment? taskInfo.actual_accomplishment: "N/A"}</div>
                        </div>
                    </div>

                    <div className="task-measurements">
                        <div className="description">
                            <div className="title">Time Measurement</div>
                            <div className="content">{taskInfo.time_measurement? taskInfo.time_measurement[0].toUpperCase() + taskInfo.time_measurement.slice(1): "N/A"}</div>
                        </div>
                        <div className="description">
                            <div className="title">Modification</div>
                            <div className="content">{taskInfo.modifications? taskInfo.modifications[0].toUpperCase() + taskInfo.modifications.slice(1): "N/A"}</div>
                        </div>
                    </div>

                    <div className="users-assigned">
                        <div className="title">Users Assigned</div>
                        <div className="user-container">
                            <div className="user">
                                <div className="user-profile">
                                    <div className="user-image">.</div>
                                    <div className="user-info">
                                        <div className="user-name">John Doe</div>
                                        <div className="user-dept">Computing Studies</div>
                                    </div>
                                </div>
                                <div className="option">
                                    <button className="btn btn-danger">
                                        <span className="material-symbols-outlined">remove</span>
                                        <span>Remove User</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="IPCRs">

                    </div>
                </div>

                <div className="task-stats">
                    <div className="graph-container">
                        <SubmissionsChart></SubmissionsChart>
                    </div>
                    <div className="graph-container">
                        <UsersPieChart></UsersPieChart>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default TaskInfo