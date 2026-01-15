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

  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [strengthLevel, setStrengthLevel] = useState("")

  const [hasMinLength, setHasMinLength] = useState(false)
  const [hasUppercase, setHasUppercase] = useState(false)
  const [hasLowercase, setHasLowercase] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)

  // Recovery Email & 2FA
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [savingRecoveryEmail, setSavingRecoveryEmail] = useState(false)
  const [enabling2FA, setEnabling2FA] = useState(false)


  function checkPasswordStrength(password) {
    const minLength = password.length >= 8
    const uppercase = /[A-Z]/.test(password)
    const lowercase = /[a-z]/.test(password)
    const number = /[0-9]/.test(password)

    setHasMinLength(minLength)
    setHasUppercase(uppercase)
    setHasLowercase(lowercase)
    setHasNumber(number)

    let score = 0
    if (minLength) score++
    if (uppercase) score++
    if (lowercase) score++
    if (number) score++

    if (score <= 2) setStrengthLevel("Weak")
    else if (score === 3) setStrengthLevel("Medium")
    else setStrengthLevel("Strong")
  }



  async function loadUserInformation() {
    const res = await getAccountInfo(props.id).then((data) => data.data).catch((error) => {
      Swal.fire("Error", error.response.data.error, "error")
    })
    setMemberInformation(res)
    setPreview(res.profile_picture_link)
    setFirstEmail(res.email)
    setRecoveryEmail(res.recovery_email || "")
    setTwoFAEnabled(res.two_factor_enabled || false)
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

  async function handleSaveRecoveryEmail() {
    if (!recoveryEmail || recoveryEmail === firstEmail) {
      Swal.fire("Error", "Recovery email must be different from primary email", "error")
      return
    }
    setSavingRecoveryEmail(true)
    try {
      await updateMemberInfo(objectToFormData({ recovery_email: recoveryEmail, id: props.id }))
      Swal.fire("Success", "Recovery email saved successfully", "success")
      await loadUserInformation()
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to save recovery email", "error")
    } finally {
      setSavingRecoveryEmail(false)
    }
  }

  async function handleToggle2FA() {
    console.log("TIRGGERING 2FA")
    if (!twoFAEnabled) {
      Swal.fire({
        title: "Enable 2FA?",
        text: "You will need to enter OTP codes on login",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setEnabling2FA(true)
          try {
            await updateMemberInfo(objectToFormData({ two_factor_enabled: 1, id: props.id }))
            setTwoFAEnabled(false)
            Swal.fire("Success", "2FA enabled", "success")
            await loadUserInformation()
          } catch (error) {
            Swal.fire("Error", "Failed to disable 2FA", "error")
          } finally {
            setEnabling2FA(false)
          }
        }
      })
    } else {
      
      Swal.fire({
        title: "Disable 2FA?",
        text: "You will no longer need to enter OTP codes on login",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Disable",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setEnabling2FA(true)
          try {
            await updateMemberInfo(objectToFormData({ two_factor_enabled: 0, id: props.id }))
            setTwoFAEnabled(false)
            Swal.fire("Success", "2FA disabled", "success")
            await loadUserInformation()
          } catch (error) {
            Swal.fire("Error", "Failed to disable 2FA", "error")
          } finally {
            setEnabling2FA(false)
          }
        }
      })

    }
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

        {/* SECTION 1: PROFILE INFORMATION */}
        <div className="border-0 mb-4" style={{ borderRadius: "1rem" }}>
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center text-primary mb-3">
            </h5>

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
                <label htmlFor="profile-image" className="btn btn-outline-primary btn-sm d-flex">
                  <span className="material-symbols-outlined me-1">upload</span> Change Photo
                </label>
                <input type="file" id="profile-image" ref={fileInput} onChange={handleImageChange} accept="image/*" hidden />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
              <input disabled type="email" id="email" className="form-control" value={formData.email || ""} onChange={(e) => { setFormData({...formData, email: e.target.value}); setEmailQuery(e.target.value)}} />
              <small className="text-muted">Primary email cannot be changed</small>
            </div>

            {/* Name Fields */}
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="first_name" className="form-label fw-semibold">First Name</label>
                <input type="text" id="first_name" className="form-control" value={formData.first_name || ""} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
              </div>
              <div className="col-md-4">
                <label htmlFor="middle_name" className="form-label fw-semibold">Middle Name</label>
                <input type="text" id="middle_name" className="form-control" value={formData.middle_name || ""} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} />
              </div>
              <div className="col-md-4">
                <label htmlFor="last_name" className="form-label fw-semibold">Last Name</label>
                <input type="text" id="last_name" className="form-control" value={formData.last_name || ""} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
              </div>
            </div>

            {/* Department & Position */}
            <div className="row g-3 mt-2">
              <div className="col-md-6">
                <label htmlFor="department" className="form-label fw-semibold">Office</label>
                <select id="department" className="form-select" disabled>
                  {allDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="position" className="form-label fw-semibold">Position</label>
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
              <button className="btn btn-success d-flex" onClick={handleUpdate} disabled={updating}>
                <span className="material-symbols-outlined me-1">save</span> {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        

        {/* SECTION 3: SECURITY SETTINGS */}
        <div className="border-0 my-6" style={{ borderRadius: "1rem" }}>
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center  mb-3">
              Security Settings
            </h5>

            {/* Password Change */}
            <div className="mb-4 pb-3 border-bottom">
              <label className="fw-semibold d-flex align-items-center">
                Password
              </label>
              <p className="small text-muted mb-3">Change your password regularly to keep your account secure</p>
              <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => setShowPasswordModal(true)}>
                <span className="material-symbols-outlined">lock_reset</span>
                Change Password
              </button>
            </div>

            {/* 2FA / OTP */}
            <div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <label className="fw-semibold d-flex align-items-center">
                    Two-Factor Authentication (2FA)
                  </label>
                  <p className="small text-muted mb-0">Add an extra layer of security with one-time passwords (OTP)</p>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="twoFA"
                    checked={twoFAEnabled}
                    onChange={handleToggle2FA}
                    disabled={enabling2FA}
                  />
                </div>
              </div>
              {twoFAEnabled && (
                <small className="text-success d-block mt-2">
                  <span className="material-symbols-outlined" style={{ fontSize: "0.9rem", verticalAlign: "middle" }}>
                    check_circle
                  </span>
                  {" "}2FA is enabled. You will receive OTP codes on login.
                </small>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: ACCOUNT STATUS */}
        <div className="border-0 my-4" style={{ borderRadius: "1rem" }}>
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center mb-3">
              Account Status & Management
            </h5>

            {/* Account Status Badge */}
            <div className="mb-3">
              <small className="text-muted fw-semibold">Current Status</small>
              <div className="mt-2">
                <span className={`badge py-2 px-3 ${memberInformation.account_status ? "bg-success" : "bg-danger"}`}>
                  {memberInformation.account_status ? "✓ Active" : "✗ Deactivated"}
                </span>
              </div>
            </div>

            {/* Last Login */}
            {memberInformation.last_login && (
              <div className="mb-3 pb-3 border-bottom">
                <small className="text-muted fw-semibold">Last Login</small>
                <p className="mb-0">{new Date(memberInformation.last_login).toLocaleString()}</p>
              </div>
            )}

            {/* Actions */}
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn d-flex align-items-center gap-2 ${
                  memberInformation.account_status
                    ? "btn-outline-danger"
                    : "btn-outline-success"
                }`}
                onClick={handleArchive}
              >
                <span className="material-symbols-outlined">
                  {memberInformation.account_status ? "lock" : "lock_open"}
                </span>
                {memberInformation.account_status ? "Deactivate Account" : "Reactivate Account"}
              </button>

              <button className="btn btn-outline-warning d-flex align-items-center gap-2" onClick={handleResetPassword} disabled={resetting}>
                <span className="material-symbols-outlined">restart_alt</span>
                {resetting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Password</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowPasswordModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              
              {/* Current Password */}
              <div className="mb-3">
                <label className="form-label">
                  Current Password <div>{passwordResultText}</div>
                </label>
                <div className="input-group">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    autoComplete="off"
                    className={`form-control border ${
                      !passwordResultText
                        ? "border-success"
                        : currentPassword
                        ? "border-danger"
                        : ""
                    }`}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                  >
                    <span className="material-symbols-outlined">
                      {showCurrentPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showNewPass ? "text" : "password"}
                    className={`form-control border ${
                      !isMatched
                        ? "border-success"
                        : newPassword && confirmPassword
                        ? "border-danger"
                        : ""
                    }`}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      checkPasswordStrength(e.target.value)
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    <span className="material-symbols-outlined">
                      {showNewPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div
                      className={`fw-semibold ${
                        strengthLevel === "Weak"
                          ? "text-danger"
                          : strengthLevel === "Medium"
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      Password Strength: {strengthLevel}
                    </div>
                    <div className="progress mt-1" style={{ height: "5px" }}>
                      <div
                        className={`progress-bar ${
                          strengthLevel === "Weak"
                            ? "bg-danger"
                            : strengthLevel === "Medium"
                            ? "bg-warning"
                            : "bg-success"
                        }`}
                        style={{
                          width:
                            strengthLevel === "Weak"
                              ? "25%"
                              : strengthLevel === "Medium"
                              ? "60%"
                              : "100%",
                        }}
                      ></div>
                    </div>

                    {/* Password Rules */}
                    <ul className="list-unstyled mt-2 small">
                      <li className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-success">
                          {hasMinLength ? "check_circle" : ""}
                        </span>
                        {!hasMinLength && (
                          <span className="material-symbols-outlined text-danger">cancel</span>
                        )}
                        <span>At least 8 characters</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-success">
                          {hasUppercase ? "check_circle" : ""}
                        </span>
                        {!hasUppercase && (
                          <span className="material-symbols-outlined text-danger">cancel</span>
                        )}
                        <span>At least one uppercase letter</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-success">
                          {hasLowercase ? "check_circle" : ""}
                        </span>
                        {!hasLowercase && (
                          <span className="material-symbols-outlined text-danger">cancel</span>
                        )}
                        <span>At least one lowercase letter</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-success">
                          {hasNumber ? "check_circle" : ""}
                        </span>
                        {!hasNumber && (
                          <span className="material-symbols-outlined text-danger">cancel</span>
                        )}
                        <span>At least one number</span>
                      </li>
                    </ul>

                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    className={`form-control border ${
                      !isMatched
                        ? "border-success"
                        : newPassword && confirmPassword
                        ? "border-danger"
                        : ""
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={
                  isMatched ||
                  passwordResultText ||
                  changingPassword ||
                  !hasMinLength ||
                  !hasUppercase ||
                  !hasLowercase ||
                  !hasNumber
                }
              >
                {!changingPassword ? (
                  "Update Password"
                ) : (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
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
