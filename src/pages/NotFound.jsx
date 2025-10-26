import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <span className="material-symbols-outlined error-icon">error_outline</span>
        <h1>404</h1>
        <p>Oops! The page you’re looking for doesn’t exist.</p>
        <div className="notfound-buttons d-flex justify-content-center gap-2">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
