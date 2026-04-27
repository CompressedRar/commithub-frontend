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
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import { getMainTask } from '../../services/taskService';
import api from '../api';
import { useSnackbar } from 'notistack';

/**
 * UserTaskResponse Component
 * 
 * Allows users to:
 * 1. View the task definition and performance targets (read-only)
 * 2. See admin fields for context (read-only)
 * 3. Answer user response fields (only numeric input)
 * 4. Submit their response which becomes a sub-task
 * 
 * User responses will be consolidated for OPCR/IPCR
 */
export default function UserTaskResponse({ open, onClose, taskId, onResponseSubmitted }) {
    const { enqueueSnackbar } = useSnackbar();
    
    // Task state
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // User responses
    const [userResponses, setUserResponses] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch task on mount or taskId change
    useEffect(() => {
        if (open && taskId) {
            fetchTask();
        }
    }, [open, taskId]);

    const fetchTask = async () => {
        try {
            setLoading(true);
            const response = await getMainTask(taskId);
            setTask(response.data || response);
            
            // Initialize user responses
            const responses = {};
            response.data?.formTemplate?.inputFields?.forEach(field => {
                if (field.user === 'User' && (field.fieldType === 'Number' || field.fieldType === 'Integer')) {
                    responses[field.fieldId] = '';
                }
            });
            setUserResponses(responses);
        } catch (error) {
            enqueueSnackbar('Failed to load task', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (fieldId, value) => {
        // Only allow numeric input
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setUserResponses(prev => ({
                ...prev,
                [fieldId]: value
            }));
        }
    };

    const handleSubmitResponse = async () => {
        // Validate that all required fields are answered
        const formTemplate = task?.formTemplate || task?.form_template;
        const userFields = formTemplate?.inputFields?.filter(f => f.user === 'User') || [];
        
        const missingRequired = userFields.filter(f => 
            f.isRequired && 
            (!userResponses[f.fieldId] || userResponses[f.fieldId] === '')
        );

        if (missingRequired.length > 0) {
            enqueueSnackbar(
                `Please answer all required fields: ${missingRequired.map(f => f.title).join(', ')}`,
                { variant: 'warning' }
            );
            return;
        }

        try {
            setSubmitting(true);
            
            // Get the actual accomplishment value (first numeric field)
            const userFieldValues = Object.values(userResponses);
            const actualAcc = userFieldValues.length > 0 ? parseInt(userFieldValues[0]) || 0 : 0;

            // Prepare response data
            const responseData = {
                actual_acc: actualAcc,
                actual_time: 0,
                actual_mod: 0,
                user_responses: userResponses,
                timestamp: new Date().toISOString(),
            };

            // Submit to backend
            const response = await api.post(
                `/api/v1/task/${taskId}/submit-form-response`,
                responseData
            );

            enqueueSnackbar('Response submitted successfully!', { variant: 'success' });
            
            if (onResponseSubmitted) {
                onResponseSubmitted(response.data);
            }
            
            resetForm();
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message || 'Failed to submit response';
            enqueueSnackbar(errorMsg, { variant: 'error' });
            console.error('Submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setUserResponses({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (loading) {
        return (
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        );
    }

    if (!task) {
        return null;
    }

    const formTemplate = task?.formTemplate || task?.form_template || {};
    const adminFields = formTemplate?.inputFields?.filter(f => f.user === 'Admin') || [];
    const userFields = formTemplate?.inputFields?.filter(f => f.user === 'User') || [];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Answer Task: {task.mfo || task.task_name}
            </DialogTitle>

            <DialogContent dividers>
                {/* Task Overview */}
                <Box sx={{ mb: 3 }}>
                    <Card sx={{ bgcolor: '#f0f7ff', border: '1px solid #1976d2' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Task Definition
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {task.description || task.target_accomplishment || 'No description provided'}
                            </Typography>
                            
                            {task.target_quantity > 0 && (
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Target Quantity:</strong> {task.target_quantity}
                                </Typography>
                            )}
                            {task.target_efficiency > 0 && (
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Target Efficiency:</strong> {task.target_efficiency}%
                                </Typography>
                            )}
                            {task.target_timeframe > 0 && (
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Target Timeframe:</strong> {task.target_timeframe} days
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Admin Fields - For Context (Read Only) */}
                {adminFields.length > 0 && (
                    <>
                        <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                            Task Context (Admin Fields)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 3 }}>
                            <Grid container spacing={2}>
                                {adminFields.map(field => (
                                    <Grid item xs={12} key={field.fieldId}>
                                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {field.title}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Type: {field.fieldType}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </>
                )}

                {/* User Response Fields */}
                <Alert severity="info" sx={{ mb: 2 }}>
                    Answer the fields below based on your actual accomplishment and performance.
                    You can only input numbers in these fields.
                </Alert>

                <Typography variant="h6" sx={{ mb: 2 }}>
                    Your Response
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {userFields.length === 0 ? (
                    <Alert severity="warning">
                        No user response fields in this task.
                    </Alert>
                ) : (
                    <Grid container spacing={2}>
                        {userFields.map(field => (
                            <Grid item xs={12} key={field.fieldId}>
                                {(field.fieldType === 'Number' || field.fieldType === 'Integer') ? (
                                    // Numeric Input Fields
                                    <TextField
                                        fullWidth
                                        label={field.title}
                                        type="number"
                                        value={userResponses[field.fieldId] || ''}
                                        onChange={(e) =>
                                            handleResponseChange(field.fieldId, e.target.value)
                                        }
                                        placeholder={`Enter ${field.fieldType.toLowerCase()}`}
                                        required={field.isRequired}
                                        helperText={
                                            field.isRequired
                                                ? 'This field is required'
                                                : 'Optional'
                                        }
                                        inputProps={{
                                            min: 0,
                                            step: field.fieldType === 'Integer' ? 1 : 0.01,
                                        }}
                                        variant="outlined"
                                    />
                                ) : (
                                    // Non-numeric fields - Display as info
                                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {field.title}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Type: {field.fieldType} (Read-only - Numeric fields only)
                                        </Typography>
                                    </Paper>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmitResponse}
                    variant="contained"
                    disabled={submitting || userFields.length === 0}
                >
                    {submitting ? <CircularProgress size={24} /> : 'Submit Response'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
