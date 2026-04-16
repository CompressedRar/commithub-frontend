import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Paper,
  Chip,
} from "@mui/material";
import { useState } from "react";

export default function ColumnSelectionDialog({
  open,
  onClose,
  onConfirm,
  columns = [],
  field = null,
  existingColumnId = null,
}) {
  const [selectedColumnId, setSelectedColumnId] = useState(
    existingColumnId || (columns.length > 0 ? columns[0].id : null)
  );

  const handleConfirm = () => {
    onConfirm(selectedColumnId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Assign to Column</Typography>
          {field && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={field.title}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                {field.type} • {field.user}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {columns.length > 0 ? (
          <RadioGroup
            value={selectedColumnId}
            onChange={(e) => setSelectedColumnId(e.target.value)}
          >
            {columns.map((column) => (
              <Paper
                key={column.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border:
                    selectedColumnId === column.id
                      ? "2px solid #1976d2"
                      : "1px solid #e0e0e0",
                  backgroundColor:
                    selectedColumnId === column.id ? "#f0f7ff" : "#fafafa",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#1976d2",
                  },
                }}
                onClick={() => setSelectedColumnId(column.id)}
              >
                <FormControlLabel
                  value={column.id}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {column.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Width: {column.width}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: "100%" }}
                />
              </Paper>
            ))}
          </RadioGroup>
        ) : (
          <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
            No columns configured. Please add columns in Column Manager.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={columns.length === 0}
        >
          Assign to Column
        </Button>
      </DialogActions>
    </Dialog>
  );
}
