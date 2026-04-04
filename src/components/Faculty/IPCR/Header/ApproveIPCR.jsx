import { Button, Tooltip } from "@mui/material";

export default function ApproveIPCRButton({ onApprove, disabled, loading, validTasks, totalTasks }) {

    return (
        
        <Tooltip title={"All tasks must have at least one valid document to approve."}>
            <Button variant="contained" color="success" onClick={onApprove} disabled={disabled || validTasks < totalTasks} loading={loading}>
                Approve IPCR 
            </Button>
        </Tooltip>
    )
}