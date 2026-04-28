import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

export default function DocumentChecklist({ sub_tasks, documents, validDocuments, pendingDocuments, rejectedDocuments }) {
  // Flatten all tasks and filter those requiring documents
  const tasksRequiringDocs = Object.entries(sub_tasks).flatMap(([category, tasks]) =>
    tasks
      .filter(task => task.required_documents && task.status == 1)
      .map(task => ({
        ...task,
        category
      }))
  );

  console.log(tasksRequiringDocs)



  // Check if document exists for a task
  const hasDocument = (taskId) => {
    return documents.some(doc => doc.task_id == taskId && doc.status == 1 && doc.isApproved == "approved") || documents.some(doc => doc.main_task_id == taskId && doc.status == 1 && doc.isApproved == "approved");
  };


  if (tasksRequiringDocs.length === 0) {
    return (
      <div className="alert alert-info mb-4" role="alert">
        <span className="material-symbols-outlined me-2">info</span>
        No tasks require supporting documents.
      </div>
    );
  }

  return (
    <div className="py-4 rounded">
      <div className=" ">
        <h6 className=" fw-bold d-flex align-items-center gap-2">
          <span className="material-symbols-outlined text-info">checklist</span>
          Required Documents Checklist
        </h6>
      </div>

      <div className="card-body">
        <div className="list-group list-group-flush">
          {tasksRequiringDocs.map((task) => {
            const isComplete = hasDocument(task.id);
            return (
              <div
                key={task.id}
                className={`list-group-item d-flex align-items-center gap-3 py-3 ${isComplete ? "bg-success bg-opacity-10 border-success" : "border-danger"
                  }`}
              >

                {/* Task Info */}
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">{task.title}</div>
                  <small className="text-muted d-block">{task.category}</small>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <span className="badge bg-success d-flex gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>done</span>
                      Uploaded
                    </span>
                  ) : (
                    <span className="badge bg-secondary d-flex gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>pending</span>
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
            borderColor: "grey.200",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            divider={<Divider orientation="vertical" flexItem sx={{ opacity: 0.6 }} />}
            alignItems="center"
          >
            

            {/* Valid */}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="h6" fontWeight="800" color="success.main" sx={{ lineHeight: 1 }}>
                {validDocuments ? validDocuments.length : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: 0.5 }}>
                Valid
              </Typography>
            </Box>

            {/* Pending */}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="h6" fontWeight="800" color="warning.main" sx={{ lineHeight: 1 }}>
                {pendingDocuments ? pendingDocuments.length : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: 0.5 }}>
                Pending
              </Typography>
            </Box>

            

            {/* Rejected */}
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="h6" fontWeight="800" color="error.main" sx={{ lineHeight: 1 }}>
                {rejectedDocuments ? rejectedDocuments.length : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: 0.5 }}>
                Rejected
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </div>
    </div>
  );
}
