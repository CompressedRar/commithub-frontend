import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Box,
  Stack,
  Avatar,
  Divider,
  Tooltip
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

const UserCard = ({ user, onEdit, onDelete }) => {
  if (!user) return null;

  const role_equivalent = {
    "administrator": "Super Admin",
    "president": "Administrator",
    "head": "Head",
    "faculty": "Member"
  }

  const fullName = [
    user.first_name,
    user.middle_name,
    user.last_name
  ]
    .filter(Boolean)
    .join(" ");

  const initials = `${user.first_name?.[0] || ""}${
    user.last_name?.[0] || ""
  }`;

  return (
    <Card
      sx={{
        position: "relative",
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        transition: "all 0.25s ease",
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(to bottom right, #ffffff, #fafafa)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
          borderColor: "primary.main"
        }
      }}
    >
      {/* Top Accent Bar */}
      <Box
        sx={{
          height: 6,
          background: user.account_status
            ? "linear-gradient(90deg, #4caf50, #81c784)"
            : "linear-gradient(90deg, #f44336, #e57373)"
        }}
      />

      <CardContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontSize: 20,
              fontWeight: 700,
              bgcolor: "primary.main"
            }}
          >
            {initials || "U"}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2
              }}
            >
              {fullName || "Unnamed User"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
            >   
              {user.position.name || "No position assigned"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
            >   
              {user.department.name || "No department assigned"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
            >
              {role_equivalent[user.role] || "No role assigned"}
            </Typography>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": {
                    bgcolor: "primary.light",
                    color: "primary.contrastText"
                  }
                }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete User">
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": {
                    bgcolor: "error.main",
                    color: "white"
                  }
                }}
              >
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Divider />

        {/* Information Section */}
        <Stack spacing={1.2}>
          {user.position_id && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <BadgeRoundedIcon
                fontSize="small"
                color="action"
              />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Position ID: {user.position_id}
              </Typography>
            </Stack>
          )}

          {user.department_id && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <BusinessRoundedIcon
                fontSize="small"
                color="action"
              />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Department ID: {user.department_id}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ pt: 1 }}
        >
          <Stack direction="row" spacing={1}>
            <Chip
              label={user.account_status ? "Active" : "Inactive"}
              size="small"
              color={user.account_status ? "success" : "error"}
              sx={{
                fontWeight: 600
              }}
            />
          </Stack>

          {user.created_at && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {new Date(user.created_at).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UserCard;