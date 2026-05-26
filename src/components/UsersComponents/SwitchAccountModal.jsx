import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import Swal from "sweetalert2";
import { AccountCollections } from "./AccountProfiles";

export default function SwitchAccountModal({
  open,
  onClose,
  accounts,
  currentAccountId,
  onSwitch,
  loading = false,
}) {
  const [switching, setSwitching] = useState(false);

  const handleSwitchAccount = async (profileId, userId) => {
    setSwitching(true);
    try {
      await onSwitch(profileId, userId);
      onClose();
    } catch (error) {
      console.error("Error switching account:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error || "Failed to switch account",
        "error"
      );
    } finally {
      setSwitching(false);
    }
  };

  if (!accounts || accounts.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1}>
            <SwitchAccountIcon color="primary" />
            <span>Switch Account</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info">No other accounts available</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={1}>
          <SwitchAccountIcon color="primary" />
          <span>Switch Account</span>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading accounts...
            </Typography>
          </Stack>
        ) : (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Click on an account to switch:
            </Typography>

            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              <AccountCollections
                accounts={accounts}
                onSwitch={handleSwitchAccount}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
