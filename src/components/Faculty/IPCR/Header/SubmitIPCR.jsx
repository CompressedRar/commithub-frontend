import { Button } from "@mui/material";

export default function SubmitIPCRButton({onSubmit, disabled, status}) {

    return (
        
        <Button variant="contained" color="success" onClick={onSubmit} disabled={disabled || status != "draft"}>
            Submit IPCR
        </Button>
    )

}