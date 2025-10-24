import { useState } from "react";
import { archiveOprc, downloadOPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";

function DeptOPCR(props) {
  const [downloading, setDownloading] = useState(false);
  const [archiving, setArchiving] = useState(false);

  async function handleArchive() {
    setArchiving(true);
    try {
      const res = await archiveOprc(props.opcr.id);
      const msg = res.data.message;

      Swal.fire({
        title: msg.includes("successfully") ? "Success" : "Error",
        text: msg,
        icon: msg.includes("successfully") ? "success" : "error",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "An error occurred.",
        icon: "error",
      });
    }
    setArchiving(false);
  }

  async function archiveOPCR() {
    Swal.fire({
      title: "Archive",
      text: "Do you want to archive this OPCR?",
      showDenyButton: true,
      confirmButtonText: "Archive",
      confirmButtonColor: "#dc3545",
      denyButtonText: "No",
      denyButtonColor: "grey",
      icon: "warning",
    }).then((result) => {
      if (result.isConfirmed) handleArchive();
    });
  }

  async function download() {
    setDownloading(true);
    try {
      const res = await downloadOPCR(props.opcr.id);
      window.open(res.data.link, "_blank", "noopener,noreferrer");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "An error occurred.",
        icon: "error",
      });
    }
    setDownloading(false);
  }

  return (
    <div className="ipcr-wrapper border rounded-3 p-3 mb-3 shadow-sm bg-white">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        {/* Info Section */}
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              work_history
            </span>
            <h6 className="mb-0 fw-semibold">
              {props.opcr ? "OPCR - " : ""}
              {props.opcr.department}
            </h6>
          </div>
          {props.opcr && (
            <span
              className={`badge mt-2 ${
                props.opcr.form_status?.toLowerCase() === "approved"
                  ? "bg-success"
                  : props.opcr.form_status?.toLowerCase() === "pending"
                  ? "bg-warning text-dark"
                  : "bg-secondary"
              }`}
              style={{ width: "fit-content" }}
            >
              {props.opcr.form_status?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {props.opcr ? (
          <div className="d-flex flex-wrap justify-content-end gap-2">
            <button
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
              onClick={download}
              disabled={downloading}
            >
              <span className="material-symbols-outlined">
                {downloading ? "refresh" : "download"}
              </span>
              {!downloading && "Download"}
            </button>

            <button
              className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
              onClick={props.onClick}
              data-bs-toggle="modal"
              data-bs-target="#view-opcr"
            >
              <span className="material-symbols-outlined">view_list</span>
              View
            </button>

            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              onClick={archiveOPCR}
              disabled={archiving}
            >
              <span className="material-symbols-outlined">
                {archiving ? "refresh" : "archive"}
              </span>
              {!archiving && "Archive"}
            </button>
          </div>
        ) : (
          <div className="text-muted fst-italic small text-end">
            Awaiting Submission
          </div>
        )}
      </div>
    </div>
  );
}

export default DeptOPCR;
