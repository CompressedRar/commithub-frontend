import {
  Box,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import GridCell from "./GridCell";

export default function FieldMapperGrid({
  gridConfig,
  fieldMapping,
  columnMapping = {},
  columns = [],
  getFieldAtCell,
  onDragOver,
  onDropOnCell,
  onEditSpan,
  onRemove,
  onEditColumn,
}) {
  const getColumnLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  const isCellPrimary = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    return Boolean(fieldMapping[cellKey]);
  };

  const isCellSecondary = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    if (fieldMapping[cellKey]) return false;

    for (const [key, cellData] of Object.entries(fieldMapping)) {
      const [fieldRow, fieldCol] = key.split("-").map(Number);
      const { span } = cellData;

      if (
        rowIndex >= fieldRow &&
        rowIndex < fieldRow + span.rows &&
        colIndex >= fieldCol &&
        colIndex < fieldCol + span.cols
      ) {
        return true;
      }
    }
    return false;
  };

  const getPrimaryFieldData = (rowIndex, colIndex) => {
    const cellData = getFieldAtCell(rowIndex, colIndex);
    if (!cellData) return null;
    return {
      field: cellData.field,
      span: cellData.span,
    };
  };

  const getAssignedColumn = (fieldId) => {
    const columnId = columnMapping[fieldId];
    if (columnId) {
      return columns.find((col) => col.id === columnId);
    }
    return null;
  };

  return (
    <Box flex={1}>
      <Box
        sx={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "600px",
          border: "1px solid #ddd",
          borderRadius: 1,
        }}
      >
        <Table sx={{ minWidth: "100%" }} size="small">
          <TableHead
            sx={{ backgroundColor: "#f5f5f5", position: "sticky", top: 0 }}
          >
            <TableRow>
              <TableCell sx={{ width: "50px", fontWeight: "bold" }}>
                Row
              </TableCell>
              {[...Array(gridConfig.columns)].map((_, colIndex) => (
                <TableCell
                  key={colIndex}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f5f5f5",
                    minWidth: "200px",
                  }}
                >
                  {getColumnLabel(colIndex)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(gridConfig.rows)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f9f9f9",
                    width: "50px",
                  }}
                >
                  {rowIndex + 1}
                </TableCell>
                {[...Array(gridConfig.columns)].map((_, colIndex) => {
                  const isPrimary = isCellPrimary(rowIndex, colIndex);
                  const isSecondary = isCellSecondary(rowIndex, colIndex);

                  if (isSecondary) {
                    return null;
                  }

                  const fieldData = isPrimary
                    ? getPrimaryFieldData(rowIndex, colIndex)
                    : null;

                  const assignedColumn = fieldData
                    ? getAssignedColumn(fieldData.field.id)
                    : null;

                  return (
                    <GridCell
                      key={`${rowIndex}-${colIndex}`}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      fieldData={fieldData}
                      assignedColumn={assignedColumn}
                      onDragOver={onDragOver}
                      onDrop={(e) =>
                        onDropOnCell(rowIndex, colIndex, e)
                      }
                      onEditSpan={onEditSpan}
                      onRemove={onRemove}
                      onEditColumn={onEditColumn}
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
