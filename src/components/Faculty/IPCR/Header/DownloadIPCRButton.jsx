import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function DownloadIPCRButton({ onDownload, downloading }) {

    return (
        <div className="d-flex gap-2">            
            <FormControl sx={{ width: "200px", padding: '0px' }} size="small" variant="outlined" disabled={downloading}>
                <InputLabel>Download IPCR</InputLabel>
                <Select
                    value=""
                    label="Download IPCR"
                    onChange={onDownload}
                    disabled={downloading}
                >
                    <MenuItem value="ipcr">Standard IPCR</MenuItem>
                    <MenuItem value="weighted">Weighted IPCR</MenuItem>
                    <MenuItem value="planned">Planned IPCR</MenuItem>
                </Select>
            </FormControl>
        </div>
    )
}