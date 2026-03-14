import { useEffect, useState } from "react";
import { socket } from "../api";
import { useSettings } from "../../hooks/useSettings";
import { useAccount } from "../../hooks/useAccount";
import { formatDateDeadline } from "../../utils/date";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid'; // Using Grid2 for the latest standard
import AssignmentIcon from '@mui/icons-material/Assignment';
import LockIcon from '@mui/icons-material/Lock';

function IPCRContainer({ switchPage }) {

  const [deadlineIPCR, setDeadline] = useState(null);
  const [targetSettingDeadline, setTargetDeadline] = useState(null);

  const { settings, loading } = useSettings();
  const { account, accountIPCR } = useAccount();

  const hasAvailableIPCR = accountIPCR && accountIPCR.length > 0;
  const activeIPCR = accountIPCR?.find(ipcr => ipcr.status === 1);


  async function loadCurrentPhase() {
    try {
      setDeadline(settings?.monitoring_end_date);
      setTargetDeadline(settings?.planning_end_date);
    } catch (error) {
      console.error("Failed to load current phase:", error)
    }
  }


  useEffect(() => {
    loadCurrentPhase()
  }, [settings]);



  return (
    <Container maxWidth={false} sx={{ width: '100%', py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          maxWidth: '1600px',
          mx: 'auto',
          height: '85vh',
          p: 4,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            height: '75%',
            mb: 3
          }}
        >
          <Box
            sx={{
              height: '50%',
              bgcolor: 'primary.main',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                backgroundImage: `url('${import.meta.env.BASE_URL}nc-splash-new.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100%',
                opacity: 0.4
              }}
            />
          </Box>

          <Box sx={{ p: 3, flexGrow: 1, display: 'flex' }}>
            <Grid container spacing={2} sx={{ width: '100%' }} alignItems="flex-end">
              <Grid size={{ xs: 12, md: 9 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {hasAvailableIPCR ? "Your IPCR is now available." : "Your IPCR is being prepared."}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  IPCR form will be available once the tasks are assigned to this account.
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Target Setting Deadline:</Typography>
                    <Typography variant="subtitle2" color="error">
                      {targetSettingDeadline && formatDateDeadline(targetSettingDeadline)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Actual Accomplishment Deadline:</Typography>
                    <Typography variant="subtitle2" color="error">
                      {deadlineIPCR && formatDateDeadline(deadlineIPCR)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {activeIPCR ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AssignmentIcon />}
                    onClick={() => switchPage(activeIPCR.id, account?.department?.id)}
                    sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
                  >
                    
                    View IPCR
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled
                    startIcon={<LockIcon />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Unavailable
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>

        {!hasAvailableIPCR && (
          <Box sx={{ textAlign: 'center', mt: 'auto', mb: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Please check back later once your office head has assigned your tasks.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default IPCRContainer;
