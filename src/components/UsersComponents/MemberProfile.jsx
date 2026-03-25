import { useState, useEffect, useRef } from "react"
import { getPositions } from "../../services/positionService"
import { getDepartments } from "../../services/departmentService"
import { archiveAccount, getAccountInfo, updateMemberInfo, unarchiveAccount, resetAccountPasssword, checkEmail } from "../../services/userService"
import { verifyAdminPassword } from "../../services/settingsService"
import { objectToFormData } from "../api"
import Swal from "sweetalert2"
import { Modal } from "bootstrap/js/dist/modal"
import { socket } from "../api";

function MemberProfile(props){
    const [memberInformation, setMemberInformation] = useState(null) 
    const [positions, setPositions] = useState(null)   
    const [allDepartments, setAllDepartments] = useState(null)
    const isMounted = useRef(true);
    const [formData, setFormData] = useState({
        id: 0, 
        department: "", 
        position: "", 
        role: "faculty", 
        first_name: "", 
        middle_name: "", 
        last_name: "", 
        email: ""
    })
    const [page, setPage] = useState(0)
    const [dataChanged, setDataChanged] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const [preview, setPreview] = useState(null)
    const fileInput = useRef(null)
    const [updating, setUpdating] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [allIPCRs, setIPCRs] = useState(null)

    const [emailQuery, setEmailQuery] = useState("");
    const [emailQueryResult, setEmailQueryResult] = useState(null);
    const [firstEmail, setFirstEmail] = useState(null)
    const [isEmailValid, setEmailValid] = useState(true)

    // Inline admin password confirmation
    const [showConfirm, setShowConfirm] = useState(false)
    const [adminPassword, setAdminPassword] = useState("")
    const [confirmError, setConfirmError] = useState("")
    const [showAdminPassword, setShowAdminPassword] = useState(false)

    // Load user info
    async function loadUserInformation(){
        await loadDepartments()
        await loadPositions()
        try {
            if (!isMounted.current) return; 
            const res = await getAccountInfo(props.id).then(d => d.data)
            setMemberInformation(res)
            setIPCRs(res.ipcrs)
            setPreview(res.profile_picture_link)
            setFirstEmail(res.email)
            setFormData({
                id: props.id,
                department: res.department?.id || "",
                position: res.position?.id || "",
                role: res.role || "faculty",
                first_name: res.first_name || "",
                middle_name: res.middle_name || "",
                last_name: res.last_name || "",
                email: res.email || "",
            })
        } catch (err) {
            console.log(err.response?.data?.error || err)
            Swal.fire({ title: "Error", text: err.response?.data?.error || "Failed to load user", icon: "error" })
        }
    }

    // Departments
    async function loadDepartments(){
        try {
            if (!isMounted.current) return; 
            const res = await getDepartments().then(d => d.data)
            setAllDepartments(res)
        } catch(err) {
            console.log(err.response?.data?.error || err)
            Swal.fire({ title: "Error", text: err.response?.data?.error || "Failed to load departments", icon: "error" })
        }
    }

    // Positions
    const loadPositions = async () => {
        try {
            if (!isMounted.current) return; 
            const res = await getPositions().then(d => d.data)
            setPositions(res)
        } catch(err) {
            console.log(err.response?.data?.error || err)
            Swal.fire({ title: "Error", text: err.response?.data?.error || "Failed to load positions", icon: "error" })
        }
    }

    // Archiving / Reactivating
    const Reactivate = async () => {
        try {
            if (!isMounted.current) return; 
            const res = await unarchiveAccount(props.id).then(d => d.data.message)
            Swal.fire({ title: "Success", text: res, icon: "success" })
        } catch(err) {
            console.log(err.response?.data?.error || err)
            Swal.fire({ title: "Error", text: err.response?.data?.error || "Failed to reactivate", icon: "error" })
        }
    }
    const handleReactivate = () => {
        Swal.fire({
            title: 'Do you want to reactivate this account?',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
        }).then(result => {
            if(result.isConfirmed) Reactivate()
        })
        closeModal()
        setArchiving(false)
    }

    const handleArch = async () => {
        try {
            if (!isMounted.current) return; 
            const res = await archiveAccount(props.id).then(d => d.data.message)
            Swal.fire({ title: "Success", text: res, icon: "success" })
        } catch(err) {
            console.log(err.response?.data?.error || err)
            Swal.fire({ title: "Error", text: err.response?.data?.error || "Failed to deactivate", icon: "error" })
        }
    }
    const handleArchive = () => {
        Swal.fire({
            title: 'Do you want to deactivate this account?',
            showDenyButton: true,
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
        }).then(result => {
            if(result.isConfirmed) handleArch()
        })
        closeModal()
        setArchiving(false)
        props.firstLoad()
    }

    // Reset password
    const ResetPassword = async () => {
        if (!isMounted.current) return; 
        setResetting(true)
        try {
            const res = await resetAccountPasssword(props.id).then(d => d.data.message)
            Swal.fire({ title: "Success", text: res, icon: "success" })
        } catch(err) {
            console.log(err.response?.data?.error || err)
            Swal.fire({ title: "Error", text: err.response?.data?.error || "Failed to reset password", icon: "error" })
        }
        setResetting(false)
    }
    const handleResetPassword = () => {
        Swal.fire({
            title: 'Reset Password?',
            showDenyButton: true,
            text: "The password will be reset to default. Continue?",
            icon: "warning",
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
        }).then(result => {
            if(result.isConfirmed) ResetPassword()
        })
        setArchiving(false)
    }

    const closeModal = () => {
        const modalEl = document.getElementById("user-profile");
        if (!modalEl) return;

        const modal = Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
            modal.dispose(); // completely clean up event listeners
        }

        // Let Bootstrap handle the rest automatically
    };


    // Update user
    // Step 1 — clicking Save opens the inline confirmation panel
    const handleUpdate = () => {
        if (!isMounted.current) return;
        if (!isEmailValid) {
            Swal.fire({ title: "Error", text: "Email already taken", icon: "error" })
            return
        }
        setAdminPassword("")
        setConfirmError("")
        setShowConfirm(true)
    }

    // Step 2 — submitting the inline confirmation panel calls the API
    const handleConfirmUpdate = async () => {
        if (!adminPassword.trim()) {
            setConfirmError("Please enter your password.")
            return
        }
        setUpdating(true)
        setConfirmError("")
        try {
            const confirmationToken = await verifyAdminPassword({ password: adminPassword })
            const data = objectToFormData(formData)
            data.set("confirmation_token", confirmationToken.data.confirmation_token)
            if (fileInput.current?.files[0]) data.set("profile_picture_link", fileInput.current.files[0])

            const res = await updateMemberInfo(data).then(d => d.data.message)
            Swal.fire({ title: res.toLowerCase().includes("success") ? "Success" : "Error", text: res, icon: res.toLowerCase().includes("success") ? "success" : "error" })
            setShowConfirm(false)
            setAdminPassword("")
            await loadUserInformation()
        } catch (err) {
            setConfirmError(err.response?.data?.error || "Incorrect password. Please try again.")
        } finally {
            setUpdating(false)
        }
    }

    const handleImageChange = () => {
        const file = fileInput.current.files[0]
        if(!file || !file.type.startsWith("image/")) return
        setPreview(URL.createObjectURL(file))
        setFormData(prev => ({ ...prev, profile_picture_link: file }))
    }

    const handleDataChange = e => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Detect change
    const detectChange = () => {
        if(page !== 1) return
        const changed = 
            formData.first_name !== memberInformation.first_name ||
            formData.middle_name !== memberInformation.middle_name ||
            formData.last_name !== memberInformation.last_name ||
            formData.department !== memberInformation.department.id ||
            formData.position !== memberInformation.position.id ||
            formData.role !== memberInformation.role ||
            preview !== memberInformation.profile_picture_link
        setDataChanged(!changed)
    }

    // Effects
    useEffect(()=> detectChange(), [formData, preview])
    useEffect(()=> setDataChanged(false), [preview])
    
    useEffect(() => {
        (async () => {
            await loadUserInformation();
        })();
    }, [page]);



    useEffect(()=>{
        if(!emailQuery) return
        const timeout = setTimeout(async () => {
            try{
                if (!isMounted.current) return; 
                if(emailQuery === firstEmail) { setEmailValid(true); return }
                const res = await checkEmail(emailQuery)
                const msg = res.data.message
                setEmailValid(msg==="Available")
                setEmailQueryResult(msg==="Available" ? <span className="text-success">{msg}</span> : <span className="text-danger">{msg}</span>)
            } catch { setEmailValid(false); setEmailQueryResult(<span className="text-muted">Error checking email</span>) }
        }, 400)
        return () => clearTimeout(timeout)
    }, [emailQuery])

    useEffect(() => {
        const handleUserModified = () => loadUserInformation();
        socket.on("user_modified", handleUserModified);

        return () => {
            socket.off("user_modified", handleUserModified);
            isMounted.current = false;
        };
    }, []);


    return (
        <div className="profile-edit-container container-fluid">
        {memberInformation && positions && allDepartments ? (
            <div className="card-body p-4">
                <h4 className="mb-4 d-flex align-items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">manage_accounts</span>
                    Edit Profile
                </h4>

                {/* Profile Image */}
                <div className="d-flex align-items-center gap-4 mb-4">
                    <div className="rounded-circle border border-2 border-primary" style={{ width: "100px", height: "100px", backgroundImage: `url('${preview || "/default-avatar.png"}')`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                    <div>
                        <label htmlFor="profile-image" className="btn btn-outline-primary btn-sm d-flex">
                            <span className="material-symbols-outlined me-1">upload</span>
                            Change Photo
                        </label>
                        <input type="file" id="profile-image" name="profile-image" onChange={handleImageChange} ref={fileInput} accept="image/*" hidden />
                    </div>
                </div>

                {/* Account Info */}
                <h5 className="fw-semibold mb-3 text-secondary">Account Information</h5>
                <div className="row g-3">
                    <div className="col">
                        <label htmlFor="email" className="form-label d-flex flex-row align-items-center gap-2">Email Address 
                            <div>{emailQueryResult}</div>
                        </label>
                        <input type="email" id="email" name="email" className="form-control" placeholder="example@email.com" value={formData.email} disabled onChange={e=>{handleDataChange(e); setEmailQuery(e.target.value)}} />
                    </div>
                </div>
                <div className="row g-1">
                    <div>
                        <label htmlFor="first_name" className="form-label">First Name</label>
                        <input type="text" id="first_name" name="first_name" className="form-control" placeholder="John" value={formData.first_name} onChange={handleDataChange} />
                    </div>
                    <div>
                        <label htmlFor="middle_name" className="form-label">Middle Name</label>
                        <input type="text" id="middle_name" name="middle_name" className="form-control" placeholder="Doe" value={formData.middle_name} onChange={handleDataChange} />
                    </div>
                    <div>
                        <label htmlFor="last_name" className="form-label">Last Name</label>
                        <input type="text" id="last_name" name="last_name" className="form-control" placeholder="Doe" value={formData.last_name} onChange={handleDataChange} />
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="department" className="form-label">Office</label>
                        <select id="department" name="department" className="form-select" value={formData.department} onChange={handleDataChange}>
                            {allDepartments.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="position" className="form-label">Position</label>
                        <select id="position" name="position" className="form-select" value={formData.position} onChange={handleDataChange}>
                            {positions.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    {
                        formData.role != "administrator" &&
                        <div className="col-md-6">
                            
                            <label htmlFor="role" className="form-label">Role</label>
                            <select id="role" name="role" className="form-select" value={formData.role} onChange={handleDataChange}>
                                <option value="faculty">Faculty</option>
                                <option value="head">Head</option>
                                <option value="president">Administrator</option>
                            </select>
                        </div>
                    }
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                    <button className="btn btn-success" disabled={dataChanged || updating || showConfirm} onClick={handleUpdate}>
                        <span className="material-symbols-outlined align-middle me-1">save</span> Save Changes
                    </button>
                </div>

                {/* Inline admin password confirmation — avoids SweetAlert z-index conflict with Bootstrap modal */}
                {showConfirm && (
                    <div className="mt-3 p-3 border rounded-3 bg-light">
                        <p className="mb-2 fw-semibold text-secondary" style={{fontSize:"0.875rem"}}>
                            <span className="material-symbols-outlined align-middle me-1" style={{fontSize:"1rem"}}>lock</span>
                            Enter your admin password to confirm changes
                        </p>
                        <div className="input-group mb-1">
                            <input
                                type={showAdminPassword ? "text" : "password"}
                                className={`form-control form-control-sm ${confirmError ? "is-invalid" : ""}`}
                                placeholder="Admin password"
                                value={adminPassword}
                                onChange={e => { setAdminPassword(e.target.value); setConfirmError("") }}
                                onKeyDown={e => e.key === "Enter" && handleConfirmUpdate()}
                                autoFocus
                            />
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                type="button"
                                onClick={() => setShowAdminPassword(p => !p)}
                                tabIndex={-1}
                            >
                                <span className="material-symbols-outlined" style={{fontSize:"1rem",verticalAlign:"middle"}}>
                                    {showAdminPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                        {confirmError && <div className="text-danger small mb-2">{confirmError}</div>}
                        <div className="d-flex gap-2 mt-2">
                            <button className="btn btn-success btn-sm" disabled={updating} onClick={handleConfirmUpdate}>
                                {updating
                                    ? <span className="spinner-border spinner-border-sm me-1"></span>
                                    : <span className="material-symbols-outlined align-middle me-1" style={{fontSize:"1rem"}}>check</span>
                                }
                                Confirm
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" disabled={updating} onClick={() => { setShowConfirm(false); setAdminPassword(""); setConfirmError("") }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <hr className="my-4" />

                {/* Account Actions */}
                <div className="d-flex gap-3 mt-4 flex-wrap">
                    <button className="btn btn-warning d-flex align-items-center gap-1" disabled={resetting} onClick={handleResetPassword}>
                        <span className="material-symbols-outlined">restart_alt</span>
                        {resetting ? <span className="spinner-border spinner-border-sm me-2"></span> : "Reset Password"}
                    </button>
                    <button className={`btn d-flex align-items-center gap-1 ${memberInformation.account_status === 0 ? "btn-success" : "btn-danger"}`} onClick={() => memberInformation.account_status ? handleArchive() : handleReactivate()}>
                        <span className="material-symbols-outlined">{memberInformation.account_status === 0 ? "account_circle" : "account_circle_off"}</span>
                        {memberInformation.account_status === 0 ? "Reactivate" : "Deactivate"}
                    </button>
                </div>
            </div>
        ) : (
            <div className="d-flex flex-column align-items-center" style={{fontSize:"5rem"}}><span className="material-symbols-outlined loading">refresh</span></div>
        )}
        </div>
    )
}

export default MemberProfile