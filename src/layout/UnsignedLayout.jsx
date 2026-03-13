import Box from '@mui/material/Box';
import Stack from "@mui/material/Stack";

const UnsignedLayout = ({ children }) => {
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 shadow rounded-4 overflow-hidden" style={{ maxWidth: "850px", zIndex: "1000" }}>
        
        <div className="col-md-6 d-none d-md-block p-0">
          <img src="nc-splash-new.jpg" alt="Background" className="img-fluid h-100 w-100 object-fit-cover" />
        </div>

        <Box className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
          <Stack mb={3}>
            <img src="LogoNC.png" alt="Logo" width={60} height={60} className="mb-3" />
            <h3 className="fw-bold">Welcome to CommitHub</h3>
            <p className="text-muted small">Sign in to continue</p>
          </Stack>
          {children}
        </Box>
      </div>

      {/* Background Overlay */}
      <div style={{ width: "100vw", height: "100vh", position: "fixed", zIndex: "1", opacity: "0.1" }}>
        <img src="nc-splash-new.jpg" alt="Overlay" className="img-fluid h-100 w-100 object-fit-cover" />
      </div>
    </div>
  );
};

export default UnsignedLayout;