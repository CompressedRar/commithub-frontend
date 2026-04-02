import { Button, FormControl, InputLabel } from "@mui/material";
import CalculateIcon from '@mui/icons-material/Calculate';
export default function CalculateRatingButton({ onCalculate, loading }) {

    return (
        <Button loading={loading} variant="outlined" startIcon={<CalculateIcon />} color="success" onClick={onCalculate}>                
            Calculate Rating
        </Button>
    )
}