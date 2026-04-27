import { Chip } from "@mui/material";

export default function IPCRStatus({status}) {
    const statusColors = {
        "draft": "warning",
        "submitted": "primary",
        "approved": "success",
        "rejected": "error"
    };

    return (
        
        <Chip 
            label={status ? status.toUpperCase() : "UNASSIGNED"} 
            size="small" 
            color={statusColors[status] || "default"} 
        />
    );
}
