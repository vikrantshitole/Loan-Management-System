const FormField = ({
  label,
  error,
  showError = true,
  children,
  className = '',
}) => {
  return (
    <label className={`form-field ${className}`.trim()}>
      {label ? <span>{label}</span> : null}
      {children}
      {showError && error ? <p className="field-error">{error}</p> : null}
    </label>
  );
};

export default FormField;
