import { useState, useCallback } from "react";
import { updateFormTemplate, formatTemplateData, getErrorMessage } from "../services/formBuilderService";
import Swal from "sweetalert2";

/**
 * Custom hook for updating existing templates
 * Handles saving changes to an already-created form template
 */
export function useTemplateUpdate() {
    const [updatingTemplate, setUpdatingTemplate] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    /**
     * Update an existing template
     * @param {number} templateId - ID of the template to update
     * @param {Object} formState - Form builder state with fields and outputFields
     * @param {Function} onSuccess - Callback function on success
     */
    const saveTemplateUpdate = useCallback(
        async (templateId, formState, onSuccess = null) => {
            if (!templateId) {
                Swal.fire("Error", "No template selected. Please load a template first.", "error");
                return;
            }

            setUpdatingTemplate(true);
            setUpdateError(null);

            try {
                // Format the template data without the name field since we're updating
                const { name, ...updateData } = formatTemplateData(formState, "");
                
                const result = await updateFormTemplate(templateId, updateData);

                Swal.fire(
                    "Success",
                    "Template updated successfully!",
                    "success"
                );

                setUpdateSuccess(true);

                // Call callback on success
                if (onSuccess) {
                    onSuccess(result);
                }

                setTimeout(() => setUpdateSuccess(false), 3000);
            } catch (error) {
                const errorMsg = getErrorMessage(error);
                setUpdateError(errorMsg);
                Swal.fire("Error", errorMsg, "error");
            } finally {
                setUpdatingTemplate(false);
            }
        },
        []
    );

    /**
     * Clear all error states and success messages
     */
    const clearMessages = useCallback(() => {
        setUpdateError(null);
        setUpdateSuccess(false);
    }, []);

    return {
        // State
        updatingTemplate,
        updateError,
        updateSuccess,

        // Functions
        saveTemplateUpdate,
        clearMessages,
    };
}
