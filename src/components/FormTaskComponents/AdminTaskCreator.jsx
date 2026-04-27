import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    CircularProgress,
    Box,
    Paper,
    Typography,
    Divider,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { listFormTemplates } from '../../services/formBuilderService';
import { createMainTaskWithForm } from '../../services/taskService';
import { getSettings } from '../../services/settingsService';
import { useSnackbar } from 'notistack';

/**
 * AdminTaskCreator Component
 * 
 * Creates form-based tasks by editing template fields directly.
 * Template fields ARE the task definition - admin edits field values.
 */
export default function AdminTaskCreator({ open, onClose, onTaskCreated }) {
    const { enqueueSnackbar } = useSnackbar();
    
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fieldValues, setFieldValues] = useState({});

    useEffect(() => {
        if (open) {
            fetchMainTemplate();
        }
    }, [open]);

    const fetchMainTemplate = async () => {
        try {
            setLoading(true);
            const settingsRes = await getSettings();
            const mainTemplateId = settingsRes.data?.data?.main_form_template_id;

            if (!mainTemplateId) {
                enqueueSnackbar('No main form template configured. Please set one in System Settings.', { variant: 'warning' });
                return;
            }

            const templatesRes = await listFormTemplates(0, 100, true);
            const templatesList = templatesRes.templates || templatesRes.data || [];
            const mainTemplate = templatesList.find(t => t.id === mainTemplateId);

            if (mainTemplate) {
                setTemplate(mainTemplate);
                
                // Initialize field values for admin fields
                const values = {};
                mainTemplate.inputFields?.forEach(field => {
                    if (field.user === 'Admin') {
                        if (field.type === 'Integer' || field.type === 'Number') {
                            values[field.fieldId] = 0;
                        } else if (field.type === 'Boolean') {
                            values[field.fieldId] = false;
                        } else if (field.type === 'Date') {
                            values[field.fieldId] = '';
                        } else {
                            values[field.fieldId] = '';
                        }
                    }
                });
                setFieldValues(values);
            } else {
                enqueueSnackbar('Main form template not found', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching template:', error);
            enqueueSnackbar('Failed to load form template', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (fieldId, value) => {
        setFieldValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleCreateTask = async () => {
        if (!template) {
            enqueueSnackbar('Template not loaded', { variant: 'warning' });
            return;
        }

        // Validate required admin fields
        const adminFields = template.inputFields?.filter(f => f.user === 'Admin') || [];
        for (const field of adminFields) {
            if (field.required && !fieldValues[field.fieldId]) {
                enqueueSnackbar(`${field.title} is required`, { variant: 'warning' });
                return;
            }
        }

        try {
            setLoading(true);
            const taskData = {
                task_name: template.title,
                description: template.description || '',
                form_template_id: template.id,
                category_id: 1,
                admin_field_values: fieldValues,
            };

            const response = await createMainTaskWithForm(taskData);
            enqueueSnackbar('Task created successfully!', { variant: 'success' });
            
            resetForm();
            
            if (onTaskCreated) {
                onTaskCreated(response);
            }
            onClose();
        } catch (error) {
            enqueueSnackbar(
                error.error || 'Failed to create task',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTemplate(null);
        setFieldValues({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Render field input based on type
    const renderFieldInput = (field) => {
        const value = fieldValues[field.fieldId] ?? '';
        const commonProps = {
            fullWidth: true,
            size: 'small',
            required: field.required,
            label: field.title,
            margin: 'normal',
        };

        switch (field.type) {
            case 'Integer':
            case 'Number':
                return (
                    <TextField
                        {...commonProps}
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field.fieldId, parseInt(e.target.value) || 0)}
                    />
                );
            
            case 'Email':
                return (
                    <TextField
                        {...commonProps}
                        type="email"
                        value={value}
                        onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                    />
                );
            
            case 'Date':
                return (
                    <TextField
                        {...commonProps}
                        type="date"
                        value={value}
                        onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                );
            
            case 'Boolean':
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={value}
                                onChange={(e) => handleFieldChange(field.fieldId, e.target.checked)}
                            />
                        }
                        label={field.title}
                    />
                );
            
            case 'TextArea':
                return (
                    <TextField
                        {...commonProps}
                        multiline
                        rows={3}
                        value={value}
                        onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
            
            case 'Dropdown':
                const options = field.validationRules?.options || [];
                return (
                    <Select
                        {...commonProps}
                        value={value}
                        onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value=""><em>Select {field.title}</em></MenuItem>
                        {options.map((opt, idx) => (
                            <MenuItem key={idx} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>
                );
            
            default: // String, Text
                return (
                    <TextField
                        {...commonProps}
                        value={value}
                        onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Create Form-Based Task
            </DialogTitle>

            <DialogContent dividers>
                {!template ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <Alert severity="warning">
                                No form template available. Please configure a template in System Settings.
                            </Alert>
                        )}
                    </Box>
                ) : (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Template: {template.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {template.description}
                            </Typography>
                        </Alert>

                        {template.inputFields?.filter(f => f.user === 'Admin').length > 0 ? (
                            <>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Configure Task Fields
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {template.inputFields
                                        .filter(f => f.user === 'Admin')
                                        .map(field => (
                                            <Box key={field.fieldId}>
                                                {renderFieldInput(field)}
                                                {field.description && (
                                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                                        {field.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                </Box>

                                {template.inputFields?.filter(f => f.user === 'User').length > 0 && (
                                    <>
                                        <Divider sx={{ my: 3 }} />
                                        <Paper sx={{ p: 2, bgcolor: '#f0f7ff', borderLeft: '4px solid #1976d2' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                User Response Fields
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Users will answer these fields when responding to the task
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                {template.inputFields
                                                    .filter(f => f.user === 'User')
                                                    .map(field => (
                                                        <Typography key={field.fieldId} variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                            • {field.title}
                                                        </Typography>
                                                    ))}
                                            </Box>
                                        </Paper>
                                    </>
                                )}
                            </>
                        ) : (
                            <Alert severity="info">
                                This template has no admin fields to configure.
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleCreateTask}
                    variant="contained"
                    disabled={loading || !template}
                >
                    {loading ? <CircularProgress size={24} /> : 'Create Task'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

