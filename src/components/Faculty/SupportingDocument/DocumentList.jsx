import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DocumentCard from "./DocumentCard";
import DocumentSearchBar from "./DocumentSearchBar";

function TaskSection({ taskName, userGroups, deptMode, onRemove }) {
  const [open, setOpen] = useState(true);
  const total = Object.values(userGroups).reduce((acc, docs) => acc + docs.length, 0);

  return (
    <Box mb={2}>
      {/* Task header */}
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 1.5,
          bgcolor: "primary.50",
          border: "1px solid",
          borderColor: "primary.100",
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { bgcolor: "primary.100" },
        }}
      >
        <FolderOpenIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ flex: 1 }}>
          {taskName}
        </Typography>
        <Chip label={total} size="small" color="primary" />
        <IconButton size="small">
          {open ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box pl={1} pt={1}>
          {Object.entries(userGroups).map(([userName, docs]) => (
            <Box key={userName} mb={1.5}>
              {/* User sub-header */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                mb={1}
                sx={{ px: 1 }}
              >
                <PersonOutlineIcon fontSize="small" color="action" />
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {userName}
                </Typography>
                <Chip label={docs.length} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
                <Divider sx={{ flex: 1 }} />
              </Stack>

              {docs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  deptMode={deptMode}
                  onRemove={onRemove}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function DocumentList({
  groupedDocuments,
  activeDocuments,
  filteredDocuments,
  loading,
  deptMode,
  onRemove,
  // search/filter props
  search,
  setSearch,
  filterType,
  setFilterType,
  filterTask,
  setFilterTask,
  fileTypes,
  taskNames,
}) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search & Filter Bar */}
      <DocumentSearchBar
        search={search}
        setSearch={setSearch}
        filterType={filterType}
        setFilterType={setFilterType}
        filterTask={filterTask}
        setFilterTask={setFilterTask}
        fileTypes={fileTypes}
        taskNames={taskNames}
        resultCount={filteredDocuments.length}
        totalCount={activeDocuments.length}
      />

      {/* Document groups */}
      {filteredDocuments.length === 0 ? (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ borderRadius: 2 }}
        >
          {activeDocuments.length === 0
            ? "No documents have been uploaded yet."
            : "No documents match the current search or filters."}
        </Alert>
      ) : (
        Object.entries(groupedDocuments).map(([taskName, userGroups]) => (
          <TaskSection
            key={taskName}
            taskName={taskName}
            userGroups={userGroups}
            deptMode={deptMode}
            onRemove={onRemove}
          />
        ))
      )}
    </Box>
  );
}

export default DocumentList;
