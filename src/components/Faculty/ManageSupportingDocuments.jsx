import { useEffect, useState } from "react";
import { archiveDocument, generatePreSignedURL, getSupportingDocuments, recordFileUploadInfo } from "../../services/pcrServices";
import axios from "axios";
import Swal from "sweetalert2";
import { socket } from "../api";

function ManageSupportingDocuments({ ipcr_id, batch_id, dept_mode }) {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  async function loadDocuments() {
    try {
      const res = await getSupportingDocuments(ipcr_id);
      setDocuments(res.data);
      console.log("Loaded documents:", res.data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to load documents.",
        icon: "error",
      });
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      Swal.fire({
        title: "File too large",
        text: "Maximum upload size is 50 MB.",
        icon: "warning",
      });
      e.target.value = null;
      return;
    }
    setFile(selectedFile);
  };

  const uploadFile = async () => {
    if (!file) {
      return Swal.fire({
        title: "Empty File",
        text: "You must add a file to upload.",
        icon: "error",
      });
    }

    try {
      // Step 1: Request pre-signed URL
      const res = await generatePreSignedURL({ fileName: file.name, fileType: file.type });
      const uploadUrl = res.data.link;

      // Step 2: Upload file to S3
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        },
      });

      // Step 3: Record upload info in database
      const uploadRes = await recordFileUploadInfo({
        fileName: file.name,
        fileType: file.type,
        ipcrID: ipcr_id,
        batchID: batch_id,
      });

      Swal.fire({
        title: "Success",
        text: uploadRes.data.message,
        icon: "success",
      });

      // Reset
      setFile(null);
      setUploadProgress(0);
      document.getElementById("support").value = null;
      loadDocuments();
      socket.emit("document");

    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "File upload failed.",
        icon: "error",
      });
    }
  };

  const download = (link) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleRemove = async (document_id) => {
    try {
      const res = await archiveDocument(document_id);
      Swal.fire({
        title: "Success",
        text: res.data.message,
        icon: "success",
      });
      loadDocuments();
      socket.emit("document");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to remove document.",
        icon: "error",
      });
    }
  };

  const removeDocument = (document_id) => {
    Swal.fire({
      title: "Remove Document",
      text: "Do you want to remove this document?",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancel",
      icon: "warning",
    }).then((result) => {
      if (result.isConfirmed) handleRemove(document_id);
    });
  };

  useEffect(() => {
    loadDocuments();
    socket.on("document", loadDocuments);
    return () => socket.off("document", loadDocuments);
  }, []);

  return (
    <div
      className="modal fade"
      id="manage-docs"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="manageDocsLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-semibold" id="manageDocsLabel">
              Manage Supporting Documents
              
            </h5>
            
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            {/* Upload Section */}
            
            {!dept_mode? <>
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
              <input
                type="file"
                className="form-control w-100 w-md-auto"
                id="support"
                onChange={handleFileChange}
              />
              
              <button className="btn btn-success d-flex align-items-center gap-2" onClick={uploadFile}>
                <span className="material-symbols-outlined">upload</span>
                Upload Document
              </button>
              
            </div>
            <small className="text-muted">
                Please upload documents that support your accomplishments or tasks — e.g., attendance sheets, screenshots, certificates, or reports. Limit: 50 MB per file.
            </small></>:""}
            

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="mb-3">
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {uploadProgress}%
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            <div className="uploaded-documents-container">
              <h5 className="fw-semibold mb-3">Uploaded Files</h5>
              <div className="list-group">
                {documents && documents.length > 0 ? (
                  documents
                    .filter((doc) => doc.status === 1)
                    .map((doc) => (
                      <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <span className="material-symbols-outlined text-primary">description</span>
                          <div>
                            <div className="fw-semibold">{doc.file_name}</div>
                            <small className="text-muted">{doc.file_type}</small>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => download(doc.download_url)}
                          >
                            <span className="material-symbols-outlined">download</span>
                            Download
                          </button>
                          {!dept_mode && (
                            <button
                              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                              onClick={() => removeDocument(doc.id)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-muted fst-italic text-center py-3">
                    No uploaded documents yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageSupportingDocuments;
