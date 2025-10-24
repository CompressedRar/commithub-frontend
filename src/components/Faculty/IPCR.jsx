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
      className="container-fluid py-3 px-3 bg-white rounded-3 shadow-sm border position-relative"
      style={{ transition: "all 0.2s ease-in-out" }}
    >
      {/* Supporting Docs */}
      <ManageSupportingDocuments ipcr_id={ipcr.id} batch_id={ipcr.batch_id} />

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary fs-6">
            {ipcr.form_status.toUpperCase()}
          </span>
        </div>

        <small className="text-muted">{new Date(ipcr.created_at).toLocaleDateString()}</small>
      </div>

      {/* Main Info */}
      {!dept_mode ? (
        <div
          className="d-flex align-items-center gap-3 text-secondary cursor-pointer"
          onClick={onClick}
          role="button"
        >
          <span className="material-symbols-outlined text-primary fs-3">contract</span>
          <div>
            <h6 className="fw-semibold mb-0">IPCR #{ipcr.id}</h6>
            <small className="text-muted">Click to view details</small>
          </div>
        </div>
      ) : (
        <div
          className="d-flex align-items-center gap-3 cursor-pointer"
          onClick={onClick}
          data-bs-toggle="modal"
          data-bs-target="#view-ipcr"
          role="button"
          onMouseOver={onMouseOver}
        >
          <div
            className="rounded-circle border bg-light flex-shrink-0"
            style={{
              backgroundImage: `url('${ipcr.user.profile_picture_link}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "50px",
              height: "50px",
            }}
          ></div>
          <div>
            <h6 className="fw-semibold mb-0">IPCR #{ipcr.id}</h6>
            <small className="text-muted">
              {ipcr.user.first_name + " " + ipcr.user.last_name}
            </small>
          </div>
        </div>
      )}

      {/* Divider */}
      <hr className="my-3" />

      {/* Buttons */}
      <div className="d-flex flex-wrap justify-content-end gap-2">
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
          <span className="material-symbols-outlined fs-5">
            {archiving ? "refresh" : "archive"}
          </span>
          {!archiving && "Archive"}
        </button>

        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          data-bs-toggle="modal"
          data-bs-target="#manage-docs"
        >
          <span className="material-symbols-outlined fs-5">attach_file</span>
          Documents
        </button>
      </div>
    </div>
  );
}

export default IPCR;
