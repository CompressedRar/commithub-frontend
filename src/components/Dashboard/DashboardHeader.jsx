

function DashboardHeader({ onRefresh, onDownload, loading, downloading }) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      {/* Title Section */}
      <h3 className="fw-bold d-flex align-items-center gap-2 mb-0">
        <span className="material-symbols-outlined text-primary fs-2">dashboard</span>
        Dashboard
      </h3>

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm px-3"
          onClick={onRefresh}
          disabled={loading || downloading}
        >
          <span className={`material-symbols-outlined ${loading ? 'spin-animation' : ''}`}>
            {loading ? "sync" : "refresh"}
          </span>
          {loading ? "Loading..." : "Refresh"}
        </button>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-3"
          onClick={onDownload}
          disabled={downloading || loading}
        >
          <span className="material-symbols-outlined">
            {downloading ? "sync" : "download"}
          </span>
          {downloading ? "Generating..." : "Download Master OPCR"}
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;