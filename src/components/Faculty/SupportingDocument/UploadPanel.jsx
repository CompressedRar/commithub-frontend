import { useRef, useState, useCallback, memo, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadIcon   from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AttachFileIcon    from "@mui/icons-material/AttachFile";
import UploadIcon        from "@mui/icons-material/Upload";
import axios from "axios";
import Swal  from "sweetalert2";
import { generatePreSignedURL, recordFileUploadInfo } from "../../../services/pcrServices";
import { socket } from "../../api";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const formatRules = {
  pdf: [".pdf"],
  image: [".jpg", ".jpeg", ".png", ".webp"],
  excel: [".xls", ".xlsx", ".csv"],
  doc: [".doc", ".docx"],
  any: null,
  none: null,
};

const isFileAllowed = (file, format) => {
  if (!format || format === "none" || format === "any") return true;

  const allowed = formatRules[format];
  if (!allowed) return true;

  const ext = "." + file.name.split(".").pop().toLowerCase();
  return allowed.includes(ext);
};

const getAcceptString = (format) => {
  if (!format || format === "none" || format === "any") return undefined;
  
  const allowed = formatRules[format];
  return allowed ? allowed.join(",") : undefined;
};

// ── Isolated row — memo prevents sibling re-renders on every keystroke ────────
const PendingFileRow = memo(function PendingFileRow({ item, index, onUpdate, onRemove }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5, mb: 1, borderRadius: 1.5,
        display: "flex", gap: 1.5, alignItems: "flex-start",
        flexWrap: { xs: "wrap", md: "nowrap" },
      }}
    >
      <Chip
        icon={<AttachFileIcon />}
        label={item.fileObject.name}
        size="small"
        variant="outlined"
        sx={{
          maxWidth: 180, flexShrink: 0, alignSelf: "center",
          "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
        }}
      />
      <TextField
        size="small" label="Title" value={item.title}
        onChange={(e) => onUpdate(index, "title", e.target.value)}
        sx={{ flex: 2, minWidth: 120 }}
      />
      <TextField
        size="small" label="Description" value={item.desc}
        onChange={(e) => onUpdate(index, "desc", e.target.value)}
        sx={{ flex: 3, minWidth: 140 }} multiline maxRows={2}
      />
      <TextField
        size="small" label="Event Date" type="date" value={item.eventDate}
        onChange={(e) => onUpdate(index, "eventDate", e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ flex: 1, minWidth: 130 }}
      />
      <Tooltip title="Remove file">
        <IconButton size="small" color="error" onClick={() => onRemove(index)} sx={{ mt: 0.25 }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
});

