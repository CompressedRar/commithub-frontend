import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider
} from "@mui/material";
import { submitTask } from "../../../services/formBuilderService";

const TaskSubmissionDialog = ({ task, isOpen, onClose, onSuccess }) => {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize user input fields
  useEffect(() => {
    if (task?.input_fields) {
      const initial = {};
      task.input_fields.forEach(f => {
        initial[f.field_id] = "";
      });
      setValues(initial);
    }
  }, [task]);

  const handleChange = (fieldId, value) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await submitTask(task.id, values);


      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Failed to submit task");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value = values[field.field_id] || "";

    return (
      <TextField
        fullWidth
        size="small"
        type={field.type === "Integer" ? "number" : "text"}
        label={field.title}
        value={value}
        onChange={(e) => handleChange(field.field_id, e.target.value)}
      />
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Submit Task</DialogTitle>

      <DialogContent dividers>

        {/* 🔹 ADMIN DATA (READ ONLY) */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Task Details
        </Typography>

        <Box sx={{ mb: 2 }}>
          {Object.values(task?.values || {}).map((item, idx) => (
            <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
              <strong>{item.title}:</strong> {item.value}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 🔹 USER INPUT */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Your Response
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {task?.input_fields?.map(field => (
            <Box key={field.field_id}>
              {renderField(field)}
            </Box>
          ))}
        </Box>

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskSubmissionDialog;