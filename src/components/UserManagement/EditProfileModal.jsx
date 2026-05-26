import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert
} from "@mui/material";

/**
 * EditProfileModal Component
 * Modal for editing profile information
 * @param {boolean} open - Whether modal is open
 * @param {Object} profile - Profile data to edit
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSubmit - Callback to submit changes
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 */
const EditProfileModal = ({
  open,
  profile,
  onClose,
  onSubmit,
  loading,
  error
}) => {
  const [formData, setFormData] = useState({
    recovery_email: "",
    two_factor_enabled: false,
    active_status: true
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        recovery_email: profile.recovery_email || "",
        two_factor_enabled: profile.two_factor_enabled || false,
        active_status: profile.active_status !== 0
      });
    }
  }, [profile, open]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    setFormError("");

    // Email recovery validation (if provided)
    if (
      formData.recovery_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recovery_email)
    ) {
      setFormError("Please enter a valid recovery email");
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setFormError(err.error || err.message || "Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {(error || formError) && (
            <Alert severity="error">{error || formError}</Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            value={profile?.email || ""}
            disabled
            helperText="Email cannot be changed"
          />

          <TextField
            fullWidth
            label="Recovery Email"
            name="recovery_email"
            type="email"
            value={formData.recovery_email}
            onChange={handleChange}
            placeholder="recovery@example.com"
            disabled={loading}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="two_factor_enabled"
                checked={formData.two_factor_enabled}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Enable 2-Factor Authentication"
          />

          <FormControlLabel
            control={
              <Checkbox
                name="active_status"
                checked={formData.active_status}
                onChange={handleChange}
                disabled={loading}
              />
            }
            label="Active Status"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
