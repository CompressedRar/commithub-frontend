import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { authenticateAccount, updatePassword } from "../../services/userService"
import { objectToFormData } from "../api"

function ChangePasswordModal({ show, onClose, userId, email }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isMatched, setIsMatched] = useState(false)
  const [passwordResultText, setPasswordResultText] = useState(null)
  const [changingPassword, setChangingPassword] = useState(false)

  function detectPassword() {
    setIsMatched(newPassword !== confirmPassword)
  }

  async function authenticatePassword() {
    if (!currentPassword) return
    const converted = objectToFormData({ email, password: currentPassword })
    try {
      const res = await authenticateAccount(converted)
      if (res.data.message === "Authenticated.") {
        setPasswordResultText("")
      } else {
        setPasswordResultText(<span className="text-danger">Invalid Password</span>)
      }
    } catch {
      setPasswordResultText(<span className="text-danger">Invalid Password</span>)
    }
  }

  async function sendNewPass() {
    try {
      setChangingPassword(true)
      const res = await updatePassword(userId, { password: newPassword })
      Swal.fire("Success", res.data.message, "success")
      handleClose()
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Something went wrong", "error")
    } finally {
      setChangingPassword(false)
    }
  }

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
    }).then((res) => {
      if (res.isConfirmed) {
        sendNewPass()
      }
    })
  }

  function handleClose() {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordResultText("")
    onClose()
  }

  useEffect(() => {
    detectPassword()
  }, [newPassword, confirmPassword])

  useEffect(() => {
    const debounce = setTimeout(() => authenticatePassword(), 500)
    return () => clearTimeout(debounce)
  }, [currentPassword])

  if (!show) return null

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Change Password</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                Current Password <div>{passwordResultText}</div>
              </label>
              <input
                type="password"
                className={`form-control border ${
                  !passwordResultText ? "border-success" : currentPassword ? "border-danger" : ""
                }`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className={`form-control border ${
                  !isMatched ? "border-success" : newPassword && confirmPassword ? "border-danger" : ""
                }`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className={`form-control border ${
                  !isMatched ? "border-success" : newPassword && confirmPassword ? "border-danger" : ""
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={isMatched || passwordResultText || changingPassword}
            >
              {!changingPassword ? "Update Password" : <span className="spinner-border spinner-border-sm me-2"></span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal
