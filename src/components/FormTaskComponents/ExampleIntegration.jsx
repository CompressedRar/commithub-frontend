import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Tab,
    Tabs,
    Alert,
} from '@mui/material';
import { AdminTaskCreator, UserTaskResponse } from './index';
import { getMainTasks } from '../../services/taskService';
import { useSnackbar } from 'notistack';

/**
 * Example Integration Page
 * 
 * This file demonstrates how to integrate AdminTaskCreator and UserTaskResponse
 * components into a full-featured task management page.
 * 
 * Features:
 * - List of created tasks
 * - Admin interface to create new tasks
 * - User interface to answer tasks
 * - Task filtering and search
 * - Performance metrics visualization
 */

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function FormTaskManagementPage() {
    const { enqueueSnackbar } = useSnackbar();

    // Tabs and Dialogs
    const [currentTab, setCurrentTab] = useState(0);
    const [openCreateTask, setOpenCreateTask] = useState(false);
    const [openAnswerTask, setOpenAnswerTask] = useState(false);

    // Task Management
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // User Responses
    const [userResponses, setUserResponses] = useState([]);

    // Fetch tasks on mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getMainTasks();
            setTasks(response.data || response || []);
        } catch (error) {
            enqueueSnackbar('Failed to load tasks', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTaskCreated = (newTask) => {
        enqueueSnackbar('Task created successfully!', { variant: 'success' });
        fetchTasks(); // Refresh task list
        setCurrentTab(0); // Switch to tasks tab
    };

    const handleResponseSubmitted = (response) => {
        enqueueSnackbar('Response submitted successfully!', { variant: 'success' });
        setUserResponses(prev => [...prev, response]);
        // Could also refresh tasks here if needed
    };

    const handleAnswerTask = (task) => {
        setSelectedTask(task);
        setOpenAnswerTask(true);
    };

    const filteredTasks = tasks.filter(task =>
        (task.mfo || task.task_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Form-Based Task Management
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Create task definitions using form templates and collect user responses for OPCR/IPCR consolidation.
                </Typography>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    aria-label="task management tabs"
                >
                    <Tab label="Task List" id="tab-0" aria-controls="tabpanel-0" />
                    <Tab label="My Responses" id="tab-1" aria-controls="tabpanel-1" />
                    <Tab label="Analytics" id="tab-2" aria-controls="tabpanel-2" />
                </Tabs>

                {/* Tab 1: Task List */}
                <TabPanel value={currentTab} index={0}>
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setOpenCreateTask(true)}
                                >
                                    + Create Task from Form
                                </Button>
                            </Grid>
                        </Grid>

                        {loading ? (
                            <LinearProgress />
                        ) : filteredTasks.length === 0 ? (
                            <Alert severity="info">
                                No tasks found. {searchQuery === '' && 'Create a new task to get started.'}
                            </Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredTasks.map(task => (
                                    <Grid item xs={12} sm={6} md={4} key={task.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                    transform: 'translateY(-4px)',
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                                    {task.mfo || task.task_name}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    sx={{ mb: 2, minHeight: 40 }}
                                                >
                                                    {task.description || task.target_accomplishment}
                                                </Typography>

                                                {/* Task Metrics */}
                                                <Stack spacing={1} sx={{ mb: 2 }}>
                                                    {task.target_quantity > 0 && (
                                                        <Typography variant="caption">
                                                            <strong>Target Qty:</strong> {task.target_quantity}
                                                        </Typography>
                                                    )}
                                                    {task.target_efficiency > 0 && (
                                                        <Typography variant="caption">
                                                            <strong>Target Eff:</strong> {task.target_efficiency}%
                                                        </Typography>
                                                    )}
                                                    {task.target_timeframe > 0 && (
                                                        <Typography variant="caption">
                                                            <strong>Timeframe:</strong> {task.target_timeframe} days
                                                        </Typography>
                                                    )}
                                                </Stack>

                                                {/* Tags */}
                                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                                    {task.form_template_id && (
                                                        <Chip
                                                            label="Form-Based"
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    {task.require_documents && (
                                                        <Chip
                                                            label="Requires Documents"
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Stack>
                                            </CardContent>

                                            {/* Actions */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    p: 2,
                                                    borderTop: '1px solid #e0e0e0',
                                                }}
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    fullWidth
                                                    onClick={() => {
                                                        // View task details
                                                        enqueueSnackbar('Task details would open here', { variant: 'info' });
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => handleAnswerTask(task)}
                                                >
                                                    Answer
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </TabPanel>

                {/* Tab 2: User Responses */}
                <TabPanel value={currentTab} index={1}>
                    {userResponses.length === 0 ? (
                        <Alert severity="info">
                            No responses submitted yet. Answer a task to see it here.
                        </Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {userResponses.map((response, idx) => (
                                <Grid item xs={12} key={idx}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 1 }}>
                                                Response {idx + 1}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                                Submitted: {new Date(response.timestamp).toLocaleDateString()}
                                            </Typography>
                                            <Stack spacing={1}>
                                                {Object.entries(response.user_responses).map(([fieldId, value]) => (
                                                    <Typography key={fieldId} variant="body2">
                                                        <strong>{fieldId}:</strong> {value}
                                                    </Typography>
                                                ))}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>

                {/* Tab 3: Analytics */}
                <TabPanel value={currentTab} index={2}>
                    <Alert severity="info">
                        Analytics features coming soon. This will show OPCR/IPCR consolidation data.
                    </Alert>
                </TabPanel>
            </Paper>

            {/* Dialogs */}
            <AdminTaskCreator
                open={openCreateTask}
                onClose={() => setOpenCreateTask(false)}
                onTaskCreated={handleTaskCreated}
            />

            {selectedTask && (
                <UserTaskResponse
                    open={openAnswerTask}
                    onClose={() => {
                        setOpenAnswerTask(false);
                        setSelectedTask(null);
                    }}
                    taskId={selectedTask.id}
                    onResponseSubmitted={handleResponseSubmitted}
                />
            )}
        </Container>
    );
}
