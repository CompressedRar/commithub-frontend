
import { Step, StepLabel, Stepper, Box } from "@mui/material";

const PHASES = ["Planning", "Monitoring", "Rating"];

export const PhaseStepper = ({ currentPhase }) => {
  const activeStep = PHASES.findIndex((phase) =>
    currentPhase?.includes(phase.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
      >
        {PHASES.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};