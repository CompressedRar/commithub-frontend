import { useEffect, useState } from "react";
import { authenticateAccount } from "../services/userService";
import { objectToFormData } from "../components/api";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styles/Login.css";

function Login() {
  const location = useLocation();
  const [loginFormData, setLoginFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Detect existing token and redirect based on role
  function detectToken() {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = jwtDecode(token);
      if (payload.role === "faculty") window.location.href = "/faculty/ipcr";
      else if (payload.role === "head") window.location.href = "/head/department";
      else if (payload.role === "administrator") window.location.href = "/admin/dashboard";
      else if (payload.role === "president") window.location.href = "/president/dashboard";
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

      if (res.data.message === "Authenticated.") {
        localStorage.setItem("token", res.data.token);
        const payload = jwtDecode(res.data.token);
        detectToken(payload);
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
        <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
          <div className="text-center mb-4">
            <img src="CommitHub.png" alt="CommitHub Logo" height="60" className="mb-3" />
            <h3 className="fw-bold">Welcome to CommitHub</h3>
            <p className="text-muted small">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmission}>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <span className="material-symbols-outlined">mail</span>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  required
                  onChange={handleDataChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <span className="material-symbols-outlined">lock</span>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                  onChange={handleDataChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
              disabled={loggingIn}
            >
              {loggingIn ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined me-2">login</span>
                  Login
                </>
              )}
            </button>
          </form>
        </div>
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
