import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { updatePassword } from "../services/userService";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Status States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get user ID from local storage
  const userId = localStorage.getItem("user_id");

  // Password Validation Logic
  const validation = useMemo(() => {
    const p = passwords.new;
    return {
      hasMinLength: p.length >= 8,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
      isMatched: p === passwords.confirm && p !== "",
    };
  }, [passwords]);

  const strength = useMemo(() => {
    const checks = [
      validation.hasMinLength,
      validation.hasUppercase,
      validation.hasLowercase,
      validation.hasNumber,
      validation.hasSpecial,
    ].filter(Boolean).length;

    if (checks <= 2) return { label: "Weak", color: "error", value: 25 };
    if (checks === 3) return { label: "Fair", color: "warning", value: 50 };
    if (checks === 4) return { label: "Good", color: "info", value: 75 };
    return { label: "Strong", color: "success", value: 100 };
  }, [validation]);

  const canSubmit =
    passwords.current &&
    validation.isMatched &&
    validation.hasMinLength &&
    validation.hasUppercase &&
    validation.hasLowercase &&
    validation.hasNumber;

  const handlePasswordChange = (field) => (e) => {
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }));
    setError(""); // Clear error when user starts typing
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      setError("Please meet all password requirements.");
      return;
    }

    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      // Call the updatePassword API with current and new password
      const response = await updatePassword(userId, {
        current_password: passwords.current,
        password: passwords.new,
      });

      setSuccess(true);
      Swal.fire({
        title: "Success",
        text: "Your password has been changed successfully.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate(-1); // Go back to previous page
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        "Failed to change password. Please check your current password and try again.";
      setError(errorMessage);
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <ListItem dense>
      <ListItemIcon>
        {met ? (
          <CheckCircle style={{ color: "#4caf50" }} />
        ) : (
          <Cancel style={{ color: "#f44336" }} />
        )}
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{
          style: {
            color: met ? "#4caf50" : "#f44336",
            textDecoration: met ? "line-through" : "none",
          },
        }}
      />
    </ListItem>
  );

  return (
    <div
      className="d-flex flex-column justify-content-start p-4 bg-white w-100 h-100"
      style={{ overflowY: "auto" }}
    >
      <div className="mb-4">
        <h4 className="fw-bold text-primary d-flex align-items-center">
          <span className="material-symbols-outlined me-2">lock</span>
          Change Password
        </h4>
        <hr />
      </div>

      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" className="mb-3">
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" className="mb-3">
                Password changed successfully!
              </Alert>
            )}

            {/* Current Password */}
            <div className="mb-4">
              <label htmlFor="current_password" className="form-label fw-semibold">
                Current Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword.current ? "text" : "password"}
                  className="form-control"
                  id="current_password"
                  placeholder="Enter your current password"
                  value={passwords.current}
                  onChange={handlePasswordChange("current")}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPassword.current ? (
                    <span className="material-symbols-outlined">visibility</span>
                  ) : (
                    <span className="material-symbols-outlined">visibility_off</span>
                  )}
                </button>
              </div>
              <small className="text-muted">
                Enter your current password to verify your identity.
              </small>
            </div>

            <hr className="my-4" />

            {/* New Password */}
            <div className="mb-3">
              <label htmlFor="new_password" className="form-label fw-semibold">
                New Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword.new ? "text" : "password"}
                  className="form-control"
                  id="new_password"
                  placeholder="Enter your new password"
                  value={passwords.new}
                  onChange={handlePasswordChange("new")}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPassword.new ? (
                    <span className="material-symbols-outlined">visibility</span>
                  ) : (
                    <span className="material-symbols-outlined">visibility_off</span>
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {passwords.new && (
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <small>Password Strength:</small>
                  <small className="fw-bold" style={{ color: `var(--bs-${strength.color})` }}>
                    {strength.label}
                  </small>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className={`progress-bar bg-${strength.color}`}
                    style={{ width: `${strength.value}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirm_password" className="form-label fw-semibold">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  className="form-control"
                  id="confirm_password"
                  placeholder="Re-enter your new password"
                  value={passwords.confirm}
                  onChange={handlePasswordChange("confirm")}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPassword.confirm ? (
                    <span className="material-symbols-outlined">visibility</span>
                  ) : (
                    <span className="material-symbols-outlined">visibility_off</span>
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {passwords.new && (
              <div className="card mb-4 border-0 bg-light">
                <div className="card-header bg-transparent border-0">
                  <h6 className="mb-0">Password Requirements</h6>
                </div>
                <div className="card-body">
                  <List dense>
                    <PasswordRequirement
                      met={validation.hasMinLength}
                      text="At least 8 characters long"
                    />
                    <PasswordRequirement
                      met={validation.hasUppercase}
                      text="Contains uppercase letter (A-Z)"
                    />
                    <PasswordRequirement
                      met={validation.hasLowercase}
                      text="Contains lowercase letter (a-z)"
                    />
                    <PasswordRequirement
                      met={validation.hasNumber}
                      text="Contains number (0-9)"
                    />
                    <PasswordRequirement
                      met={validation.isMatched}
                      text="Passwords match"
                    />
                  </List>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined me-2">lock</span>
                    Change Password
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 bg-info bg-opacity-10">
            <div className="card-header bg-transparent border-0">
              <h6 className="mb-0 text-info">
                <span className="material-symbols-outlined me-2">shield</span>
                Security Tips
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-3">
                  <strong>Make it unique:</strong> Don't reuse passwords from
                  other accounts.
                </li>
                <li className="mb-3">
                  <strong>Use variety:</strong> Mix uppercase, lowercase, numbers,
                  and symbols.
                </li>
                <li className="mb-3">
                  <strong>Avoid patterns:</strong> Don't use sequential numbers or
                  keyboard patterns.
                </li>
                <li className="mb-3">
                  <strong>Keep it secret:</strong> Never share your password with
                  anyone.
                </li>
                <li>
                  <strong>Update regularly:</strong> Change your password every
                  3-6 months.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
