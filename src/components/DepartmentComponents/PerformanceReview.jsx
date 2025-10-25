import { useEffect, useState } from "react";
import {
  getDepartmentIPCR,
  getDepartmentOPCR,
} from "../../services/departmentService";
import EditIPCR from "../Faculty/EditIPCR";
import ManageSupportingDocuments from "../Faculty/ManageSupportingDocuments";
import EditOPCR from "./EditOPCR";
import Swal from "sweetalert2";
import DeptIPCR from "./DeptIPCR";
import DeptOPCR from "./DeptOPCR";
import OPCRSupportingDocuments from "./OPCRSupportingDocuments";
import { createOPCR } from "../../services/pcrServices";
import { socket } from "../api";

function PerformanceReviews({ deptid }) {
  const [allIPCR, setAllIPCR] = useState([]);
  const [allOPCR, setAllOPCR] = useState([]);
  const [currentIPCRID, setCurrentIPCRID] = useState(null);
  const [currentOPCRID, setCurrentOPCRID] = useState(null);
  const [batchID, setBatchID] = useState(null);
  const [filteredID, setFilteredID] = useState([]);
  const [consolidating, setConsolidating] = useState(false);

  async function loadIPCR() {
    try {
      const res = await getDepartmentIPCR(deptid);
      const data = res.data || [];
      setAllIPCR(data);

      const submitted = data
        .filter(
          (item) => item.ipcr && item.ipcr.status === 1 && item.ipcr.form_status === "submitted"
        )
        .map((i) => i.ipcr.id);

      setFilteredID(submitted);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to load IPCRs", "error");
    }
  }

  async function loadOPCR() {
    try {
      const res = await getDepartmentOPCR(deptid);
      const data = res.data.filter((opcr) => opcr.status === 1);
      setAllOPCR(data);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to load OPCRs", "error");
    }
  }

  const handleSubmission = () => {
    if (filteredID.length === 0)
      return Swal.fire("Error", "The office must have at least one submitted IPCR.", "error");

    Swal.fire({
      title: "Create OPCR",
      text: "Do you want to consolidate all submitted IPCRs?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((res) => {
      if (res.isConfirmed) submission();
    });
  };

  async function submission() {
    setConsolidating(true);
    try {
      const res = await createOPCR(deptid, { ipcr_ids: filteredID });
      const msg = res.data.message;
      Swal.fire({
        title: msg.includes("successfully") ? "Success" : "Error",
        text: msg,
        icon: msg.includes("successfully") ? "success" : "error",
      });
      loadOPCR();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to create OPCR", "error");
    } finally {
      setConsolidating(false);
    }
  }

  useEffect(() => {
    loadIPCR();
    loadOPCR();

    const reload = () => {
      loadIPCR();
      loadOPCR();
    };

    socket.on("ipcr_create", reload);
    socket.on("opcr", reload);
    socket.on("ipcr", reload);
    socket.on("assign", reload);

    return () => {
      socket.off("ipcr_create", reload);
      socket.off("opcr", reload);
      socket.off("ipcr", reload);
      socket.off("assign", reload);
    };
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* === Modals === */}
      {currentOPCRID && (
        <OPCRSupportingDocuments key={currentOPCRID} opcr_id={currentOPCRID} />
      )}
      {batchID && currentIPCRID && (
        <ManageSupportingDocuments
          dept_mode={true}
          key={currentIPCRID}
          ipcr_id={currentIPCRID}
          batch_id={batchID}
        />
      )}

      {/* View IPCR Modal */}
      <div
        className="modal fade"
        id="view-ipcr"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {currentIPCRID && (
                <EditIPCR
                  dept_id={deptid}
                  key={currentIPCRID}
                  ipcr_id={currentIPCRID}
                  mode="check"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View OPCR Modal */}
      <div
        className="modal fade"
        id="view-opcr"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {currentOPCRID && (
                <EditOPCR dept_id={deptid} opcr_id={currentOPCRID} mode="dept" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === Page Header === */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <h3 className="fw-semibold text-dark m-0 d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-primary">workspace_premium</span>
          Performance Reviews
        </h3>

        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={handleSubmission}
          disabled={consolidating}
        >
          {consolidating ? (
            <>
              <span className="spinner-border spinner-border-sm"></span>
              Consolidating...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">sync_alt</span>
              Consolidate IPCRs
            </>
          )}
        </button>
      </div>

      {/* === OPCR Section === */}
      <section className="mb-5">
        <h5 className="fw-semibold text-secondary mb-3">
          Office Performance Commitment and Review (OPCR)
        </h5>

        <div className="d-flex flex-column gap-3">
          {allOPCR.length > 0 ? (
            allOPCR.map((opcr) => (
              <DeptOPCR
                key={opcr.id}
                opcr={opcr}
                onClick={() => setCurrentOPCRID(opcr.id)}
                onMouseOver={() => setCurrentOPCRID(opcr.id)}
              />
            ))
          ) : (
            <div className="text-center text-muted py-5">
              <span className="material-symbols-outlined fs-1 d-block mb-2">file_copy_off</span>
              No OPCRs Found
            </div>
          )}
        </div>
      </section>

      {/* === IPCR Section === */}
      <section>
        <h5 className="fw-semibold text-secondary mb-3">
          Individual Performance Commitment and Review (IPCR)
        </h5>

        <div className="d-flex flex-column gap-3">
          {allIPCR.length > 0 ? (
            allIPCR.map((ipcr) => (
              <DeptIPCR
                key={ipcr.id}
                ipcr={ipcr}
                dept_mode={true}
                onMouseOver={() => {
                  setBatchID(ipcr.batch_id);
                  setCurrentIPCRID(ipcr.id);
                }}
                onClick={() => setCurrentIPCRID(ipcr.id)}
              />
            ))
          ) : (
            <div className="text-center text-muted py-5">
              <span className="material-symbols-outlined fs-1 d-block mb-2">file_copy_off</span>
              No IPCRs Found
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PerformanceReviews;
