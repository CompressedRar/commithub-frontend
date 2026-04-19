import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import { listFormTemplates } from '../../services/formBuilderService';
import { useSnackbar } from 'notistack';
import { FormBuilderPage } from '../FormBuilder';

/**
 * FormBuilderTab Component
 * 
 * Allows administrators to:
 * - Select the main form template used for all form-based tasks
 * - View selected template details
 */
export default function FormBuilderTab({ mainFormTemplateId, setMainFormTemplateId }) {
    const { enqueueSnackbar } = useSnackbar();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Fetch templates on mount
    useEffect(() => {
        fetchTemplates();
    }, []);

    // Update selected template when mainFormTemplateId changes
    useEffect(() => {
        if (mainFormTemplateId && templates.length > 0) {
            const template = templates.find(t => t.id === mainFormTemplateId);
            setSelectedTemplate(template);
        }
    }, [mainFormTemplateId, templates]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await listFormTemplates(0, 100, true);
            // Response has structure: { templates: [...], total, skip, limit }
            const templatesList = response.templates || response.data || [];
            setTemplates(templatesList);
        } catch (error) {
            console.error('Failed to load templates:', error);
            enqueueSnackbar('Failed to load form templates', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateChange = (event) => {
        const templateId = event.target.value;
        setMainFormTemplateId(templateId);
        const template = templates.find(t => t.id === templateId);
        setSelectedTemplate(template);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <FormBuilderPage></FormBuilderPage>
        </Box>
    );
}
