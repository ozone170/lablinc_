const ReviewSummary = ({ averageRating = 0, totalReviews = 0, ratingDistribution = {} }) => {
  const renderStars = (rating) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= Math.round(rating) ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="review-summary">
      <div className="summary-header">
        <div className="average-rating">
          <div className="rating-number">{averageRating.toFixed(1)}</div>
          {renderStars(averageRating)}
          <div className="total-reviews">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</div>
        </div>
      </div>

      {totalReviews > 0 && (
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="distribution-row">
                <span className="rating-label">{rating} ★</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="rating-count">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;
