import { useState } from "react";
import Swal from "sweetalert2";
import { objectToFormData } from "../components/api";
import { createMainTask } from "../services/taskService";
import { convert_tense, create_description } from "../services/tenseConverted";

export function useCreateTask({ taskForm, requireDocument, onSuccess, onClose }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // ── Validate FIRST, before any expensive AI calls ──
    if (!taskForm.task_name?.trim() || !taskForm.task_desc?.trim()) {
      Swal.fire("Validation", "Task name and description are required.", "warning");
      return;
    }

    setSubmitting(true);

    let converted_tense = "";
    let short_description = "";

    try {
      [converted_tense, short_description] = await Promise.all([
        convert_tense(String(taskForm.task_desc)),
        create_description(JSON.stringify(taskForm)),
      ]);
    } catch(error) {
      console.log("task creation error" ,error)
      Swal.fire("Error", "Failed to process description.", "error");
      setSubmitting(false);
      return;
    }


    try {
      const payload = {
        ...taskForm,
        description: short_description,
        require_documents: requireDocument,
      };

      const formData = objectToFormData(payload);
      formData.append("past_task_desc", converted_tense);

      const { data } = await createMainTask(formData);

      if (data?.message === "Task successfully created.") {
        Swal.fire("Success", data.message, "success");
        onSuccess?.();
        onClose?.();
      } else {
        Swal.fire("Error", data?.message || "Failed to create task.", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to create task.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmit };
}
