import React, { useMemo } from "react";
import { 
  Box, Typography, Slider, Paper, Stack, Chip, Divider, Tooltip 
} from "@mui/material";
import { 
  format, addDays, differenceInDays, parseISO, isWithinInterval, startOfMonth, addMonths 
} from "date-fns";
import { 
  AssignmentTurnedIn, Visibility, BarChart, DateRange, LocationOn 
} from "@mui/icons-material";

export default function SliderPhaseScheduling({ periodState, setPeriodState }) {
  const bounds = useMemo(() => {
    const year = new Date().getFullYear();
    const isFirstHalf = periodState.currentPeriod?.includes("January");
    return {
      start: isFirstHalf ? new Date(year, 0, 1) : new Date(year, 6, 1),
      end: isFirstHalf ? new Date(year, 5, 30) : new Date(year, 11, 31),
    };
  }, [periodState.currentPeriod]);

  const totalDays = differenceInDays(bounds.end, bounds.start);

  // 1. Calculate Monthly Marks
  const monthMarks = useMemo(() => {
    const marks = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = startOfMonth(addMonths(bounds.start, i));
      const dayIndex = differenceInDays(monthDate, bounds.start);
      if (dayIndex >= 0 && dayIndex <= totalDays) {
        marks.push({
          value: dayIndex,
          label: format(monthDate, "MMM"),
        });
      }
    }
    return marks;
  }, [bounds, totalDays]);

  // 2. Calculate Today's Position
  const today = new Date();
  const isTodayInRange = isWithinInterval(today, { start: bounds.start, end: bounds.end });
  const todayValue = isTodayInRange ? differenceInDays(today, bounds.start) : null;

  const getVal = (dateStr, fallback) => {
    if (!dateStr) return fallback;
    try {
      return differenceInDays(parseISO(dateStr), bounds.start);
    } catch { return fallback; }
  };

  const values = [
    getVal(periodState.planningStart, 0),
    getVal(periodState.planningEnd, 30),
    getVal(periodState.monitoringEnd, 90),
    getVal(periodState.ratingEnd, 120),
  ];

  const handleChange = (event, newValues) => {
    const [pStart, pEnd, mEnd, rEnd] = newValues;
    setPeriodState(prev => ({
      ...prev,
      planningStart: format(addDays(bounds.start, pStart), "yyyy-MM-dd"),
      planningEnd: format(addDays(bounds.start, pEnd), "yyyy-MM-dd"),
      monitoringStart: format(addDays(bounds.start, pEnd + 1), "yyyy-MM-dd"),
      monitoringEnd: format(addDays(bounds.start, mEnd), "yyyy-MM-dd"),
      ratingStart: format(addDays(bounds.start, mEnd + 1), "yyyy-MM-dd"),
      ratingEnd: format(addDays(bounds.start, rEnd), "yyyy-MM-dd"),
    }));
  };

  return (
    <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, bgcolor: '#fafafa' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <DateRange color="primary" /> Interactive Phase Timeline
        </Typography>
        {isTodayInRange && (
          <Chip 
            icon={<LocationOn />} 
            label={`Today: ${format(today, "MMM dd")}`} 
            size="small" 
            color="primary" 
            variant="soft" 
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Stack>
      
      <Typography variant="body2" color="text.secondary" mb={6}>
        Drag handles to adjust phases. The blue marker indicates the current date.
      </Typography>

      <Box sx={{ px: 3, mb: 8, position: 'relative' }}>
        {/* Today Indicator Overlay */}
        {isTodayInRange && (
          <Box
            sx={{
              position: 'absolute',
              left: `${(todayValue / totalDays) * 100}%`,
              top: -10,
              bottom: -25,
              width: '2px',
              bgcolor: 'primary.main',
              zIndex: 1,
              '&::before': {
                content: '"Today"',
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                color: 'primary.main',
                textTransform: 'uppercase'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
              }
            }}
          />
        )}

        <Slider
          value={values}
          onChange={handleChange}
          min={0}
          max={totalDays}
          step={1}
          marks={monthMarks}
          valueLabelDisplay="auto"
          valueLabelFormat={(val) => format(addDays(bounds.start, val), "MMM dd")}
          disableSwap
          sx={{
            height: 12,
            '& .MuiSlider-track': { border: 'none' },
            '& .MuiSlider-thumb': {
              height: 28, width: 28, backgroundColor: '#fff', border: '2px solid currentColor',
              zIndex: 2,
              '&:hover': { boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)' },
            },
            '& .MuiSlider-markLabel': { fontSize: '0.75rem', fontWeight: 'bold', mt: 1 },
            '& .MuiSlider-rail': {
              opacity: 1,
              background: `linear-gradient(to right, 
                #1976d2 ${ (values[1]/totalDays)*100 }%, 
                #0288d1 ${ (values[1]/totalDays)*100 }% ${ (values[2]/totalDays)*100 }%, 
                #9c27b0 ${ (values[2]/totalDays)*100 }% ${ (values[3]/totalDays)*100 }%, 
                #e0e0e0 ${ (values[3]/totalDays)*100 }%)`,
            },
          }}
        />
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <PhaseCard 
          icon={<AssignmentTurnedIn />} 
          label="Planning" 
          color="#1976d2" 
          start={periodState.planningStart} 
          end={periodState.planningEnd} 
          isCurrent={isWithinInterval(today, { start: parseISO(periodState.planningStart), end: parseISO(periodState.planningEnd) })}
        />
        <PhaseCard 
          icon={<Visibility />} 
          label="Monitoring" 
          color="#0288d1" 
          start={periodState.monitoringStart} 
          end={periodState.monitoringEnd} 
          isCurrent={isWithinInterval(today, { start: parseISO(periodState.monitoringStart), end: parseISO(periodState.monitoringEnd) })}
        />
        <PhaseCard 
          icon={<BarChart />} 
          label="Rating" 
          color="#9c27b0" 
          start={periodState.ratingStart} 
          end={periodState.ratingEnd} 
          isCurrent={isWithinInterval(today, { start: parseISO(periodState.ratingStart), end: parseISO(periodState.ratingEnd) })}
        />
      </Stack>
    </Paper>
  );
}

function PhaseCard({ icon, label, color, start, end, isCurrent }) {
  const days = start && end ? differenceInDays(parseISO(end), parseISO(start)) + 1 : 0;
  return (
    <Box sx={{ 
      flex: 1, p: 2, borderRadius: 2, border: '1px solid', 
      borderColor: isCurrent ? color : 'divider',
      bgcolor: isCurrent ? `${color}05` : 'background.paper', 
      borderTop: `4px solid ${color}`,
      position: 'relative',
      transition: '0.2s'
    }}>
      {isCurrent && (
        <Chip 
          label="Active Now" 
          size="small" 
          sx={{ position: 'absolute', top: -12, right: 8, height: 20, bgcolor: color, color: 'white', fontWeight: 'bold', fontSize: '0.6rem' }} 
        />
      )}
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
        <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
      </Stack>
      <Typography variant="body2" fontWeight="medium">
        {start ? format(parseISO(start), "MMM dd") : '—'} to {end ? format(parseISO(end), "MMM dd") : '—'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {days} days total
      </Typography>
    </Box>
  );
}