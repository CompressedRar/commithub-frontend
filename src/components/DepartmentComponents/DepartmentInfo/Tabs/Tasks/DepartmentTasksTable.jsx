import { useState } from "react";
import { Box, Typography, Stack, TextField, InputAdornment, Button, Pagination, Paper, CircularProgress } from "@mui/material";
import { Search as SearchIcon, AddTask as AddTaskIcon, AssignmentLate as NoTaskIcon } from "@mui/icons-material";


import DepartmentTask from "./DepartmentTask";
import DepartmentAssignTask from "../../../DepartmentAssignTask";
import AddDepartmentTask from "../../../AddDepartmentTask";
import FormulaSettings from "../../../Tasks/TaskFormulas";
import { TaskModal } from "./modals/TaskModal";
import { useDepartmentTasks } from "./hooks/useDepartmentTask";


const ITEMS_PER_PAGE = 10;

function DepartmentTasksTable({ id, admin_mode, currentPhase }) {
  const { tasks, loading, searchQuery, setQuery } = useDepartmentTasks(id);
  const [page, setPage] = useState(1);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskData, setSelectedTaskData] = useState(null);

  // Pagination Logic
  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = tasks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTaskSelect = (task) => {
    setSelectedTaskId(task.id);
    setSelectedTaskData(task);
  };

  

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-end" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Office Tasks</Typography>
          <Typography variant="caption" color="text.secondary">
            Assign tasks to members' IPCR and track progress.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
          {admin_mode && (
            <Button variant="contained" startIcon={<AddTaskIcon />} data-bs-toggle="modal" data-bs-target="#add-task-modal">
              Manage Tasks
            </Button>
          )}
        </Stack>
      </Stack>

      {/* --- CONTENT --- */}
      <Box sx={{ minHeight: 400 }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 10 }}><CircularProgress /></Stack>
        ) : paginatedTasks.length > 0 ? (
          paginatedTasks.map((task) => (
            <Box key={task.id} sx={{ mb: 2 }}>
              <DepartmentTask
                mems={task}
                dept_id={id}
                switchMember={(tid) => setSelectedTaskId(tid)}
                switchInfo={() => setSelectedTaskData(task)}
                currentPhase={currentPhase}
              />
            </Box>
          ))
        ) : (
          <Paper variant="outlined" sx={{ py: 10, textAlign: 'center', bgcolor: 'grey.50' }}>
            <NoTaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.disabled">No Office Tasks Found</Typography>
          </Paper>
        )}
      </Box>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Stack>
      )}

      {/* --- MODALS --- */}
      <TaskModal id="add-task-modal" title="Add Office Task" icon="bi-plus-circle">
        <AddDepartmentTask dept_id={id} />
      </TaskModal>

      <TaskModal id="user-profile" title="Assign Members" icon="bi-person-plus">
        {selectedTaskId ? (
          <DepartmentAssignTask key={selectedTaskId} task_id={selectedTaskId} dept_id={id} currentPhase={currentPhase} />
        ) : <EmptySelectionNote />}
      </TaskModal>

      <TaskModal id="formulas" title="Manage Formula" icon="bi-calculator">
        {selectedTaskData ? (
          <FormulaSettings task_data={selectedTaskData} />
        ) : <EmptySelectionNote />}
      </TaskModal>
    </Box>
  );
}

const EmptySelectionNote = () => <p className="text-center text-muted">Select a task to proceed.</p>;

export default DepartmentTasksTable;