import { FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, Link, Button, Stack } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';

const LoginForm = ({ formData, onChange, onLogin, onForgotPass, loading, showPassword, setShowPassword }) => {
  return (
    <form onSubmit={onLogin}>
      <Stack spacing={3}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Email</InputLabel>
          <OutlinedInput
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            required
            label="Email"
          />
        </FormControl>

        <FormControl fullWidth variant="outlined">
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={onChange}
            required
            label="Password"
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          <Link underline="none" sx={{ cursor: "pointer", textAlign: "right", mt: 1 }} onClick={onForgotPass}>
            Forgot Password
          </Link>
        </FormControl>

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Stack>
    </form>
  );
};

export default LoginForm;