import { Button } from "@mui/material";

export default function SubmitIPCRButton({onSubmit, disabled, status}) {

    return (
        status =="draft" &&
        <Button variant="contained" color="success" onClick={onSubmit} disabled={disabled}>
            Submit IPCR
        </Button>
    )

}