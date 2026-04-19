import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { GridView as GridViewIcon } from "@mui/icons-material";
import { useState } from "react";
import FieldMapper from "./FieldMapper";

export default function FieldMapperPanel({ fields = [], outputFields = [],
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
    exportMapping,
    templateId = null,
    onSaveTemplate = null,
    onCreateForm = null
 }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Box>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <GridViewIcon />
                            <Typography variant="h6">Field Mapper</Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                            {templateId && onSaveTemplate && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={onSaveTemplate}
                                >
                                    Update Template
                                </Button>
                            )}
                            <Button
                                variant={expanded ? "contained" : "outlined"}
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? "Hide Mapper" : "Open Mapper"}
                            </Button>
                        </Box>
                    </Box>
                    {!expanded && (
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                            Arrange your input and output fields in a grid layout, similar to Excel
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {expanded && (
                <Box sx={{ border: "1px solid #ddd", borderRadius: 1, overflow: "hidden" }}>
                    {
                        gridConfig != null && fieldMapping != null && columnMapping != null && 
                        <FieldMapper fields={fields} outputFields={outputFields} gridConfig={gridConfig} fieldMapping={fieldMapping} columnMapping={columnMapping} updateGridDimensions={updateGridDimensions} addFieldToCell={addFieldToCell} updateFieldSpan={updateFieldSpan} removeFieldFromCell={removeFieldFromCell} assignFieldToColumn={assignFieldToColumn} getFieldAtCell={getFieldAtCell} clearMapping={clearMapping} exportMapping={exportMapping} />
                    }
                </Box>
            )}
        </Box>
    );
}
