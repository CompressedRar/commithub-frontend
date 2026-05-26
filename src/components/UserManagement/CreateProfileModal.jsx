import React, { useState } from "react";
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
  Stack,
  Alert
} from "@mui/material";

/**
 * CreateProfileModal Component
 * Modal for creating a new profile
 * @param {boolean} open - Whether modal is open
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSubmit - Callback to submit profile data
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 */
const CreateProfileModal = ({ open, onClose, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: "",
    recovery_email: "",
    password: "",
    two_factor_enabled: false
  });
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    setFormError("");

    // Validate email
    if (!formData.email.trim()) {
      setFormError("Email is required");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Please enter a valid email");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        email: "",
        recovery_email: "",
        password: "",
        two_factor_enabled: false
      });
      onClose();
    } catch (err) {
      setFormError(err.error || err.message || "Failed to create profile");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Profile</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {(error || formError) && (
            <Alert severity="error">{error || formError}</Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            disabled={loading}
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
            sx={{ display: "none" }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave empty for auto-generated"
            disabled={loading}
            helperText="Leave empty to auto-generate"
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
          loading={loading}
          disabled={loading}
        >
          Create Profile
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProfileModal;
