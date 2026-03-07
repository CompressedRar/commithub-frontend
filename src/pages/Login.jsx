import { useEffect, useState } from "react";
import { authenticateAccount, verifyOtp } from "../services/userService";
import { objectToFormData } from "../components/api";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styles/Login.css";

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from '@mui/material/Box';
import FormHelperText from "@mui/material/FormHelperText";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Login() {
  const location = useLocation();
  const [loginFormData, setLoginFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Detect existing token and redirect based on role
  function detectToken() {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = jwtDecode(token);
      if (payload.role === "faculty") window.location.href = "/faculty/ipcr";
      else if (payload.role === "head") window.location.href = "/head/department";
      else if (payload.role === "administrator") window.location.href = "/sadmin/dashboard";
      else if (payload.role === "president") window.location.href = "/ad/dashboard";
    }
  }

  useEffect(() => {
    if (window.location.pathname === "/") detectToken();
  }, []);

  // Handle login form submission
  const handleSubmission = async (e) => {
    e.preventDefault();
    setLoggingIn(true);

    try {
      const convertedData = objectToFormData(loginFormData);
      const res = await authenticateAccount(convertedData);
      
      if (res.data.token) {
        // User logged in directly (no 2FA)
        localStorage.setItem("token", res.data.token);
        const payload = jwtDecode(res.data.token);
        detectToken(payload);
      } else if (res.data.message === "OTP sent" || res.data.two_factor_enabled) {
        // User has 2FA enabled, show OTP prompt
        setTwoFAEnabled(true);
        setUserEmail(loginFormData.email);
        setOtpRequested(true);
        Swal.fire({ 
          title: "2FA Enabled", 
          text: "A one-time password was sent to your email.", 
          icon: "info" 
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error,
        icon: "error",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle input change
  const handleDataChange = (e) => {
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setVerifyingOtp(true);
    try {
      const res = await verifyOtp({ email: userEmail, otp: otp });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        const payload = jwtDecode(res.data.token);
        detectToken(payload);
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.error, icon: "error" });
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        
      <div className="row w-100 shadow rounded-4 overflow-hidden" style={{ maxWidth: "850px", zIndex:"1000"}}>
        {/* Left Side (Image) */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src="nc-splash-new.jpg"
            alt="Login Background"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>


        {/* Right Side (Form) */}
        <Box className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
          <Stack>
            <img src="LogoNC.png" alt="CommitHub Logo" width={60} height={60} className="mb-3" />
            <h3 className="fw-bold">Welcome to CommitHub</h3>
            <p className="text-muted small">Sign in to continue</p>
          </Stack>

          {!otpRequested ? (
            <form onSubmit={handleSubmission}>

              <Stack spacing={3}>
                <FormControl fullWidth variant="outlined" > 
                  <InputLabel htmlFor="outlined-adornment-password">Email</InputLabel>
                  <OutlinedInput
                    placeholder="Enter your email"
                    required
                    id="email"
                    name="email"
                    onChange={handleDataChange}
                    maxLength={30}
                    
                    label="Email"
                  />
                </FormControl>

                {/* Password */}

                <FormControl fullWidth variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                  <OutlinedInput
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    id="password"
                    name="password"
                    onChange={handleDataChange}
                    maxLength={30}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                          }
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                </FormControl>
                
                <Button
                  id="login-btn"
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loggingIn}
                  loading={loggingIn}
                  size="large"
                >
                  Login
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <Stack gap={2}>
                <Stack  className="alert alert-info" direction={"horizontal"} gap={2} alignItems={"center"}>
                  <VerifiedUserIcon></VerifiedUserIcon>
                  <span>Two-factor authentication is enabled on this account</span>
                </Stack>

                <FormControl fullWidth variant="outlined"> 
                  <InputLabel htmlFor="outlined-adornment-password">OTP</InputLabel>
                  <OutlinedInput  
                    id="otp"
                    name="otp"
                    placeholder="000000"
                    required
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    value={otp}
                    label="OTP"
                    aria-describedby="otp-helper"
                      
                  />
                  <FormHelperText id="otp-helper">Enter the 6-digit code sent to your email</FormHelperText>
                </FormControl>

                  
                  
                <Button type="submit" variant="contained" size="large" fullWidth disabled={verifyingOtp} loading={verifyingOtp} startIcon={<CheckCircleIcon></CheckCircleIcon>}>
                  Verify OTP
                </Button>
                <Button 
                  type="button" 
                  fullWidth
                  size="large"
                  onClick={() => {
                    setOtpRequested(false);
                    setOtp("");
                    setTwoFAEnabled(false);
                  }}
                >
                  Back to Login
                </Button>
              </Stack>
            </form>
          )}
        </Box>
      </div>
      <div style={{width:"100vw", height:"100vh", position:"fixed",zIndex:"1", opacity:"0.1"}}>
            <img
            src="nc-splash-new.jpg"
            alt="Login Background"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>
    </div>
  );
}

export default Login;
