import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import { useEffect } from "react";

const FieldMappingPreview = ({
  gridDimensions = { rows: 3, columns: 3 },
  cells = [],
  allFields = [],
}) => {
  // Helper to get field by ID
  const getFieldById = (fieldId) => {
    return allFields.find((f) => f.id === fieldId);
  };

  // Helper to get background color based on field type
  const getFieldColor = (field) => {
    if (!field) return "#f5f5f5";
    if (field.user === "Admin") return "#bbdefb"; // Light blue
    if (field.user === "User") return "#e1bee7"; // Light purple
    if (field.type === "IntegerModifier" || field.type === "CaseOutput")
      return "#c8e6c9"; // Light green for output fields
    return "#fffde7"; // Light yellow for others
  };

  // Helper to get text color for contrast
  const getTextColor = (backgroundColor) => {
    return backgroundColor === "#f5f5f5" ? "#999" : "#333";
  };

  // Create grid array
  const createGrid = () => {
    const grid = Array(gridDimensions.rows)
      .fill(null)
      .map(() => Array(gridDimensions.columns).fill(null));

    cells.forEach((cell) => {
      for (let r = cell.row; r < cell.row + cell.rowSpan; r++) {
        for (let c = cell.column; c < cell.column + cell.columnSpan; c++) {
          if (r < gridDimensions.rows && c < gridDimensions.columns) {
            grid[r][c] = cell;
          }
        }
      }
    });

    return grid;
  };

  const grid = createGrid();
  const processedCells = new Set();
  useEffect(()=> {
    console.log("Grid dimensions or cells changed, updating preview:", { gridDimensions, cells, allFields });
  }, [gridDimensions, cells, allFields])
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Field Mapping Preview
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
          Visual representation of how fields will be arranged in the export
        </Typography>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: "#bbdefb",
                border: "1px solid #90caf9",
              }}
            />
            <Typography variant="caption">Admin Fields</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: "#e1bee7",
                border: "1px solid #ce93d8",
              }}
            />
            <Typography variant="caption">User Fields</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: "#c8e6c9",
                border: "1px solid #81c784",
              }}
            />
            <Typography variant="caption">Output Fields</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Grid Preview */}
      <Paper elevation={2} sx={{ overflow: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <tbody>
            {grid.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  // Skip if this cell is part of a spanning cell already processed
                  if (cell && processedCells.has(`${cell.id}-${rowIndex}-${colIndex}`)) {
                    return null;
                  }

                  if (!cell) {
                    return (
                      <td
                        key={`empty-${rowIndex}-${colIndex}`}
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          backgroundColor: "#f9f9f9",
                          minWidth: "120px",
                          minHeight: "60px",
                        }}
                      />
                    );
                  }

                  // Mark all cells covered by this span as processed
                  for (let r = cell.row; r < cell.row + cell.rowSpan; r++) {
                    for (let c = cell.column; c < cell.column + cell.columnSpan; c++) {
                      processedCells.add(`${cell.id}-${r}-${c}`);
                    }
                  }

                  const field = getFieldById(cell.id);
                  console.log("Rednerinf field in cell:", { cell, field });
                  const bgColor = getFieldColor(field);
                  const textColor = getTextColor(bgColor);

                  return (
                    <td
                      key={`${cell.id}-${rowIndex}-${colIndex}`}
                      colSpan={cell.columnSpan}
                      rowSpan={cell.rowSpan}
                      style={{
                        border: "1px solid #999",
                        padding: "12px",
                        backgroundColor: bgColor,
                        color: textColor,
                        minWidth: `${120 * cell.columnSpan}px`,
                        minHeight: `${60 * cell.rowSpan}px`,
                        verticalAlign: "middle",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        gap={0.5}
                        height="100%"
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{
                            wordBreak: "break-word",
                            fontSize: "11px",
                          }}
                        >
                          {field?.title || "Unnamed"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "9px",
                            opacity: 0.8,
                          }}
                        >
                          {field?.type || "—"}
                        </Typography>
                        {field?.user && (
                          <Chip
                            label={field.user}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: "18px",
                              fontSize: "9px",
                            }}
                          />
                        )}
                      </Box>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>

      {/* Grid Stats */}
      <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Grid Dimensions
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {gridDimensions.rows} rows × {gridDimensions.columns} columns
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Total Fields
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {cells.length} field{cells.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

export default FieldMappingPreview;
