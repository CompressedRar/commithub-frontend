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
        inputFieldName: "",
        formula: "0",
        cases: [],
    });

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || "",
                type: data.type || "IntegerModifier",
                inputFieldName: data.inputFieldName || "",
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
        if (!formData.inputFieldName) {
            alert("Please select an input field to bind with!");
            return;
        }
        if (formData.type === "CaseOutput" && formData.cases.length === 0) {
            alert("Please add at least one case for Case Output!");
            return;
        }
        onSave(formData);
    };

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

                    <Select
                        fullWidth
                        name="inputFieldName"
                        label="Bind with User Input Field"
                        value={formData.inputFieldName}
                        onChange={handleChange}
                        variant="outlined"
                        required
                    >
                        <MenuItem value="">
                            <em>Select a user input field</em>
                        </MenuItem>
                        {userInputFields.map((field) => (
                            <MenuItem key={field.id} value={field.name}>
                                {field.title} ({field.name})
                            </MenuItem>
                        ))}
                    </Select>

                    {formData.type === "IntegerModifier" && (
                        <TextField
                            fullWidth
                            label="Formula"
                            name="formula"
                            value={formData.formula}
                            onChange={handleChange}
                            placeholder="e.g., {field_name} * 2 + 5"
                            variant="outlined"
                            helperText="Backend formula using field names in curly braces. Will be processed on the server."
                            multiline
                            rows={2}
                        />
                    )}

                    {formData.type === "CaseOutput" && (
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Case Mappings
                            </Typography>
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
        </Box>
    );
}
