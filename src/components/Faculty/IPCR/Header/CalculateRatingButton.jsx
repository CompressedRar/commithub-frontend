import { Button, FormControl, InputLabel } from "@mui/material";
import CalculateIcon from '@mui/icons-material/Calculate';
export default function CalculateRatingButton({ onCalculate, loading }) {

    return (
        <div className="d-flex gap-2">
            <Button loading={loading} variant="contained" startIcon={<CalculateIcon />} color="success" onClick={onCalculate}>                
                Calculate Rating
            </Button>
        </div>
    )
}