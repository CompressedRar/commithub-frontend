import { TaskRow } from "./TaskRow"

export function TaskSection({
    category,
    tasks,
    categoryStats,
    handleDataChange,
    handleSpanChange,
    handleRemarks,
    setSubTaskID,
    mode,
    currentPhase
}) {
    if (!categoryStats || categoryStats.count === 0) return null

    return (
        <>
        
            <tr className="table-light small">
                <td colSpan="5" className="text-muted">{category}</td>
            </tr>            
            
            {tasks.map((task) => (
                
                <TaskRow
                    key={task.id}
                    task={task}
                    handleDataChange={handleDataChange}
                    handleSpanChange={handleSpanChange}
                    handleRemarks={handleRemarks}
                    setSubTaskID={setSubTaskID}
                    mode={mode}
                    currentPhase={currentPhase}
                />
            ))}
        </>
    )
}