import { useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Button, CircularProgress, Paper } from "@mui/material";
import { Save, Grade, Calculate, People, Event, Settings } from "@mui/icons-material";


import Positions from "./Positions";
import Periods from "../components/SystemSettings/Periods";
import FormulasTab from "../components/SystemSettings/FormulasTab";
import RatingThresholdsTab from "../components/SystemSettings/RatingThreshold";
import { useSystemSettings } from "../hooks/useSystemSettings";

export default function SystemSettings() {
  const { loading, saving, handleSave, ...stateProps } = useSystemSettings();
  const [activeTab, setActiveTab] = useState(0);
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{margin:"auto"}}>
      {/* Header */}
      <Box >

        <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <Settings fontSize="large" color="primary" /> System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure rating scales, formulas, and system parameters
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          variant="scrollable"
        >
          <Tab icon={<Grade />} iconPosition="start" label="Rating Thresholds" />
          <Tab icon={<Calculate />} iconPosition="start" label="Formulas" />
          <Tab icon={<People />} iconPosition="start" label="Positions" />
          <Tab icon={<Event />} iconPosition="start" label="Periods & Officers" />
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && <RatingThresholdsTab {...stateProps} />}
        {activeTab === 1 && <FormulasTab {...stateProps} />}
        {activeTab === 2 && <Positions />}
        {activeTab === 3 && <Periods {...stateProps} />}
      </Box>

      <Paper 
        elevation={3} 
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}
      >
        <Button 
          variant="contained" 
          color="success" 
          size="large" 
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Paper>
    </Container>
  );
}