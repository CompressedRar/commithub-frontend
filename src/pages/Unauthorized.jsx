import { useNavigate, useLocation } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (location.state?.from) {
      navigate(-1); // go back if there's history
    } else {
      navigate("/"); // or go home
    }
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <span className="material-symbols-outlined warning-icon">lock</span>
        <h1>Access Denied</h1>
        <p>You don’t have permission to view this page.</p>
        <button className="btn btn-primary" onClick={goBack}>
          Go Back
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
