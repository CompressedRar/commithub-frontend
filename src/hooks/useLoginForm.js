import { useState } from "react";
import { authenticateAccount, verifyOtp } from "../services/userService";
import { objectToFormData } from "../components/api";
import Swal from "sweetalert2";
 
export const useLoginForm = () => {
  const [formData, setFormData]             = useState({ email: "", password: "" });
  const [otp, setOtp]                       = useState("");
  const [userEmail, setUserEmail]           = useState("");
  const [loading, setLoading]               = useState(false);
  const [otpRequested, setOtpRequested]     = useState(false);
  const [forgotPassOpen, setForgotPassOpen] = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
 
  function redirectByRole(role) {
    const routes = {
      faculty:       "/faculty/ipcr",
      head:          "/head/department",
      administrator: "/sadmin/dashboard",
      president:     "/ad/dashboard",
    };
    if (routes[role]) window.location.href = routes[role];
  }
 
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
 
  const login = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await authenticateAccount(objectToFormData(formData));
 
      if (res.data.message === "OTP sent" || res.data.two_factor_enabled) {
        // 2FA — no cookie yet, wait for OTP
        setUserEmail(formData.email);
        setOtpRequested(true);
        Swal.fire({ title: "2FA Enabled", text: "OTP sent to your email.", icon: "info" });
      } else {
        // Cookie was set by server. Role is in res.data.role — use it directly.
        // No /me call needed, no race condition.
        redirectByRole(res.data.role);
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.error, icon: "error" });
    } finally {
      setLoading(false);
    }
  };
 
  const verify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp({ email: userEmail, otp });
      redirectByRole(res.data.role);

      
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.error, icon: "error" });
    } finally {
      setLoading(false);
    }
  };
 
  return {
    formData, otp, loading,
    otpRequested, setOtpRequested,
    forgotPassOpen, setForgotPassOpen,
    showPassword, setShowPassword,
    handleInputChange, login, verify, setOtp,
  };
};