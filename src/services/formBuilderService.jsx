import api from "../components/api";

/**
 * Form Builder Service
 * Handles all API calls for form template and submission management
 */

// ==================== TEMPLATE OPERATIONS ====================

/**
 * Create a new form template
 * @param {Object} templateData - Form template configuration
 * @returns {Promise} - Created template with ID
 */
export async function createFormTemplate(templateData) {
    try {
        console.log("Creating form template:", templateData);
        const response = await api.post("/api/v1/form-templates", templateData);
        return response.data;
    } catch (error) {
        console.error("Error creating template:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to create template" };
    }
}

/**
 * Get a specific form template
 * @param {number} templateId - Template ID
 * @returns {Promise} - Template data
 */
export async function getFormTemplate(templateId) {
    try {
        const response = await api.get(`/api/v1/form-templates/${templateId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching template:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to fetch template" };
    }
}

/**
 * Get all form templates with pagination
 * @param {number} skip - Number of templates to skip
 * @param {number} limit - Number of templates to return
 * @param {boolean} active - Filter by active status
 * @returns {Promise} - List of templates
 */
export async function listFormTemplates(skip = 0, limit = 20, active = true) {
    try {
        const response = await api.get("/api/v1/form-templates", {
            params: { skip, limit, active }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching templates:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to fetch templates" };
    }
}

/**
 * Update a form template
 * @param {number} templateId - Template ID
 * @param {Object} updateData - Updated template data
 * @returns {Promise} - Updated template
 */
export async function updateFormTemplate(templateId, updateData) {
    try {
        const response = await api.put(`/api/v1/form-templates/${templateId}`, updateData);
        return response.data;
    } catch (error) {
        console.error("Error updating template:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to update template" };
    }
}

/**
 * Delete a form template
 * @param {number} templateId - Template ID
 * @returns {Promise} - Success message
 */
export async function deleteFormTemplate(templateId) {
    try {
        const response = await api.delete(`/api/v1/form-templates/${templateId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting template:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to delete template" };
    }
}

/**
 * Publish a form template (make available for submissions)
 * @param {number} templateId - Template ID
 * @returns {Promise} - Published template
 */
export async function publishFormTemplate(templateId) {
    try {
        const response = await api.post(`/api/v1/form-templates/${templateId}/publish`);
        return response.data;
    } catch (error) {
        console.error("Error publishing template:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to publish template" };
    }
}

/**
 * Duplicate a form template
 * @param {number} templateId - Template ID to duplicate
 * @param {string} newName - Name for the duplicated template
 * @returns {Promise} - New template
 */
export async function duplicateFormTemplate(templateId, newName) {
    try {
        const response = await api.post(`/api/v1/form-templates/${templateId}/duplicate`, {
            name: newName
        });
        return response.data;
    } catch (error) {
        console.error("Error duplicating template:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to duplicate template" };
    }
}

// ==================== SUBMISSION OPERATIONS ====================

/**
 * Create a form submission
 * @param {number} templateId - Template ID
 * @param {Object} fieldValues - Field values (field_id -> value mapping)
 * @param {boolean} isDraft - Whether to save as draft
 * @returns {Promise} - Created submission with ID
 */
export async function createFormSubmission(templateId, fieldValues, isDraft = false) {
    try {
        console.log("Creating form submission for template:", templateId);
        const response = await api.post("/api/v1/form-submissions", {
            template_id: templateId,
            fieldValues: fieldValues,
            isDraft: isDraft
        });
        return response.data;
    } catch (error) {
        console.error("Error creating submission:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to create submission" };
    }
}

/**
 * Get a specific form submission
 * @param {number} submissionId - Submission ID
 * @returns {Promise} - Submission data
 */
export async function getFormSubmission(submissionId) {
    try {
        const response = await api.get(`/api/v1/form-submissions/${submissionId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching submission:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to fetch submission" };
    }
}

/**
 * Get submissions for a template (admin only)
 * @param {number} templateId - Template ID
 * @param {number} skip - Number to skip
 * @param {number} limit - Number to return
 * @param {boolean} includeDrafts - Include draft submissions
 * @returns {Promise} - List of submissions
 */
export async function getTemplateSubmissions(templateId, skip = 0, limit = 20, includeDrafts = false) {
    try {
        const response = await api.get(`/api/v1/form-submissions/template/${templateId}`, {
            params: { skip, limit, includeDrafts }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching submissions:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to fetch submissions" };
    }
}

/**
 * Get user's form submissions
 * @param {number} userId - User ID
 * @param {number} templateId - Optional template ID to filter
 * @param {number} skip - Number to skip
 * @param {number} limit - Number to return
 * @returns {Promise} - List of user submissions
 */
export async function getUserSubmissions(userId, templateId = null, skip = 0, limit = 20) {
    try {
        const params = { skip, limit };
        if (templateId) params.templateId = templateId;
        
        const response = await api.get(`/api/v1/form-submissions/user/${userId}`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching user submissions:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to fetch submissions" };
    }
}

/**
 * Update a form submission
 * @param {number} submissionId - Submission ID
 * @param {Object} fieldValues - Updated field values
 * @param {boolean} isDraft - Update draft status
 * @returns {Promise} - Updated submission
 */
export async function updateFormSubmission(submissionId, fieldValues, isDraft = null) {
    try {
        const data = { fieldValues: fieldValues };
        if (isDraft !== null) data.isDraft = isDraft;
        
        const response = await api.put(`/api/v1/form-submissions/${submissionId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating submission:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to update submission" };
    }
}

/**
 * Delete a form submission
 * @param {submissionId} submissionId - Submission ID
 * @returns {Promise} - Success message
 */
export async function deleteFormSubmission(submissionId) {
    try {
        const response = await api.delete(`/api/v1/form-submissions/${submissionId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting submission:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to delete submission" };
    }
}

/**
 * Get submission statistics for a template
 * @param {number} templateId - Template ID
 * @returns {Promise} - Submission statistics
 */
export async function getSubmissionStats(templateId) {
    try {
        const response = await api.get(`/api/v1/form-submissions/template/${templateId}/stats`);
        return response.data;
    } catch (error) {
        console.error("Error fetching stats:", error.response?.data || error.message);
        throw error.response?.data || { error: "Failed to fetch statistics" };
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert form builder state to API template format
 * @param {Object} formState - Form builder hook state
 * @param {string} templateName - Name for the template
 * @returns {Object} - Formatted template data
 */
export function formatTemplateData(formState, templateName, ) {
    const { fields, outputFields, gridConfig, fieldMapping, columnMapping } = formState;
    
    return {
        name: templateName,
        title: templateName,
        subtitle: "",
        description: "",
        fieldMapping: fieldMapping,
        columnMapping: columnMapping,
        gridRows: gridConfig.rows,
        gridCols: gridConfig.columns,
        inputFields: fields.map((field) => ({
            id: field.id,
            title: field.title,
            placeholder: field.placeholder || "",
            description: field.description || "",
            name: field.name || "",
            type: field.type,
            user: field.user,
            required: field.required,
            validationRules: field.validationRules
        })),
        outputFields: outputFields.map((field) => ({
            id: field.id,
            title: field.title,
            type: field.type,
            inputFieldName: field.inputFieldName,
            formula: field.formula,
            cases: field.cases
        }))
    };
}

/**
 * Convert submission field values from frontend format to API format
 * @param {Object} formValues - Field values from FormRenderer
 * @param {Array} inputFields - Input field definitions
 * @returns {Object} - Formatted field values (field_id -> value)
 */
export function formatSubmissionData(formValues, inputFields) {
    const fieldValues = {};
    
    inputFields.forEach((field) => {
        if (formValues[field.id] !== undefined) {
            fieldValues[field.id] = formValues[field.id];
        }
    });
    
    return fieldValues;
}

/**
 * Handle API errors and extract user-friendly messages
 * @param {Error} error - API error
 * @returns {string} - Error message
 */
export function getErrorMessage(error) {
    if (error.error) {
        return error.error;
    }
    if (error.errors && Array.isArray(error.errors)) {
        return error.errors.join(", ");
    }
    if (error.message) {
        return error.message;
    }
    return "An unexpected error occurred";
}
