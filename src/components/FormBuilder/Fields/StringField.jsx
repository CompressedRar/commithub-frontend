import { Box, TextField, Typography } from "@mui/material";

export default function StringField({ data, onClick}) {

    /*
    {
        "title": "example",
        "type": "string",
        "user": "admin"
        "class": "input"
        "description":"test desc"
    }
    
    */

    return (
        <Box onClick={() => onClick && onClick('String')} >
            <Typography variant="h6" gutterBottom>
                {data.title}
            </Typography>
            <TextField fullWidth label="String Field" variant="outlined" />
        </Box>
    )
}