import { useState } from "react";

import { 
  Box, Card, CardHeader, CardContent, Typography, TextField, 
  FormControlLabel, Switch, Grid, Stack, MenuItem, Select, 
  IconButton, Divider, Paper 
} from "@mui/material";
import { Inventory2, Speed, Schedule, Info, Code, Tune } from "@mui/icons-material";

export function FormulaCard({ title, icon, formulaKey, formulas, setFormulas, description }) {
  const [viewMode, setViewMode] = useState("builder"); // 'builder' or 'json'
  
  // Local state for the builder
  const currentFormula = formulas[formulaKey] || { expression: "actual", rating_scale: {} };

  const handleExpressionChange = (val) => {
    setFormulas(prev => ({
      ...prev,
      [formulaKey]: { ...currentFormula, expression: val }
    }));
  };

  const updateRange = (rating, field, value) => {
    const newScale = { ...currentFormula.rating_scale };
    if (!newScale[rating]) newScale[rating] = {};
    
    if (value === "") {
      delete newScale[rating][field];
    } else {
      newScale[rating][field] = parseFloat(value);
    }

    setFormulas(prev => ({
      ...prev,
      [formulaKey]: { ...currentFormula, rating_scale: newScale }
    }));
  };

  return (
    <Grid item xs={12} lg={6}>
      <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
        <CardHeader 
          title={title} 
          avatar={icon}
          action={
            <IconButton onClick={() => setViewMode(viewMode === "builder" ? "json" : "builder")}>
              {viewMode === "builder" ? <Code /> : <Tune />}
            </IconButton>
          }
          titleTypographyProps={{ fontWeight: 'bold', variant: 'h6' }} 
          sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'grey.200' }}
        />
        <CardContent>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {description}
          </Typography>

          <Box sx={{ mt: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Mathematical Expression"
              size="small"
              helperText="Variable available: 'actual' and 'target'"
              value={currentFormula.expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              InputProps={{ sx: { fontFamily: 'monospace' } }}
            />
          </Box>

          <Divider sx={{ mb: 2 }}><Typography variant="overline">Rating Scale Mapping</Typography></Divider>

          {viewMode === "builder" ? (
            <Stack spacing={1.5}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Paper key={rating} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 80, fontWeight: 'bold' }}>
                    Rating {rating}:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                    <TextField
                      label="≥ (Min)"
                      type="number"
                      size="small"
                      value={currentFormula.rating_scale[rating]?.gte ?? ""}
                      onChange={(e) => updateRange(rating, 'gte', e.target.value)}
                    />
                    <TextField
                      label="≤ (Max)"
                      type="number"
                      size="small"
                      value={currentFormula.rating_scale[rating]?.lte ?? ""}
                      onChange={(e) => updateRange(rating, 'lte', e.target.value)}
                    />
                    <TextField
                      label="= (Eq)"
                      type="number"
                      size="small"
                      placeholder="Exact"
                      value={currentFormula.rating_scale[rating]?.eq ?? ""}
                      onChange={(e) => updateRange(rating, 'eq', e.target.value)}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={12}
              variant="filled"
              value={JSON.stringify(currentFormula, null, 2)}
              InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.8rem' } }}
            />
          )}

          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <Info fontSize="small" color="primary" />
            <Typography variant="caption" color="text.secondary">
              Logic: If (expression) matches range, return rating.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}