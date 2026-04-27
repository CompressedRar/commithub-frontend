
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
        filteredID,
        ipcrCount,
        handleConsolidate 
    } = usePerformanceData(deptid);
    
    

    return (
        <div className="performance-reviews-container">
            {/* OPCR SECTION */}
            
            <SectionHeader 
                title="Office Performance Commitment and Review Form" 
                onAction={handleConsolidate}
                actionLoading={consolidating}
                showAction={ipcrCount == filteredID.length} // Keeping d-none logic from original: change to true if needed
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
                {(allOPCR == null || allOPCR.length === 0)  && <EmptyState message="Consolidate IPCRs to create OPCR" />}
            </div>

            <hr />

            {/* IPCR SECTION */}
            <SectionHeader title="Individual Performance Commitment and Review" showAction={false} />
            <div className="all-ipcr-container d-flex flex-column gap-2">
                {allIPCR?.map(ipcr => (
                    <DeptIPCR 
                        key={ipcr.ipcr?.id || ipcr.id} 
                        dept_id={deptid} 
                        ipcr={ipcr} 
                        dept_mode={dept_mode} 
                    />
                ))}
                {(allIPCR == null || allIPCR.length === 0) && <EmptyState message="No IPCR Found" />}
            </div>
        </div>
    );
}

export default PCR;