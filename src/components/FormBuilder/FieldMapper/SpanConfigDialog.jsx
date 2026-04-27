import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Box,
  Typography,
} from "@mui/material";

export default function SpanConfigDialog({
  open,
  editingCell,
  rowSpan,
  colSpan,
  onRowSpanChange,
  onColSpanChange,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {editingCell ? "Edit Field Span" : "Configure Field Span"}
      </DialogTitle>
      <DialogContent sx={{ minWidth: "300px" }}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            How many rows and columns should this field occupy?
          </Typography>
          <TextField
            label="Row Span"
            type="number"
            value={rowSpan}
            onChange={(e) =>
              onRowSpanChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            inputProps={{ min: 1, max: 20 }}
            fullWidth
          />
          <TextField
            label="Column Span"
            type="number"
            value={colSpan}
            onChange={(e) =>
              onColSpanChange(Math.max(1, parseInt(e.target.value) || 1))
            }
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
          <Box sx={{ p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold">
              Preview: {rowSpan} row(s) × {colSpan} column(s)
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          {editingCell ? "Update Span" : "Place Field"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
