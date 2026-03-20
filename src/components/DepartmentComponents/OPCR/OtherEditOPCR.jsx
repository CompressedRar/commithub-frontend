import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { socket } from "../../api";
import { useOPCR } from "../../../hooks/useOPCR";
import { useCanEval } from "../../../hooks/useCanEval";
import { useSettings } from "../../../hooks/useSettings";
import ManageDeptSupportingDocuments from "../../Faculty/ManageDeptSupportingDocuments";
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
import CalculateRatingButton from "../../Faculty/IPCR/Header/CalculateRatingButton";

function OtherEditOPCR() {
  const { opcr_id } = useParams();
  const [searchParams] = useSearchParams();
  const dept_id = searchParams.get("dept_id");

  const {
    opcrInfo,
    assignedData,
    headData,
    stats,
    downloading,
    mainTasks,
    ratingThresholds,
    setRating,
    loadOPCR,
    loadMainTasks,
    handleDownloadChange,
    handleRemarks,
    isRatingPhase,
    handleCalculateRatings,
    loading
  } = useOPCR({ opcr_id, dept_id });

  const { canEval } = useCanEval();
  const { settings } = useSettings();
  const currentPhase = settings?.current_phase ?? null;

  useEffect(() => {
    loadOPCR();
    loadMainTasks();

    socket.on("ipcr", loadOPCR);
    socket.on("rating", loadOPCR);

    return () => {
      socket.off("ipcr", loadOPCR);
      socket.off("rating", loadOPCR);
    };
  }, [opcr_id]);

  if (!opcrInfo) return <OPCRLoadingSpinner />;

  return (
    <div className="py-4" style={{ minWidth: "1200px" }}>
      <PhaseStepper currentPhase={currentPhase} />

      {/* Supporting Documents Modal */}
      {mainTasks && (
        <ManageDeptSupportingDocuments dept_id={dept_id} dept_mode={true} sub_tasks={mainTasks} />
      )}

      {/* Action Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => window.history.back()}
        >
          <span className="material-symbols-outlined">undo</span>
          Back
        </button>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#manage-dept-docs"
          >
            Documents
          </button>

          <OPCRDownloadButton
            onDownload={handleDownloadChange}
            downloading={downloading}
            label="Download OPCR"
            options={[
              { value: "opcr", label: "Standard OPCR" },
              { value: "weighted", label: "Weighted OPCR" },
              { value: "planned", label: "Planned OPCR" },
            ]}
          />

          {isRatingPhase(currentPhase) && canEval && (
            <CalculateRatingButton onCalculate={handleCalculateRatings} loading={loading} />
          )}
        </div>
      </div>

      {canEval && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-4" role="alert">
          <span className="material-symbols-outlined">info</span>
          <span>
            Only modify fields highlighted with a <strong className="text-success">green background</strong>.
          </span>
        </div>
      )}

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
                  <th style={{ width: "10%", textAlign: "center" }}>WEIGHT</th>
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
                  <th style={{ width: "10%", textAlign: "center" }}>WEIGHTED AVG</th>
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
                      canEval={canEval}
                      isRatingPhase={isRatingPhase(currentPhase)}
                      setRating={setRating}
                      showWeightedAvg={true}
                      editable={true}
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

export default OtherEditOPCR;