// ── Main component ────────────────────────────────────────────────────────────
function UploadPanel({ subTasks, ipcr_id, batch_id, onUploaded }) {
  const fileInputRef = useRef(null);

  // All upload state is local — changing it never affects parent/siblings
  const [selectedTask,    setSelectedTask]    = useState("");
  const [pendingFiles,    setPendingFiles]    = useState([]);
  const [uploading,       setUploading]       = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);

    const selectedTaskObj = Object.values(subTasks || {})
    .flat()
    .find((t) => String(t.id) === selectedTask);

    console.log("Selected Task Object:", selectedTaskObj);
  // ── File staging ─────────────────────────────────────────────────────────
  const handleAddFiles = useCallback((e) => {
    const format = selectedTaskObj?.document_format;

    const valid = Array.from(e.target.files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        Swal.fire("File too large", `${f.name} exceeds 50 MB.`, "warning");
        return false;
      }

      if (!isFileAllowed(f, format)) {
        Swal.fire(
          "Invalid format",
          `${f.name} is not allowed.\nRequired: ${format}`,
          "error"
        );
        return false;
      }

      return true;
    });

    setPendingFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({
        fileObject: f,
        title: f.name,
        desc: "",
        eventDate: new Date().toISOString().split("T")[0],
      })),
    ]);

    e.target.value = null;
  }, [selectedTaskObj]);

  const handleUpdate = useCallback((index, field, value) => {
    setPendingFiles((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const handleRemovePending = useCallback((index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!selectedTask) return Swal.fire("No task", "Please choose a task.", "warning");
    if (pendingFiles.length === 0) return Swal.fire("No files", "Please add at least one file.", "error");

    setUploading(true);
    try {
      for (const item of pendingFiles) {
        const res = await generatePreSignedURL({
          fileName: item.fileObject.name,
          fileType: item.fileObject.type,
        });
        await axios.put(res.data.link, item.fileObject, {
          headers: { "Content-Type": item.fileObject.type },
          onUploadProgress: (e) =>
            setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });
        await recordFileUploadInfo({
          fileName:  res.data.key,
          fileType:  item.fileObject.type,
          ipcrID:    ipcr_id,
          batchID:   batch_id || "",
          subTaskID: selectedTask,
          title:     item.title,
          desc:      item.desc,
          eventDate: item.eventDate,
        });
      }
      Swal.fire("Success", "All files uploaded successfully.", "success");
      setPendingFiles([]);
      setSelectedTask("");
      setUploadProgress(0);
      socket.emit("document");
      onUploaded?.();
    } catch (err) {
      Swal.fire("Upload Failed", err.response?.data?.error || err.message, "error");
    } finally {
      setUploading(false);
    }
  }, [selectedTask, pendingFiles, ipcr_id, batch_id, onUploaded]);

  useEffect(()=> {
    console.log(subTasks)
  }, [subTasks])

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3, overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.5, bgcolor: "grey.50",
        borderBottom: "1px solid", borderColor: "divider",
        display: "flex", alignItems: "center", gap: 1,
      }}>
        <CloudUploadIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={700}>
          Upload Supporting Documents
        </Typography>
      </Box>

      <Box p={2.5}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>

          {/* Native select — zero re-render overhead on value change */}
          <Box sx={{ flex: 1 }}>
            <Typography
              component="label" htmlFor="task-select"
              variant="caption" fontWeight={600} color="text.secondary"
              display="block" mb={0.5}
            >
              Select Task *
            </Typography>
            <select
              id="task-select"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              disabled={uploading}
              style={{
                width: "100%", height: 40, padding: "0 12px",
                fontSize: "0.875rem", fontFamily: "inherit",
                border: "1px solid #c4c4c4", borderRadius: 4,
                backgroundColor: uploading ? "#f5f5f5" : "#fff",
                color: selectedTask ? "#1a1a1a" : "#9e9e9e",
                cursor: uploading ? "not-allowed" : "pointer",
                outline: "none", appearance: "auto",
              }}
            >
              <option value="">— Choose a task —</option>
              {Object.entries(subTasks || {}).map(([category, tasks]) => (
                <optgroup key={category} label={category}>
                  {(Array.isArray(tasks) ? tasks : []).map((task) => (
                    <option key={task.id} value={String(task.id)}>
                      {task.title}{task.required_documents ? " (Required)" : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Box>

          {/* File picker */}
          <Box>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
              Add Files
            </Typography>
            
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              hidden 
              /* THIS is where the magic happens */
              accept={getAcceptString(selectedTaskObj?.document_format)} 
              onChange={handleAddFiles} 
            />
            
            <Button
              variant="outlined" startIcon={<AttachFileIcon />} size="small" sx={{ height: 40 }}
              onClick={() => {
                // Prevent opening the file picker if no task is selected
                if (!selectedTask) {
                  Swal.fire("Select Task", "Please select a task first so we know what file types to allow.", "info");
                  return;
                }
                fileInputRef.current?.click();
              }} 
              disabled={uploading}
            >
              Browse…
            </Button>
            
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Max 50 MB per file
            </Typography>
          </Box>
        </Stack>

        {/* Staged files */}
        {pendingFiles.length > 0 && (
          <Box mb={2}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
              {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""} staged
            </Typography>
            {pendingFiles.map((item, idx) => (
              <PendingFileRow
                key={idx}
                item={item}
                index={idx}
                onUpdate={handleUpdate}
                onRemove={handleRemovePending}
              />
            ))}
          </Box>
        )}

        {/* Progress */}
        {uploading && uploadProgress > 0 && (
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">Uploading…</Typography>
              <Typography variant="caption" fontWeight={600}>{uploadProgress}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1 }} />
          </Box>
        )}

        {/* Submit */}
        <Button
          variant="contained" fullWidth sx={{ borderRadius: 1.5 }}
          startIcon={uploading ? undefined : <UploadIcon />}
          onClick={handleUpload}
          disabled={uploading || pendingFiles.length === 0 || !selectedTask}
        >
          {uploading
            ? `Uploading… ${uploadProgress}%`
            : `Upload ${pendingFiles.length || ""} Document${pendingFiles.length !== 1 ? "s" : ""}`}
        </Button>

        {!selectedTask && pendingFiles.length > 0 && (
          <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 1.5, py: 0.5 }}>
            Please select a task before uploading.
          </Alert>
        )}
      </Box>
    </Paper>
  );
}

export default UploadPanel;