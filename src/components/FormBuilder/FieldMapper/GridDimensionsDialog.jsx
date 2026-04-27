import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
} from "@mui/material";

export default function GridDimensionsDialog({
  open,
  rowsInput,
  colsInput,
  onRowsChange,
  onColsChange,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Configure Grid Dimensions</DialogTitle>
      <DialogContent sx={{ minWidth: "300px" }}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Number of Rows"
            type="number"
            value={rowsInput}
            onChange={(e) => onRowsChange(e.target.value)}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
          />
          <TextField
            label="Number of Columns"
            type="number"
            value={colsInput}
            onChange={(e) => onColsChange(e.target.value)}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
