
import { Box, Button, Stack, Typography } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';

export const EmptyState = ({ message }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            padding: 4,
            textAlign: 'center',
            color: 'text.secondary',
        }}
    >
        <FileCopyIcon sx={{ fontSize: 60, color: 'action.disabled' }} />
        <Typography variant="body1" fontWeight="medium">
            {message}
        </Typography>
    </Box>
);
import PivotTableChartIcon from '@mui/icons-material/PivotTableChart';
export const SectionHeader = ({ title, onAction, actionLoading, showAction }) => (
    <Stack direction={"row"} gap={1} justifyContent={"space-between"} marginY={1}>

        <Typography variant="h5" fontWeight="bold">
            {title}
        </Typography>
        {showAction && (
            <Button startIcon={<PivotTableChartIcon />} variant="outlined" color="primary" onClick={onAction} disabled={actionLoading} loading={actionLoading}>
                Consolidate IPCRs
            </Button>
            
        )}
    </Stack>
);