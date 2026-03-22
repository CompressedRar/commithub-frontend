import { useMemo } from "react";
import {
  Badge, Box, Button, Chip, Divider,
  Stack, Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import { useDocuments }  from "./hook/useDocuments";
import DocumentChecklist from "../DocumentChecklist";
import UploadPanel       from "./UploadPanel";
import DocumentList      from "./DocumentList";

function ManageDeptSupportingDocuments({ dept_id, dept_mode, sub_tasks }) {
  // sub_tasks here is a flat array — group it once, stably
  // useMemo with no deps on parent re-renders (sub_tasks ref may change)
  // We JSON-stringify as dep to do a deep comparison cheaply
  const groupedSubTasks = useMemo(() => {
    if (!Array.isArray(sub_tasks)) return sub_tasks || {};
    const map = {};
    sub_tasks.forEach((task) => {
      const cat = task.category?.name || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(task);
    });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sub_tasks)]);

  const {
    activeDocuments,
    filteredDocuments,
    groupedDocuments,
    loading,
    removeDocument,
    loadDocuments,
    search,     setSearch,
    filterType, setFilterType,
    filterTask, setFilterTask,
    fileTypes,
    taskNames,
  } = useDocuments({ mode: "dept", dept_id });

  return (
    <div
      className="modal fade"
      id="manage-dept-docs"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="manageDeptDocsLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-3">

          {/* Header */}
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
              <FolderOpenIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Department Supporting Documents</Typography>
              <Chip label={activeDocuments.length} size="small" color="primary" />
            </Stack>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <Divider sx={{ mx: 3, mt: 2 }} />

          {/* Body */}
          <div className="modal-body px-4 py-3">
            <Box mb={3}>
              <DocumentChecklist sub_tasks={groupedSubTasks} documents={activeDocuments} />
            </Box>

            {!dept_mode && (
              <UploadPanel
                subTasks={groupedSubTasks}
                ipcr_id={undefined}
                batch_id={undefined}
                onUploaded={loadDocuments}
              />
            )}

            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>Uploaded Files</Typography>
              <Chip label={activeDocuments.length} size="small" color="success" />
            </Stack>

            <DocumentList
              groupedDocuments={groupedDocuments}
              activeDocuments={activeDocuments}
              filteredDocuments={filteredDocuments}
              loading={loading}
              deptMode={dept_mode}
              onRemove={removeDocument}
              search={search}           setSearch={setSearch}
              filterType={filterType}   setFilterType={setFilterType}
              filterTask={filterTask}   setFilterTask={setFilterTask}
              fileTypes={fileTypes}
              taskNames={taskNames}
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

export default ManageDeptSupportingDocuments;