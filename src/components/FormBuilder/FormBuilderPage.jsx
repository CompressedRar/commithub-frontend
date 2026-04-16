import { Box, Tabs, Tab, Typography } from "@mui/material";
import { useState } from "react";
import Builder from "./TaskBuilder/Builder";
import FormBuilder from "./FormBuilder/FormBuilder";
import useFormBuilder from "../../hooks/useFormBuilder";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`builder-tabpanel-${index}`}
      aria-labelledby={`builder-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FormBuilderPage() {
  const [tabValue, setTabValue] = useState(0);
  const formBuilderHook = useFormBuilder();
  const { fields, outputFields } = formBuilderHook;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Simulate field mapping (would come from FieldMapper hook in production)
  const fieldMapping = {};
  const gridConfig = { rows: 3, columns: 3 };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", p: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Form Builder Suite
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Build form templates with input fields, output fields, and layout configuration
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="builder tabs"
        sx={{
          px: 3,
          backgroundColor: "#fafafa",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tab label="🏗️ Field Configuration" id="builder-tab-0" />
        <Tab label="🎨 Form Styling & Preview" id="builder-tab-1" />
      </Tabs>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Builder />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {fields.length > 0 || outputFields.length > 0 ? (
          <FormBuilder
            fields={fields}
            outputFields={outputFields}
            fieldMapping={fieldMapping}
            gridConfig={gridConfig}
          />
        ) : (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No fields created yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Go to the "Field Configuration" tab to create input and output fields first
            </Typography>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
}
