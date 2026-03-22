import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { socket } from "../../api";
import { usePlannedOPCR } from "../../../hooks/useOPCR";
import { useSettings } from "../../../hooks/useSettings";
import { PhaseStepper } from "../../Faculty/PhaseStepper";
import {
  OPCRHeaderSection,
  OfficerInfoSection,
  OPCRSignaturesSection,
  OPCRFinalRatingsSection,
  OPCRDownloadButton,
  OPCRTaskSection,
  OPCRLoadingSpinner,
} from "./OPCRShared";

function OtherDraftedOPCR() {
  const { opcr_id } = useParams();
  const [searchParams] = useSearchParams();
  const dept_id = searchParams.get("dept_id");

  const {
    opcrInfo,
    assignedData,
    headData,
    stats,
    downloading,
    ratingThresholds,
    loadOPCR,
    downloadPlanned,
    handleRemarks,
    isRatingPhase,
    isMonitoringPhase,
  } = usePlannedOPCR({ dept_id });

  const { settings } = useSettings();
  const currentPhase = settings?.current_phase ?? null;

  useEffect(() => {
    loadOPCR();

    socket.on("ipcr", loadOPCR);
    socket.on("ipcr_added", loadOPCR);
    socket.on("rating", loadOPCR);
    socket.on("opcr_created", loadOPCR);

    return () => {
      socket.off("ipcr", loadOPCR);
      socket.off("ipcr_added", loadOPCR);
      socket.off("rating", loadOPCR);
      socket.off("opcr_created", loadOPCR);
    };
  }, [dept_id]);

  if (!opcrInfo) return <OPCRLoadingSpinner />;

  return (
    <div className="py-4" style={{ minWidth: "1200px" }}>
      <PhaseStepper currentPhase={currentPhase} />

      {/* Action Bar */}
      <div className="d-flex justify-content-end align-items-center mb-4 gap-2">
        <OPCRDownloadButton
          onDownload={downloadPlanned}
          downloading={downloading}
          label="Download OPCR"
          options={[{ value: "planned", label: "Planned OPCR" }]}
        />
      </div>

      {/* Main Card */}
      <div className="container-fluid border rounded">
        <div className="card-body p-4">
          <OPCRHeaderSection />
          <OfficerInfoSection headData={headData} />

          <div className="table-responsive mt-5 mb-4">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "15%", textAlign: "center" }}>OUTPUT</th>
                  <th style={{ width: "20%", textAlign: "center" }}>
                    SUCCESS INDICATORS<br />
                    <small className="text-muted">(TARGETS + MEASURES)</small>
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>INDIVIDUALS ACCOUNTABLE</th>
                  <th style={{ width: "20%", textAlign: "center" }}>ACTUAL ACCOMPLISHMENT</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    RATING<br />
                    <small className="text-muted">Q² E² T² A²</small>
                  </th>
                  <th style={{ width: "15%", textAlign: "center" }}>REMARKS</th>
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
                      isRatingPhase={isRatingPhase(currentPhase)}
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

          <OPCRSignaturesSection headData={headData} />
        </div>
      </div>
    </div>
  );
}

export default OtherDraftedOPCR;
