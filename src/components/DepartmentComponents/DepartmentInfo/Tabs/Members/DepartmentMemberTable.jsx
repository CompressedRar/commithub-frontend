
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, InputAdornment, Box, Typography, Pagination,
  Stack, Button, CircularProgress
} from "@mui/material";
import { 
    Search as SearchIcon, 
    PersonOff as NoAccountIcon,
    CloudDownload as DownloadIcon 
} from "@mui/icons-material";
import { useDepartmentMembers } from "./Hooks/useDepartmentMembers";
import TopUserPerformanceInDepartment from "../../../../Charts/UserPerformanceInDepartment";
import { generateDepartmentPerformanceReport } from "../../../../../services/departmentService";
import { useState } from "react";
import DepartmentMembers from "./DepartmentMembers";
import Swal from "sweetalert2";

function DepartmentMemberTable({ deptid, currentPhase }) {
  const {
    paginatedMembers,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    removeMember
  } = useDepartmentMembers(deptid);
  const [generating, setGenerating] = useState(false);

  const handleDownloadReport = async () => {
    setGenerating(true);
    try {
      const res = await generateDepartmentPerformanceReport(deptid);
      const link = res.data.download_url;
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to download", "error");
    } finally {
      setGenerating(false);
    }
  };




  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* Header Section */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Office Members
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage personnel and monitor performance ratings
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <TextField
            size="small"
            placeholder="Search member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 250 }, bgcolor: 'background.paper' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            disableElevation
            startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
            onClick={handleDownloadReport}
            disabled={generating}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            {generating ? "Generating..." : "Download Report"}
          </Button>
        </Stack>
      </Stack>

      {/* Members Table */}
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>FULL NAME</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>NUMERICAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>ADJECTIVAL</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>POSITION</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((member) => (
                <DepartmentMembers
                  key={member.id}
                  mems={member}
                  onRemove={removeMember}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={1} sx={{ color: 'text.disabled' }}>
                    <NoAccountIcon sx={{ fontSize: 48 }} />
                    <Typography variant="body2">No active members found</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              color="primary"
            />
          </Box>
        )}
      </TableContainer>

      {/* Performance Analytics Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, px: 1 }}>
          Performance Analytics
        </Typography>
        <TopUserPerformanceInDepartment dept_id={deptid} currentPhase={currentPhase} />
      </Box>
    </Box>
  );
}

export default DepartmentMemberTable;