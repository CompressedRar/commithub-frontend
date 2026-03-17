import  { useState, useEffect } from "react";
import { 
  Box, Card, CardHeader, CardContent, Typography, TextField, 
  FormControlLabel, Switch, Grid, Stack, MenuItem, Select, 
  IconButton, Divider, Paper 
} from "@mui/material";
import { Inventory2, Speed, Schedule, Info, Code, Tune } from "@mui/icons-material";
import { FormulaCard } from "./FormulaCard";



export default function FormulasTab({ enableFormulas, setEnableFormulas, formulas, setFormulas, setFormulaValidations }) {
  return (
    <Box>
      
      <FormControlLabel
        control={<Switch checked={!!enableFormulas} onChange={(e) => setEnableFormulas(e.target.checked ? 1 : 0)} />}
        label={<Typography fontWeight="bold">Enable Formulas</Typography>}
        sx={{ mb: 1 }}
      />
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enabling formulas allows the system to automatically compute performance ratings based on defined ranges.
      </Typography>

      {!!enableFormulas && (
        <Grid container spacing={4}>
          <FormulaCard
            title="Quality Formula" icon={<Inventory2 />}
            formulaKey="quantity" formulas={formulas} setFormulas={setFormulas}
            description="Define how quality metrics are calculated"
          />
          <FormulaCard
            title="Efficiency Formula" icon={<Speed />}
            formulaKey="efficiency" formulas={formulas} setFormulas={setFormulas}
            description="Define how efficiency metrics are calculated"
          />
          <FormulaCard
            title="Timeliness Formula" icon={<Schedule />}
            formulaKey="timeliness" formulas={formulas} setFormulas={setFormulas}
            description="Define how timeliness metrics are calculated"
          />
        </Grid>
      )}
    </Box>
  );
}

