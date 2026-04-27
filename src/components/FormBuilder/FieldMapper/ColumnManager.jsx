import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function ColumnManager({
  open,
  onClose,
  onSave,
  existingColumns = [],
  fieldCount = 0,
  fieldMapping = {},
  columnMapping = {},
}) {
  const [columns, setColumns] = useState(
    existingColumns.length > 0
      ? existingColumns
      : [{ id: 1, name: "Column 1", width: "50%" }]
  );
  const [editingId, setEditingId] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");

  // Add new column
  const handleAddColumn = () => {
    const newId = Math.max(...columns.map((c) => c.id), 0) + 1;
    const newWidth = `${Math.round(100 / (columns.length + 1))}%`;
    setColumns([
      ...columns,
      { id: newId, name: `Column ${newId}`, width: newWidth },
    ]);
    // Redistribute widths
    const newColumns = [...columns, { id: newId, name: `Column ${newId}`, width: newWidth }];
    redistributeWidths(newColumns);
  };

  // Remove column
  const handleRemoveColumn = (id) => {
    if (columns.length > 1) {
      const filtered = columns.filter((c) => c.id !== id);
      redistributeWidths(filtered);
    }
  };

  // Update column name
  const handleUpdateName = (id, newName) => {
    setColumns(
      columns.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  // Update column width
  const handleUpdateWidth = (id, newWidth) => {
    setColumns(
      columns.map((c) => (c.id === id ? { ...c, width: newWidth } : c))
    );
  };

  // Redistribute widths evenly
  const redistributeWidths = (cols) => {
    const evenWidth = `${Math.round(100 / cols.length)}%`;
    const updated = cols.map((c) => ({ ...c, width: evenWidth }));
    setColumns(updated);
  };

  // Get fields assigned to a column
  const getFieldsInColumn = (columnId) => {
    const fieldsInColumn = [];
    for (const [fieldId, assignedColId] of Object.entries(columnMapping)) {
      if (assignedColId === columnId) {
        // Find the field from fieldMapping
        for (const cellData of Object.values(fieldMapping)) {
          if (cellData.field.id === parseInt(fieldId)) {
            fieldsInColumn.push(cellData.field);
            break;
          }
        }
      }
    }
    return fieldsInColumn;
  };

  // Handle save
  const handleSave = () => {
    onSave(columns);
    onClose();
  };

  // Calculate total width
  const totalWidth = columns.reduce((sum, c) => {
    const widthNum = parseInt(c.width);
    return sum + (isNaN(widthNum) ? 0 : widthNum);
  }, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Column Layout Manager
          <Typography variant="caption" color="textSecondary">
            {columns.length} column{columns.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Info */}
          <Paper
            elevation={0}
            sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 1 }}
          >
            <Typography variant="body2">
              Define columns for your form layout. Fields will be distributed across
              these columns based on their position in the grid.
            </Typography>
          </Paper>

          {/* Columns Table */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Column Configuration
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell width="50%">Column Name</TableCell>
                  <TableCell width="30%">Width</TableCell>
                  <TableCell width="20%">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((column) => (
                  <TableRow key={column.id}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={column.name}
                        onChange={(e) =>
                          handleUpdateName(column.id, e.target.value)
                        }
                        placeholder="Column name"
                        variant="outlined"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={column.width}
                        onChange={(e) =>
                          handleUpdateWidth(column.id, e.target.value)
                        }
                        placeholder="e.g., 50%"
                        variant="outlined"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveColumn(column.id)}
                        disabled={columns.length === 1}
                        title={columns.length === 1 ? "Cannot remove last column" : "Remove"}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Add Column Button */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddColumn}
            fullWidth
          >
            Add Column
          </Button>

          {/* Width Validation */}
          <Box>
            <Typography variant="caption" fontWeight="bold">
              Total Width: {totalWidth}%
            </Typography>
            {totalWidth !== 100 && (
              <Typography variant="caption" color="error" display="block">
                ⚠️ Width must equal 100%
              </Typography>
            )}
          </Box>

          {/* Preview */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Layout Preview with Field Assignments
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                border: "1px solid #ddd",
                borderRadius: 1,
                p: 1,
                backgroundColor: "#fafafa",
                minHeight: "150px",
              }}
            >
              {columns.map((col) => {
                const fieldsInCol = getFieldsInColumn(col.id);
                return (
                  <Box
                    key={col.id}
                    sx={{
                      flex: `0 0 ${col.width}`,
                      border: "1px dashed #bbb",
                      p: 2,
                      borderRadius: 0.5,
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      overflow: "auto",
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold" color="textSecondary">
                      {col.name}
                      <br />
                      ({col.width})
                    </Typography>
                    {fieldsInCol.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {fieldsInCol.map((field) => (
                          <Chip
                            key={field.id}
                            label={field.title}
                            size="small"
                            color={field.user === "Admin" ? "primary" : "secondary"}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary" sx={{ fontStyle: "italic" }}>
                        No fields assigned
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={totalWidth !== 100}
        >
          Save Columns
        </Button>
      </DialogActions>
    </Dialog>
  );
}
