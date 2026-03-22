import { FormControl, InputLabel, OutlinedInput, FormHelperText, Button, Stack } from "@mui/material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

 const OtpForm = ({ otp, setOtp, onVerify, onBack, loading }) => {
  return (
    <form onSubmit={onVerify}>
      <Stack gap={2}>
        <Stack className="alert alert-info" direction="row" gap={2} alignItems="center">
          <VerifiedUserIcon />
          <span style={{ fontSize: '0.85rem' }}>Two-factor authentication is enabled</span>
        </Stack>

        <FormControl fullWidth variant="outlined">
          <InputLabel>OTP Code</InputLabel>
          <OutlinedInput
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            label="OTP Code"
          />
          <FormHelperText>Enter the 6-digit code sent to your email</FormHelperText>
        </FormControl>

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} startIcon={<CheckCircleIcon />}>
          Verify OTP
        </Button>
        <Button color="inherit" onClick={onBack}>
          Back to Login
        </Button>
      </Stack>
    </form>
  );
};

export default OtpForm;