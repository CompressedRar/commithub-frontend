import { useState } from 'react';

export default function useFieldMapper() {
  const [gridConfig, setGridConfig] = useState({
    rows: 5,
    columns: 3,
  });

  const [fieldMapping, setFieldMapping] = useState({});

  /**
   * Check if a cell is available for placement
   * Returns false if cell is already occupied by another field's span
   */
  const isCellAvailable = (rowIndex, colIndex, excludeCellKey = null) => {
    for (const [cellKey, cellData] of Object.entries(fieldMapping)) {
      if (excludeCellKey && cellKey === excludeCellKey) continue;
      
      const [fieldRow, fieldCol] = cellKey.split('-').map(Number);
      const { span } = cellData;
      
      // Check if the target cell falls within this field's span
      if (
        rowIndex >= fieldRow && rowIndex < fieldRow + span.rows &&
        colIndex >= fieldCol && colIndex < fieldCol + span.cols
      ) {
        return false;
      }
    }
    return true;
  };

  /**
   * Check if a rectangular area is available for placement
   * Returns true only if ALL cells in the area are available
   */
  const isAreaAvailable = (startRow, startCol, rows, cols, excludeCellKey = null) => {
    for (let r = startRow; r < startRow + rows; r++) {
      for (let c = startCol; c < startCol + cols; c++) {
        if (r >= gridConfig.rows || c >= gridConfig.columns) {
          return false; // Out of bounds
        }
        if (!isCellAvailable(r, c, excludeCellKey)) {
          return false;
        }
      }
    }
    return true;
  };

  /**
   * Add a field to a cell with optional row/column span
   * rowSpan: how many rows this field occupies (default 1)
   * colSpan: how many columns this field occupies (default 1)
   */
  const addFieldToCell = (rowIndex, colIndex, field, rowSpan = 1, colSpan = 1) => {
    // Validate bounds
    if (rowIndex + rowSpan > gridConfig.rows || colIndex + colSpan > gridConfig.columns) {
      return false;
    }

    // Check if area is available
    if (!isAreaAvailable(rowIndex, colIndex, rowSpan, colSpan)) {
      return false;
    }

    const cellKey = `${rowIndex}-${colIndex}`;
    setFieldMapping((prev) => ({
      ...prev,
      [cellKey]: {
        field,
        span: { rows: rowSpan, cols: colSpan },
      },
    }));
    return true;
  };

  /**
   * Update span of an existing field
   * Only works from the primary cell (where field was originally placed)
   */
  const updateFieldSpan = (rowIndex, colIndex, newRowSpan, newColSpan) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    
    if (!fieldMapping[cellKey]) {
      return false;
    }

    // Validate bounds
    if (rowIndex + newRowSpan > gridConfig.rows || colIndex + newColSpan > gridConfig.columns) {
      return false;
    }

    // Check if new area is available (excluding the old span)
    if (!isAreaAvailable(rowIndex, colIndex, newRowSpan, newColSpan, cellKey)) {
      return false;
    }

    setFieldMapping((prev) => ({
      ...prev,
      [cellKey]: {
        ...prev[cellKey],
        span: { rows: newRowSpan, cols: newColSpan },
      },
    }));
    return true;
  };

  /**
   * Remove a field from a cell
   * Only works from the primary cell (top-left of the span)
   */
  const removeFieldFromCell = (rowIndex, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    setFieldMapping((prev) => {
      const updated = { ...prev };
      delete updated[cellKey];
      return updated;
    });
  };

  /**
   * Get field data at a specific cell
   * If the cell is part of a span, returns the field from the primary cell
   */
  const getFieldAtCell = (rowIndex, colIndex) => {
    // First check if this exact cell has a field
    const exactCellKey = `${rowIndex}-${colIndex}`;
    if (fieldMapping[exactCellKey]) {
      return fieldMapping[exactCellKey];
    }

    // Check if this cell is part of another field's span
    for (const [cellKey, cellData] of Object.entries(fieldMapping)) {
      const [fieldRow, fieldCol] = cellKey.split('-').map(Number);
      const { span } = cellData;

      if (
        rowIndex >= fieldRow && rowIndex < fieldRow + span.rows &&
        colIndex >= fieldCol && colIndex < fieldCol + span.cols
      ) {
        return cellData;
      }
    }

    return null;
  };

  /**
   * Get the primary cell key for a field at any position
   * Returns null if cell is empty
   */
  const getPrimaryCellKey = (rowIndex, colIndex) => {
    // Check exact cell first
    const exactCellKey = `${rowIndex}-${colIndex}`;
    if (fieldMapping[exactCellKey]) {
      return exactCellKey;
    }

    // Find primary cell if this is part of a span
    for (const [cellKey, cellData] of Object.entries(fieldMapping)) {
      const [fieldRow, fieldCol] = cellKey.split('-').map(Number);
      const { span } = cellData;

      if (
        rowIndex >= fieldRow && rowIndex < fieldRow + span.rows &&
        colIndex >= fieldCol && colIndex < fieldCol + span.cols
      ) {
        return cellKey;
      }
    }

    return null;
  };

  /**
   * Update grid dimensions (rows and columns)
   * Max: 20 rows, 10 columns
   */
  const updateGridDimensions = (rows, columns) => {
    const validRows = Math.min(Math.max(rows, 1), 20);
    const validColumns = Math.min(Math.max(columns, 1), 10);

    // Check if any fields go out of bounds with new dimensions
    setFieldMapping((prev) => {
      const updated = { ...prev };
      for (const [cellKey, cellData] of Object.entries(updated)) {
        const [fieldRow, fieldCol] = cellKey.split('-').map(Number);
        const { span } = cellData;

        if (fieldRow + span.rows > validRows || fieldCol + span.cols > validColumns) {
          // Field exceeds new bounds, remove it
          delete updated[cellKey];
        }
      }
      return updated;
    });

    setGridConfig({ rows: validRows, columns: validColumns });
  };

  /**
   * Get all occupied cells including spans
   * Returns array of { row, col, field, isPrimary, span }
   */
  const getOccupiedCells = () => {
    const occupied = [];

    for (const [cellKey, cellData] of Object.entries(fieldMapping)) {
      const [row, col] = cellKey.split('-').map(Number);
      const { field, span } = cellData;

      occupied.push({
        row,
        col,
        field,
        isPrimary: true,
        span,
      });

      // Add all secondary cells (covered by span)
      for (let r = row; r < row + span.rows; r++) {
        for (let c = col; c < col + span.cols; c++) {
          if (r !== row || c !== col) {
            occupied.push({
              row: r,
              col: c,
              field,
              isPrimary: false,
              span,
              primaryRow: row,
              primaryCol: col,
            });
          }
        }
      }
    }

    return occupied;
  };

  /**
   * Get all fields that have been placed
   */
  const getUsedFields = () => {
    return Object.values(fieldMapping).map((cellData) => cellData.field);
  };

  /**
   * Clear all field mappings
   */
  const clearMapping = () => {
    setFieldMapping({});
  };

  /**
   * Reset everything
   */
  const clearGrid = () => {
    setGridConfig({ rows: 5, columns: 3 });
    setFieldMapping({});
  };

  /**
   * Export mapping data
   */
  const exportMapping = () => {
    const fieldMappingArray = Object.entries(fieldMapping).map(([cellKey, cellData]) => {
      const [row, col] = cellKey.split('-').map(Number);
      return {
        cell: cellKey,
        row,
        col,
        fieldId: cellData.field.id,
        fieldTitle: cellData.field.title,
        fieldType: cellData.field.type,
        rowSpan: cellData.span.rows,
        colSpan: cellData.span.cols,
      };
    });

    return {
      gridConfig,
      fieldMapping: fieldMappingArray,
    };
  };

  return {
    gridConfig,
    fieldMapping,
    isCellAvailable,
    isAreaAvailable,
    updateGridDimensions,
    addFieldToCell,
    updateFieldSpan,
    removeFieldFromCell,
    getFieldAtCell,
    getPrimaryCellKey,
    getOccupiedCells,
    getUsedFields,
    clearMapping,
    clearGrid,
    exportMapping,
  };
}
