import {
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import PendingIcon from '@mui/icons-material/Pending';
import DocumentStatus from "./DocumentStatus";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);
const PDF_TYPE = "application/pdf";
const WORD_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function getFileIcon(fileType) {
  if (!fileType) return <InsertDriveFileOutlinedIcon fontSize="medium" />;
  if (IMAGE_TYPES.has(fileType)) return <ImageOutlinedIcon fontSize="medium" color="success" />;
  if (fileType === PDF_TYPE) return <PictureAsPdfIcon fontSize="medium" color="error" />;
  if (WORD_TYPES.has(fileType)) return <ArticleOutlinedIcon fontSize="medium" color="primary" />;
  return <InsertDriveFileOutlinedIcon fontSize="medium" color="action" />;
}

function getTypeLabel(fileType) {
  const map = {
    "image/jpeg": "JPEG",
    "image/jpg": "JPG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "image/webp": "WebP",
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  };
  return map[fileType] || fileType || "File";
}

function DocumentCard({ doc, deptMode, onRemove, onApprove, onReject }) {
  const handleDownload = () => window.open(doc.download_url, "_blank", "noopener,noreferrer");

  const eventDate = doc.event_date
    ? new Date(doc.event_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : doc.created_at
      ? new Date(doc.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      : null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        transition: "box-shadow 0.15s, border-color 0.15s",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.main",
        },
      }}
    >
      {/* File type icon */}
      <DocumentStatus status={doc.isApproved}></DocumentStatus>

      <Divider orientation="vertical" flexItem sx={{ borderColor: "primary.100" }} />

      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1.5,
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {getFileIcon(doc.file_type)}
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.25}>
          <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ flex: "1 1 auto" }}>
            {doc.title || doc.file_name || "Untitled"}
          </Typography>
          <Chip
            label={getTypeLabel(doc.file_type)}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.68rem", height: 20 }}
          />
        </Stack>

        {/* File name (if different from title) */}
        {doc.file_name && doc.title && doc.file_name !== doc.title && (
          <Typography variant="caption" color="text.disabled" display="block" noWrap mb={0.5}>
            {doc.file_name}
          </Typography>
        )}

        {/* Meta row */}
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          {doc.task_name && (
            <Typography variant="caption" color="text.secondary" noWrap>
              📌 {doc.task_name}
            </Typography>
          )}
          {doc.user_name && (
            <Typography variant="caption" color="text.secondary" noWrap>
              👤 {doc.user_name}
            </Typography>
          )}
          {eventDate && (
            <Stack direction="row" alignItems="center" spacing={0.3}>
              <EventOutlinedIcon sx={{ fontSize: "0.75rem", color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {eventDate}
              </Typography>
            </Stack>
          )}
          {doc.desc && (
            <Stack direction="row" alignItems="center" spacing={0.3}>
              <NotesIcon sx={{ fontSize: "0.75rem", color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  maxWidth: 260,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {doc.desc}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Actions */}
      {
        doc.isApproved != "rejected" && (
          <Stack direction="row" spacing={0.5} flexShrink={0} alignItems="center">
            <Tooltip title="Download">
              <IconButton size="small" onClick={handleDownload} color="primary">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {!deptMode && (
              <Tooltip title="Remove">
                <IconButton size="small" onClick={() => onRemove(doc.id)} color="error">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )
      }

      {
        deptMode && doc.isApproved == "pending" && (
          <>
            <Divider orientation="vertical" flexItem sx={{ borderColor: "primary.100" }} />
            <Stack direction="column" spacing={1} alignItems="center" justifyContent={"center"}>
              <Tooltip title="Approve Document">

                <Button variant="contained" fullWidth startIcon={<CheckIcon />} onClick={() => onApprove(doc.id)} color="success">
                  Approve
                </Button>

              </Tooltip>
              <Tooltip title="Reject Document">
                <Button variant="outlined" fullWidth startIcon={<ClearIcon />} onClick={() => onReject(doc.id)} color="error">
                  Reject
                </Button>
              </Tooltip>
            </Stack>
          </>
        )
      }

    </Paper>
  );
}

export default DocumentCard;
