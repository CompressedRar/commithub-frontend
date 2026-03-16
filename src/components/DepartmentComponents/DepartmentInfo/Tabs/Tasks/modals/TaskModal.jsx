// components/TaskModal.jsx
export const TaskModal = ({ id, title, icon, children }) => (
  <div className="modal fade" id={id} data-bs-backdrop="static" tabIndex="-1" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered modal-xl">
      <div className="modal-content">
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">
            <i className={`bi ${icon} me-2`}></i> {title}
          </h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
        </div>
        <div className="modal-body bg-light">
          {children}
        </div>
      </div>
    </div>
  </div>
);