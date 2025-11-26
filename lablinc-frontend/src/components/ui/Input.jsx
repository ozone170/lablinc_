import './Input.css';

const Input = ({
  label,
  error,
  helperText,
  required,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={props.id} className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <input
        className={`input-field ${error ? 'input-error' : ''}`}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      />
      
      {error && (
        <span id={`${props.id}-error`} className="input-error-message" role="alert">
          {error}
        </span>
      )}
      
      {!error && helperText && (
        <span id={`${props.id}-helper`} className="input-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
