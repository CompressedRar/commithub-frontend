import { FormControl, InputLabel, OutlinedInput, Button, Stack, FormHelperText } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

const ForgotPassword = ({ email, setEmail, onReset, onBack, loading }) => {
  return (
    <form>
      <Stack spacing={3}>
        <div className="mb-2">
          <h5 className="fw-bold">Reset Password</h5>
          <p className="text-muted small">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <FormControl fullWidth variant="outlined">
          <InputLabel>Recovery Email</InputLabel>
          <OutlinedInput
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            label="Recovery Email"
          />
          <FormHelperText>We will send a link to this address</FormHelperText>
        </FormControl>

        <Button 
          variant="contained" 
          size="large" 
          fullWidth 
          disabled={loading}
          startIcon={<SendIcon />}
          onClick={onReset}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

      </Stack>
    </form>
  );
};

export default ForgotPassword;