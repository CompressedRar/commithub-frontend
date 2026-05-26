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
  FormControlLabel,
  Checkbox
} from "@mui/material";

/**
 * EditUserModal Component
 * Modal for editing user information
 * @param {boolean} open - Whether modal is open
 * @param {Object} user - User data to edit
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSubmit - Callback to submit changes
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {Array} positions - Available positions (optional)
 * @param {Array} departments - Available departments (optional)
 */
const EditUserModal = ({
  open,
  user,
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

  useEffect(() => {
    console.log("additional", positions, departments);
    console.log("user data in edit modal", user);
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        middle_name: user.middle_name || "",
        position_id: user.position.id || "",
        department_id: user.department.id || "",
        role: user.role || "user",
        account_status: user.account_status || 1
      });
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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
      onClose();
    } catch (err) {
      setFormError(err.error || err.message || "Failed to update user");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User </DialogTitle>
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

          <FormControlLabel
            control={
              <Checkbox
                name="account_status"
                checked={Boolean(formData.account_status)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    account_status: e.target.checked ? 1 : 0
                  }))
                }
                disabled={loading}
              />
            }
            label="Active Account"
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

export default EditUserModal;
