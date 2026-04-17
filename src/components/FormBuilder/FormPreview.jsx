import { Box, Card, CardContent, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from "@mui/material";
import { Preview as PreviewIcon } from "@mui/icons-material";
import { useState } from "react";
import FormRenderer from "./FormRenderer";
import { createFormSubmission, formatSubmissionData, getErrorMessage } from "../../services/formBuilderService";
import Swal from "sweetalert2";

export default function FormPreview({ fields, outputFields = [], templateId = null }) {
    const [open, setOpen] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleChange = (fieldId, value) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!templateId) {
            Swal.fire("Error", "Template not found. Please save the template first.", "error");
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            const fieldValues = formatSubmissionData(formValues, fields);
            const result = await createFormSubmission(templateId, fieldValues, false);
            
            Swal.fire("Success", "Form submitted successfully!", "success");
            setFormValues({});
            setOpen(false);
        } catch (error) {
            const errorMsg = getErrorMessage(error);
            setSubmitError(errorMsg);
            Swal.fire("Error", errorMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!templateId) {
            Swal.fire("Error", "Template not found. Please save the template first.", "error");
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        try {
            const fieldValues = formatSubmissionData(formValues, fields);
            await createFormSubmission(templateId, fieldValues, true);
            
            Swal.fire("Success", "Form saved as draft!", "info");
            setFormValues({});
            setOpen(false);
        } catch (error) {
            const errorMsg = getErrorMessage(error);
            setSubmitError(errorMsg);
            Swal.fire("Error", errorMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                color="info"
                startIcon={<PreviewIcon />}
                onClick={() => setOpen(true)}
                disabled={fields.length === 0}
            >
                Preview Form
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Form Preview</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ py: 2 }}>
                        <FormRenderer
                            fields={fields}
                            outputFields={outputFields}
                            values={formValues}
                            onChange={handleChange}
                        />
                        {submitError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {submitError}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={submitting}>
                        Close
                    </Button>
                    {templateId && (
                        <Button 
                            onClick={handleSaveDraft} 
                            variant="outlined"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : "Save Draft"}
                        </Button>
                    )}
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={submitting || !templateId}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
