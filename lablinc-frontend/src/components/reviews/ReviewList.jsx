import { useState } from 'react';
import Pagination from '../ui/Pagination';

const ReviewList = ({ reviews = [], totalReviews = 0, onPageChange, currentPage = 1 }) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const toggleExpand = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return reviewDate.toLocaleDateString();
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-list-empty">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalReviews / 10);

  return (
    <div className="review-list">
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review._id);
        const isLongComment = review.comment && review.comment.length > 200;
        const displayComment = isExpanded || !isLongComment
          ? review.comment
          : review.comment.substring(0, 200) + '...';

        return (
          <div key={review._id} className="review-item">
            <div className="review-header">
              <div className="review-user">
                <div className="user-avatar">
                  {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <div className="user-name">{review.user?.name || 'Anonymous'}</div>
                  <div className="review-date">{formatDate(review.createdAt)}</div>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>

            <div className="review-content">
              <p>{displayComment}</p>
              {isLongComment && (
                <button
                  type="button"
                  onClick={() => toggleExpand(review._id)}
                  className="review-expand-btn"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {review.response && (
              <div className="review-response">
                <div className="response-label">Response from owner:</div>
                <p>{review.response}</p>
              </div>
            )}
          </div>
        );
      })}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ReviewList;
