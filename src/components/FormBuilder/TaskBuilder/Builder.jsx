import { Box, Button, Drawer, Stack, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";
import Editor from "../PropertyEditor/Editor";
import OutputFieldEditor from "../PropertyEditor/OutputFieldEditor";
import InputFieldsPanel from "../Panels/InputFieldsPanel";
import OutputFieldsPanel from "../Panels/OutputFieldsPanel";
import FieldMapperPanel from "../FieldMapper/FieldMapperPanel";
import FormPreview from "../FormPreview";
import useFormBuilder from "../../../hooks/useFormBuilder";
import useFieldHandlers from "../../../hooks/useFieldHandlers";
import useOutputFieldHandlers from "../../../hooks/useOutputFieldHandlers";
import { sampleTaskData } from "../sampleTaskData";

export default function Builder() {
    const formBuilderHook = useFormBuilder();
    const { fields, outputFields, clearFields, getUserInputFields } = formBuilderHook;

    const inputFieldHandlers = useFieldHandlers(formBuilderHook);
    const outputFieldHandlers = useOutputFieldHandlers(formBuilderHook);

    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleClearAll = () => {
        clearFields();
        setClearConfirmOpen(false);
    };

    const handleSaveTemplate = () => {
        console.log("Saving template with fields:", fields);
        console.log("Saving template with output fields:", outputFields);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleLoadSampleData = () => {
        // Load sample data
        formBuilderHook.loadFields(sampleTaskData.inputFields);
        formBuilderHook.loadOutputFields(sampleTaskData.outputFields);
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const userInputFields = getUserInputFields();

    return (
        <Box padding={"2em"}>
            <Stack spacing={3}>
                {/* Header */}
                <Box display={"flex"} gap={2} justifyContent={"space-between"} alignItems={"center"}>
                    <Typography variant="h4">Form Template Builder</Typography>
                    <Box display={"flex"} gap={1}>
                        <Button 
                            variant="outlined" 
                            color="info" 
                            onClick={handleLoadSampleData}
                            sx={{ textTransform: 'none' }}
                        >
                            📋 Load Sample Task
                        </Button>
                        <FormPreview fields={fields} outputFields={outputFields} />
                        <Button variant="contained" onClick={handleSaveTemplate}>
                            Save Task Template
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={() => setClearConfirmOpen(true)} 
                            disabled={fields.length === 0 && outputFields.length === 0}
                        >
                            Clear All
                        </Button>
                    </Box>
                </Box>

                {saveSuccess && (
                    <Alert severity="success">Template saved successfully!</Alert>
                )}

                {/* Input Fields Section */}
                <InputFieldsPanel
                    fields={fields}
                    onAddAdminField={inputFieldHandlers.handleAddAdminField}
                    onAddUserField={inputFieldHandlers.handleAddUserField}
                    onEditField={inputFieldHandlers.handleEditField}
                    onDeleteField={inputFieldHandlers.handleDeleteField}
                />

                {/* Output Fields Section */}
                <OutputFieldsPanel
                    outputFields={outputFields}
                    userInputFields={userInputFields}
                    onAddIntegerModifier={outputFieldHandlers.handleAddIntegerModifier}
                    onAddCaseOutput={outputFieldHandlers.handleAddCaseOutput}
                    onEditField={outputFieldHandlers.handleEditField}
                    onDeleteField={outputFieldHandlers.handleDeleteField}
                />

                {/* Field Mapper Section */}
                {fields.length > 0 && (
                    <FieldMapperPanel fields={fields} outputFields={outputFields} />
                )}
            </Stack>

            {/* Input Field Editor Drawer */}
            <Drawer 
                open={inputFieldHandlers.editorOpen} 
                onClose={() => inputFieldHandlers.setEditorOpen(false)} 
                anchor="right" 
                PaperProps={{ sx: { width: "30vw" } }}
            >
                {inputFieldHandlers.selectedField && (
                    <Editor 
                        data={inputFieldHandlers.selectedField} 
                        onSave={inputFieldHandlers.handleSaveField} 
                    />
                )}
            </Drawer>

            {/* Output Field Editor Drawer */}
            <Drawer 
                open={outputFieldHandlers.editorOpen} 
                onClose={() => outputFieldHandlers.setEditorOpen(false)} 
                anchor="right" 
                PaperProps={{ sx: { width: "30vw" } }}
            >
                {outputFieldHandlers.selectedOutputField && (
                    <OutputFieldEditor 
                        data={outputFieldHandlers.selectedOutputField} 
                        onSave={outputFieldHandlers.handleSaveField} 
                        userInputFields={userInputFields}
                    />
                )}
            </Drawer>

            {/* Clear All Confirmation Dialog */}
            <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)}>
                <DialogTitle>Clear All Fields?</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete all input and output fields? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleClearAll} color="error" variant="contained">
                        Delete All
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}