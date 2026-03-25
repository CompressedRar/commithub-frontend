import React, { useEffect, useState } from "react";
import { 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Stack, 
    Box, 
    CircularProgress, 
    Chip,
    Divider
} from "@mui/material";
import { 
    FileDownload as DownloadIcon, 
    Visibility as ViewIcon, 
    PendingActions as PendingIcon,
    Business as BusinessIcon
} from "@mui/icons-material";
import { downloadOPCR } from "../../../../../services/pcrServices";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function DeptOPCR({ opcr, opcr_id, dept_id, dept_mode }) {
    const [downloading, setDownloading] = useState(false);
    const navigate = useNavigate();

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await downloadOPCR(opcr_id);
            const link = res.data.link;
            window.open(link, "_blank", "noopener,noreferrer");
        } catch (error) {
            Swal.fire({
                title: "Download Failed",
                text: error.response?.data?.error || "An error occurred while fetching the file.",
                icon: "error"
            });
        } finally {
            setDownloading(false);
        }
    };

    const handleView = () => {
        const baseRoute = dept_mode ? "/head/opcr" : "/sadmin/opcr";
        navigate(`${baseRoute}/${opcr_id}?dept_id=${dept_id}`);
    };

    return (
        <Card 
            variant="outlined" 
            sx={{ 
                mb: 2, 
                borderRadius: 3, 
                transition: "0.3s", 
                "&:hover": { boxShadow: 4, borderColor: 'primary.main' } 
            }}
        >
            <CardContent>
                <Stack 
                    direction={{ xs: "column", sm: "row" }} 
                    justifyContent="space-between" 
                    alignItems="center" 
                    spacing={2}
                >
                    {/* INFO SECTION */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                            sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'primary.lighter', 
                                p: 1, 
                                borderRadius: 2,
                                display: 'flex'
                            }}
                        >
                            <BusinessIcon fontSize="medium" />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                Office Performance Review
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                {opcr?.department || "Unknown Department"}
                            </Typography>
                        </Box>
                    </Box>

                    {/* ACTIONS SECTION */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        {opcr ? (
                            <>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {downloading ? "Preparing..." : "Download"}
                                </Button>
                                
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<ViewIcon />}
                                    onClick={handleView}
                                    sx={{ borderRadius: 2, boxShadow: 'none' }}
                                >
                                    View
                                </Button>
                            </>
                        ) : (
                            <Chip 
                                icon={<PendingIcon />} 
                                label="Awaiting Submission" 
                                variant="outlined" 
                                color="warning" 
                                sx={{ fontStyle: 'italic' }}
                            />
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default DeptOPCR;