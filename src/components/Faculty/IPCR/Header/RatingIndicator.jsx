export default function RatingIndicator({ isRatingPhase }) {
    if (!isRatingPhase) return null;

    return (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <span className="material-symbols-outlined">fact_check</span>
            <span>
                You are currently in the <strong>Rating phase</strong>. Please review the actual accomplishments and assign final ratings.
            </span>
        </div>
    );
}