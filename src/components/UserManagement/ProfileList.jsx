import React from "react";
import {
  Grid,
  Paper,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ProfileCard from "./ProfileCard";

/**
 * ProfileList Component
 * Displays a list of profiles with search functionality
 * @param {Array} profiles - List of profiles to display
 * @param {string} searchTerm - Current search term
 * @param {Function} onSearchChange - Callback for search input
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {Function} onCreateProfile - Callback for create profile button
 * @param {Function} onEditProfile - Callback for edit profile
 * @param {Function} onDeleteProfile - Callback for delete profile
 * @param {Function} onViewUsers - Callback for view users
 */
const ProfileList = ({
  profiles,
  searchTerm,
  onSearchChange,
  loading,
  error,
  onCreateProfile,
  onEditProfile,
  onDeleteProfile,
  onViewUsers
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <TextField
              fullWidth
              placeholder="Search profiles by email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateProfile}
            sx={{ whiteSpace: "nowrap" }}
          >
            New Profile
          </Button>
        </Stack>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : profiles.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography color="textSecondary">No profiles found</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {profiles.map((profile) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={profile.id}>
              <ProfileCard
                profile={profile}
                onEdit={() => onEditProfile(profile)}
                onDelete={() => onDeleteProfile(profile.id)}
                onViewUsers={() => onViewUsers(profile)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default ProfileList;
