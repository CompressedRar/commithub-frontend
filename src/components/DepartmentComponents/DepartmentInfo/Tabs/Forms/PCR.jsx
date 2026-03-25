
import DeptIPCR from "./DeptIPCR";
import DeptOPCR from "./DeptOPCR";
import { EmptyState, SectionHeader } from "./EmptyForms";
import { usePerformanceData } from "./Hooks/usePerformanceReview";
 // Assume hook is in separate file

function PCR({ deptid, dept_mode }) {
    const { 
        allIPCR, 
        allOPCR, 
        consolidating, 
        handleConsolidate 
    } = usePerformanceData(deptid);
    
    

    return (
        <div className="performance-reviews-container">
            {/* OPCR SECTION */}
            
            <SectionHeader 
                title="Office Performance Review and Commitment Form" 
                onAction={handleConsolidate}
                actionLoading={consolidating}
                showAction={false} // Keeping d-none logic from original: change to true if needed
            />
            
            <div className="all-ipcr-container d-flex flex-column gap-2 mb-4">
                {allOPCR?.map(opcr => (
                    <DeptOPCR 
                        key={opcr.id} 
                        opcr={opcr} 
                        dept_id={deptid} 
                        opcr_id={opcr.id} 
                        dept_mode={dept_mode} 
                    />
                ))}
                {allOPCR?.length === 0 && <EmptyState message="No OPCRs Found" />}
            </div>

            <hr />

            {/* IPCR SECTION */}
            <h3>Individual Performance Review and Commitment Forms</h3>
            <div className="all-ipcr-container d-flex flex-column gap-2">
                {allIPCR?.map(ipcr => (
                    <DeptIPCR 
                        key={ipcr.ipcr?.id || ipcr.id} 
                        dept_id={deptid} 
                        ipcr={ipcr} 
                        dept_mode={dept_mode} 
                    />
                ))}
                {allIPCR?.length === 0 && <EmptyState message="No IPCR Found" />}
            </div>
        </div>
    );
}

export default PCR;