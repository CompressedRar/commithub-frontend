import { Paper, Typography, Stack, Box, Chip } from "@mui/material";

export default function AvailableFieldsSidebar({
  unusedFields,
  onDragStart,
}) {
  return (
    <Paper
      sx={{
        p: 2,
        width: "250px",
        maxHeight: "600px",
        overflowY: "auto",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" mb={2}>
        Available Fields ({unusedFields.length})
      </Typography>

      {unusedFields.length === 0 ? (
        <Typography variant="caption" color="textSecondary">
          All fields are placed
        </Typography>
      ) : (
        <Stack spacing={1}>
          {unusedFields.map((field) => (
            <Box
              key={field.id}
              draggable
              onDragStart={() => onDragStart(field)}
              sx={{
                p: 1.5,
                backgroundColor:
                  field.user === "Admin" ? "#e3f2fd" : "#f3e5f5",
                border: "1px solid #ccc",
                borderRadius: 1,
                cursor: "move",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Typography variant="caption" fontWeight="bold" display="block">
                {field.title}
              </Typography>
              <Chip
                label={field.user === "Admin" ? "Admin" : "User"}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
