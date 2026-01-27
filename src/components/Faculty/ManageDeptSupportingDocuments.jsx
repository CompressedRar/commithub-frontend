import { useEffect, useState } from "react";
import { archiveDocument, generatePreSignedURL, getDeptSupportingDocuments, getSupportingDocuments, recordFileUploadInfo } from "../../services/pcrServices";
import axios from "axios";
import Swal from "sweetalert2";
import { socket } from "../api";
import DocumentChecklist from "./DocumentChecklist";



function ManageDeptSupportingDocuments({ dept_id, dept_mode, sub_tasks }) {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTask, setSelectedTask] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mainTasks, setMainTasks] = useState(false)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  async function loadDocuments() {
    try {
      const res = await getDeptSupportingDocuments(dept_id);
      setDocuments(res.data.message);
      console.log("OPCR DOCUEMTNGS",res.data.message)
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

    if (!selectedTask) {
      return Swal.fire({
        title: "Select Task",
        text: "Please select a task for this document.",
        icon: "warning",
      });
    }

    setUploading(true);
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
        batchID: "",
        subTaskID: selectedTask,
      });

      Swal.fire({
        title: "Success",
        text: uploadRes.data.message,
        icon: "success",
      });

      // Reset
      setFile(null);
      setSelectedTask("");
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

  const groupDocumentsByUserAndTask = (docs) => {
    const grouped = {};
    
    docs
      .filter((doc) => doc.status === 1)
      .forEach((doc) => {
        const userName = doc.user_name || "Unknown User";
        const taskName = doc.task_name || "Unassigned Task";
        
        if (!grouped[userName]) {
          grouped[userName] = {};
        }
        
        if (!grouped[userName][taskName]) {
          grouped[userName][taskName] = [];
        }
        
        grouped[userName][taskName].push(doc);
      });
    
    return grouped;
  };

  const groupDocumentsByTask = (docs) => {
    const grouped = {};
    
    docs
      .filter((doc) => doc.status === 1)
      .forEach((doc) => {
        const userName = doc.user_name || "Unknown User";
        const taskName = doc.task_name || "Unassigned Task";
        
        if (!grouped[taskName]) {
          grouped[taskName] = {};
        }
        
        if (!grouped[taskName][userName]) {
          grouped[taskName][userName] = [];
        }
        
        grouped[taskName][userName].push(doc);
      });
    
    return grouped;
  };

  

  useEffect(() => {

    const all_categories = {}
    const all_category_type = {}

    
    

    sub_tasks.forEach(task => {
            const category = task.category.name
            const type = task.category.type

            all_categories[category] = all_categories[category] || []
            all_category_type[category] = type

            all_categories[category].push(task)
        })

    setMainTasks(all_categories)
    console.log("ALL CATS", all_categories)




    loadDocuments();
    socket.on("document", loadDocuments);
    return () => socket.off("document", loadDocuments);
  }, []);

  return (
    <div
      className="modal fade"
      id="manage-dept-docs"
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
            {true && (
              <DocumentChecklist sub_tasks={mainTasks} documents={documents} />
            )}

            {/* Upload Section */}
            {!dept_mode && (
              <>
                <div className="card card-body bg-light border-0 mb-4">
                  <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">cloud_upload</span>
                    Upload New Document
                  </h6>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Select File</label>
                      <input
                        type="file"
                        className="form-control"
                        id="support"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                      <small className="text-muted d-block mt-2">
                        <span className="material-symbols-outlined" style={{ fontSize: "1rem", verticalAlign: "middle" }}>info</span>
                        Maximum file size: 50 MB
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Select Task</label>
                      <select
                        className="form-select"
                        id="sub_task"
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        disabled={uploading}
                      >
                        <option value="">-- Choose a task --</option>
                        {Object.entries(sub_tasks).map(([category, tasks]) => (
                          <optgroup key={category} label={category}>
                            {tasks
                              .filter(task => task.required_documents)
                              .map((task) => (
                                <option key={task.id} value={task.id}>
                                  {task.title} {task.required_documents ? "( Required )" : ""}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success d-flex align-items-center gap-2"
                      onClick={uploadFile}
                      disabled={!file || !selectedTask || uploading}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">upload</span>
                          Upload Document
                        </>
                      )}
                    </button>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && (
                    <div className="mt-3">
                      <div className="progress" style={{ height: "24px" }}>
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                          role="progressbar"
                          style={{ width: `${uploadProgress}%` }}
                          aria-valuenow={uploadProgress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <small className="fw-semibold">{uploadProgress}%</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="my-4" />
              </>
            )}

            {/* Uploaded Files Section */}
            <div>
              <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-success">folder_managed</span>
                Uploaded Files ({documents.filter(d => d.status === 1).length})
              </h6>

              <div className="list-group">
                {documents && documents.filter(d => d.status === 1).length > 0 ? (
                  Object.entries(groupDocumentsByTask(documents)).map(([userName, tasks]) => (
                    <div key={userName} className="mb-4">
                      {/* User Header */}
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary">
                        <h6 className="mb-0 fw-bold ">{userName}</h6>
                      </div>

                      {/* Task Groups */}
                      {Object.entries(tasks).map(([taskName, docList]) => (
                        <div key={taskName} className="ms-3 mb-3">
                          {/* Task Subheader */}
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <small className="fw-semibold ">{taskName} Documents</small>
                            <span className="badge bg-primary ms-auto">{docList.length}</span>
                          </div>

                          {/* Documents */}
                          {docList.map((doc) => (
                            <div key={doc.id} className="list-group-item d-flex justify-content-between align-items-center p-3 mb-2 rounded">
                              <div className="d-flex align-items-center gap-3 flex-grow-1">
                                <span className="material-symbols-outlined text-primary fs-5">description</span>
                                <div className="flex-grow-1">
                                  <div className="fw-semibold text-dark">{doc.file_name}</div>
                                  <small className="text-muted d-block">{doc.file_type}</small>
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
                          ))}
                        </div>
                      ))}
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

export default ManageDeptSupportingDocuments;