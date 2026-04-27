import RatingBadges from "./RatingBadges"
import SubTaskField from "./SubTaskField"
import Swal from "sweetalert2"
import { numericKeyDown, handlePasteNumeric, sanitizeNumberInput } from "../../../../utils/inputSanitization"
import EditableRatingBadges from "./EditableRatingBadges"
import { useSettings } from "../../../../hooks/useSettings"
import { Stack } from "@mui/material"
import TaskDocumentStats from "./TaskDocumentStatus"

export function TaskRow({ task, handleDataChange, setSubTaskID, mode, currentPhase }) {

    const {isMonitoringPhase, isPlanningPhase, isRatingPhase} = useSettings();

    const isEditableMode = mode === "faculty"
    const isEditableDuringMonitoring = isMonitoringPhase(currentPhase)
    const isEditableDuringPlanning = isPlanningPhase(currentPhase)

    const isTargetEditable = isEditableMode && isEditableDuringPlanning
    const isActualEditable = isEditableMode && isEditableDuringMonitoring

    console.log(currentPhase)

    const onNumberInput = (e) => {
        sanitizeNumberInput(e)
        handleDataChange(e)
    }

    async function submitDateTimeChange(subTaskId, fieldName, datetimeLocal) {
        if (!subTaskId || !fieldName) return;
        if (!datetimeLocal) {
            Swal.fire("Validation", "Please provide a valid date/time.", "warning");
            return;
        }

        const d = new Date(datetimeLocal);
        if (isNaN(d.getTime())) {
            Swal.fire("Error", "Invalid date/time value.", "error");
            return;
        }

        const iso = d.toISOString();

        try {
            await updateSubTask(subTaskId, fieldName, iso);
        } catch (error) {
            console.error("Failed to save datetime:", error);
            Swal.fire("Error", error.response?.data?.error || "Failed to save date/time", "error");
        }
    }

    return (
        <>

            <tr className="align-middle">
                <td className="fw-semibold small">
                    
                    <Stack direction={"row"} alignItems="center" gap={3}>
                        
                        <TaskDocumentStats 
                            validDocumentCount={task.valid_document_count}
                            totalDocumentCount={task.total_document_count}
                            pendingDocumentCount={task.pending_document_count}
                            rejectedDocumentCount={task.rejected_document_count}
                        ></TaskDocumentStats>
                        {task.title}
                    </Stack>
                    
                </td>
                <td className>
                    <div className="d-grid gap-2">
                        <div>
                            <SubTaskField
                                field="target_acc"
                                value={task.target_acc}
                                onClick={() => isTargetEditable && setSubTaskID(task.id)}
                                isEditable={isTargetEditable}
                                onKeyDown={numericKeyDown}
                                onNumberInput={onNumberInput}
                                onPaste={handlePasteNumeric}
                                description={task.main_task.target_acc}
                            />
                        </div>
                        <div>
                            {task.main_task.timeliness_mode == "timeframe" ?
                                <>
                                    <SubTaskField
                                        field="target_time"
                                        value={task.target_time}
                                        onClick={() => isTargetEditable && setSubTaskID(task.id)}
                                        isEditable={isTargetEditable}
                                        onKeyDown={numericKeyDown}
                                        onNumberInput={onNumberInput}
                                        onPaste={handlePasteNumeric}
                                        description={task.main_task.time}
                                    />
                                </> :
                                <>
                                    <input
                                        type="date"
                                        name="target_deadline"
                                        className={`form-control form-control-sm no-spinner ${isTargetEditable ? "bg-success bg-opacity-25" : ""}`}
                                        value={formatDateForInput(task.main_task.target_deadline)}
                                        onChange={(e) => submitDateTimeChange(task.id, "target_deadline", e.target.value)}
                                        disabled={!isEditableDuringPlanning}
                                        title={!isEditableDuringPlanning ? "Only editable during Planning phase" : ""}
                                    />
                                    <span className="text-muted small d-block">on set deadline with</span>


                                </>}
                        </div>
                        <div>
                            <SubTaskField
                                field="target_mod"
                                value={task.target_mod}
                                onClick={() => isTargetEditable && setSubTaskID(task.id)}
                                isEditable={isTargetEditable}
                                onKeyDown={numericKeyDown}
                                onNumberInput={onNumberInput}
                                onPaste={handlePasteNumeric}
                                description={task.main_task.modification}
                            />


                        </div>
                    </div>
                </td>
                <td>
                    <div className="d-grid gap-2">
                        <SubTaskField
                            field="actual_acc"
                            value={task.actual_acc}
                            onClick={() => isActualEditable && setSubTaskID(task.id)}
                            isEditable={isActualEditable}
                            onKeyDown={numericKeyDown}
                            onNumberInput={onNumberInput}
                            onPaste={handlePasteNumeric}
                            description={task.main_task.actual_acc}
                        />
                        <div>
                            {task.main_task.timeliness_mode == "timeframe" ?
                                <>
                                    <SubTaskField
                                        field="actual_time"
                                        value={task.actual_time}
                                        onClick={() => isActualEditable && setSubTaskID(task.id)}
                                        isEditable={isActualEditable}
                                        onKeyDown={numericKeyDown}
                                        onNumberInput={onNumberInput}
                                        onPaste={handlePasteNumeric}
                                        description={task.main_task.time}
                                    />
                                </> :
                                <>
                                    <input
                                        type="date"
                                        name="actual_deadline"
                                        className={`form-control form-control-sm no-spinner ${isEditableDuringMonitoring ? "bg-success bg-opacity-25" : ""}`}
                                        value={formatDateForInput(task.actual_deadline)}
                                        onChange={(e) => submitDateTimeChange(task.id, "actual_deadline", e.target.value)}
                                        disabled={!isEditableDuringMonitoring}
                                        title={isEditableDuringMonitoring ? "Only editable during Monitoring phase" : ""}
                                    />
                                    <span className="text-muted small d-block">on set deadline with</span>
                                </>}
                        </div>
                        <div>
                            <SubTaskField
                                field="actual_mod"
                                value={task.actual_mod}
                                onClick={() => isActualEditable && setSubTaskID(task.id)}
                                isEditable={isActualEditable}
                                onKeyDown={numericKeyDown}
                                onNumberInput={onNumberInput}
                                onPaste={handlePasteNumeric}
                                description={task.main_task.modification}
                            />
                        </div>
                    </div>
                </td>
                <td className="small text-center">
                    {mode === "check" && <EditableRatingBadges task={task} onClick={() => setSubTaskID(task.id)} handleDataChange={handleDataChange} isRatingPhase={isRatingPhase(currentPhase)} />}
                    {mode !== "check" && <RatingBadges task={task} />}
                </td>
                <td className="small text-center fw-semibold"></td>
            </tr>
        </>
    )
}