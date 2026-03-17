
import MemberProfile from "./MemberProfile";

export default function UserModals({ currentUserID }) {
  return (
    <>
      {/* Create User Modal */}
      <div className="modal fade" id="add-user" data-bs-backdrop="static">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content overflow-hidden">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Create New Account</h5>
              <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <iframe className="w-100 border-0" style={{ height: "85vh" }} src="/create" title="Create" />
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <div className="modal fade" id="user-profile" data-bs-backdrop="static">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Account Profile</h5>
              <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {currentUserID && <MemberProfile key={currentUserID} id={currentUserID} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}