import { IconButton, Stack, Typography } from "@mui/material";
import PendingIcon from '@mui/icons-material/Pending';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
export default function DocumentStatus({ status }) {



    return (
        <Stack alignItems={"center"} gap={1} >
            

            <IconButton aria-readonly disableRipple>
                {status === "approved" ? <CreditScoreIcon fontSize="large" color="success" /> : status === "rejected" ? <ThumbDownIcon fontSize="large" color="error" /> : <PendingIcon fontSize="large" />}
            </IconButton>
            <Typography fontSize={"small"}>
                {status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending"}
                
            </Typography>
        </Stack>
        
    )
}