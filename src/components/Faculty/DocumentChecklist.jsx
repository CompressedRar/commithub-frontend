import { useState } from "react";



export default function DocumentChecklist({ sub_tasks, documents }) {
  // Flatten all tasks and filter those requiring documents
  const tasksRequiringDocs = Object.entries(sub_tasks).flatMap(([category, tasks]) =>
    tasks
      .filter(task => task.required_documents)
      .map(task => ({
        ...task,
        category
      }))
  );



  // Check if document exists for a task
  const hasDocument = (taskId) => {


    return documents.some(doc => doc.task_id == taskId && doc.status == 1);
  };

    console.log(hasDocument(87));

  if (tasksRequiringDocs.length === 0) {
    return (
      <div className="alert alert-info mb-4" role="alert">
        <span className="material-symbols-outlined me-2">info</span>
        No tasks require supporting documents.
      </div>
    );
  }

  return (
    <div className="border py-4 rounded">
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
                className={`list-group-item d-flex align-items-center gap-3 py-3 ${
                  isComplete ? "bg-success bg-opacity-10 border-success" : "border-danger"
                }`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <span className="material-symbols-outlined text-success fs-5">check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-danger fs-5">cancel</span>
                  )}
                </div>

                {/* Task Info */}
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">{task.title}</div>
                  <small className="text-muted d-block">{task.category}</small>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <span className="badge bg-success">
                      <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>done</span>
                      Uploaded
                    </span>
                  ) : (
                    <span className="badge bg-danger">
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
        <div className="mt-3 p-3 bg-light rounded-2">
          <div className="row g-2 text-center">
            <div className="col-6">
              <div className="fw-semibold text-success">{tasksRequiringDocs.filter(t => hasDocument(t.id)).length}</div>
              <small className="text-muted">Completed</small>
            </div>
            <div className="col-6">
              <div className="fw-semibold text-danger">{tasksRequiringDocs.filter(t => !hasDocument(t.id)).length}</div>
              <small className="text-muted">Remaining</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
