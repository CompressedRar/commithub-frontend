import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from "@mui/material";

/**
 * CreateUserModal Component
 * Modal for creating a new user in a profile
 * @param {boolean} open - Whether modal is open
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSubmit - Callback to submit user data
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {Array} positions - Available positions (optional)
 * @param {Array} departments - Available departments (optional)
 */
const CreateUserModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  positions,
  departments
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    position_id: "",
    department_id: "",
    role: "user",
    account_status: 1
  });
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setFormError("");

    // Validate required fields
    if (!formData.first_name.trim()) {
      setFormError("First name is required");
      return;
    }

    if (!formData.last_name.trim()) {
      setFormError("Last name is required");
      return;
    }

    if (!formData.position_id) {
      setFormError("Position is required");
      return;
    }

    if (!formData.department_id) {
      setFormError("Department is required");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        first_name: "",
        last_name: "",
        middle_name: "",
        position_id: "",
        department_id: "",
        role: "user",
        account_status: 1
      });
      onClose();
    } catch (err) {
      setFormError(err.error || err.message || "Failed to create user");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {(error || formError) && (
            <Alert severity="error">{error || formError}</Alert>
          )}

          <TextField
            fullWidth
            label="First Name *"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            disabled={loading}
            placeholder="John"
          />

          <TextField
            fullWidth
            label="Middle Name"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            disabled={loading}
            placeholder="Michael"
          />

          <TextField
            fullWidth
            label="Last Name *"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            disabled={loading}
            placeholder="Doe"
          />

          <FormControl fullWidth>
            <InputLabel>Position *</InputLabel>
            <Select
              name="position_id"
              value={formData.position_id}
              onChange={handleChange}
              disabled={loading}
              label="Position *"
            >
              {positions && positions.length > 0 ? (
                positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.name || `Position ${pos.id}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No positions available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Department *</InputLabel>
            <Select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              disabled={loading}
              label="Department *"
            >
              {departments && departments.length > 0 ? (
                departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name || `Department ${dept.id}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No departments available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              label="Role"
            >
              <MenuItem value="faculty">Member</MenuItem>
              <MenuItem value="head">Head</MenuItem>
              <MenuItem value="administrator">Administrator</MenuItem>
              <MenuItem value="president">President</MenuItem>
            </Select>
          </FormControl>
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
          {loading ? <CircularProgress size={24} /> : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;
