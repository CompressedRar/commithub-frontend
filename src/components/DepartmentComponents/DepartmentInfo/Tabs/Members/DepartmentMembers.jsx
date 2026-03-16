import React, { useState } from "react";
import { 
    TableRow, TableCell, Avatar, Typography, Chip, 
    IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Stack 
} from "@mui/material";
import { 
    MoreVert as MoreIcon, 
    PersonRemove as RemoveIcon, 
    Visibility as ViewIcon 
} from "@mui/icons-material";

// Configuration for performance styling
const PERFORMANCE_MAP = {
    5: { label: "OUTSTANDING", color: "success" },
    4: { label: "VERY SATISFACTORY", color: "primary" },
    3: { label: "SATISFACTORY", color: "info" },
    2: { label: "UNSATISFACTORY", color: "warning" },
    1: { label: "POOR", color: "error" },
    0: { label: "UNRATED", color: "default" }
};

function DepartmentMembers({ mems, onRemove }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const getPerfData = (rating) => {
        const score = Math.floor(rating);
        return PERFORMANCE_MAP[score] || PERFORMANCE_MAP[0];
    };

    const perf = getPerfData(mems.avg_performance);

    return (
        <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {/* PROFILE & NAME */}
            <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar 
                        src={mems.profile_picture_link} 
                        sx={{ width: 36, height: 36, border: '1px solid', borderColor: 'divider' }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mems.first_name} {mems.last_name}
                    </Typography>
                </Stack>
            </TableCell>

            {/* NUMERICAL SCORE */}
            <TableCell align="center">
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {parseFloat(mems.avg_performance || 0).toFixed(2)}
                </Typography>
            </TableCell>

            {/* ADJECTIVAL BADGE */}
            <TableCell align="center">
                <Chip 
                    label={perf.label} 
                    color={perf.color} 
                    size="small" 
                    variant="contained"
                    sx={{ fontWeight: 700, fontSize: '0.65rem', minWidth: 120 }} 
                />
            </TableCell>

            {/* POSITION */}
            <TableCell align="center">
                <Typography variant="body2" color="text.secondary">
                    {mems.position?.name || "N/A"}
                </Typography>
            </TableCell>

            {/* ACTIONS */}
            <TableCell align="right">
                <IconButton size="small" onClick={handleOpenMenu}>
                    <MoreIcon fontSize="small" />
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleCloseMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { minWidth: 180, borderRadius: 2, boxShadow: 3 } }}
                >
                    
                    <MenuItem 
                        onClick={() => {
                            handleCloseMenu();
                            onRemove(mems.id, `${mems.first_name} ${mems.last_name}`);
                        }}
                        sx={{ color: 'error.main' }}
                    >
                        <ListItemIcon><RemoveIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText primary="Remove Member" primaryTypographyProps={{ variant: 'body2' }} />
                    </MenuItem>
                </Menu>
            </TableCell>
        </TableRow>
    );
}

export default DepartmentMembers;