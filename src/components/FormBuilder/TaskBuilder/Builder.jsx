import { Box, Button, Drawer, Stack, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Editor from "../PropertyEditor/Editor";
import OutputFieldEditor from "../PropertyEditor/OutputFieldEditor";
import InputFieldsPanel from "../Panels/InputFieldsPanel";
import OutputFieldsPanel from "../Panels/OutputFieldsPanel";
import FieldMapperPanel from "../FieldMapper/FieldMapperPanel";
import FormPreview from "../FormPreview";
import TemplateLoaderDialog from "../TemplateLoaderDialog";
import useFormBuilder from "../../../hooks/useFormBuilder";
import useFieldHandlers from "../../../hooks/useFieldHandlers";
import useOutputFieldHandlers from "../../../hooks/useOutputFieldHandlers";

import { useTemplateManagement } from "../../../hooks/useTemplateManagement";
import { useTemplateLoader } from "../../../hooks/useTemplateLoader";
import { useLoadTemplates } from "../../../hooks/useLoadTemplates";
import { sampleTaskData } from "../sampleTaskData";
import useFieldMapper from "../../../hooks/useFieldMapper";



export default function Builder({ onTemplateSaved = null }) {
    const formBuilderHook = useFormBuilder();
    const { fields, outputFields, clearFields, getUserInputFields, loadFields, loadOutputFields } = formBuilderHook;
    
    const {
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
        loadMappingFromTemplate
    } = useFieldMapper();


    const inputFieldHandlers = useFieldHandlers(formBuilderHook);
    const outputFieldHandlers = useOutputFieldHandlers(formBuilderHook);

    const {
        templateName,
        setTemplateName,
        saveDialogOpen,
        savingTemplate,
        saveError,
        saveSuccess,
        openSaveDialog,
        closeSaveDialog,
        saveTemplate,
    } = useTemplateManagement();

    const { loading: loadingTemplate, loadTemplate } = useTemplateLoader();
    const { templates, loading: loadingTemplates, error: templatesError } = useLoadTemplates();

    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [loaderDialogOpen, setLoaderDialogOpen] = useState(false);

    const handleClearAll = () => {
        clearFields();
        setClearConfirmOpen(false);
    };

    const handleSaveTemplate = async () => {

        console.log("Saving template with data:", { fields, outputFields, gridConfig, fieldMapping, columnMapping });
        await saveTemplate({ fields, outputFields, gridConfig, fieldMapping, columnMapping }, onTemplateSaved);
    };

    const handleLoadSampleData = () => {
        // Load sample data
        formBuilderHook.loadFields(sampleTaskData.inputFields);
        formBuilderHook.loadOutputFields(sampleTaskData.outputFields);
    };

    const handleLoadTemplateFromDialog = async (template) => {
        // Check if there are existing fields and ask for confirmation
        if (fields.length > 0 || outputFields.length > 0) {
            const result = await new Promise((resolve) => {
                import("sweetalert2").then(({ default: Swal }) => {
                    Swal.fire({
                        title: "Load Template?",
                        text: "This will replace your current fields. Continue?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Load",
                    }).then((result) => {
                        resolve(result.isConfirmed);
                    });
                });
            });

            if (!result) return;
        }

        // Load the template
        const templateData = await loadTemplate(template.id);
        console.log(templateData)
        
        if (templateData) {
            // Clear current fields
            clearFields();
            
            // Load the template fields
            if (templateData.inputFields && templateData.inputFields.length > 0) {
                console.log("Loading input fields:", templateData.inputFields);
                loadFields(templateData.inputFields);
            }
            if (templateData.outputFields && templateData.outputFields.length > 0) {
                console.log("Loading output fields:", templateData.outputFields);
                loadOutputFields(templateData.outputFields);
            }
            if (templateData.gridConfig) {
                console.log("Loading grid config:", templateData.gridConfig);
                updateGridDimensions(templateData.gridConfig.rows, templateData.gridConfig.columns);
            }
            if (templateData.fieldMapping) {
                console.log("Loading field mapping:", templateData);
                loadMappingFromTemplate(templateData);
            }


            import("sweetalert2").then(({ default: Swal }) => {
                Swal.fire(
                    "Loaded",
                    `Template "${templateData.templateName}" loaded successfully!`,
                    "success"
                );
            });
        }
    };

    const userInputFields = getUserInputFields();

    useEffect(() => {
        console.log("Fields, outputFields, gridConfig, fieldMapping, or columnMapping changed:", { fields, outputFields, gridConfig, fieldMapping, columnMapping });
    }, [gridConfig, fieldMapping, columnMapping, fields, outputFields]);

    return (
        <Box padding={"2em"}>
            <Stack spacing={3}>
                {/* Header */}
                <Box display={"flex"} gap={2} justifyContent={"space-between"} alignItems={"center"}>
                    <Typography variant="h4">Form Template Builder</Typography>
                    <Box display={"flex"} gap={1}>
                        <Button 
                            variant="outlined" 
                            color="success" 
                            onClick={() => setLoaderDialogOpen(true)}
                            sx={{ textTransform: 'none' }}
                            disabled={loadingTemplate}
                        >
                            📂 Load Template
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="info" 
                            onClick={handleLoadSampleData}
                            sx={{ textTransform: 'none' }}
                        >
                            📋 Load Sample Task
                        </Button>
                        <FormPreview fields={fields} outputFields={outputFields} templateId={null} />
                        <Button 
                            variant="contained" 
                            onClick={openSaveDialog}
                            disabled={fields.length === 0}
                        >
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

                {templatesError && (
                    <Alert severity="warning">{templatesError}</Alert>
                )}

                {templates.length > 0 && !loadingTemplates && (
                    <Alert severity="info">
                        {templates.length} template{templates.length !== 1 ? "s" : ""} available. Click "Load Template" to use one.
                    </Alert>
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
                {fields.length > 0 && (gridConfig != {} && fieldMapping != {} && columnMapping != {}) && (
                    <FieldMapperPanel key={templateName} fields={fields} outputFields={outputFields}  gridConfig={gridConfig} fieldMapping={fieldMapping} columnMapping={columnMapping} updateGridDimensions={updateGridDimensions} addFieldToCell={addFieldToCell} updateFieldSpan={updateFieldSpan} removeFieldFromCell={removeFieldFromCell} assignFieldToColumn={assignFieldToColumn} getFieldAtCell={getFieldAtCell} clearMapping={clearMapping} exportMapping={exportMapping}  />
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

            {/* Save Template Dialog */}
            <Dialog open={saveDialogOpen} onClose={closeSaveDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Save Template</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 2 }}>
                        <TextField
                            autoFocus
                            label="Template Name"
                            placeholder="e.g., Performance Review 2024"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveTemplate();
                                }
                            }}
                            fullWidth
                            disabled={savingTemplate}
                        />
                        {saveError && (
                            <Alert severity="error">{saveError}</Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeSaveDialog} disabled={savingTemplate}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveTemplate} 
                        variant="contained"
                        disabled={savingTemplate || !templateName.trim()}
                    >
                        {savingTemplate ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Template Loader Dialog */}
            <TemplateLoaderDialog
                open={loaderDialogOpen}
                onClose={() => setLoaderDialogOpen(false)}
                onLoadTemplate={handleLoadTemplateFromDialog}
            />
        </Box>
    );
}