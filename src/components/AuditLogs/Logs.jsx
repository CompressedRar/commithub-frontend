import "bootstrap/dist/css/bootstrap.min.css";

function Logs({ log }) {
  // Helper: format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Helper: style actions
  const actionStyle = {
    CREATE: "text-primary",
    UPDATE: "text-warning",
    LOGIN: "text-success",
    ARCHIVE: "text-danger",
    DEACTIVATE: "text-danger",
  };

  return (
    <tr className="align-middle">
      {/* User */}
      <td className="text-nowrap">
        <i className="bi bi-person text-primary me-2"></i>
        <span className="fw-semibold text-dark">
          {log.full_name || "Unknown"}
        </span>
      </td>

      {/* Department */}
      <td>
        <span
          className="badge bg-light text-dark border border-secondary-subtle px-3 py-2"
          title={log.department || "No department"}
        >
          {log.department || "N/A"}
        </span>
      </td>

      {/* Action */}
      <td className="text-uppercase fw-semibold">
        <span
          className={`${actionStyle[log.action] || "text-secondary"} px-1`}
        >
          {log.action || "N/A"}
        </span>
      </td>

      {/* Target */}
      <td className="text-muted text-truncate" style={{ maxWidth: "120px" }}>
        {log.target || "—"}
      </td>

      {/* IP */}
      <td className="text-muted small text-nowrap">{log.ip_address || "—"}</td>

      {/* Timestamp */}
      <td className="text-muted small text-nowrap">
        <i className="bi bi-clock me-1"></i>
        {formatDate(log.timestamp)}
      </td>

      {/* User Agent */}
      <td
        className="text-muted small text-truncate"
        style={{ maxWidth: "250px" }}
        title={log.user_agent}
      >
        {log.user_agent || "Unknown"}
      </td>
    </tr>
  );
}

export default Logs;
