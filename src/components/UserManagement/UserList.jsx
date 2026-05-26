import React from "react";
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  Alert,
  Skeleton
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

import UserCard from "./UserCard";

/**
 * UserList Component
 * Modern responsive user management layout
 */
const UserList = ({
  users = [],
  loading = false,
  error = "",
  onAddUser,
  onEditUser,
  onDeleteUser,
  profileEmail
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 5,
        p: { xs: 2, md: 3 },
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(to bottom right, #ffffff, #fafafa)"
      }}
    >
      {/* HEADER */}
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          {/* LEFT SECTION */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primary.main",
                color: "white"
              }}
            >
              <GroupRoundedIcon />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                Account Profiles
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {profileEmail}
              </Typography>
            </Box>
          </Stack>

          {/* RIGHT SECTION */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            width={{ xs: "100%", md: "auto" }}
          >
            <TextField
              size="small"
              placeholder="Search users..."
              sx={{
                minWidth: { xs: "100%", sm: 260 }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={onAddUser}
              sx={{
                borderRadius: 3,
                px: 2.5,
                whiteSpace: "nowrap",
                boxShadow: "none",
                textTransform: "none",
                fontWeight: 600,
                minHeight: 40
              }}
            >
              Add User
            </Button>
          </Stack>
        </Stack>

        {/* STATS BAR */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: "grey.100"
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600
            }}
          >
            {users.length}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Total Users
          </Typography>
        </Stack>

        <Divider />

        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 3
            }}
          >
            {error}
          </Alert>
        )}

        {/* LOADING */}
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)"
              },
              gap: 3
            }}
          >
            {[...Array(8)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={300}
                sx={{
                  borderRadius: 4
                }}
              />
            ))}
          </Box>
        ) : users.length === 0 ? (
          /* EMPTY STATE */
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{
              py: 10,
              textAlign: "center"
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "grey.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <GroupRoundedIcon
                sx={{
                  fontSize: 36,
                  color: "text.secondary"
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600 }}
              >
                No users found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Add your first team member to get started.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={onAddUser}
              sx={{
                borderRadius: 3,
                textTransform: "none"
              }}
            >
              Create User
            </Button>
          </Stack>
        ) : (
          /* USER GRID */
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)"
              },
              gap: 3,
              alignItems: "stretch"
            }}
          >
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => onEditUser(user)}
                onDelete={() => onDeleteUser(user.id)}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default UserList;