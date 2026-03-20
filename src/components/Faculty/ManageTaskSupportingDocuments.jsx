import { useEffect, useState } from "react";
import { archiveDocument, generatePreSignedURL, getCompiledFromIPCR, getSupportingDocuments, recordFileUploadInfo } from "../../services/pcrServices";
import axios from "axios";
import Swal from "sweetalert2";
import { socket } from "../api";
import DocumentChecklist from "./DocumentChecklist";
import Divider from "@mui/material/Divider";



function ManageTaskSupportingDocuments({ ipcr_id, batch_id, dept_mode, sub_tasks }) {
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTask, setSelectedTask] = useState("");
  const [uploading, setUploading] = useState(false);
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  const [file, setFile] = useState(null); // Keep for compatibility or remove
  const [pendingFiles, setPendingFiles] = useState([]);


  const [compiling, setCompiling] = useState(false)

  async function loadDocuments() {
    try {
      const res = await getSupportingDocuments(ipcr_id);
      setDocuments(res.data);
      console.log("IPCR DOCUEMTNGS", res.data)
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
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        Swal.fire("File too large", `${f.name} exceeds 50MB`, "warning");
        return false;
      }
      return true;
    });

    // Map files to include metadata fields
    const newPending = validFiles.map(f => ({
      fileObject: f,
      title: f.name,
      desc: "",
      eventDate: new Date().toISOString().split('T')[0]
    }));

    setPendingFiles([...pendingFiles, ...newPending]);
    e.target.value = null; // Reset input so user can add more
  };

  const updatePendingMetadata = (index, field, value) => {
    const updated = [...pendingFiles];
    updated[index][field] = value;
    setPendingFiles(updated);
  };

  const removePendingFile = (index) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index));
  };

  const handleCompile = async () => {
    try {
      setCompiling(true)
      let link = await getCompiledFromIPCR(ipcr_id)
        .then((d) => {
          const url = window.URL.createObjectURL(new Blob([d.data]));
          const link = document.createElement('a');
          link.href = url;

          // You can name the file here
          link.setAttribute('download', `Compiled_Report_${ipcr_id}.docx`);

          document.body.appendChild(link);
          link.click();

          // 4. Cleanup: remove the link and revoke the temporary URL
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
          Swal.fire("Error", "No Images to Compile", "error")
          setCompiling(false)
        });

      setCompiling(false)

    }
    catch (error) {
      console.log(error)
      Swal.fire("Error", "No Images to Compile", "error")
      setCompiling(false)
    }
  }

  const uploadFile = async () => {
  if (pendingFiles.length === 0) return Swal.fire("Error", "No files selected", "error");
  if (!selectedTask) return Swal.fire("Select Task", "Please select a task", "warning");
 
  setUploading(true);
  try {
    for (const item of pendingFiles) {
 
      // 1. Request presigned URL — backend validates MIME type and returns a UUID key
      const res = await generatePreSignedURL({
        fileName: item.fileObject.name,   // sent for display_name sanitisation only
        fileType: item.fileObject.type,   // validated against allowlist on backend
      });
 
      // 2. Upload directly to S3 using the presigned URL
      await axios.put(res.data.link, item.fileObject, {
        headers: { "Content-Type": item.fileObject.type },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
 
      // 3. Record in DB — use res.data.key (UUID path) not the raw filename
      await recordFileUploadInfo({
        fileName:  res.data.key,           // <-- UUID-based S3 key, e.g. "documents/uuid.pdf"
        fileType:  item.fileObject.type,
        ipcrID:    ipcr_id,
        batchID:   batch_id,
        subTaskID: selectedTask,
        title:     item.title,
        desc:      item.desc,
        eventDate: item.eventDate,
      });
    }
 
    Swal.fire("Success", "All files uploaded successfully", "success");
    setPendingFiles([]);
    setUploadProgress(0);
    loadDocuments();
    socket.emit("document");
 
  } catch (error) {
    // Show the backend's validation error (e.g. "File type not allowed")
    const msg = error.response?.data?.error || error.message;
    Swal.fire("Upload Failed", msg, "error");
  } finally {
    setUploading(false);
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
    console.log("TASKS", sub_tasks)
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
        <div className="modal-content shadow-lg border-0 rounded-3">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white border-0">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="manageDocsLabel">
              <span className="material-symbols-outlined">folder_open</span>
              Manage Supporting Documents
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4">
            {/* Document Checklist */}
            {!dept_mode && (
              <DocumentChecklist sub_tasks={sub_tasks} documents={documents} />
            )}

            {/* Upload Section */}
            {!dept_mode && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light fw-bold">Upload Supporting Documents</div>
                <div className="card-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">1. Select Task</label>
                      <select
                        className="form-select"
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                      >
                        <option value="">-- Select Target Task --</option>
                        {Object.entries(sub_tasks).map(([cat, tasks]) => (
                          <optgroup key={cat} label={cat}>
                            {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">2. Add Files</label>
                      <input type="file" className="form-control" multiple onChange={handleFileChange} />
                    </div>
                  </div>

                  {pendingFiles.length > 0 && (
                    <div className="table-responsive border rounded mb-3">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-primary">
                          <tr>
                            <th style={{ width: '25%' }}>File Name</th>
                            <th style={{ width: '25%' }}>Title</th>
                            <th style={{ width: '30%' }}>Description</th>
                            <th style={{ width: '15%' }}>Date</th>
                            <th style={{ width: '5%' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingFiles.map((item, index) => (
                            <tr key={index}>
                              <td className="small text-truncate" style={{ maxWidth: '150px' }}>{item.fileObject.name}</td>
                              <td>
                                <input
                                  type="text" className="form-control form-control-sm"
                                  value={item.title}
                                  onChange={(e) => updatePendingMetadata(index, 'title', e.target.value)}
                                />
                              </td>
                              <td>
                                <textarea
                                  rows="1" className="form-control form-control-sm"
                                  value={item.desc}
                                  onChange={(e) => updatePendingMetadata(index, 'desc', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="date" className="form-control form-control-sm"
                                  value={item.eventDate}
                                  onChange={(e) => updatePendingMetadata(index, 'eventDate', e.target.value)}
                                />
                              </td>
                              <td>
                                <button className="btn btn-link text-danger p-0" onClick={() => removePendingFile(index)}>
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button
                    className="btn btn-primary w-100"
                    onClick={uploadFile}
                    disabled={uploading || pendingFiles.length === 0 || !selectedTask}
                  >
                    {uploading ? `Uploading (${uploadProgress}%)...` : `Upload ${pendingFiles.length} Document(s)`}
                  </button>
                </div>
              </div>
            )}

            {/* Uploaded Files Section */}
            <div>
              <div className="d-flex justify-content-between m-2">
                <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-success">folder_managed</span>
                  Uploaded Files ({documents.filter(d => d.status === 1).length})
                </h6>

                {
                  false &&
                  <button className="btn btn-outline-primary d-flex" disabled={compiling} onClick={() => {
                    if (!compiling) handleCompile();
                  }}>

                    {compiling ? <span className="spinner-border spinner-border-sm me-2"></span>
                      :
                      <>
                        <span className="material-symbols-outlined">download</span>
                        Download Compiled Images
                      </>}
                  </button>
                }
              </div>

              <div className="list-group">
                {documents && documents.length > 0 ? (
                  documents
                    .filter((doc) => doc.status === 1)
                    .map((doc) => (
                      <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center p-3 border-primary">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <span className="material-symbols-outlined text-primary fs-5">description</span>
                          <div className="flex-grow-1">
                            <div className="fw-bold text-dark">{doc.title}</div>

                            <div className="fw-light small text-dark">{doc.file_name}</div>
                            <small className="text-muted d-block">
                              {doc.task_name}
                              <Divider></Divider>
                              <span className="fw-semibold">Description:</span> {doc.desc || "None"}
                              <Divider></Divider>
                              <span className="fw-semibold">Event Date:</span> {new Date(doc.created_at).toUTCString().split(' ').slice(0, 4).join(' ')}</small>
                          </div>
                        </div>

                        <div className="d-flex gap-2 ms-2">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => download(doc.download_url)}
                            title="Download file"
                          >
                            <span className="material-symbols-outlined">download</span>
                            <span className="d-none d-md-inline">Download</span>
                          </button>
                          {!dept_mode && (
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              onClick={() => removeDocument(doc.id)}
                              title="Remove file"
                            >
                              <span className="material-symbols-outlined">delete</span>
                              <span className="d-none d-md-inline">Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="alert alert-info mb-0 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">info</span>
                    <span>No uploaded documents yet.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-top-0">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageTaskSupportingDocuments;