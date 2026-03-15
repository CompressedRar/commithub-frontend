import DepartmentAssignHead from "../DepartmentAssignHead"
import CreateOPCRModal from "../CreateOPCRModal"

function DepartmentModals({ id, dept }) {

  const {
    formData,
    setFormData,
    submitting,
    archiving,
    updateDept,
    archiveDept
  } = dept

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <CreateOPCRModal deptid={id} />

      {/* Assign Head */}
      <div className="modal fade" id="assign-head">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Assign Office Head</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <DepartmentAssignHead dept_id={id} />
            </div>

          </div>
        </div>
      </div>

      {/* Edit Department */}
      <div className="modal fade" id="edit-department">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5>Edit Office</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">

              <label className="form-label">Office Name</label>

              <input
                type="text"
                className="form-control"
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
              />

            </div>

            <div className="modal-footer">

              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>

              <button className="btn btn-primary" onClick={updateDept}>
                {submitting
                  ? <span className="spinner-border spinner-border-sm"></span>
                  : "Update"}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Archive */}
      <div className="modal fade" id="archive-department">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5>Archive Office</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              Are you sure you want to archive this office?
            </div>

            <div className="modal-footer">

              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>

              <button className="btn btn-danger" onClick={archiveDept}>
                {archiving
                  ? <span className="spinner-border spinner-border-sm"></span>
                  : "Archive"}
              </button>

            </div>

          </div>
        </div>
      </div>

    </>
  )
}

export default DepartmentModals