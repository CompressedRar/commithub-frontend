import { useTaskWeights } from "./hooks/useTaskWeights";
import { WeightInput } from "./Weights/WeightInput";


function TaskWeights({ dept_id }) {
  const { 
    allTasks, 
    taskData, 
    totalWeight, 
    isDirty, 
    updating, 
    updateWeights, 
    handleWeightChange 
  } = useTaskWeights(dept_id);

  const isValidTotal = Math.abs(totalWeight - 100) < 0.01; // Handle floating point precision

  return (
    <div className="card shadow-sm p-4">
      <div className="header mb-4">
        <h3 className="fw-bold text-primary">Task Weights</h3>
        <p className="text-muted small">Adjust weights for the OPCR. Total must equal 100%.</p>
      </div>
      

      <div className="table-responsive">
        <div className="row border-bottom pb-2 mb-3 fw-bold text-secondary">
          <div className="col-8 col-md-9">Task Name</div>
          <div className="col-4 col-md-3">Weight (%)</div>
        </div>

        {allTasks.length > 0 ? (
          allTasks.map((task) => (
            <div className="row align-items-center mb-3" key={task.id}>
              <div className="col-8 col-md-9 text-truncate">
                <span className="text-dark">{task.task_name}</span>
              </div>
              <div className="col-4 col-md-3">
                <WeightInput 
                  id={task.id} 
                  value={taskData[task.id]} 
                  onChange={handleWeightChange} 
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted">
            No assigned tasks found for this department.
          </div>
        )}

        <div className="row border-top pt-3 mt-3 fw-bold fs-5">
          <div className="col-8 col-md-9">Total Weight</div>
          <div className={`col-4 col-md-3 ${isValidTotal ? 'text-success' : 'text-danger'}`}>
            {totalWeight.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          className={`btn w-100 ${isValidTotal ? 'btn-success' : 'btn-outline-secondary'}`}
          disabled={!isValidTotal || updating || !isDirty}
          onClick={updateWeights}
        >
          {updating ? (
            <span className="spinner-border spinner-border-sm me-2"></span>
          ) : !isValidTotal ? (
            `Remaining: ${(100 - totalWeight).toFixed(2)}%`
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}

export default TaskWeights;