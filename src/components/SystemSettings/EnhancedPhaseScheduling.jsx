
import {
  Typography,
  TextField,
  Box,
  Stack,
  Paper,
  Chip,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  timelineOppositeContentClasses
} from "@mui/lab";
import {
  AssignmentTurnedIn,
  BarChart,
  Visibility,
  DateRange,
} from "@mui/icons-material";
import { differenceInDays, parseISO, isValid } from "date-fns";

export default function EnhancedPhaseScheduling({ periodState, onDateChange }) {
  
  const getDuration = (start, end) => {
    if (!start || !end) return null;
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    if (!isValid(startDate) || !isValid(endDate)) return null;
    const days = differenceInDays(endDate, startDate) + 1;
    return days > 0 ? `${days} days` : "Invalid Range";
  };

  const phases = [
    {
      label: "Planning Phase",
      icon: <AssignmentTurnedIn />,
      color: "primary",
      startKey: "planningStart",
      endKey: "planningEnd",
    },
    {
      label: "Monitoring Phase",
      icon: <Visibility />,
      color: "info",
      startKey: "monitoringStart",
      endKey: "monitoringEnd",
    },
    {
      label: "Rating Phase",
      icon: <BarChart />,
      color: "secondary",
      startKey: "ratingStart",
      endKey: "ratingEnd",
    },
  ];

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, bgcolor: '#fafafa' }}>
      <Typography variant="h6" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold' }}>
        <DateRange color="action" />
        Academic Phase Timeline
      </Typography>

      <Timeline 
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: { xs: 0, sm: 0.2 },
            paddingLeft: 0,
            display: { xs: 'none', sm: 'block' }
          },
        }}
      >
        {phases.map((phase, index) => {
          const duration = getDuration(periodState[phase.startKey], periodState[phase.endKey]);
          
          return (
            <TimelineItem key={phase.label}>
              <TimelineOppositeContent color="text.secondary">
                {duration && (
                  <Chip 
                    label={duration} 
                    size="small" 
                    variant="outlined" 
                    color={phase.color}
                    sx={{ fontWeight: 'bold', borderStyle: 'dashed' }} 
                  />
                )}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={phase.color} sx={{ p: 1.5 }}>
                  {phase.icon}
                </TimelineDot>
                {index !== phases.length - 1 && <TimelineConnector sx={{ bgcolor: `${phase.color}.light`, width: 2 }} />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Box 
                  sx={{ 
                    p: 2.5, 
                    mb: 4, 
                    borderRadius: 2, 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {phase.label}
                  </Typography>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={periodState[phase.startKey] || ""}
                      onChange={(e) => onDateChange(phase.startKey, e.target.value)}
                    />
                    
                    <Typography variant="body2" color="text.disabled" sx={{ display: { xs: 'none', md: 'block' } }}>
                      to
                    </Typography>
                    
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={periodState[phase.endKey] || ""}
                      onChange={(e) => onDateChange(phase.endKey, e.target.value)}
                    />
                  </Stack>
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Paper>
  );
}