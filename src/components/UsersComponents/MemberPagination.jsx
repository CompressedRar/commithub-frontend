
import { Stack, Pagination, Typography } from "@mui/material";

export default function MemberPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <Stack 
      direction="row" 
      justifyContent="center" 
      alignItems="center" 
      spacing={2} 
      sx={{ mt: 4, mb: 2 }}
    >
      <Pagination 
        count={totalPages} 
        page={currentPage} 
        onChange={(_, value) => onPageChange(value)} 
        color="primary"
        variant="outlined"
        shape="rounded"
        showFirstButton 
        showLastButton
      />
    </Stack>
  );
}