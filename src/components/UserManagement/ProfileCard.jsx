import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Stack
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";

/**
 * ProfileCard Component
 * Displays profile information with action buttons
 * @param {Object} profile - Profile data
 * @param {Function} onEdit - Callback for edit button
 * @param {Function} onDelete - Callback for delete button
 * @param {Function} onViewUsers - Callback for view users button
 */
const ProfileCard = ({ profile, onEdit, onDelete, onViewUsers }) => {
  if (!profile) {
    return <Typography color="error">No profile data</Typography>;
  }

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: 2,
        "&:hover": { boxShadow: 4 }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          component="h3"
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          {profile.email}
        </Typography>


        <Box sx={{ mt: 2, mb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={profile.two_factor_enabled ? "2FA Enabled" : "2FA Disabled"}
              color={profile.two_factor_enabled ? "success" : "default"}
              size="small"
            />
            <Chip
              label={profile.active_status ? "Active" : "Inactive"}
              color={profile.active_status ? "success" : "error"}
              size="small"
            />
          </Stack>
        </Box>

        {profile.created_at && (
          <Typography variant="caption" color="textSecondary">
            Created: {new Date(profile.created_at).toLocaleDateString()}
          </Typography>       
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PeopleIcon />}
          onClick={onViewUsers}
          fullWidth
        >
          Users ({profile.accounts_count || 0})
        </Button>
        <IconButton
          size="small"
          color="primary"
          onClick={onEdit}
          title="Edit profile"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          title="Delete profile"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ProfileCard;
