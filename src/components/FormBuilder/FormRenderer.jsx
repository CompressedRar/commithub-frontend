import { Box, TextField, Stack, Typography } from "@mui/material";

export default function FormRenderer({
    fields = [],
    outputFields = [],
    values = {},
    onChange = () => {},
    readOnly = false,
    mode = "admin", // "admin" | "user"
}) {

    // 🔥 Normalize field id (CRITICAL FIX)
    const getFieldKey = (field) => field.id;

    const handleChange = (fieldId, value) => {
        onChange(fieldId, {"value": value, "title": fields.find(f => f.id === fieldId)?.title || "Unnamed Field"});
    };

    // 🔥 Filter fields based on mode
    const filteredFields = fields.filter((field) => {
        if (mode === "admin") return field.user === "Admin";
        if (mode === "user") return field.user === "User";
        return false;
    });

    const renderField = (field) => {
        const fieldKey = getFieldKey(field);
        const value = values[fieldKey] ?? "";

        const commonProps = {
            fullWidth: true,
            placeholder: field.placeholder,
            disabled: readOnly,
            required: field.required,
            variant: "outlined",
            margin: "none",
        };

        const inputComponent = (() => {
            switch (field.type) {
                case "String":
                    return (
                        <TextField
                            {...commonProps}
                            value={value.value}
                            onChange={(e) => {
                                console.log("Integer field change:",fieldKey, e.target.value);
                                handleChange(fieldKey, e.target.value)
                            }}
                        />
                    );

                case "Integer":
                    return (
                        <TextField
                            {...commonProps}
                            type="number"
                            value={value.value}
                            onChange={(e) => {
                                console.log("Integer field change:",fieldKey, e.target.value);
                                handleChange(fieldKey, e.target.value)
                            }}
                            inputProps={{ step: "1" }}
                            helperText={
                                mode === "admin"
                                    ? "Define the expected integer value."
                                    : "Enter a numeric value."
                            }
                        />
                    );

                case "Number":
                    return (
                        <TextField
                            {...commonProps}
                            type="number"
                            value={value.value}
                            onChange={(e) => {
                                console.log("Integer field change:",fieldKey, e.target.value);
                                handleChange(fieldKey, e.target.value)
                            }}
                        />
                    );

                default:
                    return (
                        <TextField
                            {...commonProps}
                            value={value.value}
                            onChange={(e) => {
                                console.log("Integer field change:",fieldKey, e.target.value);
                                handleChange(fieldKey, e.target.value)
                            }}
                        />
                    );
            }
        })();

        return (
            <Stack spacing={0.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {field.title}
                    {field.required && <span style={{ color: "red" }}> *</span>}
                </Typography>

                {/* 🔥 Only show description to USER mode */}
                {field.description && mode === "user" && (
                    <Typography variant="caption" sx={{ color: "#666", mb: 1 }}>
                        {field.description}
                    </Typography>
                )}

                {inputComponent}
            </Stack>
        );
    };

    const renderOutputField = (outputField) => {
        return (
            <Stack spacing={0.5} key={outputField.field_id}>
                <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", color: "#2196F3" }}
                >
                    {outputField.title} (Output)
                </Typography>

                <TextField
                    fullWidth
                    value={
                        outputField.type === "IntegerModifier"
                            ? "[Calculated Value]"
                            : "[Case Output]"
                    }
                    disabled
                    variant="outlined"
                    helperText={`Bound to: ${
                        Array.isArray(outputField.inputFieldNames)
                            ? outputField.inputFieldNames.join(", ")
                            : outputField.inputFieldName
                    }`}
                />
            </Stack>
        );
    };

    if (!filteredFields || filteredFields.length === 0) {
        return (
            <Box p={2}>
                <Typography color="textSecondary">
                    No fields available for this mode
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {/* Input Fields */}
            {filteredFields.map((field) => (
                <Box key={field.field_id}>{renderField(field)}</Box>
            ))}

            {/* 🔥 Output fields should only appear in USER mode */}
            {mode === "user" && outputFields && outputFields.length > 0 && (
                <Box sx={{ borderTop: "2px solid #2196F3", pt: 2, mt: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 2, color: "#2196F3" }}
                    >
                        Output Fields
                    </Typography>

                    {outputFields.map((field) => renderOutputField(field))}
                </Box>
            )}
        </Stack>
    );
}