import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import SearchIcon      from "@mui/icons-material/Search";
import FilterListIcon  from "@mui/icons-material/FilterList";
import ClearIcon       from "@mui/icons-material/Clear";

const TYPE_LABELS = {
  "image/jpeg":   "JPEG",
  "image/jpg":    "JPG",
  "image/png":    "PNG",
  "image/gif":    "GIF",
  "image/webp":   "WebP",
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

// Shared style for all native <select> elements in the search bar
const nativeSelectStyle = {
  height: 40,
  padding: "0 10px",
  fontSize: "0.8125rem",
  fontFamily: "inherit",
  border: "1px solid #c4c4c4",
  borderRadius: 4,
  backgroundColor: "#fff",
  color: "#1a1a1a",
  cursor: "pointer",
  outline: "none",
  appearance: "auto",
  width: "100%",
};

function NativeSelect({ label, value, onChange, children, icon: Icon }) {
  return (
    <Box sx={{ flex: 1, minWidth: 130 }}>
      {label && (
        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 0.5, mb: 0.4,
          }}
        >
          {Icon && <Icon sx={{ fontSize: "0.85rem", color: "text.secondary" }} />}
          <Box
            component="span"
            sx={{ fontSize: "0.72rem", fontWeight: 600, color: "text.secondary", lineHeight: 1 }}
          >
            {label}
          </Box>
        </Box>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={nativeSelectStyle}
        onFocus={(e)  => (e.target.style.borderColor = "#1976d2")}
        onBlur={(e)   => (e.target.style.borderColor = "#c4c4c4")}
      >
        {children}
      </select>
    </Box>
  );
}

function DocumentSearchBar({
  search,
  setSearch,
  filterType,
  setFilterType,
  filterTask,
  setFilterTask,
  fileTypes,
  taskNames,
  resultCount,
  totalCount,
}) {
  const hasActiveFilters = search || filterType !== "all" || filterTask !== "all";

  const clearAll = () => {
    setSearch("");
    setFilterType("all");
    setFilterTask("all");
  };

  return (
    <Box
      sx={{
        p: 2, mb: 2, borderRadius: 2,
        bgcolor: "grey.50",
        border: "1px solid", borderColor: "grey.200",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-end">

        {/* Search text input */}
        <Box sx={{ flex: 2, minWidth: 200 }}>
          <Box
            component="span"
            sx={{ fontSize: "0.72rem", fontWeight: 600, color: "text.secondary", display: "block", mb: 0.4 }}
          >
            Search
          </Box>
          <TextField
            size="small"
            placeholder="Title, file, task, user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {/* File type filter */}
        <NativeSelect
          label="File Type"
          icon={FilterListIcon}
          value={filterType}
          onChange={setFilterType}
        >
          <option value="all">All Types</option>
          {fileTypes.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t] || t}
            </option>
          ))}
        </NativeSelect>

        {/* Task filter */}
        {taskNames.length > 0 && (
          <NativeSelect
            label="Task"
            value={filterTask}
            onChange={setFilterTask}
          >
            <option value="all">All Tasks</option>
            {taskNames.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </NativeSelect>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <Tooltip title="Clear all filters">
            <IconButton size="small" onClick={clearAll} color="error" sx={{ mb: 0.25 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Chip
            size="small"
            label={`${resultCount} of ${totalCount} result${totalCount !== 1 ? "s" : ""}`}
            color={resultCount === 0 ? "error" : "primary"}
            variant="outlined"
          />
          {search && (
            <Chip size="small" label={`"${search}"`} onDelete={() => setSearch("")} variant="outlined" />
          )}
          {filterType !== "all" && (
            <Chip
              size="small"
              label={`Type: ${TYPE_LABELS[filterType] || filterType}`}
              onDelete={() => setFilterType("all")}
              variant="outlined"
            />
          )}
          {filterTask !== "all" && (
            <Chip
              size="small"
              label={`Task: ${filterTask}`}
              onDelete={() => setFilterTask("all")}
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
}

export default DocumentSearchBar;