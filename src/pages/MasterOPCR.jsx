import { useEffect } from "react";
import { socket } from "../components/api";
import { useMasterOPCR } from "../hooks/useOPCR";
import { CircularProgress } from "@mui/material";
import {
  OPCRHeaderSection,
  OfficerInfoSection,
  OPCRSignaturesSection,
  OPCRFinalRatingsSection,
  OPCRDownloadButton,
  OPCRTaskSection,
} from "../components/DepartmentComponents/OPCR/OPCRShared";

function MasterOPCR() {
  const {
    opcrInfo,
    assignedData,
    headData,
    stats,
    downloading,
    ratingThresholds,
    loadOPCR,
    handleDownloadChange,
    handleRemarks,
  } = useMasterOPCR();

  useEffect(() => {
    loadOPCR();

    socket.on("ipcr", loadOPCR);
    socket.on("ipcr_added", loadOPCR);
    socket.on("ipcr_remove", loadOPCR);
    socket.on("assign", loadOPCR);

    return () => {
      socket.off("ipcr", loadOPCR);
      socket.off("ipcr_added", loadOPCR);
      socket.off("ipcr_remove", loadOPCR);
      socket.off("assign", loadOPCR);
    };
  }, []);

  if (!opcrInfo) {
    return (
      <div
        style={{ width: "100%", height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <div className="overlay-content text-center">
          <img
            src={`${import.meta.env.BASE_URL}empty-folder.png`}
            alt="No Data"
            className="overlay-icon"
          />
          <h2>No Consolidated OPCR Data</h2>
          <p>There are currently no IPCRs assigned or consolidated into the Master OPCR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4" style={{ minWidth: "1200px" }}>
      {/* Action Bar */}
      <div className="d-flex justify-content-end align-items-center mb-4 gap-3">
        <OPCRDownloadButton
          onDownload={handleDownloadChange}
          downloading={downloading}
          label={downloading ? "Generating..." : "Download Options"}
          options={[
            { value: "master", label: "Download Master OPCR" },
          ]}
        />
      </div>

      {/* Main Card */}
      <div className="container-fluid border rounded">
        <div className="card-body p-4">
          <OPCRHeaderSection
            title="MASTER OFFICE PERFORMANCE COMMITMENT & REVIEW FORM"
            subtitle="Consolidated Results from All Department OPCRs"
          />

          <OfficerInfoSection headData={headData} rateeLabel="Consolidated by" />

          <div className="table-responsive mt-5 mb-4">
            <table className="table table-bordered table-hover">
              <thead className="table-light sticky-top">
                <tr>
                  <th style={{ width: "20%", textAlign: "center" }}>OUTPUT</th>
                  <th style={{ width: "20%", textAlign: "center" }}>
                    SUCCESS INDICATORS<br />
                    <small className="text-muted">(TARGETS + MEASURES)</small>
                  </th>
                  <th style={{ width: "15%", textAlign: "center" }}>INDIVIDUALS ACCOUNTABLE</th>
                  <th style={{ width: "20%", textAlign: "center" }}>ACTUAL ACCOMPLISHMENT</th>
                  <th style={{ width: "15%", textAlign: "center" }}>
                    RATING<br />
                    <small className="text-muted">Q² E² T² A²</small>
                  </th>
                  <th style={{ width: "20%", textAlign: "center" }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {opcrInfo.map((categoryObj, i) =>
                  Object.entries(categoryObj).map(([category, tasks]) => (
                    <OPCRTaskSection
                      key={`${i}-${category}`}
                      category={category}
                      tasks={tasks}
                      assignedData={assignedData}
                      canEval={false}
                      isRatingPhase={false}
                      showWeightedAvg={false}
                      editable={false}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <OPCRFinalRatingsSection
            stats={stats}
            opcrInfo={opcrInfo}
            handleRemarks={handleRemarks}
            ratingThresholds={ratingThresholds}
          />

          <OPCRSignaturesSection
            headData={headData}
            people={[
              { label: "Consolidated by", name: headData?.fullName, position: headData?.position },
              { label: "Reviewed by", name: headData?.individuals?.assess?.name, position: headData?.individuals?.assess?.position },
              { label: "Approved by", name: headData?.individuals?.approve?.name, position: headData?.individuals?.approve?.position },
              { label: "Confirmed by", name: headData?.individuals?.confirm?.name, position: headData?.individuals?.confirm?.position },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default MasterOPCR;
