import { Box, TextField, Stack, Typography } from "@mui/material";

export default function FormRenderer({ fields, outputFields = [], values = {}, onChange = () => {}, readOnly = false }) {
    const handleChange = (fieldId, value) => {
        onChange(fieldId, value);
    };

    const renderField = (field) => {
        const value = values[field.id] || "";
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
                            value={value}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            multiline={false}
                        />
                    );

                case "Integer":
                    return (
                        <TextField
                            {...commonProps}
                            type="number"
                            value={value}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            inputProps={{ step: "1" }}
                        />
                    );

                default:
                    return (
                        <TextField
                            {...commonProps}
                            value={value}
                            onChange={(e) => handleChange(field.id, e.target.value)}
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
                {field.description && field.user === "User" && (
                    <Typography variant="caption" sx={{ color: "#666", mb: 1 }}>
                        {field.description}
                    </Typography>
                )}
                {inputComponent}
            </Stack>
        );
    };

    if (!fields || fields.length === 0) {
        return (
            <Box p={2}>
                <Typography color="textSecondary">No fields to display</Typography>
            </Box>
        );
    }

    const renderOutputField = (outputField) => {
        // In a real implementation, calculate the output based on formula/cases
        // For now, just show a preview
        return (
            <Stack spacing={0.5} key={outputField.id}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#2196F3" }}>
                    {outputField.title} (Output Field)
                </Typography>
                <TextField
                    fullWidth
                    value={outputField.type === "IntegerModifier" ? "[Calculated Value]" : "[Case Output]"}
                    disabled
                    variant="outlined"
                    helperText={`Bound to: ${outputField.inputFieldName}`}
                />
            </Stack>
        );
    };

    return (
        <Stack spacing={2}>
            {/* Input Fields */}
            {fields.map((field) => (
                <Box key={field.id}>{renderField(field)}</Box>
            ))}

            {/* Output Fields */}
            {outputFields && outputFields.length > 0 && (
                <>
                    <Box sx={{ borderTop: "2px solid #2196F3", pt: 2, mt: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#2196F3" }}>
                            Output Fields
                        </Typography>
                        {outputFields.map((field) => renderOutputField(field))}
                    </Box>
                </>
            )}
        </Stack>
    );
}
