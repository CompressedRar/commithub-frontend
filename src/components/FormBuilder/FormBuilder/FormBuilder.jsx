import {
  Box,
  Stack,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  Grid,
  Card,
} from "@mui/material";
import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PreviewIcon from "@mui/icons-material/Preview";
import FormBuilderPreview from "./FormBuilderPreview";

export default function FormBuilder({
  fields = [],
  outputFields = [],
  fieldMapping = {},
  gridConfig = { rows: 3, columns: 3 },
}) {
  const [formConfig, setFormConfig] = useState({
    title: "Task Form",
    subtitle: "",
    logoUrl: "",
    logoFile: null,
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  // All fields combined
  const allFields = [...fields, ...outputFields];

  // Handle text input changes
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormConfig((prev) => ({
          ...prev,
          logoUrl: event.target?.result,
          logoFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setFormConfig((prev) => ({
      ...prev,
      logoUrl: "",
      logoFile: null,
    }));
  };

  // Convert fieldMapping to organized grid structure
  const getFormLayout = () => {
    const layout = Array(gridConfig.rows)
      .fill(null)
      .map(() => Array(gridConfig.columns).fill(null));

    Object.entries(fieldMapping).forEach(([key, cellData]) => {
      const [rowIndex, colIndex] = key.split("-").map(Number);
      const spanRows = cellData?.span?.rows ?? 1;
      const spanCols = cellData?.span?.cols ?? 1;
      for (let r = rowIndex; r < rowIndex + spanRows; r++) {
        for (let c = colIndex; c < colIndex + spanCols; c++) {
          if (r < gridConfig.rows && c < gridConfig.columns) {
            layout[r][c] = cellData.field;
          }
        }
      }
    });

    return layout;
  };

  const formLayout = getFormLayout();
  const colWidth = Math.max(1, Math.floor(12 / gridConfig.columns));

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">{formConfig.title}</Typography>
          <TextField
            name="title"
            label="Title"
            value={formConfig.title}
            onChange={handleTextChange}
            size="small"
          />
          <TextField
            name="subtitle"
            label="Subtitle"
            value={formConfig.subtitle}
            onChange={handleTextChange}
            size="small"
          />

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {formConfig.logoUrl ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img src={formConfig.logoUrl} alt="logo" style={{ height: 48 }} />
                <IconButton onClick={handleRemoveLogo} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ) : (
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                Upload Logo
                <input hidden type="file" accept="image/*" onChange={handleLogoUpload} />
              </Button>
            )}

            <Button onClick={() => setPreviewOpen(true)} startIcon={<PreviewIcon />}>
              Preview
            </Button>
          </Box>

          <Divider />

          <Typography variant="subtitle1">Form Layout</Typography>
          <Grid container spacing={1}>
            {formLayout.map((row, rIdx) => (
              <Grid container item key={rIdx} spacing={1}>
                {row.map((cell, cIdx) => (
                  <Grid item xs={colWidth} key={cIdx}>
                    <Card variant="outlined" sx={{ p: 1, minHeight: 48, display: "flex", alignItems: "center" }}>
                      <Typography variant="body2">
                        {cell ? cell.label ?? cell.name ?? "Field" : "Empty"}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <FormBuilderPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        config={formConfig}
        fields={allFields}
        layout={formLayout}
      />
    </Box>
  );
}