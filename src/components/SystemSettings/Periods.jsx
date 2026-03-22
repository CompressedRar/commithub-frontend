import React from "react";
import {
  Typography,
  TextField,
  Alert,
  AlertTitle,
  Box,
  Chip,
  Divider,
  Stack,
  Button,
  Paper
} from "@mui/material";
import { Info, Warning, Event, Refresh, Person, Badge } from "@mui/icons-material";
import { checkDateOverlap } from "../../utils/periodUtils";
import EnhancedPhaseScheduling from "./EnhancedPhaseScheduling";
import SliderPhaseScheduling from "./SliderPhaseScheduling";

export default function Periods({ 
  periodState, 
  setPeriodState, 
  officers, 
  setOfficers, 
  handleSave,
  handleResetPeriod,
  resettingPeriod 
}) {
  const handleDateChange = (field, value) => {
    setPeriodState((prev) => ({ ...prev, [field]: value }));
  };

  const overlap = checkDateOverlap(periodState);

  return (
    <Box sx={{ pb: 8 }}> {/* Added padding for the fixed bottom save button */}
      <Stack spacing={4}>

        
        
        {/* 1. Alerts Section */}
        <Box>
          <Alert icon={<Info fontSize="inherit" />} severity="info" sx={{ mb: 1 }}>
            <AlertTitle>Current Active Phase(s)</AlertTitle>
            {periodState.currentPhase && periodState.currentPhase.length > 0 ? (
              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                {periodState.currentPhase.map((phase) => (
                  <Chip key={phase} label={phase} color="primary" size="small" />
                ))}
              </Box>
            ) : (
              "No active phase for today's date."
            )}
          </Alert>

          {overlap.hasOverlap && (
            <Alert icon={<Warning fontSize="inherit" />} severity="warning">
              <AlertTitle>Date Overlap Detected</AlertTitle>
              {overlap.message}
            </Alert>
          )}
        </Box>

        {/* 2. Management & Officers Row */}
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", lg: "row" } }}>
          
          {/* Period Management Section */}
          <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Refresh color="warning" /> Period Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Generate a new random period ID to start a new academic period.
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Current Period ID</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {periodState.currentPeriodId || "Not set"}
                </Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="warning" 
                startIcon={<Refresh />}
                onClick={handleResetPeriod}
                disabled={resettingPeriod}
                sx={{ alignSelf: 'start' }}
              >
                {resettingPeriod ? "Resetting..." : "Reset Period"}
              </Button>
            </Stack>
          </Paper>

          {/* Officers Section */}
          <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" /> Current Officers
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="President Fullname"
                value={officers.president}
                onChange={(e) => setOfficers({ ...officers, president: e.target.value })}
                placeholder="Fullname of current president"
                size="large"
              />
              <TextField
                fullWidth
                label="Mayor Fullname"
                value={officers.mayor}
                onChange={(e) => setOfficers({ ...officers, mayor: e.target.value })}
                placeholder="Fullname of current mayor"
                size="large"
              />
            </Stack>
          </Paper>
        </Box>

        {/* 3. Scheduling Section */}
        <Box>
          <Divider sx={{ mb: 3 }}>
            <Chip label="Phase Scheduling" icon={<Event />} />
          </Divider>

          <Stack spacing={3}>
            <Box sx={{ maxWidth: 400, mb: 2 }}>
              <TextField
                fullWidth
                label="Current Period (Automatic)"
                value={periodState.currentPeriod || ""}
                InputProps={{ readOnly: true }}
                helperText='Set based on current month (January-June / July-December)'
              />
            </Box>

            <SliderPhaseScheduling periodState={periodState} setPeriodState={setPeriodState} />
          </Stack>
        </Box>

      </Stack>
    </Box>
  );
}
