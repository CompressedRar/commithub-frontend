import { useEffect, useState } from "react";
import {
    Container,
    Typography,
    Box,
    Checkbox,
    Stack,
    Divider,
    Paper,
    Avatar,
    Link,
    Button
} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { getCreatedTasks } from "../../../services/formBuilderService";
import TaskSubmissionDialog from "./TaskSubmissionDialog";

export default function TaskListPage() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleOpenTask = (task) => {
    setSelectedTask(task);
};

    async function fetchTasks() {
        try {
            const res = await getCreatedTasks();
            setTasks(res.data.tasks || []);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Box sx={{ bgcolor: "#f6f8fa", minHeight: "100vh", py: 4, color: "#1f2328" }}>
            <Container maxWidth="lg">
                {/* Simple Page Header */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 600, color: "#1f2328" }}>
                        Inbox
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: "#ffffff",
                        border: "1px solid #d0d7de",
                        borderRadius: "6px",
                        overflow: "hidden"
                    }}
                >
                    {/* Select All Bar */}
                    <Box sx={{ p: "8px 16px", bgcolor: "#f6f8fa", borderBottom: "1px solid #d0d7de", display: "flex", alignItems: "center" }}>
                        <Checkbox
                            size="small"
                            sx={{ color: "#d0d7de", p: 0, mr: 2, '&.Mui-checked': { color: "#0969da" } }}
                        />
                        <Typography sx={{ fontSize: "12px", color: "#636c76", fontWeight: 600 }}>
                            Select all
                        </Typography>
                    </Box>

                    {tasks.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center", color: "#636c76" }}>
                            No tasks found.
                        </Box>
                    ) : (
                        tasks.map((task, index) => {
                            const fieldEntries = Object.values(task.values || {});
                            const [mainField, ...otherFields] = fieldEntries;

                            return (
                                <Box key={task.id || index} display={"flex"} flexDirection={"column"} alignItems={"end"}>
                                    <Stack
                                        direction="row"
                                        alignItems="flex-start"
                                        
                                        sx={{
                                            p: "8px 16px",
                                            transition: "0.1s",
                                            cursor: "pointer", // 👈 important UX cue
                                            "&:hover": { bgcolor: "#f6f8fa" },
                                            borderLeft: "2px solid #0969da"
                                        }}
                                    >

                                        {/* Content Section */}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Link
                                                    href="#"
                                                    underline="hover"
                                                    sx={{ color: "#636c76", fontSize: "12px", fontWeight: 400 }}
                                                >
                                                </Link>
                                            </Stack>

                                            {/* Bold Dynamic Title */}
                                            <Typography sx={{ color: "#1f2328", fontSize: "14px", fontWeight: 600, mt: 0.2 }}>
                                                {mainField?.value || "Untitled Task"}
                                            </Typography>
                                            <Typography sx={{ color: "#636c76", fontSize: "12px", mt: 0.5 }}>
                                                {task.category_name || ""}
                                            </Typography>
                                            <Divider></Divider>

                                            {/* Metadata row */}
                                            <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                                                {otherFields.map((field, fIdx) => (
                                                    <Typography key={fIdx} sx={{ color: "#636c76", fontSize: "12px" }}>
                                                        <span style={{ color: "#8c959f", fontWeight: 500 }}>{field.title}:</span> {field.value}
                                                    </Typography>
                                                ))}
                                            </Stack>
                                        </Box>

                                        {/* Right Hand Side (Meta/Author) */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 2, height: "100%", pt: 0.5 }}>
                                            <Typography sx={{ color: "#636c76", fontSize: "12px" }}>
                                                author
                                            </Typography>
                                            <Avatar sx={{ width: 20, height: 20, fontSize: "10px", bgcolor: "#afb8c1", color: "#fff" }}>
                                                {task.created_by}
                                            </Avatar>
                                            <Typography sx={{ color: "#636c76", fontSize: "12px", minWidth: "60px", textAlign: "right" }}>
                                                {formatDate(task.created_at)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" spacing={1} sx={{ mb: 1, mr: 2 }}>
                                        <Button onClick={() => handleOpenTask(task)} variant="outlined">
                                            Responses
                                        </Button>
                                        <Button onClick={() => handleOpenTask(task)} variant="contained">
                                            Insert Accomplisment
                                        </Button>
                                    </Stack>
                                    
                                    {index !== tasks.length - 1 && <Divider sx={{ borderColor: "#d0d7de" }} />}
                                </Box>
                            );
                        })
                    )}
                </Paper>
            </Container>
            <TaskSubmissionDialog
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onSuccess={() => {
                    fetchTasks(); // refresh after submit
                }}
            />
        </Box>
        
    );
}