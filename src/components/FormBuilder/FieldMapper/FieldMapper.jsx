import { Box, Stack, Typography, Paper, Divider, IconButton, Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import EyeIcon from "@mui/icons-material/Visibility";
import EyeOffIcon from "@mui/icons-material/VisibilityOff";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import useFieldMapper from "../../../hooks/useFieldMapper";
import FieldMapperHeader from "./FieldMapperHeader";
import AvailableFieldsSidebar from "./AvailableFieldsSidebar";
import FieldMapperGrid from "./FieldMapperGrid";
import GridDimensionsDialog from "./GridDimensionsDialog";
import SpanConfigDialog from "./SpanConfigDialog";
import ColumnSelectionDialog from "./ColumnSelectionDialog";
import FieldMappingPreview from "../FieldMappingPreview";
import ColumnManager from "./ColumnManager";

export default function FieldMapper({ fields = [], outputFields = [],
    gridConfig,
    fieldMapping,
    columnMapping,

    updateGridDimensions,
    addFieldToCell,
    updateFieldSpan,
    removeFieldFromCell,
    assignFieldToColumn,
    getFieldAtCell,
    clearMapping,
    exportMapping
 }) {

  // Dialog states
  const [dimensionDialogOpen, setDimensionDialogOpen] = useState(false);
  const [spanDialogOpen, setSpanDialogOpen] = useState(false);
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);
  const [columnSelectionOpen, setColumnSelectionOpen] = useState(false);

  // Drawer states
  const [fieldsDrawerOpen, setFieldsDrawerOpen] = useState(true);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(true);

  // Column state
  const [columns, setColumns] = useState([
    { id: 1, name: "Column 1", width: "100%" },
  ]);

  // Grid input states
  const [rowsInput, setRowsInput] = useState(gridConfig.rows);
  const [colsInput, setColsInput] = useState(gridConfig.columns);

  // Span config states
  const [spanConfig, setSpanConfig] = useState({ rowSpan: 1, colSpan: 1 });
  const [dragDropTarget, setDragDropTarget] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [draggedField, setDraggedField] = useState(null);
  const [fieldForColumnSelection, setFieldForColumnSelection] = useState(null);

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
      } else {
        // After successfully placing field, show column selection
        setFieldForColumnSelection(draggedField);
        setColumnSelectionOpen(true);
      }
      setDraggedField(null);
    }
    resetSpanDialog();
  };

  const handleConfirmColumnSelection = (columnId) => {
    if (fieldForColumnSelection) {
      assignFieldToColumn(fieldForColumnSelection.id, columnId);
      setFieldForColumnSelection(null);
    }
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

  const handleEditColumnForField = (rowIndex, colIndex) => {
    const fieldData = fieldMapping[`${rowIndex}-${colIndex}`];
    if (fieldData) {
      setFieldForColumnSelection(fieldData.field);
      setColumnSelectionOpen(true);
    }
  };

  // Convert fieldMapping to cells array for preview component
  const previewCells = Object.entries(fieldMapping).map(([key, cellData]) => {
    const [rowIndex, colIndex] = key.split("-").map(Number);
    return {
      id: cellData.field.id,
      fieldId: cellData.field.field_id,
      row: rowIndex,
      column: colIndex,
      rowSpan: cellData.span.rows,
      columnSpan: cellData.span.cols,
    };
  });

  useEffect(()=> {
    console.log("Fields, outputFields, gridConfig, fieldMapping, or columnMapping changed:", { allFields,unusedFields, usedFieldIds, fieldMapping });
  }, [allFields, unusedFields, usedFieldIds]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#fafafa" }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "#ffffff", borderRadius: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box flex={1}>
            <FieldMapperHeader
              onGridSettingsClick={handleGridSettingsClick}
              onExport={handleExport}
              onClearMapping={clearMapping}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => setColumnManagerOpen(true)}
              title="Manage Columns"
              size="small"
            >
              <ViewAgendaIcon />
            </IconButton>
            <IconButton
              onClick={() => setFieldsDrawerOpen(!fieldsDrawerOpen)}
              title={fieldsDrawerOpen ? "Hide Fields Panel" : "Show Fields Panel"}
              color={fieldsDrawerOpen ? "primary" : "inherit"}
              size="small"
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              onClick={() => setPreviewDrawerOpen(!previewDrawerOpen)}
              title={previewDrawerOpen ? "Hide Preview Panel" : "Show Preview Panel"}
              color={previewDrawerOpen ? "primary" : "inherit"}
              size="small"
            >
              {previewDrawerOpen ? <EyeIcon /> : <EyeOffIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 0 }} />

      {/* Main Content Area - Full Width Grid */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Drawer - Available Fields */}
        <Drawer
          variant="persistent"
          open={fieldsDrawerOpen}
          sx={{
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              position: "relative",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Available Fields
            </Typography>
            <AvailableFieldsSidebar
              unusedFields={unusedFields}
              onDragStart={handleDragStart}
            />
          </Box>
        </Drawer>

        {/* Center - Grid Editor (Full Width) */}
        <Box sx={{ flex: 1, backgroundColor: "#ffffff", overflowY: "auto", p: 3, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Field Mapper Grid
          </Typography>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <FieldMapperGrid
              gridConfig={gridConfig}
              fieldMapping={fieldMapping}
              columnMapping={columnMapping}
              columns={columns}
              getFieldAtCell={getFieldAtCell}
              onDragOver={handleDragOver}
              onDropOnCell={handleDropOnCell}
              onEditSpan={handleEditSpan}
              onRemove={handleRemoveFromCell}
              onEditColumn={handleEditColumnForField}
            />
          </Box>
        </Box>

        {/* Right Drawer - Preview */}
        <Drawer
          variant="persistent"
          open={previewDrawerOpen}
          anchor="right"
          sx={{
            width: 420,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 420,
              boxSizing: "border-box",
              position: "relative",
              borderLeft: "1px solid #e0e0e0",
            },
          }}
        >
          <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
            <FieldMappingPreview
              gridDimensions={gridConfig}
              cells={previewCells}
              allFields={allFields}
            />
          </Box>
        </Drawer>
      </Box>

      <Divider sx={{ my: 0 }} />

      {/* Footer Stats */}
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "#ffffff", borderRadius: 0 }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Grid Size
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {gridConfig.rows} rows × {gridConfig.columns} columns
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Placed Fields
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {Object.keys(fieldMapping).length} / {allFields.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Unused Fields
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={unusedFields.length === 0 ? "success.main" : "inherit"}>
              {unusedFields.length}
            </Typography>
          </Box>
        </Stack>
      </Paper>

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

      <ColumnManager
        open={columnManagerOpen}
        onClose={() => setColumnManagerOpen(false)}
        onSave={(newColumns) => setColumns(newColumns)}
        existingColumns={columns}
        fieldCount={Object.keys(fieldMapping).length}
        fieldMapping={fieldMapping}
        columnMapping={columnMapping}
      />

      <ColumnSelectionDialog
        open={columnSelectionOpen}
        onClose={() => {
          setColumnSelectionOpen(false);
          setFieldForColumnSelection(null);
        }}
        onConfirm={handleConfirmColumnSelection}
        columns={columns}
        field={fieldForColumnSelection}
        existingColumnId={fieldForColumnSelection ? columnMapping[fieldForColumnSelection.id] : null}
      />
    </Box>
  );
}

