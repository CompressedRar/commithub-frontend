import { Stack, Button, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export default function OutputFieldRecord({ field, onEdit, onDelete }) {
    const getTypeLabel = (type) => {
        return type === "IntegerModifier" ? "Integer Modifier" : "Case Output";
    };

    return (
        <div
            className="row"
            style={{
                padding: "1em",
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                alignItems: "center",
            }}
        >
            <div className="col-3">
                <h5 style={{ margin: 0 }}>{field.title}</h5>
            </div>
            <div className="col-3">
                <Chip
                    label={getTypeLabel(field.type)}
                    size="small"
                    variant="outlined"
                    color={field.type === "IntegerModifier" ? "primary" : "info"}
                />
            </div>
            <div className="col-3">
                <Chip
                    label={`Bound to: ${field.inputFieldName}`}
                    size="small"
                    variant="outlined"
                />
            </div>
            <div className="col-3">
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                </Stack>
            </div>
        </div>
    );
}
