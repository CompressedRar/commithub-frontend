import React, { useEffect, useState } from "react";
import { 
  Box, Typography,  FormControlLabel, Switch, 
  Grid,  Paper,  CircularProgress, Button, Container
} from "@mui/material";
import { 
  Inventory2, Speed, Schedule,  Calculate, Save 
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { updateAssignedDepartmentTaskFormula } from "../../../services/departmentService";
import { FormulaCard } from "../../SystemSettings/FormulaCard";

export default function FormulaSettings({ task_data }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulas state following the structure from task_data
  const [formulas, setFormulas] = useState({
    quantity: {},
    efficiency: {},
    timeliness: {}
  });

  const [enableFormulas, setEnableFormulas] = useState(false);

  useEffect(() => {
    if (task_data) {
      setEnableFormulas(task_data.enable_formulas ?? false);
      setFormulas({
        quantity: task_data.quantity_formula || { expression: "actual", rating_scale: {} },
        efficiency: task_data.efficiency_formula || { expression: "actual", rating_scale: {} },
        timeliness: task_data.timeliness_formula || { expression: "actual", rating_scale: {} }
      });
      setLoading(false);
    }
  }, [task_data]);

  async function save() {
    try {
      setSaving(true);
      await updateAssignedDepartmentTaskFormula(task_data.assigned_dept_id, {
        quantity_formula: formulas.quantity,
        efficiency_formula: formulas.efficiency,
        timeliness_formula: formulas.timeliness,
        enable_formulas: enableFormulas
      });
      Swal.fire("Success", "Formulas updated successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save formulas", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <header style={{ marginBottom: '24px' }}>
        <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <Calculate color="primary" fontSize="large" /> Formula Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure individual computation formulas for this task
        </Typography>
      </header>

      <FormControlLabel
        control={
          <Switch 
            checked={enableFormulas} 
            onChange={(e) => setEnableFormulas(e.target.checked)} 
          />
        }
        label={<Typography fontWeight="bold">Enable Formulas</Typography>}
        sx={{ mb: 3 }}
      />

      {enableFormulas ? (
        <Grid container spacing={4}>
          <FormulaCard
            title="Quality Formula"
            icon={<Inventory2 />}
            formulaKey="quantity"
            formulas={formulas}
            setFormulas={setFormulas}
            description="Define range logic for Quality/Quantity"
          />
          <FormulaCard
            title="Efficiency Formula"
            icon={<Speed />}
            formulaKey="efficiency"
            formulas={formulas}
            setFormulas={setFormulas}
            description="Define range logic for Efficiency"
          />
          <FormulaCard
            title="Timeliness Formula"
            icon={<Schedule />}
            formulaKey="timeliness"
            formulas={formulas}
            setFormulas={setFormulas}
            description="Define range logic for Timeliness"
          />
        </Grid>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography color="text.secondary">
            Formulas are currently disabled. Toggle the switch above to configure automated rating logic.
          </Typography>
        </Paper>
      )}

      {/* Action Bar */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving Changes..." : "Save Formulas"}
        </Button>
      </Box>
    </Container>
  );
}

