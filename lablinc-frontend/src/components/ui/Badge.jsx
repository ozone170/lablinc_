const Badge = ({ 
  children, 
  variant = 'default', // default, primary, success, warning, danger, info
  size = 'medium', // small, medium, large
  className = '' 
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
