import { useEffect, useState } from "react";
import "../assets/styles/Department.css"
import { getDepartments, registerDepartment } from "../services/departmentService";
import DepartmentInfo from "../components/DepartmentComponents/DepartmentInfo";
import { objectToFormData } from "../components/api";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";


function Department(){
    const [departments, setDepartments] = useState([])
    const [currentDepartment, setCurrentDepartment] = useState(null)
    const [formData, setFormData] = useState({"department_name": "", "icon": ""})
    const [submitting, setSubmission] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    async function loadAllDepartments(){
        setLoading(true)
        try {
            const res = await getDepartments().then(data => data.data)
            setDepartments(res)
            if (!currentDepartment && res.length > 0) setCurrentDepartment(res[0].id)
            return res
        } catch (error) {
            console.log(error.response?.data?.error)
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })
            return []
        } finally {
            setLoading(false)
        }
    }

    async function loadFirstDepartment() {
        loadAllDepartments().then(res => {
            console.log("loading first")
            if (res.length > 0) setCurrentDepartment(res[0].id);
        }).catch(error => {
            console.log(error.response?.data?.error)
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })
        });
    }
    
    function loadAnotherDepartment(id){
        console.log("Loading another" + id)
        setCurrentDepartment(id)
    }

    const handleDataChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})        
    }

    const handleSubmission = async () => {
        if (!formData.department_name || formData.department_name.trim() === "") {
            return Swal.fire("Validation", "Office name is required", "warning")
        }
        
        const newFormData = objectToFormData(formData);
        setSubmission(true)
        try {
            const a = await registerDepartment(newFormData)
            
            if(a.data.message == "Office successfully created.") {
                Swal.fire({
                    title:"Success",
                    text: a.data.message,
                    icon:"success"
                })
                // close modal
                const el = document.getElementById("add-department")
                const m = Modal.getInstance(el)
                if (m) m.hide()
                setFormData({"department_name": "", "icon": ""})
            }
            loadAllDepartments()
        } catch (error) {
            console.log(error.response?.data?.error)
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })
        } finally {
            setSubmission(false)
        }
    }

    function openCreateModal() {
        const el = document.getElementById("add-department")
        const m = new Modal(el)
        m.show()
    }

    const filteredDepartments = departments.filter(dept => 
        (dept.department_name || "").toLowerCase().includes((searchQuery || "").toLowerCase())
    )

    useEffect(()=>{
        loadFirstDepartment()
    },[])

    return(
        <div className="container-fluid py-4">
            <div className="row g-3">
                {/* LEFT: Departments list */}
                <div className="col-12 col-md-4 col-lg-3">
                    <div className="card shadow-sm sticky-top" style={{ top: "1rem" }}>
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h5 className="mb-0 fw-bold">Offices</h5>
                                    <small className="text-muted">Select an office to manage</small>
                                </div>
                                <button className="btn btn-sm btn-primary d-flex gap-2 align-items-center" onClick={openCreateModal} title="Create office">
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>

                            <div className="mb-3">
                                <input
                                    className="form-control form-control-sm"
                                    placeholder="Search offices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="list-group list-group-flush">
                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border text-primary" role="status" />
                                    </div>
                                ) : filteredDepartments.length === 0 ? (
                                    <div className="text-center text-muted py-3">No offices found</div>
                                ) : (
                                    filteredDepartments.map((dept) => {
                                        const active = dept.id === currentDepartment
                                        return (
                                            <button
                                                key={dept.id}
                                                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${active ? "active" : ""}`}
                                                onClick={() => loadAnotherDepartment(dept.id)}
                                                title={dept.department_name}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="material-symbols-outlined">business</span>
                                                    <div className="text-start">
                                                        <div className="fw-semibold small mb-0 text-truncate" style={{ maxWidth: 180 }}>{dept.department_name}</div>
                                                        <small className="text">{dept.name || "No description"}</small>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })
                                )}
                            </div>

                            <div className="mt-3 text-muted small">Showing {filteredDepartments.length} offices</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Department info */}
                <div className="col-12 col-md-8 col-lg-9">
                    <div className="p-2 border rounded shadow-sm">
                        <div className="header d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex gap-3 align-items-center">
                                <h5 className="mb-0 fw-semibold">
                                </h5>
                            </div>
                        </div>

                        <div className="body">
                            {currentDepartment ? (
                                <DepartmentInfo 
                                    key={currentDepartment}
                                    id={currentDepartment}
                                    loadDepts={() => loadAllDepartments()}
                                    firstLoad={() => loadFirstDepartment()}
                                />
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <div className="mb-3"><span className="material-symbols-outlined fs-1">business</span></div>
                                    <div className="fw-semibold mb-1">No office selected</div>
                                    <div className="mb-3">Create or select an office from the left panel.</div>
                                    <div><button className="btn btn-primary" onClick={openCreateModal}><span className="material-symbols-outlined me-1">add</span>Create Office</button></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Department Modal */}
            <div className="modal fade" id="add-department" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="addDepartmentLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-3 shadow-sm">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title d-flex gap-2 align-items-center" id="addDepartmentLabel">
                                <span className="material-symbols-outlined">add</span>
                                Create Office
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Office Name <span className="text-danger">*</span></label>
                                <input 
                                    type="text"
                                    className="form-control" 
                                    name="department_name"
                                    value={formData.department_name}
                                    onChange={handleDataChange}
                                    placeholder="Eg. Computing Studies"
                                />
                            </div>

                            <div className="mb-3" style={{display:"none"}}>
                                <label className="form-label">Choose Icon <span className="text-danger">*</span></label>
                                <div className="d-flex flex-wrap gap-2">
                                    {[
                                        { id: "cs", value: "computer", label: "Computer" },
                                        { id: "ed", value: "auto_stories", label: "Stories" },
                                        { id: "hm", value: "flights_and_hotels", label: "Hotels" },
                                        { id: "reg", value: "checkbook", label: "Checkbook" },
                                        { id: "acc", value: "account_balance", label: "Balance" },
                                        { id: "lib", value: "local_library", label: "Library" },
                                        { id: "nc", value: "school", label: "School" },
                                        { id: "psy", value: "psychology", label: "Psychology" },
                                        { id: "off", value: "supervisor_account", label: "Office" },
                                        { id: "dom", value: "domain", label: "Domain" }
                                    ].map(icon => (
                                        <div key={icon.id} className="form-check">
                                            <input 
                                                type="radio" 
                                                name="icon" 
                                                id={icon.id} 
                                                value={icon.value}
                                                onChange={handleDataChange}
                                                className="form-check-input"
                                            />
                                            <label htmlFor={icon.id} className="form-check-label d-flex align-items-center gap-1 cursor-pointer">
                                                <span className="material-symbols-outlined">{icon.value}</span>
                                                <span className="small">{icon.label}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                            <button 
                                type="button" 
                                className="btn btn-primary d-flex gap-2 align-items-center" 
                                onClick={handleSubmission}
                                disabled={submitting || !formData.department_name}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">check</span>
                                        Create Office
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Department