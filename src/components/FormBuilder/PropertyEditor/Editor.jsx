import { Box, Button, MenuItem, Select, Stack, TextField, Typography, FormControlLabel, Checkbox, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

export default function Editor({ data, onSave }) {
    const [formData, setFormData] = useState({
        title: "",
        placeholder: "",
        description: "",
        name: "",
        user: "Admin",
        type: "String",
        required: false,
    });

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || "",
                placeholder: data.placeholder || "",
                description: data.description || "",
                name: data.name || "",
                user: data.user || "Admin",
                type: data.type || "String",
                required: data.required || false,
            });
        }
    }, [data]);

    useEffect(() => {
        // Auto-correct field type when user type changes
        const availableTypes = formData.user === "Admin" ? ["String"] : ["Integer"];
        if (!availableTypes.includes(formData.type)) {
            setFormData((prev) => ({
                ...prev,
                type: availableTypes[0],
            }));
        }
    }, [formData.user]);

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: inputType === "checkbox" ? checked : value,
        }));
    };

    const handleSave = () => {
        if (!formData.title.trim()) {
            alert("Field title is required!");
            return;
        }
        onSave(formData);
    };

    // Restrict field types based on user role
    const getAvailableFieldTypes = () => {
        if (formData.user === "Admin") {
            return ["String"];
        } else {
            return ["Integer"];
        }
    };

    const fieldTypes = getAvailableFieldTypes();
    const userTypes = ["Admin", "User"];

    return (
        <Box padding={"2em"} width={"100%"} height={"100vh"} display="flex" flexDirection="column">
            <Stack spacing={2} flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom>
                        {data?.title ? `${data.title} - Field Editor` : "New Field Editor"}
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
                        label="Field Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Task Description"
                        variant="outlined"
                        required
                        helperText="The label shown for this field"
                    />

                    <TextField
                        fullWidth
                        label="Placeholder Text"
                        name="placeholder"
                        value={formData.placeholder}
                        onChange={handleChange}
                        placeholder="e.g., Enter task description..."
                        variant="outlined"
                        helperText="Helper text shown inside the input field"
                    />

                    {formData.user === "User" && (
                        <TextField
                            fullWidth
                            label="Field Name (Variable Name)"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., user_score"
                            variant="outlined"
                            helperText="Unique identifier used to bind with output fields (no spaces)"
                        />
                    )}

                    {formData.user === "User" && (
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g., Please provide details about..."
                            variant="outlined"
                            multiline
                            rows={3}
                            helperText="Description shown below the field title for User inputs"
                        />
                    )}

                    <Select
                        fullWidth
                        name="user"
                        label="User Type"
                        value={formData.user}
                        onChange={handleChange}
                        variant="outlined"
                    >
                        {userTypes.map((userType) => (
                            <MenuItem key={userType} value={userType}>
                                {userType === "Admin" ? "Admin Input" : "User Input"}
                            </MenuItem>
                        ))}
                    </Select>

                    <TextField
                        fullWidth
                        name="type"
                        label="Field Type"
                        value={formData.type}
                        onChange={handleChange}
                        variant="outlined"
                        disabled
                    >
                    </TextField>

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
                    Save Field
                </Button>
            </Stack>
        </Box>
    );
}