import { 
  Card, CardHeader, CardContent, Typography, 
  TextField, Divider, Box 
} from '@mui/material';
import { Grade } from '@mui/icons-material';

const ratingLabels = {
  outstanding: "Outstanding",
  very_satisfactory: "Very Satisfactory",
  satisfactory: "Satisfactory",
  unsatisfactory: "Unsatisfactory",
  poor: "Poor"
};

// Define the explicit order here
const ORDERED_KEYS = [
  "outstanding",
  "very_satisfactory",
  "satisfactory",
  "unsatisfactory",
  "poor"
];

export default function RatingThresholdsTab({ ratingThresholds, setRatingThresholds }) {
  const handleChange = (key, field, value) => {
    // Ensure we handle empty inputs or strings by converting to float/null
    const val = value === "" ? "" : parseFloat(value);
    
    setRatingThresholds(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: val }
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Performance Rating Scale
      </Typography>

      {/* Main Flex Container for Cards */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3 
        }}
      >
        {/* Map through ORDERED_KEYS instead of Object.keys() */}
        {ORDERED_KEYS.map((key) => {
          const threshold = ratingThresholds[key];
          if (!threshold) return null; // Safety check

          return (
            <Card 
              key={key} 
              variant="outlined" 
              sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 24px)', md: '0 1 calc(33.333% - 20px)' },
                minWidth: '280px' 
              }}
            >
              <CardHeader 
                title={ratingLabels[key]} 
                avatar={<Grade color="primary" />}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
              />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {threshold.min !== undefined && (
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        label="Min Score"
                        type="number"
                        fullWidth
                        size="small"
                        value={threshold.min}
                        onChange={(e) => handleChange(key, 'min', e.target.value)}
                        inputProps={{ step: "0.01" }}
                      />
                    </Box>
                  )}
                  {threshold.max !== undefined && (
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        label="Max Score"
                        type="number"
                        fullWidth
                        size="small"
                        value={threshold.max}
                        onChange={(e) => handleChange(key, 'max', e.target.value)}
                        inputProps={{ step: "0.01" }}
                      />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}