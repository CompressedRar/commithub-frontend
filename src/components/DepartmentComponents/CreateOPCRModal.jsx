import { useEffect, useState } from "react";
import { getDepartmentIPCR } from "../../services/departmentService";
import { createOPCR } from "../../services/pcrServices";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import { socket } from "../api";

function CreateOPCRModal({ deptid }) {
  const [allIPCR, setAllIPCR] = useState([]);

  async function loadIPCR() {
    try {
      const res = await getDepartmentIPCR(deptid);
      const data = res.data || [];

      const filtered = data.filter(
        (item) => item.ipcr && item.ipcr.status === 1 && item.ipcr.form_status === "submitted"
      );
      setAllIPCR(filtered);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to load IPCRs", "error");
    }
  }

  async function submission(selectedIds) {
    try {
      const res = await createOPCR(deptid, { ipcr_ids: selectedIds });
      const msg = res.data.message;

      Swal.fire({
        title: msg.includes("successfully") ? "Success" : "Error",
        text: msg,
        icon: msg.includes("successfully") ? "success" : "error",
      });

      const modalEl = document.getElementById("create-opcr");
      const modal = Modal.getOrCreateInstance(modalEl);
      modal.hide();

      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    } catch (error) {
      Swal.fire("Error", error.response?.data?.error || "Failed to create OPCR", "error");
    }
  }

  const handleSubmission = () => {
    const selected = Array.from(document.querySelectorAll(".ipcr-checkbox:checked")).map(
      (el) => el.id
    );

    if (selected.length === 0)
      return Swal.fire("Error", "Select at least one IPCR.", "error");

    Swal.fire({
      title: "Create OPCR",
      text: "Do you want to create OPCR with the selected IPCR(s)?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((res) => {
      if (res.isConfirmed) submission(selected);
    });
  };

  useEffect(() => {
    loadIPCR();
    socket.on("ipcr", loadIPCR);
    socket.on("opcr", loadIPCR);
    return () => {
      socket.off("ipcr", loadIPCR);
      socket.off("opcr", loadIPCR);
    };
  }, []);

  return (
    <div
      className="modal fade"
      id="create-opcr"
      tabIndex="-1"
      aria-labelledby="createOPCRLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow-lg outlined-4">
          <div className="modal-header bg-primary text-white outlined-top-4 py-3 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="createOPCRLabel">
              <span className="material-symbols-outlined fs-4">assignment</span>
              Create OPCR
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
          </div>

          <div className="modal-body px-4 py-4">
            <p className="text-muted mb-4">
              <span className="material-symbols-outlined me-1 align-middle text-primary">
                info
              </span>
              Select IPCRs to include in the OPCR.
            </p>

            {allIPCR.length === 0 ? (
              <div className="text-center text-secondary py-5 fs-6 fw-semibold">
                No IPCRs found.
              </div>
            ) : (
              <div className="row g-3">
                {allIPCR.map((item) => (
                  <div className="col-sm-6 col-md-4" key={item.ipcr.id}>
                    <div className="ipcr-card position-relative">
                      <input
                        type="checkbox"
                        className="ipcr-checkbox position-absolute"
                        id={item.ipcr.id}
                        checked
                      />
                      <label
                        htmlFor={item.ipcr.id}
                        className="ipcr-label card shadow border-1 outlined-3 p-3 h-100"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined text-primary">
                              assignment_ind
                            </span>
                            <span className="fw-semibold">IPCR #{item.id}</span>
                          </div>
                          {item.ipcr.isMain && (
                            <span className="badge bg-success px-2 py-1">MAIN</span>
                          )}
                        </div>

                        <div className="text-muted small mb-1">
                          Status:{" "}
                          <span className="fw-semibold text-success">
                            {item.ipcr.form_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="fw-semibold fs-6">
                          {item.ipcr.user.first_name} {item.ipcr.user.last_name}
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer border-0 px-4 pb-4">
            <button type="button" className="btn btn-light px-4" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" className="btn btn-primary px-4" onClick={handleSubmission}>
              Create OPCR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOPCRModal;
