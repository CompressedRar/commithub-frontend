export const EmptyState = ({ message }) => (
    <div className="empty-symbols">
        <span className="material-symbols-outlined">file_copy_off</span>
        <span className="desc">{message}</span>
    </div>
);

export const SectionHeader = ({ title, onAction, actionLoading, showAction }) => (
    <h3 className="d-flex align-items-center gap-3">
        {title}
        {showAction && (
            <button className="btn btn-primary" onClick={onAction} disabled={actionLoading}>
                {!actionLoading ? (
                    <span className="d-flex gap-2">
                        <span className="material-symbols-outlined">compare_arrows</span>
                        <span>Consolidate IPCRs</span>
                    </span>
                ) : (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                )}
            </button>
        )}
    </h3>
);