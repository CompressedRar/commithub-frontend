import { useState } from "react";
import { archiveIprc, downloadIPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";

function DeptIPCR(props) {
  const [optionsOpen, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [archiving, setArchiving] = useState(false);

  async function handleArchive() {
    setArchiving(true);
    try {
      const res = await archiveIprc(props.ipcr.ipcr.id);
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

  async function archiveIPCR() {
    Swal.fire({
      title: "Archive",
      text: "Do you want to archive this IPCR?",
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
      const res = await downloadIPCR(props.ipcr.ipcr.id);
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
    <div
      className="ipcr-wrapper border rounded-3 p-3 mb-3 shadow-sm bg-white"
      onMouseLeave={() => setOpen(false)}
    >
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        {/* Profile + Info */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle border"
            style={{
              width: "50px",
              height: "50px",
              backgroundImage: `url('${props.ipcr.member.profile_picture_link}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>

          <div className="d-flex flex-column">
            <h6 className="mb-0 fw-semibold">
              {props.ipcr.ipcr ? "IPCR - " : ""}
              {props.ipcr.member.first_name} {props.ipcr.member.last_name}
            </h6>
            <small className="text-muted">
              {props.ipcr.ipcr ? "Submitted" : "Awaiting Submission"}
            </small>
          </div>
        </div>

        {/* Action Buttons */}
        {props.ipcr.ipcr ? (
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
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              data-bs-toggle="modal"
              data-bs-target={props.dept_mode ? "#manage-docs" : ""}
            >
              <span className="material-symbols-outlined">attach_file</span>
              Documents
            </button>

            <button
              className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
              onClick={props.onClick}
              data-bs-toggle="modal"
              data-bs-target="#view-ipcr"
            >
              <span className="material-symbols-outlined">view_list</span>
              View
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

export default DeptIPCR;
