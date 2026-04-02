import { Button } from "@mui/material";

export default function ApproveIPCRButton({ onApprove, disabled, loading }) {

    return (
        
        <Button variant="contained" color="success" onClick={onApprove} disabled={disabled} loading={loading}>
            Approve IPCR
        </Button>
    )
}