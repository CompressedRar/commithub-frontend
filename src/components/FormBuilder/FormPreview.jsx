import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Select,
    MenuItem
} from "@mui/material";
import { Preview as PreviewIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import FormRenderer from "./FormRenderer";
import Swal from "sweetalert2";

import {
    createTask,
    submitTask,
    getErrorMessage
} from "../../services/formBuilderService";
import { getCategories } from "../../services/categoryService";

export default function FormPreview({
    fields,
    outputFields = [],
    templateId = null,
    mode = "admin", // "admin" | "user"
    task = null
}) {
    const [open, setOpen] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const handleChange = (fieldId, value) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleLoadCategories = async () => {
        try {
            const res = await getCategories();
            console.log("Fetched categories:", res.data);
            setCategories(res.data || []);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            if (mode === "admin") {
                if (!templateId) {
                    throw new Error("Template ID is required");
                }

                await createTask({
                    template_id: templateId,
                    values: formValues,
                    category_id: selectedCategory
                });

                Swal.fire("Success", "Task created successfully!", "success");
            }

            else if (mode === "user") {
                if (!task?.id) {
                    throw new Error("Task not found");
                }

                await submitTask(task.id, formValues);

                Swal.fire("Success", "Response submitted!", "success");
            }

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

    useEffect(() => {
        if (open) {
            handleLoadCategories();
        }
    }, [open]);

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
                <DialogTitle>
                    {mode === "admin" ? "Create Task" : "Answer Task"}
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ py: 2 }}>
                        {mode === "admin" && categories.length > 0 && (
                            <Box>
                                <strong>Category</strong>
                                <Select label="Category" fullWidth displayEmpty sx={{ mb: 2 }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                    
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        )}

                        {/* 🔥 Show task values (admin-defined) when user answers */}
                        {mode === "user" && task?.values && (
                            <Box sx={{ mb: 2 }}>
                                <strong>Task Details:</strong>
                                <pre style={{ fontSize: "12px" }}>
                                    {JSON.stringify(task.values, null, 2)}
                                </pre>
                            </Box>
                        )}

                        <FormRenderer
                            fields={fields}
                            outputFields={outputFields}
                            values={formValues}
                            onChange={handleChange}
                            mode={mode}
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

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Processing..."
                            : mode === "admin"
                                ? "Create Task"
                                : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}