export default function SkeletonCard({ subtle = false }) {
  return (
    <div className={`card text-center border-0 shadow-sm rounded-4 skeleton-card ${subtle ? "bg-light" : ""}`}>
      <div className="card-body">
        <div className="skeleton-icon mb-2"></div>
        <div className="skeleton-text skeleton-title mb-2"></div>
        <div className="skeleton-text skeleton-small"></div>
      </div>
    </div>
  );
}
