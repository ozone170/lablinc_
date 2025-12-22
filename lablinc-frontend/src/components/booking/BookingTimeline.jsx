const BookingTimeline = ({ timeline }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created': return '📝';
      case 'confirmed': return '✅';
      case 'cancelled': return '❌';
      case 'completed': return '🎉';
      case 'rejected': return '⛔';
      default: return '📌';
    }
  };

  return (
    <div className="booking-timeline">
      {timeline.map((event, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-marker">
            <span className="timeline-icon">{getStatusIcon(event.status)}</span>
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <h4>{event.status?.replace('_', ' ').toUpperCase()}</h4>
              <span className="timeline-date">{formatDate(event.timestamp)}</span>
            </div>
            {event.note && <p className="timeline-note">{event.note}</p>}
            {event.changedBy && (
              <p className="timeline-actor">
                by {event.changedBy.name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingTimeline;
