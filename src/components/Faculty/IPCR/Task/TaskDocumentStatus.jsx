import { Chip, IconButton, Stack, Tooltip } from "@mui/material";
import PendingIcon from '@mui/icons-material/Pending';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';


export default function TaskDocumentStats({ validDocumentCount, totalDocumentCount, pendingDocumentCount, rejectedDocumentCount }) {
    const statsMap = {
        "not_submitted": { text: "Not Submitted", color: "danger" },
        "submitted": { text: "Submitted", color: "warning" },
        "approved": { text: "Approved", color: "success" },
        "rejected": { text: "Rejected", color: "danger" },
    };

    return (
        <Stack direction={"column"} gap={1}>
            <Tooltip title={`${validDocumentCount} of ${totalDocumentCount} documents approved`}>
                <Chip
                    iconsize="extraSmall"
                    icon={<CheckIcon></CheckIcon>}
                    label={`${validDocumentCount}/${totalDocumentCount}`}
                    color={"success" }
                    size="extraSmall"
                />
            </Tooltip>
            
            <Tooltip title={`${rejectedDocumentCount} of ${totalDocumentCount} documents rejected`}>
                <Chip
                    iconsize="extraSmall"
                    icon={<ClearIcon></ClearIcon>}
                    label={`${rejectedDocumentCount}/${totalDocumentCount}`}
                    color={"error"}
                    size="extraSmall"
                />
            </Tooltip>

            <Tooltip title={`${pendingDocumentCount} of ${totalDocumentCount} documents pending`}>
                <Chip
                    iconsize="extraSmall"
                    icon={<PendingIcon></PendingIcon>}
                    label={`${pendingDocumentCount}/${totalDocumentCount}`}
                    color={"muted"}
                    size="extraSmall"
                />
            </Tooltip>
        </Stack>
    )
}
