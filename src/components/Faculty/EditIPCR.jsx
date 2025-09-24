import { useEffect, useState } from "react"
import { getIPCR, updateSubTask } from "../../services/pcrServices"
import { socket } from "../api"
import { jwtDecode } from "jwt-decode"
import { getAccountInfo } from "../../services/userService"

function EditIPCR(props) {
    const [userinfo, setuserInfo] = useState({})
    const [ipcrInfo, setIPCRInfo] = useState({})
    const [arrangedSubTasks, setArrangedSubTasks] = useState({})
    const [quantityAvg, setQuantityAvg] = useState(0)
    const [efficiencyAvg, setEfficiencyAvg] = useState(0)
    const [timelinessAvg, setTimelinessAvg] = useState(0)
    const [allAvg, setAllAvg] = useState(0)
    

    const [field, setField] = useState("")
    const [value, setValue] = useState(0)
    const [subTaskID, setSubTaskID] = useState(0)
    async function loadIPCR(){
        var res = await getIPCR(props.ipcr_id).then(data => data.data)
        setIPCRInfo(res)
        console.log(res)

        //rearrange my tasks here
        var sub_tasks = res.sub_tasks
        var all_categories = {}
        for(const task of sub_tasks){
            var category = task.main_task.category.name
            all_categories = {...all_categories, [category]: []}
        }
        var q = 0
        var e = 0
        var t = 0
        var a = 0

        

        for(const task of sub_tasks){
            q += task.quantity
            e += task.efficiency
            t += task.timeliness
            a += task.average
            all_categories[task.main_task.category.name].push(task)

        }
        setArrangedSubTasks(all_categories)

        console.log(q/res.sub_tasks_count)
        
        setQuantityAvg(q/res.sub_tasks_count)
        setEfficiencyAvg(e/res.sub_tasks_count)
        setTimelinessAvg(t/res.sub_tasks_count)
        setAllAvg(a/res.sub_tasks_count)

        var keys = Object.keys(all_categories)
        for(const cat of keys){
            console.log(all_categories[cat])
        }
    }

    function handleDataChange(e){
        setField(e.target.name)
        setValue(e.target.value)
    }

    async function loadUserInfo() {
            if (Object.keys(localStorage).includes("token")){
                var token = localStorage.getItem("token")
                var payload = jwtDecode(token)
                
                var res = await getAccountInfo(payload.id).then(data => data.data)
    
                setuserInfo(res)
                console.log(res)
            }
        }

    useEffect(()=> {
        console.log(subTaskID, field, value)
        if(value == "") {
            console.log(subTaskID, field, value)
            return   
        }
        const debounce = setTimeout(()=>{
            //loadSearchedData(searchQuery)
            updateSubTask(subTaskID, field, value)
            console.log("nya")
        }, 500)

        return ()=> clearTimeout(debounce)
    }, [value])


    useEffect(()=> {
        loadIPCR()
        loadUserInfo()

        socket.on("ipcr", ()=>{
            loadIPCR()
        })

        return () => socket.off("ipcr")
    }, [])

    return (
        <div className="edit-ipcr-container">
            
            <div className="option-header">
                <div className="back" onClick={()=> {
                    props.switchPage()
                }}>
                    <span className="material-symbols-outlined">undo</span>
                    Back to IPCRs 
                </div>

                <div className="ipcr-options">
                    <button className="btn btn-primary">
                        <span className="material-symbols-outlined">article_shortcut</span>
                        <span>Submit this IPCR</span>
                    </button>
                </div>
            </div>
            
            <div className="ipcr-form-container">
                <div className="ipcr-header-container">
                    <div className="ipcr-logo" style={{backgroundImage: `url('${import.meta.env.BASE_URL}municipal.png')`}}>.</div>
                    <div className="school-info">
                        <div>Republic of the Philippines</div>
                        <div>Province of the Bulacan</div>
                        <div><strong>Municipality of Norzagaray</strong></div>
                        <div><strong>NORZAGARAY COLLEGE</strong></div>
                    </div>
                    <div className="ipcr-logo" style={{backgroundImage: `url('${import.meta.env.BASE_URL}LogoNC.png')`}}></div>
                </div>  
                <div className="ipcr-title">
                    <span>INDIVIDUAL PERFORMANCE COMMITMENT & REVIEW FORM</span>
                </div>

                <div className="ratee-information">
                    <div className="ratee-oath">
                        <span className="first-oath">
                            <i>I, <div className="ratee-name"><strong>{userinfo && userinfo.first_name + " "+ userinfo.last_name}</strong></div>, <div className="ratee-position">Librarian</div> of the <strong>NORZAGARAY COLLEGE,</strong> commit to deliver and agree to be rated on the attainment of  </i>
                        </span>
                        <span className="second-oath">
                            <i>the following targets in accordance with the indicated measures for the period <strong>JULY - DECEMBER 2025</strong> </i>
                        </span>
                    </div>
                    <div className="ratee-signature">
                        <span className="date">
                            <input type="text" value={userinfo && userinfo.first_name + " " + userinfo.last_name} style={{color:"black", textAlign:"center", fontWeight:"bold"}}/>
                            Ratee
                        </span>
                        <span className="date">
                            <input type="text" />
                            DATE
                        </span>
                    </div>

                    <div className="individuals-top-container">
                        <div className="involved">
                            <div className="individual-container">
                                <span className="type">Reviewed by:</span>
                                <span className="name">Arman Bitancur</span>
                                <span>Librarian II</span>
                            </div>
                            <div className="date-viewed">
                                <span>Date</span>
                            </div>
                        </div>
                        <div className="involved">
                            <div className="individual-container">
                                <span className="type">Approved by:</span>
                                <span className="name">Arman Bitancur</span>
                                <span>Librarian II</span>
                            </div>
                            <div className="date-viewed">
                                <span className="type">Date</span>
                                <span></span>
                            </div>
                        </div>
                    </div>

                    <div className="legend-container">
                        <div className="legend">    
                            <span>5 - OUTSTANDING</span>
                            <span>4 - VERY SATISFACTORY</span>
                            <span>3 - SATISFACTORY</span>
                            <span>2 - UNSATISFACTORY</span>
                            <span>1 - POOR</span>
                        </div>
                    </div>


                    <div className="tasks-table">
                        <div className="headers">
                            OUTPUT
                        </div>
                        <div className="headers">
                            <span>SUCCESS INDICATORS</span>
                            <span>{"(TARGETS + MEASURES)"}</span>
                        </div>
                        <div className="headers">
                            <span>ACTUAL</span>
                            <span>ACCOMPLISHMENT</span>
                        </div>
                        <div className="headers rating">
                            <span>RATING</span>
                            <span className="rates">                                
                                <span>Q <sup>2</sup> </span>
                                <span>E <sup>2</sup> </span>
                                <span>T <sup>2</sup> </span>
                                
                                <span>A <sup>2</sup> </span>
                            </span>
                        </div>
                        <div className="headers">
                            REMARKS
                        </div>

                        <div className="categories">
                            CORE FUNCTION
                        </div>
                        {/**
                         * dito ilagay lahat ng tasks
                         */}

                         {Object.entries(arrangedSubTasks).map(([category, tasks])=>(
                            
                            <div className="task-wrapper">
                                <div className="categories">
                                    {category}
                                </div>

                                {tasks.map(task =>(
                                    <div className="sub-task-wrapper">
                                        <div className="sub-task-name">
                                            {task.title}
                                        </div>
                                        <div className="stats">
                                            <input name = "target_acc" type="number" className="value"  defaultValue={task.target_acc}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)}/>

                                            <span className="desc">{task.main_task.target_acc} in</span>
                                            <input name = "target_time" type="number" className="value" defaultValue={task.target_time}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)}/>

                                            <span className="desc">{task.main_task.time} with</span>
                                            <input name = "target_mod" type="number" className="value" defaultValue={task.target_mod}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)}/>

                                            <span className="desc">{task.main_task.modification}</span>

                                        </div>

                                        <div className="stats">
                                            <input name = "actual_acc" type="number" className="value" defaultValue={task.actual_acc}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)}/>

                                            <span className="desc">{task.main_task.actual_acc} in</span>
                                            <input name = "actual_time" type="number" className="value" defaultValue={task.actual_time}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)}/>

                                            <span className="desc">{task.main_task.time} with</span>
                                            <input name = "actual_mod" type="number" className="value" defaultValue={task.actual_mod}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)}/>

                                            <span className="desc">{task.main_task.modification}</span>
                                        </div>

                                        <div className="sub-task-rating">
                                            <span>{parseFloat(task.quantity).toFixed(0)}</span>
                                            <span>{parseFloat(task.efficiency).toFixed(0)}</span>
                                            <span>{parseFloat(task.timeliness).toFixed(0)}</span>
                                            <span>{parseFloat(task.average).toFixed(2)}</span>
                                        </div>

                                        <div className="remarks">
                                            
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        
                        

                        

                        


                    </div>
                    
                    <div className="another-rating">
                        <div className="fill-blanks">

                        </div>
                        <div className="calculated-rating">
                        
                            <div className="whole-rating">
                                <span className="rating-type">Final Average Rating</span>
                                <div className="each-rating">
                                    <span>{parseFloat(quantityAvg).toFixed(1)}</span>
                                    <span>{parseFloat(efficiencyAvg).toFixed(1)}</span>
                                    <span>{parseFloat(timelinessAvg).toFixed(1)}</span>
                                    <span>{parseFloat(allAvg).toFixed(1)}</span>
                                </div>
                            </div>  
                            <div className="whole-rating">
                                <span className="rating-type">FINAL AVERAGE RATING</span>
                                <div className="avg-rating">
                                    {parseFloat(allAvg).toFixed(2)}
                                </div>
                            </div>  
                            <div className="whole-rating">
                                <span className="rating-type">ADJECTIVAL RATING</span>
                                <div className="avg-rating">
                                    {
                                        parseFloat(allAvg).toFixed(2) == 5? "OUTSTANDING": parseFloat(allAvg).toFixed(2) >= 4? "VERY SATISFACTORY": parseFloat(allAvg).toFixed(2) >= 3? "SATISFACTORY":parseFloat(allAvg).toFixed(2) >= 2? "UNSATISFACTORY": "POOR" 
                                    }
                                </div>
                            </div>  
                        </div>
                    </div>
                    

                    

                    


                </div>
                <div className="individuals-bottom-container" style={{marginTop: "10px"}}>
                    <div className="involved">
                        <div className="individual-container">
                            <span className="type">Discussed with:</span>
                            <span className="name">Arman Bitancur</span>
                            <span>Librarian II</span>
                        </div>
                        <div className="date-viewed">
                            <span>Date</span>
                        </div>
                    </div>
                    <div className="involved">
                        <div className="individual-container">
                            <span className="type">Assessed by:</span>
                            <span className="name">Arman Bitancur</span>
                            <span>Librarian II</span>
                        </div>
                        <div className="date-viewed">
                            <span className="type">Date</span>
                            <span></span>
                        </div>
                    </div>

                    <div className="involved">
                        <div className="individual-container">
                            <span className="type">Final Rating by:</span>
                            <span className="name">Arman Bitancur</span>
                            <span>Librarian II</span>
                        </div>
                        <div className="date-viewed">
                            <span className="type">Date</span>
                            <span></span>
                        </div>
                    </div>                    
                        
                </div>

                <div className="individuals-bottom-container" style={{borderStyle: "none"}}>
                    <div className="involved">
                        
                    </div>
                    <div className="involved" style={{borderLeftStyle:"solid",borderBottomStyle:"solid", borderWidth: "1px", marginTop: "0px"}}>
                        <div className="individual-container">
                            <span className="type">Confirmed by:</span>
                            <span className="name">Arman Bitancur</span>
                            <span>Librarian II</span>
                        </div>
                        <div className="date-viewed">
                            <span className="type">Date</span>
                            <span></span>
                        </div>
                    </div>

                    <div className="involved">
                        
                    </div>                    
                        
                </div>


            </div>
            
        </div>
    )
}

export default EditIPCR