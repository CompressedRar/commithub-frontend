import { Box, TextField, Typography } from "@mui/material";
import NumberField from "./NumberField";

export default function IntegerField({data, onClick}) {
    /*
    {
        "title": "example",
        "type": "integer",
        "user": "user"
        "class": "input"
        "description":"test desc"

        "name": "quantity"
    }
    
    */
    return (
        <Box onClick={() => onClick && onClick('Integer')}>
            <Typography variant="h6" gutterBottom>
                {data.title}
            </Typography>
            <NumberField fullWidth label="Integer Field" variant="outlined" />
        </Box>
    )
}