import { useEffect, useState, useSyncExternalStore } from "react"
import { assignMainIPCR, downloadIPCR, getIPCR, updateSubTask } from "../../services/pcrServices"
import { socket } from "../api"
import { jwtDecode } from "jwt-decode"
import { getAccountInfo } from "../../services/userService"
import Swal from "sweetalert2"
import ManageTask from "./ManageTask"
import ManageSupportingDocuments from "./ManageSupportingDocuments"

function EditOPCR(props) {
    
    const [opcrInfo, setOPCRInfo] = useState()


    const [downloadURL, setDownloadURL] = useState(null)
    const [downloading, setDownloading] = useState(false)
    
    async function loadOPCR(){
        

        //rearrange my tasks here
        
    }


    async function download() {
        setDownloading(true)
        var res = await downloadIPCR(props.ipcr_id).then(data => data.data.link)
        setDownloadURL(res)
        window.open(res, "_blank", "noopener,noreferrer");
        setDownloading(false)
    }

    //ayusin yubng logo sa IPCR
    //pati yung loading
    //mag lagay ng supporting documents

    //gawin yung head module at opcr generaton

    useEffect(()=> {
        
    }, [])
    


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

        return () => {
            socket.off("ipcr")
            socket.off("document")
        }
    }, [])

    return (
        <div className="edit-ipcr-container">
            
            
            
            <div className="back">
                <div className="back"  data-bs-dismiss="modal" data-bs-target={props.dept_mode? "#view-ipcr":""} onClick={()=> {
                    
                }}>
                    <span className="material-symbols-outlined">undo</span>
                    Back to IPCRs 
                </div>
            </div>
            <div className="option-header">
                

                <div className="ipcr-options">
                    <div className="additional">
                        {!props.dept_mode? <button className="btn btn-primary" onClick={()=>{download()}}>
                            <span className="material-symbols-outlined">{downloading? "refresh": "download"}</span>
                            {!downloading? <span>Download</span>:""}
                        </button>:""}
                        
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
                    <span>INDIVIDUAL PERFORMANCE COMMITMENT & REVIEW FORM</span>
                </div>

                <div className="ratee-information">
                    <div className="ratee-oath">
                        <span className="first-oath">
                            <i>I, <div className="ratee-name"><strong></strong></div>, <div className="ratee-position">Librarian</div> of the <strong>NORZAGARAY COLLEGE,</strong> commit to deliver and agree to be rated on the attainment of  </i>
                        </span>
                        <span className="second-oath">
                            <i>the following targets in accordance with the indicated measures for the period <strong>JULY - DECEMBER 2025</strong> </i>
                        </span>
                    </div>
                    <div className="ratee-signature">
                        <span className="date">
                            <input type="text"style={{color:"black", textAlign:"center", fontWeight:"bold"}}/>
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

                        <div className="sub-task-wrapper">
                            <div className="sub-task-name">
                                {task.title}
                            </div>
                            <div className="stats">
                                <input name = "target_acc" type="number" className="value"/>

                                <span className="desc"> in</span>
                                <input name = "target_time" type="number" className="value"/>

                                <span className="desc"> with</span>
                                <input name = "target_mod" type="number" className="value" />

                                <span className="desc"></span>

                            </div>

                            <div className="stats">
                                <input name = "actual_acc" type="number" className="value"/>

                                <span className="desc">{task.main_task.actual_acc} in</span>
                                <input name = "actual_time" type="number" className="value"/>

                                <span className="desc">{task.main_task.time} with</span>
                                <input name = "actual_mod" type="number" className="value" />

                                <span className="desc"></span>
                            </div>

                            <div className="sub-task-rating">
                                <span>1</span>
                                <span>1</span>
                                <span>1</span>
                                <span>1</span>
                            </div>

                            <div className="remarks">
                                            
                            </div>
                        </div>
                    </div>
                    
                    <div className="another-rating">
                        <div className="fill-blanks">

                        </div>
                        <div className="calculated-rating">
                        
                            <div className="whole-rating">
                                <span className="rating-type">Final Average Rating</span>
                                <div className="each-rating">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>  
                            <div className="whole-rating">
                                <span className="rating-type">FINAL AVERAGE RATING</span>
                                <div className="avg-rating">
                                    
                                </div>
                            </div>  
                            <div className="whole-rating">
                                <span className="rating-type">ADJECTIVAL RATING</span>
                                <div className="avg-rating">
                                    
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

export default EditOPCR