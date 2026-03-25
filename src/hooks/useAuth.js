import { useState, useEffect } from "react";
import { authenticateAccount, verifyOtp } from "../services/userService";
import { objectToFormData } from "../components/api";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";


export const useAuth = () => {
  // --- States ---
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [forgotPassOpen, setForgotPassOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // --- Token Logic ---
  const detectToken = (token = localStorage.getItem("token")) => {
    if (!token) return;
    try {
      const payload = jwtDecode(token);
      const routes = {
        faculty: "/faculty/ipcr",
        head: "/head/department",
        administrator: "/sadmin/dashboard",
        president: "/ad/dashboard",
      };
      if (routes[payload.role]) window.location.href = routes[payload.role];
    } catch (e) {
      console.error("Invalid token", e);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await authenticateAccount(objectToFormData(formData));
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        detectToken(res.data.token);
      } else if (res.data.message === "OTP sent" || res.data.two_factor_enabled) {
        setUserEmail(formData.email);
        setOtpRequested(true);
        Swal.fire({ title: "2FA Enabled", text: "OTP sent to your email.", icon: "info" });
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
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        detectToken(res.data.token);
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.error, icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () =>{
    try {
      const currentTime = Date.now() / 1000;
      const token = localStorage.getItem("token"); 
      if (!token) return;

      const payload = jwtDecode(token);
      console.log(payload.exp, payload.exp < currentTime)

      
      if (payload.exp < currentTime) {
        handleAutomaticLogout();
        
      }
    }
    catch(error){
      console.log(error)
    }
  }

  function handleAutomaticLogout() {
    localStorage.removeItem("token");  
    window.location.replace('/')      
  }

  return {
    // Data
    formData, otp, loading,
    // UI Toggles
    otpRequested, setOtpRequested,
    forgotPassOpen, setForgotPassOpen,
    showPassword, setShowPassword,
    // Actions
    handleInputChange, login, verify, setOtp, detectToken, verifyToken
  };
};