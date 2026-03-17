
import { 
  Box, TextField, MenuItem, Select, FormControl, 
  InputLabel, InputAdornment, Grid, Paper 
} from "@mui/material";
import { Search } from "@mui/icons-material";

export default function MemberFilters({
  departments,
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
  searchQuery,
  setQuery,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#fcfcfc' }}>
      <Grid container spacing={2} alignItems="center">
        {/* Department Filter */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Office / Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Office / Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="All">All Offices</MenuItem>
              {departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Role Filter */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>System Role</InputLabel>
            <Select
              value={selectedRole}
              label="System Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Administrator">Super Administrator</MenuItem>
              <MenuItem value="President">Admin</MenuItem>
              <MenuItem value="Head">Head</MenuItem>
              <MenuItem value="Faculty">Member</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Search Input */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}