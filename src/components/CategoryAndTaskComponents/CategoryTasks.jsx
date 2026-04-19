import { useRef, useState } from "react";
import { Modal } from "bootstrap";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Button, Stack } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ArchiveIcon from "@mui/icons-material/Archive";
import EditIcon from "@mui/icons-material/Edit";

import CategoryTask from "./CategoryTask";
import CreateTaskModal from "./CreateTaskModal";
import { AdminTaskCreator } from "../FormTaskComponents";
import { useCategoryTasks } from "../../hooks/useCategoryTasks";
import { useEditableTitle } from "../../hooks/useEditableTitle";

const MODAL_ID = "add-task";

function CategoryTasks({ id: categoryId, changeTaskID, reloadAll }) {
  const titleRef = useRef(null);
  const [openFormTaskCreator, setOpenFormTaskCreator] = useState(false);

  const {
    categoryInfo,
    categoryTasks,
    allDepartments,
    loading,
    taskForm,
    setTaskField,
    toggleDepartment,
    resetTaskForm,
    loadCategory,
    archiveCategoryAction,
    updateCategoryTitle,
  } = useCategoryTasks(categoryId, reloadAll);

  const { titleEditable, startEdit, saveEdit, cancelEdit } = useEditableTitle({
    initialTitle: categoryInfo?.name ?? "",
    onSave: updateCategoryTitle,
    titleRef,
  });

  const openModal = () => {
    new Modal(document.getElementById(MODAL_ID)).show();
  };

  const handleFormTaskCreated = () => {
    loadCategory(); // Refresh task list
    setOpenFormTaskCreator(false);
  };

  if (!categoryId) {
    return (
      <div className="mb-3 p-4 bg-light border rounded-3">
        <div className="d-flex align-items-start gap-3">
          <span className="material-symbols-outlined fs-2 text-muted">info</span>
          <div>
            <h5 className="mb-1">No KRA Selected</h5>
            <p className="mb-0 text-muted">Select a Key Result Area to view its tasks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="category-main-container container-fluid py-3"
      style={{ overflowY: "auto", overflowX: "hidden", paddingBottom: "2.5rem" }}
    >
      {/* Title + Edit Controls */}
      <div className="d-flex flex-column justify-content-between align-items-start gap-5 my-4">
        <div className="d-flex align-items-center gap-3">
          <div style={{ minWidth: 220 }}>
            <h4
              ref={titleRef}
              id="title"
              contentEditable={titleEditable}
              suppressContentEditableWarning
              onInput={(e) =>
                titleRef.current && (titleRef.current._pendingTitle = e.currentTarget.textContent)
              }
              className={`mb-0 fw-semibold d-flex align-items-center gap-2 ${
                titleEditable ? "border border-primary bg-white rounded px-2 py-1" : "text-primary"
              }`}
              style={{ outline: "none", cursor: titleEditable ? "text" : "default" }}
            >
              <span>{categoryInfo?.name ?? "Category"}</span>
            </h4>
            <small className="text-muted d-block">{categoryInfo?.description}</small>
          </div>

          {titleEditable ? (
            <Stack direction="row" gap={1}>
              <Button
                variant="contained"
                color="success"
                onClick={() => saveEdit(titleRef.current?._pendingTitle)}
              >
                Save
              </Button>
              <Button variant="outlined" onClick={cancelEdit}>
                Cancel
              </Button>
            </Stack>
          ) : (
            <Button variant="outlined" onClick={startEdit}>
              <EditIcon />
            </Button>
          )}
        </div>

        {/* Primary Actions */}
        <div className="d-flex justify-content-between w-100 gap-2 align-items-center">
          <div className="d-flex gap-2">
            <Button
              variant="contained"
              size="large"
              endIcon={<AddBoxIcon />}
              onClick={openModal}
            >
              Create Task
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              endIcon={<AddBoxIcon />}
              onClick={() => setOpenFormTaskCreator(true)}
              title="Create task from form template"
            >
              Create Form Task
            </Button>
          </div>
          <Button
            variant="outlined"
            size="large"
            color="error"
            endIcon={<ArchiveIcon />}
            onClick={archiveCategoryAction}
          >
            Archive
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="mb-0">Tasks</h3>
          <small className="text-muted">{categoryTasks.length} items</small>
        </div>

        {categoryTasks.filter((t) => t?.status === 1).length === 0 ? (
          <div className="py-5 text-center text-muted border rounded-3 bg-light">
            <span className="material-symbols-outlined fs-1 d-block mb-2">playlist_remove</span>
            <div>There are no existing tasks.</div>
          </div>
        ) : (
          <div className="d-grid no-wrap">
            <div className="row gap-3">
              {categoryTasks
                .filter((t) => t?.status === 1)
                .map((task) => (
                  <CategoryTask
                    key={task.id}
                    category={task}
                    onClick={() => changeTaskID(task.id)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        modalId={MODAL_ID}
        allDepartments={allDepartments}
        taskForm={taskForm}
        setTaskField={setTaskField}
        toggleDepartment={toggleDepartment}
        resetForm={resetTaskForm}
        onSuccess={() => loadCategory()}
      />

      {/* Create Form-Based Task Dialog */}
      <AdminTaskCreator
        open={openFormTaskCreator}
        onClose={() => setOpenFormTaskCreator(false)}
        onTaskCreated={handleFormTaskCreated}
      />
    </div>
  );
}

export default CategoryTasks;
