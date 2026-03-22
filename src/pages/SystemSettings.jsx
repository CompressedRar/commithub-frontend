import { useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Button, CircularProgress, Paper } from "@mui/material";
import { Save, Grade, Calculate, People, Event, Settings } from "@mui/icons-material";


import Positions from "./Positions";
import Periods from "../components/SystemSettings/Periods";
import FormulasTab from "../components/SystemSettings/FormulasTab";
import RatingThresholdsTab from "../components/SystemSettings/RatingThreshold";
import { useSystemSettings } from "../hooks/useSystemSettings";

const TABS = [
  { label: "Rating Thresholds", icon: <Grade sx={{ fontSize: 17 }} /> },
  { label: "Formulas",           icon: <Calculate sx={{ fontSize: 17 }} /> },
  { label: "Positions",          icon: <People sx={{ fontSize: 17 }} /> },
  { label: "Periods & Officers", icon: <Event sx={{ fontSize: 17 }} /> },
];

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
            <Box sx={{ borderBottom: "1px solid", borderColor: "divider", mb: 4 }}>
        <Box sx={{ display: "flex" }}>
          {TABS.map((tab, i) => (
            <Box
              key={i}
              onClick={() => setActiveTab(i)}
              sx={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "6px",
                px:             2,
                py:             "10px",
                fontSize:       "0.8125rem",
                fontWeight:     activeTab === i ? 600 : 400,
                color:          activeTab === i ? "primary.main" : "text.secondary",
                borderBottom:   activeTab === i ? "3px solid" : "3px solid transparent",
                borderColor:    activeTab === i ? "primary.main" : "transparent",
                mb:             "-1px",          // overlap the container border-bottom
                cursor:         "pointer",
                userSelect:     "none",
                whiteSpace:     "nowrap",
                transition:     "color .15s",
                "&:hover": {
                  color:   activeTab === i ? "primary.main" : "text.primary",
                  bgcolor: "action.hover",
                  borderRadius: "4px 4px 0 0",
                },
              }}
            >
              {tab.icon}
              {tab.label}
            </Box>
          ))}
        </Box>
      </Box>

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