import { useState } from "react";
import { usePeriod } from "../hooks/usePeriod";
import IPCRContainer from "../components/Faculty/IPCRContainer";
import EditIPCR from "../components/Faculty/EditIPCR";
import { Stepper, Step, StepLabel } from '@mui/material';

function Faculty() {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIPCRID, setCurrentIPCRID] = useState(null);
  const [departmentID, setDepartmentID] = useState(null);

  const { currentPhase } = usePeriod();

  const handleSwitchPage = (ipcr_id, dept_id) => {
    setTimeout(() => {
      setCurrentPage(1);
      setCurrentIPCRID(ipcr_id);
      setDepartmentID(dept_id);
    }, 500);
  };


  return (
    <div className="faculty-container">
      <Stepper alternativeLabel sx={{ mb: 4 }}>
        {["Planning", "Monitoring", "Rating"].map((label) => (
          <Step key={label} completed={currentPhase?.includes(label.toLowerCase())}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {currentPage === 0 ? (
        <IPCRContainer switchPage={handleSwitchPage} />
      ) : (
        <EditIPCR 
          dept_id={departmentID} 
          mode="faculty" 
          ipcr_id={currentIPCRID} 
          switchPage={() => {
            setCurrentPage(0);
            setCurrentIPCRID(null);
          }} 
        />
      )}
    </div>
  );
}

export default Faculty;