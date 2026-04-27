import { Box, Button, MenuItem, Select, Stack, TextField, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function OutputFieldEditor({ data, onSave, userInputFields = [] }) {
    const [formData, setFormData] = useState({
        title: "",
        type: "IntegerModifier",
        inputFieldNames: [],
        formula: "0",
        cases: [],
    });

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || "",
                type: data.type || "IntegerModifier",
                inputFieldNames: Array.isArray(data.inputFieldNames)
                    ? data.inputFieldNames
                    : (data.inputFieldName ? [data.inputFieldName] : []),
                formula: data.formula || "0",
                cases: data.cases || [],
            });
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddCase = () => {
        setFormData((prev) => ({
            ...prev,
            cases: [...prev.cases, { condition: "", output: "" }],
        }));
    };

    const handleUpdateCase = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            cases: prev.cases.map((caseItem, idx) =>
                idx === index ? { ...caseItem, [field]: value } : caseItem
            ),
        }));
    };

    const handleDeleteCase = (index) => {
        setFormData((prev) => ({
            ...prev,
            cases: prev.cases.filter((_, idx) => idx !== index),
        }));
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            alert("Output field title is required!");
            return;
        }
        if (formData.type === "IntegerModifier") {
            if (formData.inputFieldNames.length === 0) {
                alert("Please select at least one input field for Integer Modifier!");
                return;
            }
            if (formData.inputFieldNames.length > 2) {
                alert("Integer Modifier can reference up to 2 input fields maximum!");
                return;
            }
        } else if (formData.type === "CaseOutput") {
            if (formData.inputFieldNames.length === 0) {
                alert("Please select an input field!");
                return;
            }
            if (formData.cases.length === 0) {
                alert("Please add at least one case for Case Output!");
                return;
            }
        }
        onSave(formData);
    };

    const handleSelectField = (fieldName) => {
        setFormData((prev) => {
            const isSelected = prev.inputFieldNames.includes(fieldName);
            if (isSelected) {
                return {
                    ...prev,
                    inputFieldNames: prev.inputFieldNames.filter((f) => f !== fieldName),
                };
            } else {
                if (prev.inputFieldNames.length >= 2) {
                    alert("Integer Modifier can only reference up to 2 fields!");
                    return prev;
                }
                return {
                    ...prev,
                    inputFieldNames: [...prev.inputFieldNames, fieldName],
                };
            }
        });
    };

    const numberInputFields = userInputFields.filter(
        (field) => field.type === "Integer"
    );

    return (
        <Box padding={"2em"} width={"100%"} height={"100vh"} display="flex" flexDirection="column">
            <Stack spacing={2} flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom>
                        {data?.title ? `${data.title} - Output Field Editor` : "New Output Field Editor"}
                    </Typography>
                </Box>

                <Divider />

                {formData.title && (
                    <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                        {formData.title}
                    </Typography>
                )}

                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="Output Field Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Final Score"
                        variant="outlined"
                        required
                        helperText="The label shown for this output field"
                    />

                    <Select
                        fullWidth
                        name="type"
                        label="Output Type"
                        value={formData.type}
                        onChange={handleChange}
                        variant="outlined"
                    >
                        <MenuItem value={"IntegerModifier"}>Integer Modifier</MenuItem>
                        <MenuItem value={"CaseOutput"}>Case Output</MenuItem>
                    </Select>

                    {formData.type === "IntegerModifier" && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Select Number Input Fields (Up to 2)
                                <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                                    Currently selected: {formData.inputFieldNames.length}/2
                                </Typography>
                            </Typography>
                            {numberInputFields.length === 0 ? (
                                <Typography variant="body2" color="error">
                                    No number input fields available. Create Integer fields first.
                                </Typography>
                            ) : (
                                <Box sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2 }}>
                                    {numberInputFields.map((field) => (
                                        <Box
                                            key={field.id}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                p: 1.5,
                                                mb: 1,
                                                backgroundColor: formData.inputFieldNames.includes(field.name)
                                                    ? "#e3f2fd"
                                                    : "transparent",
                                                border: formData.inputFieldNames.includes(field.name)
                                                    ? "2px solid #1976d2"
                                                    : "1px solid #e0e0e0",
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                "&:hover": { backgroundColor: "#f5f5f5" },
                                            }}
                                            onClick={() => handleSelectField(field.name)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.inputFieldNames.includes(field.name)}
                                                onChange={() => handleSelectField(field.name)}
                                                style={{ cursor: "pointer" }}
                                            />
                                            <Box flex={1}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {field.title}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {field.name} (Type: {field.type})
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            <TextField
                                fullWidth
                                label="Formula"
                                name="formula"
                                value={formData.formula}
                                onChange={handleChange}
                                placeholder={
                                    formData.inputFieldNames.length === 1
                                        ? "e.g., {" + formData.inputFieldNames[0] + "} * 2"
                                        : formData.inputFieldNames.length === 2
                                        ? "e.g., {" +
                                          formData.inputFieldNames[0] +
                                          "} + {" +
                                          formData.inputFieldNames[1] +
                                          "} * 1.5"
                                        : "e.g., {fieldName} * 2"
                                }
                                variant="outlined"
                                helperText="Backend formula using field names in curly braces. Will be processed on the server."
                                multiline
                                rows={2}
                            />
                        </Stack>
                    )}

                    {formData.type === "CaseOutput" && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Select Input Field
                            </Typography>
                            {numberInputFields.length === 0 ? (
                                <Typography variant="body2" color="error">
                                    No number input fields available. Create Integer fields first.
                                </Typography>
                            ) : (
                                <Box sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2 }}>
                                    {numberInputFields.map((field) => (
                                        <Box
                                            key={field.id}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                p: 1.5,
                                                mb: 1,
                                                backgroundColor: formData.inputFieldNames.includes(field.name)
                                                    ? "#e3f2fd"
                                                    : "transparent",
                                                border: formData.inputFieldNames.includes(field.name)
                                                    ? "2px solid #1976d2"
                                                    : "1px solid #e0e0e0",
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                "&:hover": { backgroundColor: "#f5f5f5" },
                                            }}
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    inputFieldNames: [field.name],
                                                }))
                                            }
                                        >
                                            <input
                                                type="radio"
                                                name="caseInput"
                                                checked={formData.inputFieldNames.includes(field.name)}
                                                onChange={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        inputFieldNames: [field.name],
                                                    }))
                                                }
                                                style={{ cursor: "pointer" }}
                                            />
                                            <Box flex={1}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {field.title}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {field.name} (Type: {field.type})
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            <Table size="small" sx={{ border: "1px solid #ddd" }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableCell>Condition</TableCell>
                                        <TableCell>Output Text</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.cases.map((caseItem, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={caseItem.condition}
                                                    onChange={(e) =>
                                                        handleUpdateCase(index, "condition", e.target.value)
                                                    }
                                                    placeholder="e.g., value > 50"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={caseItem.output}
                                                    onChange={(e) =>
                                                        handleUpdateCase(index, "output", e.target.value)
                                                    }
                                                    placeholder="e.g., Excellent"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteCase(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddCase}
                                size="small"
                            >
                                Add Case
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={() => onSave(null)}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    Save Output Field
                </Button>
            </Stack>
        </Box >
    );
}
