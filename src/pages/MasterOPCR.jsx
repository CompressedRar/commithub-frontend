import { useEffect, useState} from "react"

import Swal from "sweetalert2"
import { downloadMasterOPCR, getMasterOPCR } from "../services/pcrServices"
import { socket } from "../components/api"


function MasterOPCR(){
    
        const [opcrInfo, setOPCRInfo] = useState(null)
    
        
        const [assignedData, setAssignedData] = useState(null)
        const [headData, setHeadData] = useState(null)
    
    
        const [quantityAvg, setQuantity] = useState(0)
        const [efficiencyAvg, setEfficiency] = useState(0)
        const [timelinessAvg, setTimeliness] = useState(0)
        const [allAvg, setAllAvg] = useState(0)
    
        const [downloading, setDownloading] = useState(false)
        const [ submitting, setSubmitting] = useState(false)
        
        async function loadOPCR(){
            var res = await getMasterOPCR().then(data => data.data).catch(error => {
                console.log(error.response.data.error)
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error"
                })
            })
    
            console.log("MASTER OPCR INFRO", res)
            setOPCRInfo(res.ipcr_data)
            setAssignedData(res.assigned)
            setHeadData(res.admin_data)
            //rearrange my tasks here
            
        }
    
    
        async function download() {
            setDownloading(true)
            var res = await downloadMasterOPCR().then(data => data.data.link).catch(error => {
                console.log(error.response.data.error)
                Swal.fire({
                    title: "Error",
                    text: error.response.data.error,
                    icon: "error"
                })
                setDownloading(false)
            })
            window.open(res, "_blank", "noopener,noreferrer");
            setDownloading(false)
        }
    
        //ayusin yubng logo sa IPCR
        //pati yung loading
        //mag lagay ng supporting documents
    
        //gawin yung head module at opcr generaton
        useEffect(() => {
        if (!opcrInfo) return;
    
        let qSum = 0, eSum = 0, tSum = 0, allSum = 0;
        let qCount = 0, eCount = 0, tCount = 0;
    
        opcrInfo.forEach(categoryObj => {
            Object.entries(categoryObj).forEach(([category, tasks]) => {
                tasks.forEach(task => {
                    let q = task.rating.quantity;
                    let e = task.rating.efficiency;
                    let t = task.rating.timeliness;
                    
                    let avg = calculateAverage(q, e, t);
    
                    qSum += q; eSum += e; tSum += t; allSum += avg;
                    qCount++; eCount++; tCount++;
                    });
                });
            });
            console.log("Timeliness AVG: ", tSum, tCount)
            setQuantity(qSum / qCount);
            setEfficiency(eSum / eCount);
            setTimeliness(tSum / tCount);
            setAllAvg(allSum / qCount);
    
            console.log("result:", opcrInfo)
        }, [opcrInfo]);
    
        
        
    
        function calculateAverage(quantity, efficiency, timeliness) {
            let calculations = quantity + efficiency + timeliness;
            let result = calculations / 3;
    
            return result;
        }
    
        //do the final rating in president module
        // opcr labas download
        //ayusin ang notification at logs bukas
        //yung account settings tagal na nun hahaha, di lumalabas sa deparmtent at account amnagement
        // yung task info sa category gawin nalang modal
        
    
        useEffect(()=> {
            loadOPCR()
            
    
            socket.on("ipcr", ()=>{
                loadOPCR()
                console.log("IPCR LISTENED")
            })
    
            socket.on("ipcr_added", ()=>{
                loadOPCR()
                console.log("ADDED LISTENED")
            })
    
            socket.on("ipcr_remove", ()=>{
                loadOPCR()
                console.log("REMOVE LISTENED")
            })
    
            socket.on("assign", ()=>{
                loadOPCR()
                console.log("assigned")
            })
    
            return () => {
                socket.off("ipcr")
                socket.off("document")
            }
        }, [])
    
        return (
            <div className="edit-ipcr-container">
                
               <div className="back-container d-flex justify-content-between">
                    
    
                </div>
                <div className="option-header">
                    
    
                    <div className="ipcr-options">
                        <div className="additional">
                        <button
                        className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                        onClick={()=> {download()}}
                        disabled={downloading}
                        >
                            <span className="material-symbols-outlined">
                                {downloading ? "sync" : "download"}
                            </span>
                            {downloading ? "Generating..." : "Download Master OPCR"}
                        </button>
    
                        </div>
    
                        
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
                        <span>OFFICE PERFORMANCE COMMITMENT & REVIEW FORM</span>
                    </div>
    
                    <div className="ratee-information">
                        <div className="ratee-oath">
                            <span className="first-oath">
                                <i>I, <div className="ratee-name"><strong>{headData && headData.fullName}</strong></div>, <div className="ratee-position">{headData && headData.position}</div> of the <strong>NORZAGARAY COLLEGE,</strong> commit to deliver and agree to be rated on the attainment of  </i>
                            </span>
                            <span className="second-oath">
                                <i>the following targets in accordance with the indicated measures for the period <strong>JULY - DECEMBER 2025</strong> </i>
                            </span>
                        </div>
                        <div className="ratee-signature">
                            <span className="date">
                                <input disabled type="text"style={{color:"black", textAlign:"center", fontWeight:"bold"}} value={headData && headData.fullName}/>
                                Ratee
                            </span>
                            <span className="date">
                                <input type="text" />
                                DATE
                            </span>
                        </div>
    
                        <div className="individuals-top-container" style={{borderStyle:"none" , gridTemplateColumns:"1fr 1fr 1fr"}}>
                            
                            <div className="involved" style={{borderStyle:"solid", borderWidth: "1px", gridTemplateColumns:"1fr"}}>
                                <div className="individual-container" style={{textAlign:"left"}}>
                                    <span className="type" style={{textAlign:"left", borderBottomStyle:"solid", borderWidth: "1px"}}>Approved by:</span>
                                    <span className="type"  style={{textAlign:"left" , borderBottomStyle:"solid", borderWidth: "1px"}}>Name: {headData && headData.individuals.approve.name}</span>
                                    <span className="type" style={{textAlign:"left", borderBottomStyle:"solid", borderWidth: "1px"}}>Position: {headData && headData.individuals.approve.position}</span>
                                    <span className="type" style={{textAlign:"left", borderBottomStyle:"solid", borderWidth: "1px"}}>Date: {headData && headData.individuals.approve.date}</span>                                    
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
    
    
                        <div className="tasks-table" style={{gridTemplateColumns:" 1fr 1.2fr 1fr 1.2fr 1.2fr 1fr 1fr"}}>
                            <div className="headers">
                                OUTPUT
                            </div>
                            <div className="headers">
                                <span>SUCCESS INDICATORS</span>
                                <span>{"(TARGETS + MEASURES)"}</span>
                            </div>
                            <div className="headers">
                                <span>BUDGET</span>
                                <span>ALLOTED</span>
                            </div>
                            <div className="headers">
                                <span>DIVISIONS / </span>
                                <span> INDIVIDUALS</span>
                                <span>ACCOUNTABLE</span>
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
    
                            <div className="categories" style={{gridColumn:"span 7"}}>
                                CORE FUNCTION
                            </div>
                            {/**
                             * dito ilagay lahat ng tasks
                             */}
    
                            {opcrInfo && opcrInfo.map((categoryObj, i) => (
                                Object.entries(categoryObj).map(([category, tasks]) => (
                                    <div className="task-wrapper" key={i + category} style={{gridColumn:"span 7"}}>
                                        <div className="categories">
                                            {category}
                                        </div>
    
                                        {tasks.map((task, j) => (
                                            <div className="sub-task-wrapper" style={{gridTemplateColumns:" 1fr 1.2fr 1fr 1.2fr 1.2fr 1fr 1fr", gridColumn:"span 7"}}>
                                                <div className="sub-task-name">
                                                    {task.title}
                                                </div>
                                                <div className="stats">
                                                    <input disabled name = "target_acc" type="number" className="value" defaultValue={task.summary.target}/>
                                                    <span className="desc">{task.description.target} in</span>
    
                                                    <input disabled name = "target_time" type="number" className="value" defaultValue={task.working_days.target} />
                                                    <span className="desc">{task.description.time} with</span>
    
                                                    <input disabled name = "target_mod" type="number" className="value" defaultValue={task.corrections.target}/>
                                                    <span className="desc">{task.description.alterations} </span>
    
                                                </div>
                                                
                                                <div className="budget-alloted">
                                                    0
                                                </div>
    
                                                <div className="accountable">
                                                    {assignedData && assignedData[task.title].map(assigned => (
                                                        <span>{assigned}</span>
                                                    ))}
                                                </div>
    
                                                <div className="stats">
                                                    <input disabled name = "actual_acc" type="number" className="value" defaultValue={task.summary.actual}/>
                                                    <span className="desc"> {task.description.actual} in</span>
    
                                                    <input disabled name = "actual_time" type="number" className="value"  defaultValue={task.working_days.actual}/>
                                                    <span className="desc">{task.description.time} with</span>
    
                                                    <input disabled name = "actual_mod" type="number" className="value" defaultValue={task.corrections.actual} />
                                                    <span className="desc">{task.description.alterations} </span>
                                                </div>
    
                                                <div className="sub-task-rating">
                                                    <span>{task.rating.quantity}</span>
                                                    <span>{task.rating.efficiency}</span>
                                                    <span>{task.rating.timeliness}</span>
                                                    <span>{task.rating.average}</span>
                                                </div>
    
                                                <div className="remarks">
                                                                
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ))}
    
                            
                        </div>
                        
                        <div className="another-rating" style={{gridTemplateColumns:" 1fr 1.2fr 1fr 1.2fr 1.2fr 1fr 1fr", gridColumn:"span 7", marginTop:"20px"}}>
                            <div className="fill-blanks" style={{gridColumn:"span 4"}}>
    
                            </div>
                            <div className="calculated-rating" style={{gridColumn:"span 2", borderTopStyle:"solid", borderWidth:"1px"}}>
                            
                                <div className="whole-rating">
                                    <span className="rating-type">Final Average Rating</span>
                                    <div className="each-rating">
                                        <span>{parseFloat(quantityAvg).toFixed(2)}</span>
                                        <span>{parseFloat(efficiencyAvg).toFixed(2)}</span>
                                        <span>{parseFloat(timelinessAvg).toFixed(2)}</span>
                                        <span>{parseFloat(allAvg).toFixed(2)}</span>
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
                                <span className="name">{headData && headData.fullName}</span>
                                <span>{headData && headData.position}</span>
                            </div>
                            <div className="date-viewed">
                                <span>Date</span>
                            </div>
                        </div>
                        <div className="involved">
                            <div className="individual-container">
                                <span className="type">Assessed by:</span>
                                <span style={{textAlign:"left", fontWeight:"300", fontSize:"0.9rem", padding:"10px"}}>I certified that I discussed my assessment of the performance with the employee</span>
                                <span className="name">{headData && headData.individuals.assess.name}</span>
                                <span>{headData && headData.individuals.assess.position}</span>
                            </div>
                            <div className="date-viewed">
                                <span className="type">Date</span>
                                <span>{headData && headData.individuals.assess.date}</span>
                            </div>
                        </div>
    
                        <div className="involved">
                            <div className="individual-container">
                                <span className="type">Final Rating by:</span>
                                <span className="name">{headData && headData.individuals.final.name}</span>
                                <span>{headData && headData.individuals.final.position}</span>
                            </div>
                            <div className="date-viewed">
                                <span className="type">Date</span>
                                <span>{headData && headData.individuals.final.date}</span>
                            </div>
                        </div>                    
                            
                    </div>
    
                    <div className="individuals-bottom-container" style={{borderStyle: "none"}}>
                        <div className="involved">
                            
                        </div>
                        <div className="involved" style={{borderLeftStyle:"solid",borderBottomStyle:"solid", borderWidth: "1px", marginTop: "0px"}}>
                            <div className="individual-container">
                                <span className="type">Confirmed by:</span>
                                <span className="name">{headData && headData.individuals.confirm.name}</span>
                                <span>{headData && headData.individuals.confirm.position}</span>
                            </div>
                            <div className="date-viewed">
                                <span className="type">Date</span>
                                <span>{headData && headData.individuals.confirm.date}</span>
                            </div>
                        </div>
    
                        <div className="involved">
                            
                        </div>                    
                            
                    </div>
    
    
                </div>
                
            </div>
        )
}

export default MasterOPCR