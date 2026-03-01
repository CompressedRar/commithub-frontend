export default function SkeletonChart() {
  return (
    <div className="skeleton-chart border rounded-4 p-3">
      <div className="d-flex flex-column gap-3">
        <div className="skeleton-text" style={{ width: "30%", height: "20px" }}></div>
        <div className="skeleton-bar" style={{ height: "240px", width: "100%" }}></div>
        <div className="d-flex gap-2 justify-content-center">
          <div className="skeleton-text" style={{ width: "80px", height: "16px" }}></div>
          <div className="skeleton-text" style={{ width: "80px", height: "16px" }}></div>
        </div>
      </div>
    </div>
  );
}
