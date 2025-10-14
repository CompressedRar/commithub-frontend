import { useEffect, useState } from "react"
import { approveIPCR, assignMainIPCR, downloadIPCR, getIPCR, reviewIPCR, updateSubTask } from "../../services/pcrServices"
import { socket } from "../api"
import { jwtDecode } from "jwt-decode"
import { getAccountInfo } from "../../services/userService"
import Swal from "sweetalert2"
import ManageTask from "./ManageTask"
import ManageSupportingDocuments from "./ManageSupportingDocuments"


//check bukas yung current user para alam sa department kung head yung nag eedit
// para di din makapag approve si head / 
// account settinmgs hahahah
//yung master opcr, gawin katulad nung sa ipcr pero di na mamimili, kita nalanmg kung anong department walang opcr
//check bukas kung gumagana pa yung g4f
function EditIPCR(props) {

    const token = localStorage.getItem("token")
    const [userinfo, setuserInfo] = useState(null)
    const [ipcrInfo, setIPCRInfo] = useState(null)
    const [arrangedSubTasks, setArrangedSubTasks] = useState({})
    const [quantityAvg, setQuantityAvg] = useState(0)
    const [efficiencyAvg, setEfficiencyAvg] = useState(0)
    const [timelinessAvg, setTimelinessAvg] = useState(0)
    const [allAvg, setAllAvg] = useState(0)
    

    const [field, setField] = useState("")
    const [value, setValue] = useState(0)
    const [subTaskID, setSubTaskID] = useState(0)
    const [downloading, setDownloading] = useState(false)
    const [hasShownMainNotice, setHasShownMainNotice] = useState(false);


    const [currentUserInfo, setCurrentUserInfo] = useState(null)

    function readTokenInformation(){
        let payload = {}
        try {
            payload = jwtDecode(token)
            console.log("token: ",payload)
            setCurrentUserInfo(payload)
            
            
        }
        catch(err){
            console.log(err)
        }
    }

    
    async function loadIPCR(){
        var res = await getIPCR(props.ipcr_id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        console.log("USER IPCR: ", res)
        setIPCRInfo(res)

        //rearrange my tasks here
        var sub_tasks = res.sub_tasks
        console.log(res)
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

        
        setQuantityAvg(q/res.sub_tasks_count)
        setEfficiencyAvg(e/res.sub_tasks_count)
        setTimelinessAvg(t/res.sub_tasks_count)
        setAllAvg(a/res.sub_tasks_count)

    }

    function handleDataChange(e){
        setField(e.target.name)
        setValue(e.target.value)
    }

    function handleSpanChange(e){
        setField(e.target.className)
        setValue(e.target.textContent)
    }

    async function loadUserInfo() {
        if (Object.keys(localStorage).includes("token")){
            var token = localStorage.getItem("token")
            var payload = jwtDecode(token)
                
            var res = await getAccountInfo(payload.id).then(data => data.data).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
    
            setuserInfo(res)
        }
    }

    async function handleApproval(){
        var res = await approveIPCR(ipcrInfo.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            
        if (res == "This IPCR is successfully approved."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
    } 
    
    async function approvalIPCR(){
        Swal.fire({
            title:"Approve",
            text:"By approving this IPCR, you acknowledge that this IPCR can be consolidated for the OPCR. Do you wish to proceed?",
            showDenyButton: true,
            confirmButtonText:"Approve",
            confirmButtonColor:"green",
            denyButtonText:"No",
            denyButtonColor:"grey",
            icon:"question",
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-1 right-gap',
            },
        }).then((result)=> {
            if(result.isConfirmed){
                handleApproval()
            }
        }) 
    }

    async function handleReview(){
        var res = await reviewIPCR(ipcrInfo.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            
        if (res == "This IPCR is successfully reviewed."){
            Swal.fire({
                title:"Success",
                text: res,
                icon:"success"
            })
        }
    } 
    
    async function reviewalIPCR(){
        Swal.fire({
            title:"Review",
            text:"Please confirm that you have thoroughly reviewed this IPCR. Do you want to proceed with marking it as reviewed?",
            showDenyButton: true,
            confirmButtonText:"Yes",
            confirmButtonColor:"blue",
            denyButtonText:"No",
            denyButtonColor:"grey",
            icon:"question",
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-1 right-gap',
            },
        }).then((result)=> {
            if(result.isConfirmed){
                handleReview()
            }
        }) 
    }

    async function scrollReviewalIPCR(){
        Swal.fire({
            title:"Review",
            text:"Please confirm that you have thoroughly reviewed this IPCR. Do you want to proceed with marking it as reviewed?",
            showDenyButton: true,
            confirmButtonText:"Yes",
            confirmButtonColor:"blue",
            denyButtonText:"No",
            denyButtonColor:"grey",
            icon:"question",
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-1 right-gap',
            },
        }).then((result)=> {
            if(result.isConfirmed){
                handleReview()
            }
        }) 
    }

    async function handleAssign(){
        var res = await assignMainIPCR(ipcrInfo.id, userinfo.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
            
        if (res == "IPCR successfully assigned."){
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

    async function handleAssignMain(){
        var res = await assignMainIPCR(ipcrInfo.id, userinfo.id).then(data => data.data.message).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        
    } 
    
    async function assignIPCR(){
        Swal.fire({
            title:"Assign",
            text:"Submitting this IPCR would make this your main IPCR?",
            showDenyButton: true,
            confirmButtonText:"Assign",
            denyButtonText:"No",
            denyButtonColor:"grey",
            icon:"question",
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2',
                denyButton: 'order-1 right-gap',
            },
        }).then((result)=> {
            if(result.isConfirmed){
                handleAssign()
            }
        }) 
    }

    async function download() {
        setDownloading(true)
        var res = await downloadIPCR(props.ipcr_id).then(data => data.data.link).catch(error => {
            console.log(error.response.data.error)
            Swal.fire({
                title: "Error",
                text: error.response.data.error,
                icon: "error"
            })
        })
        window.open(res, "_blank", "noopener,noreferrer");
        setDownloading(false)
    }

    //ayusin yubng logo sa IPCR
    //pati yung loading
    //mag lagay ng supporting documents

    //gawin yung head module at opcr generaton
    useEffect(() => {
        const modalBody = document.querySelector("#view-ipcr .modal-body"); // change selector to your modal
        console.log(modalBody)
        const handleScroll = () => {
           
            if (!modalBody) return;

            const scrollTop = modalBody.scrollTop;
            const scrollHeight = modalBody.scrollHeight;
            const clientHeight = modalBody.clientHeight;

            // Check if scrolled to bottom
            if (scrollTop + clientHeight >= scrollHeight - 10) {
            console.log("✅ Reached bottom of modal!");
            }
        };

        if (modalBody) {
            modalBody.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (modalBody) {
            modalBody.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    function allTargetsFilled(ipcr) {
        if (!ipcr || !ipcr.sub_tasks) return false;

        return ipcr.sub_tasks.every(task =>
            task.target_acc && task.target_time && task.target_mod
        );
    }


    useEffect(() => {
        if (value === "") return;

        const debounce = setTimeout(() => {
            updateSubTask(subTaskID, field, value)
            .then(() => {
                // After updating, reload latest IPCR to check completeness
                getIPCR(props.ipcr_id).then((res) => {
                const updatedIPCR = res.data;
                setIPCRInfo(updatedIPCR);

                // ✅ Only assign main when all targets are filled
                if (userinfo && allTargetsFilled(updatedIPCR)) {
                    handleAssignMain();

                    // ✅ Show message only once
                    if (!hasShownMainNotice) {
                    Swal.fire({
                        title: "Main IPCR Assigned",
                        text: "All target fields are filled. This IPCR has been automatically set as your main IPCR.",
                        icon: "success",
                        confirmButtonColor: "#198754"
                    });
                    setHasShownMainNotice(true);
                    }
                }
                });
            })
            .catch((error) => {
                console.log(error.response?.data?.error || error);
            });
        }, 500);

        return () => clearTimeout(debounce);
    }, [value]);


    useEffect(()=> {
        //if(ipcrInfo && userinfo) handleAssignMain();
    }, [ipcrInfo, userinfo])
    


    useEffect(()=> {
        loadIPCR()
        loadUserInfo()
        readTokenInformation()

        socket.on("ipcr", ()=>{
            loadIPCR()
            loadUserInfo()
            console.log("IPCR LISTENED")
        })

        socket.on("ipcr_added", ()=>{
            loadIPCR()
            loadUserInfo()
            console.log("ADDED LISTENED")
        })

        socket.on("ipcr_remove", ()=>{
            loadIPCR()
            loadUserInfo()
            console.log("REMOVE LISTENED")
        })

        return () => {
            socket.off("ipcr")
            socket.off("document")
        }
    }, [])

    return (
        <div className="edit-ipcr-container">
            {ipcrInfo && <ManageSupportingDocuments ipcr_id = {props.ipcr_id} batch_id = {ipcrInfo.batch_id}></ManageSupportingDocuments>}
            {userinfo && <ManageTask key = {userinfo.id? userinfo.id: 0} ipcr_id = {props.ipcr_id} user_id = {userinfo.id? userinfo.id: 0} dept_id = {userinfo.department ? userinfo.department.id: 0}></ManageTask>}
            <div className="back-container">
                <div className="back"  data-bs-dismiss="modal" data-bs-target={props.dept_mode? "#view-ipcr":""} onClick={()=> {
                    props.switchPage()
                }}>
                    <span className="material-symbols-outlined">undo</span>
                    Back to IPCRs 
                </div>
            </div>
            <div className="option-header">
                

                <div className="ipcr-options">
                    <div className="additional">
                        {<button className="btn btn-primary" onClick={()=>{download()}}>
                            <span className="material-symbols-outlined">{downloading? "refresh": "download"}</span>
                            {!downloading? <span>Download</span>:""}
                        </button>}
                        {!props.dept_mode? userinfo && <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#manage-tasks">
                            <span className="material-symbols-outlined">assignment</span>
                            <span>Tasks</span>
                        </button>:""}
                        {!props.dept_mode? <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#manage-docs">
                            <span className="material-symbols-outlined">attach_file</span>
                            <span>Documents</span>
                        </button>:""}
                    </div>
                    

                </div>
            </div>
            
            <div className="ipcr-form-container">
                <span className="pcr-status-container">
                    <span>{ipcrInfo && ipcrInfo.isMain && "MAIN"}</span>
                </span>
                <span className="pcr-status-container">
                    <span>{ipcrInfo && ipcrInfo.form_status && ipcrInfo.form_status.toUpperCase()}</span>
                </span>
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
                            <i>I, <div className="ratee-name"><strong>{ipcrInfo && (ipcrInfo.user_info.first_name + " "+ ipcrInfo.user_info.last_name)}</strong></div>, <div className="ratee-position">Librarian</div> of the <strong>NORZAGARAY COLLEGE,</strong> commit to deliver and agree to be rated on the attainment of  </i>
                        </span>
                        <span className="second-oath">
                            <i>the following targets in accordance with the indicated measures for the period <strong>JULY - DECEMBER 2025</strong> </i>
                        </span>
                    </div>
                    <div className="ratee-signature">
                        <span className="date">
                            <input type="text" value={ipcrInfo && (ipcrInfo.user_info.first_name + " "+ ipcrInfo.user_info.last_name)} style={{color:"black", textAlign:"center", fontWeight:"bold"}}/>
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
                                <span className="name">{ipcrInfo && (ipcrInfo.review.name.toUpperCase())}</span>
                                <span>{ipcrInfo && (ipcrInfo.review.position)}</span>
                            </div>
                            <div className="date-viewed">
                                <span>Date</span>
                            </div>
                        </div>
                        <div className="involved">
                            <div className="individual-container">
                                <span className="type">Approved by:</span>
                                <span className="name">{ipcrInfo && (ipcrInfo.approve.name.toUpperCase())}</span>
                                <span>{ipcrInfo && (ipcrInfo.approve.position)}</span>
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
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)} disabled = {ipcrInfo && props.dept_mode? props.dept_mode: ipcrInfo.form_status == "approved"}/>

                                            <span className="desc">{task.main_task.target_acc} in</span>
                                            <input name = "target_time" type="number" className="value" defaultValue={task.target_time}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)} disabled = {ipcrInfo && props.dept_mode? props.dept_mode: ipcrInfo.form_status == "approved"}/>

                                            <span className="desc">{task.main_task.time} with</span>
                                            <input name = "target_mod" type="number" className="value" defaultValue={task.target_mod}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)} disabled = {ipcrInfo && props.dept_mode? props.dept_mode: ipcrInfo.form_status == "approved"}/>

                                            <span className="desc">{task.main_task.modification}</span>

                                        </div>

                                        <div className="stats">
                                            <input name = "actual_acc" type="number" className="value" defaultValue={task.actual_acc}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)} disabled = {ipcrInfo && props.dept_mode? props.dept_mode: ipcrInfo.form_status == "approved"}/>

                                            <span className="desc">{task.main_task.actual_acc} in</span>
                                            <input name = "actual_time" type="number" className="value" defaultValue={task.actual_time}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)} disabled = {ipcrInfo && props.dept_mode? props.dept_mode: ipcrInfo.form_status == "approved"}/>

                                            <span className="desc">{task.main_task.time} with</span>
                                            <input name = "actual_mod" type="number" className="value" defaultValue={task.actual_mod}
                                            onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleDataChange(e)} disabled = {ipcrInfo && props.dept_mode? props.dept_mode: ipcrInfo.form_status == "approved"}/>

                                            <span className="desc">{task.main_task.modification}</span>
                                        </div>

                                        <div className="sub-task-rating">
                                            <span className = "quantity" onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleSpanChange(e)} contentEditable ={props.dept_mode}>{parseFloat(task.quantity).toFixed(0)}</span>
                                            <span className = "efficiency" onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleSpanChange(e)} contentEditable ={props.dept_mode}>{parseFloat(task.efficiency).toFixed(0)}</span>
                                            <span className = "timeliness" onClick={()=>{setSubTaskID(task.id)}} onInput={(e)=> handleSpanChange(e)} contentEditable ={props.dept_mode}>{parseFloat(task.timeliness).toFixed(0)}</span>
                                            <span className = "average" >{parseFloat(task.average).toFixed(2)}</span>
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
                            
                            <span className="name">{ipcrInfo && (ipcrInfo.discuss.name.toUpperCase())}</span>
                                <span>{ipcrInfo && (ipcrInfo.discuss.position)}</span>
                        </div>
                        <div className="date-viewed">
                            <span>Date</span>
                        </div>
                    </div>
                    <div className="involved">
                        <div className="individual-container">
                            <span className="type">Assessed by:</span>
                            <span style={{textAlign:"left", fontWeight:"300", fontSize:"0.9rem", padding:"10px"}}>I certified that I discussed my assessment of the performance with the employee</span>
                            <span className="name">{ipcrInfo && (ipcrInfo.assess.name.toUpperCase())}</span>
                                <span>{ipcrInfo && (ipcrInfo.assess.position)}</span>
                        </div>
                        <div className="date-viewed">
                            <span className="type">Date</span>
                            <span></span>
                        </div>
                    </div>

                    <div className="involved">
                        <div className="individual-container">
                            <span className="type">Final Rating by:</span>
                            <span className="name">{ipcrInfo && (ipcrInfo.final.name.toUpperCase())}</span>
                            <span>{ipcrInfo && (ipcrInfo.final.position)}</span>
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
                            <span className="name">{ipcrInfo && (ipcrInfo.confirm.name.toUpperCase())}</span>
                            <span>{ipcrInfo && (ipcrInfo.confirm.position)}</span>
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