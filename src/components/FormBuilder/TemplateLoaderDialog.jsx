import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
} from "@mui/material";
import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { listFormTemplates, deleteFormTemplate } from "../../services/formBuilderService";
import Swal from "sweetalert2";

export default function TemplateLoaderDialog({
  open,
  onClose,
  onLoadTemplate,
}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load templates on dialog open
  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listFormTemplates(0, 100, true);
      console.log("Templates API response:", response);
      // Backend returns { templates: [...], total: X, skip: 0, limit: 20 }
      const templateList = response.templates || [];
      setTemplates(Array.isArray(templateList) ? templateList : []);
    } catch (err) {
      setError(err.error || "Failed to load templates");
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    const result = await Swal.fire({
      title: "Delete Template?",
      text: `Are you sure you want to delete "${templateName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    setDeleting(true);
    try {
      await deleteFormTemplate(templateId);
      Swal.fire("Deleted", `Template "${templateName}" has been deleted.`, "success");
      await loadTemplates();
      setSelectedTemplate(null);
    } catch (err) {
      Swal.fire("Error", err.error || "Failed to delete template", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleLoadTemplate = async (template) => {
    setSelectedTemplate(template);

    console.log("Selected template to load:", template);
    // Call the parent's onLoadTemplate with the selected template
    if (onLoadTemplate) {
      await onLoadTemplate(template);
    }
    onClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter templates based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTemplates = filteredTemplates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: "500px" } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Load Form Template
          <Typography variant="caption" color="textSecondary">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search templates by name..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            size="small"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "#f5f5f5" }}>
            <Typography color="textSecondary">
              {templates.length === 0
                ? "No templates found. Create your first template to get started."
                : "No templates match your search."}
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell width="40%">Template Name</TableCell>
                    <TableCell width="25%">Created</TableCell>
                    <TableCell width="15%">Fields</TableCell>
                    <TableCell width="20%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTemplates.map((template) => (
                    <TableRow
                      key={template.id}
                      hover
                      sx={{
                        backgroundColor:
                          selectedTemplate?.id === template.id ? "#e3f2fd" : "inherit",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {template.name || template.title}
                        </Typography>
                        {template.subtitle && (
                          <Typography variant="caption" color="textSecondary">
                            {template.subtitle}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {template.created_at
                            ? new Date(template.created_at).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {template.inputFields?.length || 0}
                          {(template.outputFields?.length || 0) > 0 &&
                            ` + ${template.outputFields.length}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadTemplate(template);
                          }}
                          disabled={loading || deleting}
                          sx={{ mr: 1 }}
                        >
                          Load
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id, template.name || template.title);
                          }}
                          disabled={loading || deleting}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {filteredTemplates.length > rowsPerPage && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTemplates.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => selectedTemplate && handleLoadTemplate(selectedTemplate)}
          variant="contained"
          disabled={!selectedTemplate || loading || deleting}
          startIcon={<DownloadIcon />}
        >
          Load Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
}
