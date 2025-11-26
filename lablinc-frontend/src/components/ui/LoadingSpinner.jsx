import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false, message = '' }) => {
  const content = (
    <div className={`loading-spinner-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
      <div className={`loading-spinner ${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  return content;
};

export default LoadingSpinner;
