import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function FormBuilderPreview({
  open,
  onClose,
  formConfig,
  formLayout,
  gridConfig,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Form Preview
        <Button onClick={onClose} size="small" variant="text">
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 3 }}>
          {/* Logo and Header Section */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "#f5f5f5",
              mb: 3,
            }}
          >
            <Stack spacing={2} alignItems="center">
              {/* Logo */}
              {formConfig.logoUrl && (
                <Box
                  component="img"
                  src={formConfig.logoUrl}
                  alt="Logo"
                  sx={{
                    maxWidth: 120,
                    maxHeight: 80,
                    objectFit: "contain",
                  }}
                />
              )}

              {/* Title */}
              <Typography variant="h4" fontWeight="bold" component="h1">
                {formConfig.title}
              </Typography>

              {/* Subtitle */}
              {formConfig.subtitle && (
                <Typography variant="body1" color="textSecondary" component="p">
                  {formConfig.subtitle}
                </Typography>
              )}
            </Stack>
          </Paper>

          {/* Form Fields Grid */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Form Fields
            </Typography>

            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: 1,
                overflow: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "100%",
                }}
              >
                <tbody>
                  {formLayout.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((field, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          style={{
                            border: "1px solid #e0e0e0",
                            padding: "16px",
                            minWidth: "150px",
                            minHeight: "100px",
                            verticalAlign: "top",
                            backgroundColor: field ? "#fafafa" : "#ffffff",
                          }}
                        >
                          {field && (
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {field.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Type: {field.type}
                              </Typography>
                              {field.user && (
                                <Typography variant="caption" color="primary">
                                  ({field.user})
                                </Typography>
                              )}
                              {field.type === "IntegerModifier" && field.formula && (
                                <Box
                                  sx={{
                                    p: 1,
                                    backgroundColor: "#e8f5e9",
                                    borderRadius: 0.5,
                                    fontSize: "11px",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  Formula: {field.formula}
                                </Box>
                              )}
                              {field.type === "CaseOutput" && field.cases?.length > 0 && (
                                <Box sx={{ fontSize: "11px" }}>
                                  <Typography variant="caption" fontWeight="bold">
                                    Cases:
                                  </Typography>
                                  {field.cases.map((caseItem, idx) => (
                                    <Box key={idx} sx={{ ml: 1 }}>
                                      <Typography variant="caption">
                                        {caseItem.condition} → {caseItem.output}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Stack>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>

          {/* Info Box */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "#e3f2fd",
              borderRadius: 1,
              border: "1px solid #90caf9",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              This preview shows how your form will appear when exported. The layout follows
              the field mapping configuration with {gridConfig.rows} rows and{" "}
              {gridConfig.columns} columns.
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
