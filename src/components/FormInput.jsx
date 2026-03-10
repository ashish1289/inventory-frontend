import React from 'react';
import { cn } from '../utils/cn';

const FormInput = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label} {required && <span className="text-secondary">*</span>}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={cn(
          "px-3 py-2 bg-surface text-text border border-border rounded-md shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          "placeholder:text-text-muted transition-colors sm:text-sm",
          error && "border-secondary focus:ring-secondary/50 focus:border-secondary"
        )}
        {...props}
      />
      {error && <p className="text-xs text-secondary mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
