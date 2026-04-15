import { Box, Button, Alert } from "@mui/material";
import { Typography } from "@mui/material";
import Record from "../Record/Record";

export default function InputFieldsPanel({ 
    fields, 
    onAddAdminField, 
    onAddUserField, 
    onEditField, 
    onDeleteField 
}) {
    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Input Fields
            </Typography>

            <Box display={"flex"} gap={2} flexDirection={"row"} justifyContent={"flex-start"} mb={2}>
                <Button variant="contained" color="primary" onClick={onAddAdminField}>
                    + Add Admin Field
                </Button>

                <Button variant="contained" color="secondary" onClick={onAddUserField}>
                    + Add User Field
                </Button>
            </Box>

            {fields.length === 0 ? (
                <Alert severity="info">
                    No input fields added yet. Click "Add Admin Field" or "Add User Field" to get started.
                </Alert>
            ) : (
                <Box 
                    display={"grid"} 
                    borderColor={"rgba(0, 0, 0, 0.12)"} 
                    border={1} 
                    width={"100%"} 
                    borderRadius={1} 
                    mb={2}
                >
                    <div className="row" style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)", padding: "1em", backgroundColor: "#f5f5f5" }}>
                        <div className="col-3">
                            <Typography variant="subtitle1" fontWeight="bold">
                                Title
                            </Typography>
                        </div>
                        <div className="col-3">
                            <Typography variant="subtitle1" fontWeight="bold">
                                Type
                            </Typography>
                        </div>
                        <div className="col-3">
                            <Typography variant="subtitle1" fontWeight="bold">
                                User Type
                            </Typography>
                        </div>
                        <div className="col-3">
                            <Typography variant="subtitle1" fontWeight="bold">
                                Actions
                            </Typography>
                        </div>
                    </div>
                    {fields.map((field) => (
                        <Record
                            key={field.id}
                            field={field}
                            onEdit={() => onEditField(field)}
                            onDelete={() => onDeleteField(field.id)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
