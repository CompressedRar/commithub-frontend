import { useState, useEffect, useRef } from "react"
import { getPositions } from "../../services/positionService"
import { getDepartments } from "../../services/departmentService"
import { archiveAccount, getAccountInfo, updateMemberInfo, unarchiveAccount, resetAccountPasssword, checkEmail, authenticateAccount, updatePassword } from "../../services/userService"
import { objectToFormData, socket } from "../api"
import Swal from "sweetalert2"
import { Modal } from "bootstrap/js/dist/modal"

function AccountSettings(props) {
  const [memberInformation, setMemberInformation] = useState({})
  const [positions, setPositions] = useState([])
  const [allDepartments, setAllDepartments] = useState([])
  const [formData, setFormData] = useState({})
  const [preview, setPreview] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [dataChanged, setDataChanged] = useState(false)
  const [emailQuery, setEmailQuery] = useState("")
  const [emailQueryResult, setEmailQueryResult] = useState(null)
  const [firstEmail, setFirstEmail] = useState(null)
  const [isEmailValid, setEmailValid] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const fileInput = useRef(null)

  // For password change
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isMatched, setIsMatched] = useState(false)

  const [passwordResultText, setPasswordResultText] = useState(null)
  const [passwordResult, setPasswordResult] = useState(false)

  async function loadUserInformation() {
    const res = await getAccountInfo(props.id).then((data) => data.data).catch((error) => {
      Swal.fire("Error", error.response.data.error, "error")
    })
    setMemberInformation(res)
    setPreview(res.profile_picture_link)
    setFirstEmail(res.email)
    setFormData({
      id: props.id,
      department: res.department.id,
      position: res.position.id,
      first_name: res.first_name,
      middle_name: res.middle_name,
      last_name: res.last_name,
      email: res.email
    })
  }

  async function handleUpdate() {
    if (!isEmailValid) {
      Swal.fire("Error", "Email was already taken.", "error")
      return
    }

    const data = objectToFormData(formData)
    if (fileInput.current?.files[0]) data.append("profile_picture_link", fileInput.current.files[0])

    setUpdating(true)
    const res = await updateMemberInfo(data).then((data) => data.data.message).catch((error) => {
      Swal.fire("Error", error.response.data.error, "error")
    })
    if (res === "User successfully updated") Swal.fire("Success", res, "success")
    setUpdating(false)
    await loadUserInformation()
  }

  async function handleResetPassword() {
    Swal.fire({
      title: "Reset Password?",
      text: "Password will be reset to default. Continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reset",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setResetting(true)
        const res = await resetAccountPasssword(props.id)
          .then((d) => d.data.message)
          .catch((e) => Swal.fire("Error", e.response.data.error, "error"))
        Swal.fire("Result", res, "info")
        setResetting(false)
      }
    })
  }

  async function handleArchive() {
    Swal.fire({
      title: memberInformation.account_status ? "Deactivate Account?" : "Reactivate Account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then(async (result) => {
      if (!result.isConfirmed) return
      const action = memberInformation.account_status ? archiveAccount : unarchiveAccount
      const res = await action(props.id).then((d) => d.data.message)
      Swal.fire("Result", res, "success")
      await loadUserInformation()
    })
  }

  function handleImageChange() {
    const file = fileInput.current.files[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return alert("Please select an image file.")
    setPreview(URL.createObjectURL(file))
    setFormData({ ...formData, profile_picture_link: file })
  }

  function detectPassword(){

    
    setIsMatched(newPassword !== confirmPassword)
  }

  async function authenticatePassword(){
    var converted = objectToFormData({"email": firstEmail, "password":currentPassword}) 
    
    var a = await authenticateAccount(converted).then(data => data.data.message).catch(error => {

    })
    if (a == "Authenticated.") {
      setPasswordResult(false)
      setPasswordResultText("")
    }
    else {
      
      setPasswordResult(false)
      setPasswordResultText(<span className="text-danger">Invalid Password</span>)
    }
  }

  async function sendNewPass(){
    var res = await updatePassword(props.id, {"password": newPassword}).then(data => {
      
      Swal.fire("Success", data.data.message, "success")
        setShowPasswordModal(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
    
    }).catch(error => {
      Swal.fire("Error", error, "error")
    })

    
  }

  // --- Change Password Feature ---
  function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire("Error", "Please fill in all password fields.", "error")
      return
    }
                           

    Swal.fire({
      title: "Change Password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Change",
    }).then(async (res) => {
      if (res.isConfirmed) {
        sendNewPass()
      }
    })
  }
  useEffect(()=> {
    detectPassword()
  }, [newPassword, confirmPassword])

  useEffect(()=> {
    
    const debounce = setTimeout(() => {
            authenticatePassword()
        }, 500)

    return () => clearTimeout(debounce)
    

  }, [currentPassword])

  useEffect(() => {
    loadUserInformation()
    getDepartments().then((r) => setAllDepartments(r.data))
    getPositions().then((r) => setPositions(r.data))
  }, [props.id])

  return (
    <div className="profile-edit-container container-fluid">
      <div className="">
        <h4 className="mb-4 d-flex align-items-center text-primary">
          <span className="material-symbols-outlined me-2">manage_accounts</span>
          Account Settings
        </h4>

        {/* Profile Picture */}
        <div className="d-flex align-items-center gap-4 mb-4">
          <div
            className="rounded-circle border border-2 border-primary"
            style={{
              width: "100px",
              height: "100px",
              backgroundImage: `url('${preview || "/default-avatar.png"}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div>
            <label htmlFor="profile-image" className="btn btn-outline-primary btn-sm">
              <span className="material-symbols-outlined me-1">upload</span> Change Photo
            </label>
            <input type="file" id="profile-image" ref={fileInput} onChange={handleImageChange} accept="image/*" hidden />
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input disabled type="email" id="email" className="form-control" value={formData.email || ""} onChange={(e) => { setFormData({...formData, email: e.target.value}); setEmailQuery(e.target.value)}} />
          {emailQueryResult && <div className="mt-1">{emailQueryResult}</div>}
        </div>

        {/* Name Fields */}
        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="first_name" className="form-label">First Name</label>
            <input type="text" id="first_name" className="form-control" value={formData.first_name || ""} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
          </div>
          <div className="col-md-4">
            <label htmlFor="middle_name" className="form-label">Middle Name</label>
            <input type="text" id="middle_name" className="form-control" value={formData.middle_name || ""} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} />
          </div>
          <div className="col-md-4">
            <label htmlFor="last_name" className="form-label">Last Name</label>
            <input type="text" id="last_name" className="form-control" value={formData.last_name || ""} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
          </div>
        </div>

        {/* Department & Position */}
        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <label htmlFor="department" className="form-label">Office</label>
            <select id="department" className="form-select" disabled>
              
              {allDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="position" className="form-label">Position</label>
            <select id="position" className="form-select" disabled>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleUpdate} disabled={updating}>
            <span className="material-symbols-outlined me-1">save</span> {updating ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <hr className="my-4" />

        {/* Password and Account Controls */}
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary d-flex align-items-center gap-1" onClick={() => setShowPasswordModal(true)}>
            <span className="material-symbols-outlined">lock_reset</span> Change Password
          </button>

          <button className="btn btn-warning d-flex align-items-center gap-1" disabled = {resetting} onClick={handleResetPassword}>
            <span className="material-symbols-outlined">{resetting? "refresh": "restart_alt"}</span> {resetting? "":"Reset Password"}
          </button>

          <button className={`btn d-flex align-items-center gap-1 ${memberInformation && memberInformation.account_status ? "btn-danger" : "btn-success"}`} onClick={handleArchive}>
            <span className="material-symbols-outlined">{memberInformation && memberInformation.account_status ? "account_circle_off" : "account_circle"}</span>
            {memberInformation.account_status ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Current Password <div>{passwordResultText}</div></label>
                  <input type="password" name = "pass" className={`form-control border ${!passwordResultText? "border-success": (currentPassword)? "border-danger":""}`} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input type="password" name = "passs" className={`form-control border ${!isMatched? "border-success": (newPassword && confirmPassword)? "border-danger":""}`} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" name = "pas" className={`form-control border ${!isMatched? "border-success": (newPassword && confirmPassword)? "border-danger":""}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleChangePassword} disabled = {isMatched || passwordResultText || changingPassword}>

                  {!changingPassword ? "Update Password": <span className="spinner-border spinner-border-sm me-2"></span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountSettings
