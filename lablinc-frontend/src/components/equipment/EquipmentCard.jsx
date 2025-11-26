import { Link } from 'react-router-dom';
import './EquipmentCard.css';

const EquipmentCard = ({ instrument }) => {
  if (!instrument) {
    return null;
  }

  const { 
    _id, 
    name, 
    category, 
    description, 
    pricing = {}, 
    availability, 
    ownerName, 
    photos 
  } = instrument;

  const getLowestPrice = () => {
    const prices = [];
    if (pricing?.hourly) prices.push({ rate: pricing.hourly, type: 'hour' });
    if (pricing?.daily) prices.push({ rate: pricing.daily, type: 'day' });
    if (pricing?.weekly) prices.push({ rate: pricing.weekly, type: 'week' });
    if (pricing?.monthly) prices.push({ rate: pricing.monthly, type: 'month' });
    
    if (prices.length === 0) return null;
    
    const lowest = prices.reduce((min, p) => (p.rate < min.rate ? p : min));
    return lowest;
  };

  const lowestPrice = getLowestPrice();

  const getAvailabilityBadge = () => {
    const badges = {
      available: { text: 'Available', class: 'badge-success' },
      booked: { text: 'Booked', class: 'badge-warning' },
      maintenance: { text: 'Maintenance', class: 'badge-info' },
      unavailable: { text: 'Unavailable', class: 'badge-danger' },
    };
    return badges[availability] || badges.unavailable;
  };

  const badge = getAvailabilityBadge();

  return (
    <div className="equipment-card">
      <div className="equipment-image">
        {photos && photos.length > 0 ? (
          <img src={photos[0]} alt={name} />
        ) : (
          <div className="equipment-placeholder">🔬</div>
        )}
        <span className={`availability-badge ${badge.class}`}>{badge.text}</span>
      </div>

      <div className="equipment-content">
        <div className="equipment-category">{category || 'Uncategorized'}</div>
        <h3 className="equipment-name">{name || 'Unnamed Instrument'}</h3>
        <p className="equipment-description">
          {description && description.length > 100 
            ? `${description.substring(0, 100)}...` 
            : description || 'No description available'}
        </p>

        <div className="equipment-footer">
          <div className="equipment-owner">
            <span className="owner-label">By:</span> {ownerName || 'Unknown'}
          </div>
          {lowestPrice && (
            <div className="equipment-price">
              ₹{lowestPrice.rate}/{lowestPrice.type}
            </div>
          )}
        </div>

        <Link to={`/instrument/${_id}`} className="btn btn-primary equipment-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EquipmentCard;
