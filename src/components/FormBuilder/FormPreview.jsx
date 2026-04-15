import { Box, Card, CardContent, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Preview as PreviewIcon } from "@mui/icons-material";
import { useState } from "react";
import FormRenderer from "./FormRenderer";

export default function FormPreview({ fields, outputFields = [] }) {
    const [open, setOpen] = useState(false);
    const [formValues, setFormValues] = useState({});

    const handleChange = (fieldId, value) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleSubmit = () => {
        console.log("Form submitted with values:", formValues);
        alert(JSON.stringify(formValues, null, 2));
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
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
