import { Box, Button, Alert } from "@mui/material";
import { Typography } from "@mui/material";
import OutputFieldRecord from "../Record/OutputFieldRecord";

export default function OutputFieldsPanel({ 
    outputFields, 
    userInputFields,
    onAddIntegerModifier, 
    onAddCaseOutput, 
    onEditField, 
    onDeleteField 
}) {
    const canAddOutputFields = userInputFields && userInputFields.length > 0;

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Output Fields
            </Typography>

            <Box display={"flex"} gap={2} flexDirection={"row"} justifyContent={"flex-start"} mb={2}>
                <Button 
                    variant="contained" 
                    color="success" 
                    onClick={onAddIntegerModifier} 
                    disabled={!canAddOutputFields}
                >
                    + Add Integer Modifier
                </Button>

                <Button 
                    variant="contained" 
                    color="info" 
                    onClick={onAddCaseOutput} 
                    disabled={!canAddOutputFields}
                >
                    + Add Case Output
                </Button>
            </Box>

            {!canAddOutputFields && (
                <Alert severity="warning">
                    Please add at least one User input field before creating output fields.
                </Alert>
            )}

            {outputFields.length === 0 ? (
                <Alert severity="info">
                    No output fields added yet. Click "Add Integer Modifier" or "Add Case Output" to get started.
                </Alert>
            ) : (
                <Box 
                    display={"grid"} 
                    borderColor={"rgba(0, 0, 0, 0.12)"} 
                    border={1} 
                    width={"100%"} 
                    borderRadius={1}
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
                                Bound To
                            </Typography>
                        </div>
                        <div className="col-3">
                            <Typography variant="subtitle1" fontWeight="bold">
                                Actions
                            </Typography>
                        </div>
                    </div>
                    {outputFields.map((field) => (
                        <OutputFieldRecord
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
