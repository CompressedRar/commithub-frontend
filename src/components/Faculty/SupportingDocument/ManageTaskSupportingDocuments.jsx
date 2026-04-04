import {
  Badge, Box, Button, Chip, Divider,
  Stack, Tooltip, Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import { getCompiledFromIPCR, getPresentationFromIPCR } from "../../../services/pcrServices";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

import { useDocuments } from "./hook/useDocuments";
import DocumentChecklist from "../DocumentChecklist";
import UploadPanel from "./UploadPanel";
import DocumentList from "./DocumentList";
import { socket } from "../../api";

function ManageTaskSupportingDocuments({ ipcr_id, batch_id, dept_mode, sub_tasks }) {
  const [compiling, setCompiling] = useState(false);

  const {
    activeDocuments, validDocuments, pendingDocuments, rejectedDocuments,
    filteredDocuments,
    groupedDocuments,
    loading,
    removeDocument,
    loadDocuments,
    search, setSearch,
    filterType, setFilterType,
    filterTask, setFilterTask,
    filterStatus, setFilterStatus,
    fileTypes,
    taskNames,
    handleApproveDocument, handleRejectDocument
  } = useDocuments({ mode: "ipcr", ipcr_id });

  const handleCompile = async () => {
    try {
      setCompiling(true);
      const d = await getCompiledFromIPCR(ipcr_id);
      const url = window.URL.createObjectURL(new Blob([d.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Compiled_Report_${ipcr_id}.docx`);
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire("Error", "No documents to compile.", "error");
    } finally {
      setCompiling(false);
    }
  };

  const handlePresentation = async () => {
    try {
      setCompiling(true);
      const d = await getPresentationFromIPCR(ipcr_id);
      const url = window.URL.createObjectURL(new Blob([d.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Compiled_Report_${ipcr_id}.pptx`);
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire("Error", "No documents to compile.", "error");
    } finally {
      setCompiling(false);
    }
  };

  
  useEffect(() => {
    loadDocuments();
    socket.on("document", loadDocuments);
    socket.on(`document-${ipcr_id}`, ()=> {
      loadDocuments();
      console.log("socket message detected for document changes")
    });
  }, [ipcr_id]);

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
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-3">

          {/* Header */}
          <div className="modal-header border-0 pb-0 px-4 pt-4 gap-2">
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
              <FolderOpenIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Supporting Documents</Typography>
              <Chip label={activeDocuments.length} size="small" color="primary" />
            </Stack>


            
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <Divider sx={{ mx: 3, mt: 2 }} />

          {/* Body */}
          <div className="modal-body px-4 py-3">
            {!dept_mode && (
              <Box mb={3}>
                <DocumentChecklist sub_tasks={sub_tasks} documents={activeDocuments} validDocuments={validDocuments} pendingDocuments={pendingDocuments} rejectedDocuments={rejectedDocuments} />
              </Box>
            )}

            {!dept_mode && (
              <UploadPanel
                subTasks={sub_tasks}
                ipcr_id={ipcr_id}
                batch_id={batch_id}
                onUploaded={loadDocuments}
              />
            )}

            <div className="d-flex justify-content-between">
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>Uploaded Files</Typography>
                <Chip label={activeDocuments.length} size="small" color="success" />
              </Stack>
              {
                !compiling ?
                  <Stack direction={"row"} spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Download compiled report (.docx)">
                        <span>
                          <Button
                            size="small" variant="outlined"
                            startIcon={compiling
                              ? <span className="spinner-border spinner-border-sm" />
                              : <SimCardDownloadIcon />}
                            onClick={handleCompile}
                            disabled={compiling || validDocuments.length === 0}
                          >
                            {compiling ? "Compiling…" : "Compile into DOCX"}
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Download compiled report (.docx)">
                        <span>
                          <Button
                            size="small" variant="outlined"
                            startIcon={compiling
                              ? <span className="spinner-border spinner-border-sm" />
                              : <SimCardDownloadIcon />}
                            onClick={handlePresentation}
                            disabled={compiling || validDocuments.length === 0}
                          >
                            {compiling ? "Compiling…" : "Compile to PPTX"}
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  : <Button
                    size="small" variant="outlined"
                    startIcon={<span className="spinner-border spinner-border-sm" />
                    }
                    disabled={compiling || activeDocuments.length === 0}
                  >
                    {"Compiling…"}
                  </Button>
              }
            </div>

            <DocumentList
              groupedDocuments={groupedDocuments}
              activeDocuments={activeDocuments}
              filteredDocuments={filteredDocuments}
              loading={loading}
              deptMode={dept_mode}
              onRemove={removeDocument}
              search={search} setSearch={setSearch}
              filterType={filterType} setFilterType={setFilterType}
              filterTask={filterTask} setFilterTask={setFilterTask}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              fileTypes={fileTypes}
              taskNames={taskNames}
              onApprove={handleApproveDocument}
              onReject={handleRejectDocument}

            />
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 pt-0">
            <Button variant="text" color="inherit" data-bs-dismiss="modal">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageTaskSupportingDocuments;