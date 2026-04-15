import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";
import useFieldMapper from "../../../hooks/useFieldMapper";
import FieldMapperHeader from "./FieldMapperHeader";
import AvailableFieldsSidebar from "./AvailableFieldsSidebar";
import FieldMapperGrid from "./FieldMapperGrid";
import GridDimensionsDialog from "./GridDimensionsDialog";
import SpanConfigDialog from "./SpanConfigDialog";

export default function FieldMapper({ fields = [], outputFields = [] }) {
  const {
    gridConfig,
    fieldMapping,
    updateGridDimensions,
    addFieldToCell,
    updateFieldSpan,
    removeFieldFromCell,
    getFieldAtCell,
    clearMapping,
    exportMapping,
  } = useFieldMapper();

  // Dialog states
  const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false);
  const [spanDialogOpen, setSpanDialogOpen] = useState(false);

  // Grid input states
  const [rowsInput, setRowsInput] = useState(gridConfig.rows);
  const [colsInput, setColsInput] = useState(gridConfig.columns);

  // Span config states
  const [spanConfig, setSpanConfig] = useState({ rowSpan: 1, colSpan: 1 });
  const [dragDropTarget, setDragDropTarget] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [draggedField, setDraggedField] = useState(null);

  // Computed values
  const allFields = [...fields, ...outputFields];
  const usedFieldIds = new Set(
    Object.values(fieldMapping).map((cellData) => cellData.field.id)
  );
  const unusedFields = allFields.filter((field) => !usedFieldIds.has(field.id));

  // Header handlers
  const handleGridSettingsClick = () => {
    setRowsInput(gridConfig.rows);
    setColsInput(gridConfig.columns);
    setDimensionDialogOpen(true);
  };

  const handleUpdateDimensions = () => {
    const rows = Math.max(1, Math.min(20, parseInt(rowsInput) || 5));
    const cols = Math.max(1, Math.min(10, parseInt(colsInput) || 3));
    updateGridDimensions(rows, cols);
    setRowsInput(rows);
    setColsInput(cols);
    setDimensionDialogOpen(false);
  };

  const handleExport = () => {
    const data = exportMapping();
    console.log("Field Mapping Export:", data);
    alert("Field mapping exported to console. Check DevTools.");
  };

  // Drag-drop handlers
  const handleDragStart = (field) => {
    setDraggedField(field);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnCell = (rowIndex, colIndex, e) => {
    e.preventDefault();
    if (draggedField) {
      setDragDropTarget({ rowIndex, colIndex });
      setSpanConfig({ rowSpan: 1, colSpan: 1 });
      setEditingCell(null);
      setSpanDialogOpen(true);
    }
  };

  // Span dialog handlers
  const handleConfirmSpan = () => {
    if (editingCell) {
      const { rowIndex, colIndex } = editingCell;
      const success = updateFieldSpan(
        rowIndex,
        colIndex,
        spanConfig.rowSpan,
        spanConfig.colSpan
      );
      if (!success) {
        alert(
          "Cannot update span - overlaps with another field or exceeds grid bounds!"
        );
      }
    } else if (dragDropTarget) {
      const { rowIndex, colIndex } = dragDropTarget;
      const success = addFieldToCell(
        rowIndex,
        colIndex,
        draggedField,
        spanConfig.rowSpan,
        spanConfig.colSpan
      );
      if (!success) {
        alert(
          "Cannot place field - not enough space or overlaps with another field!"
        );
      }
      setDraggedField(null);
    }
    resetSpanDialog();
  };

  const handleEditSpan = (rowIndex, colIndex) => {
    const cellData = fieldMapping[`${rowIndex}-${colIndex}`];
    if (cellData) {
      setEditingCell({ rowIndex, colIndex });
      setSpanConfig({ rowSpan: cellData.span.rows, colSpan: cellData.span.cols });
      setSpanDialogOpen(true);
    }
  };

  const resetSpanDialog = () => {
    setSpanDialogOpen(false);
    setDragDropTarget(null);
    setEditingCell(null);
  };

  // Grid cell handlers
  const handleRemoveFromCell = (rowIndex, colIndex) => {
    removeFieldFromCell(rowIndex, colIndex);
  };

  return (
    <Box padding="2em">
      <Stack spacing={3}>
        {/* Header */}
        <FieldMapperHeader
          onGridSettingsClick={handleGridSettingsClick}
          onExport={handleExport}
          onClearMapping={clearMapping}
        />

        {/* Main Content */}
        <Box display="flex" gap={3}>
          {/* Available Fields Sidebar */}
          <AvailableFieldsSidebar
            unusedFields={unusedFields}
            onDragStart={handleDragStart}
          />

          {/* Grid */}
          <FieldMapperGrid
            gridConfig={gridConfig}
            fieldMapping={fieldMapping}
            getFieldAtCell={getFieldAtCell}
            onDragOver={handleDragOver}
            onDropOnCell={handleDropOnCell}
            onEditSpan={handleEditSpan}
            onRemove={handleRemoveFromCell}
          />
        </Box>

        {/* Stats */}
        <Box display="flex" gap={3}>
          <Typography variant="body2">
            <strong>Grid Size:</strong> {gridConfig.rows} rows ×{" "}
            {gridConfig.columns} columns
          </Typography>
          <Typography variant="body2">
            <strong>Placed Fields:</strong> {Object.keys(fieldMapping).length} /{" "}
            {allFields.length}
          </Typography>
        </Box>
      </Stack>

      {/* Dialogs */}
      <GridDimensionsDialog
        open={dimensionDialogOpen}
        rowsInput={rowsInput}
        colsInput={colsInput}
        onRowsChange={setRowsInput}
        onColsChange={setColsInput}
        onClose={() => setDimensionDialogOpen(false)}
        onConfirm={handleUpdateDimensions}
      />

      <SpanConfigDialog
        open={spanDialogOpen}
        editingCell={editingCell}
        rowSpan={spanConfig.rowSpan}
        colSpan={spanConfig.colSpan}
        onRowSpanChange={(val) =>
          setSpanConfig({ ...spanConfig, rowSpan: val })
        }
        onColSpanChange={(val) =>
          setSpanConfig({ ...spanConfig, colSpan: val })
        }
        onClose={resetSpanDialog}
        onConfirm={handleConfirmSpan}
      />
    </Box>
  );
}

