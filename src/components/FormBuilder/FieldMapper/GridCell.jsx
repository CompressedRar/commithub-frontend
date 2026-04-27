import { TableCell, Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon, Close as CloseIcon } from "@mui/icons-material";

export default function GridCell({
  rowIndex,
  colIndex,
  fieldData,
  onDragOver,
  onDrop,
  onEditSpan,
  onRemove,
  assignedColumn = null,
  onEditColumn = null,
}) {
  return (
    <TableCell
      key={`${rowIndex}-${colIndex}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      rowSpan={fieldData?.span?.rows || 1}
      colSpan={fieldData?.span?.cols || 1}
      sx={{
        minHeight: `${90 * (fieldData?.span?.rows || 1)}px`,
        border: "1px dashed #ccc",
        backgroundColor: fieldData ? "#f0f7ff" : "#fafafa",
        cursor: fieldData ? "default" : "crosshair",
        p: 1,
        "&:hover": {
          backgroundColor: fieldData ? "#e0f2ff" : "#f5f5f5",
        },
        position: "relative",
        verticalAlign: "top",
      }}
    >
      {fieldData ? (
        <Box>
          {/* Column indicator */}
          {assignedColumn && (
            <Box sx={{ mb: 1, display: "flex", gap: 0.5, alignItems: "center" }}>
              <Chip
                label={`Column: ${assignedColumn.name}`}
                size="small"
                color="info"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
              {onEditColumn && (
                <Tooltip title="Change column">
                  <IconButton
                    size="small"
                    sx={{ width: 24, height: 24, p: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditColumn(rowIndex, colIndex);
                    }}
                  >
                    <EditIcon fontSize="small" sx={{ fontSize: "0.8rem" }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="start"
            gap={1}
          >
            <Box flex={1}>
              <Typography
                variant="caption"
                fontWeight="bold"
                display="block"
                sx={{
                  wordBreak: "break-word",
                  mb: 1,
                }}
              >
                {fieldData.field.title}
              </Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap">
                <Chip
                  label={fieldData.field.type || "Field"}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={fieldData.field.user}
                  size="small"
                  color={
                    fieldData.field.user === "Admin"
                      ? "primary"
                      : "secondary"
                  }
                />
                <Chip
                  label={`${fieldData.span.rows}×${fieldData.span.cols}`}
                  size="small"
                  variant="filled"
                  sx={{ backgroundColor: "#fff3cd", color: "#000" }}
                />
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Tooltip title="Edit span">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEditSpan(rowIndex, colIndex)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove from cell">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemove(rowIndex, colIndex)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            whiteSpace: "nowrap",
          }}
        >
          Drag field here
        </Typography>
      )}
    </TableCell>
  );
}
