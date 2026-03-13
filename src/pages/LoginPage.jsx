import { useEffect } from "react";
import UnsignedLayout from "../layout/UnsignedLayout";
import OtpForm from "../components/Auth/OtpForm";
import ForgotPassword from "./ForgotPassword";
import LoginForm from "../components/Auth/LoginForm";
import { Button } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const {
    formData, otp, loading,
    otpRequested, setOtpRequested,
    forgotPassOpen, setForgotPassOpen,
    showPassword, setShowPassword,
    handleInputChange, login, verify, setOtp, detectToken
  } = useAuth();

  useEffect(() => {
    if (window.location.pathname === "/") detectToken();
  }, []);

  return (
    <UnsignedLayout>
      {otpRequested ? (
        <OtpForm 
          otp={otp} 
          setOtp={setOtp} 
          onVerify={verify} 
          onBack={() => setOtpRequested(false)}
          loading={loading}
        />
      ) : forgotPassOpen ? (
        <>
          <ForgotPassword />
          <Button fullWidth onClick={() => setForgotPassOpen(false)}>Back to Login</Button>
        </>
      ) : (
        <LoginForm 
          formData={formData}
          onChange={handleInputChange}
          onLogin={login}
          onForgotPass={() => setForgotPassOpen(true)}
          loading={loading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      )}
    </UnsignedLayout>
  );
}

export default LoginPage;