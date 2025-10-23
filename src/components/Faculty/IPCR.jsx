import { useState } from "react";
import { archiveIprc, downloadIPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";
import ManageSupportingDocuments from "./ManageSupportingDocuments";

function IPCR({ ipcr, dept_mode, onClick, onMouseOver }) {
  const [downloading, setDownloading] = useState(false);
  const [archiving, setArchiving] = useState(false);

  async function handleArchive() {
    setArchiving(true);
    try {
      const res = await archiveIprc(ipcr.id);
      Swal.fire({
        title: "Success",
        text: res.data.message,
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Something went wrong.",
        icon: "error",
      });
    } finally {
      setArchiving(false);
    }
  }

  function confirmArchive() {
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
      const res = await downloadIPCR(ipcr.id);
      window.open(res.data.link, "_blank", "noopener,noreferrer");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Download failed.",
        icon: "error",
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="container p-3"
      style={{
        boxShadow:
          "0 6px 15px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
      }}
    >
        <ManageSupportingDocuments ipcr_id = {ipcr.id} batch_id = {ipcr.batch_id}></ManageSupportingDocuments>
      <div className="card-body" onMouseOver={dept_mode ? onMouseOver : null}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary">
              {ipcr.form_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* IPCR Info */}
        {!dept_mode ? (
          <div
            className="d-flex align-items-center gap-2 text-secondary"
            onClick={onClick}
            role="button"
          >
            <span className="material-symbols-outlined text-primary fs-4">contract</span>
            <div>
              <div className="fw-semibold">IPCR #{ipcr.id}</div>
              <small className="text-muted">{ipcr.created_at}</small>
            </div>
          </div>
        ) : (
          <div
            className="d-flex align-items-center gap-3"
            onClick={onClick}
            data-bs-toggle="modal"
            data-bs-target="#view-ipcr"
            role="button"
          >
            <div
              className="rounded-circle bg-light border"
              style={{
                backgroundImage: `url('${ipcr.user.profile_picture_link}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "45px",
                height: "45px",
              }}
            ></div>
            <div>
              <div className="fw-semibold">IPCR #{ipcr.id}</div>
              <small className="text-muted">
                {ipcr.user.first_name + " " + ipcr.user.last_name}
              </small>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="d-flex justify-content-end gap-2 mt-3 border-top pt-2">
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            onClick={download}
            disabled={downloading}
          >
            <span className="material-symbols-outlined fs-5">
              {downloading ? "refresh" : "download"}
            </span>
            {!downloading && "Download"}
          </button>

          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
            onClick={confirmArchive}
            disabled={archiving}
          >
            <span className="material-symbols-outlined fs-5">archive</span>
            {!archiving && "Archive"}
          </button>

          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            data-bs-toggle="modal"
            data-bs-target={"#manage-docs"}
          >
            <span className="material-symbols-outlined fs-5">attach_file</span>
            Documents
          </button>
        </div>
      </div>
    </div>
  );
}

export default IPCR;
