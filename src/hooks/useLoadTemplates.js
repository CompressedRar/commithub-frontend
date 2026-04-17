import { useState, useEffect, useCallback } from "react";
import { listFormTemplates, getFormTemplate } from "../services/formBuilderService";

/**
 * Custom hook for loading and managing the list of form templates
 * Automatically loads templates on mount
 */
export function useLoadTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load all templates from the API
   */
  const loadAllTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Loading all templates...");
      const response = await listFormTemplates(0, 100); // Load up to 100 templates
      
      console.log("API Response:", response);
      
      // Backend returns { templates: [...], total: X, skip: 0, limit: 20 }
      const templateList = response.templates || [];
      setTemplates(Array.isArray(templateList) ? templateList : []);
      
      console.log("Loaded templates:", templateList);
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to load templates";
      setError(errorMsg);
      console.error("Error loading templates:", err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadAllTemplates();
  }, [loadAllTemplates]);

  /**
   * Refresh the template list
   */
  const refreshTemplates = useCallback(async () => {
    await loadAllTemplates();
  }, [loadAllTemplates]);

  return {
    templates,
    loading,
    error,
    refreshTemplates,
  };
}
