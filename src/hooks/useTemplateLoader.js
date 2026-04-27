import { useState, useCallback } from "react";
import { getFormTemplate } from "../services/formBuilderService";
import Swal from "sweetalert2";

/**
 * Custom hook for loading form templates
 * Handles fetching and parsing template data from the API
 */
export function useTemplateLoader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load a template by ID and return formatted data
   * @param {number} templateId - Template ID to load
   * @returns {Promise<Object>} - Template data with fields and outputFields
   */
  const loadTemplate = useCallback(async (templateId) => {
    if (!templateId) {
      setError("Invalid template ID");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Loading template:", templateId);
      const templateData = await getFormTemplate(templateId);

      console.log("API Response for template:", templateData);

      // Ensure we have the correct structure
      const formattedData = {
        inputFields: templateData.input_fields || [],
        outputFields: templateData.output_fields || [],
        templateId: templateData.id,
        templateName: templateData.name || templateData.title,
        fieldMapping: templateData.field_mapping || {},
        columnMapping: templateData.column_mapping || {},
        gridConfig: { rows: templateData.grid_rows || 0, columns: templateData.grid_columns || 0 }
      };

      console.log("Formatted template data:", formattedData);

      return formattedData;
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to load template";
      setError(errorMsg);
      Swal.fire("Error", errorMsg, "error");
      console.error("Error loading template:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    loadTemplate,
    clearError,
  };
}
