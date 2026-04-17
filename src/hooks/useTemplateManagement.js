import { useState, useCallback } from "react";
import { createFormTemplate, formatTemplateData, getErrorMessage } from "../services/formBuilderService";
import Swal from "sweetalert2";

/**
 * Custom hook for template management functionality
 * Handles saving, loading, and error handling for form templates
 */
export function useTemplateManagement() {
    const [templateName, setTemplateName] = useState("");
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    /**
     * Open the save template dialog
     */
    const openSaveDialog = useCallback(() => {
        setSaveDialogOpen(true);
        setSaveError(null);
    }, []);

    /**
     * Close the save template dialog
     */
    const closeSaveDialog = useCallback(() => {
        setSaveDialogOpen(false);
        setTemplateName("");
        setSaveError(null);
    }, []);

    /**
     * Save template to backend
     * @param {Object} formState - Form builder state with fields and outputFields
     * @param {Function} onSuccess - Callback function with template ID on success
     */
    const saveTemplate = useCallback(
        async (formState, onSuccess = null) => {
            if (!templateName.trim()) {
                Swal.fire("Error", "Please enter a template name", "error");
                return;
            }

            setSavingTemplate(true);
            setSaveError(null);

            try {
                const templateData = formatTemplateData(
                    formState,
                    templateName.trim()
                );

                const result = await createFormTemplate(templateData);

                Swal.fire(
                    "Success",
                    `Template "${templateName}" saved successfully!`,
                    "success"
                );

                setSaveSuccess(true);
                setSaveDialogOpen(false);
                setTemplateName("");

                // Call callback to notify parent of template ID
                if (onSuccess) {
                    onSuccess(result.id);
                }

                setTimeout(() => setSaveSuccess(false), 3000);
            } catch (error) {
                const errorMsg = getErrorMessage(error);
                setSaveError(errorMsg);
                Swal.fire("Error", errorMsg, "error");
            } finally {
                setSavingTemplate(false);
            }
        },
        [templateName]
    );

    /**
     * Clear all error states and success messages
     */
    const clearMessages = useCallback(() => {
        setSaveError(null);
        setSaveSuccess(false);
    }, []);

    return {
        // State
        templateName,
        setTemplateName,
        saveDialogOpen,
        savingTemplate,
        saveError,
        saveSuccess,

        // Functions
        openSaveDialog,
        closeSaveDialog,
        saveTemplate,
        clearMessages,
    };
}
