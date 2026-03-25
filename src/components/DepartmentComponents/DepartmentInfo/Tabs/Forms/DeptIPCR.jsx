import { useState } from "react";
import { 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Stack, 
    Box, 
    Avatar, 
    CircularProgress, 
    Chip,
    Tooltip
} from "@mui/material";
import { 
    FileDownload as DownloadIcon, 
    Visibility as ViewIcon, 
    Person as PersonIcon 
} from "@mui/icons-material";
import { downloadIPCR } from "../../../../../services/pcrServices";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function DeptIPCR({ ipcr, dept_id, dept_mode, onMouseOver }) {
    const [downloading, setDownloading] = useState(false);
    const navigate = useNavigate();

    const handleDownload = async (e) => {
        e.stopPropagation(); // Prevent card triggers
        setDownloading(true);
        try {
            const res = await downloadIPCR(ipcr.ipcr.id);
            const link = res.data.link;
            window.open(link, "_blank", "noopener,noreferrer");
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error || "Failed to download",
                icon: "error"
            });
        } finally {
            setDownloading(false);
        }
    };

    const handleView = () => {
        const routePrefix = dept_mode ? "head" : "sadmin";
        navigate(`/${routePrefix}/ipcr/${ipcr.ipcr.id}`);
    };

    return (
        <Card 
            variant="outlined" 
            onMouseOver={dept_mode ? onMouseOver : null}
            sx={{ 
                mb: 1, 
                borderRadius: 2, 
                transition: "all 0.2s",
                borderColor: 'grey.200',
                "&:hover": { 
                    borderColor: 'primary.light',
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)'
                } 
            }}
        >
            <CardContent sx={{ py: "8px !important", px: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                            src={ipcr.member.profile_picture_link} 
                            
                            sx={{ width: 32, height: 32, bgcolor: 'white', border: '1px solid', borderColor: 'grey.300' }}
                        >
                            <PersonIcon fontSize="small" />
                        </Avatar>
                        
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', lineHeight: 1 }}>
                                {ipcr.ipcr ? "INDIVIDUAL REVIEW" : "PENDING"}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {`${ipcr.member.first_name} ${ipcr.member.last_name}`}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* ACTIONS SECTION */}
                    <Box>
                        {ipcr.ipcr ? (
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Download Excel">
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="inherit"
                                        sx={{ minWidth: 40, p: 0.5, borderColor: 'grey.300' }}
                                        onClick={handleDownload}
                                        disabled={downloading}
                                    >
                                        {downloading ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
                                    </Button>
                                </Tooltip>

                                <Button
                                    size="small"
                                    variant="contained"
                                    disableElevation
                                    startIcon={<ViewIcon />}
                                    onClick={handleView}
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    View
                                </Button>
                            </Stack>
                        ) : (
                            <Chip 
                                label="Unavailable" 
                                size="small" 
                                variant="outlined" 
                                sx={{ height: 24, fontSize: '0.7rem', color: 'text.disabled' }} 
                            />
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default DeptIPCR;