import React from 'react';
 
/**
 * A reusable liquid glass button.
 * @param {object} props
 * @param {React.ReactNode} props.children - The content inside the button (text, icons, etc.)
 * @param {function} props.onClick - The click handler function.
 * @param {string} props.className - Extra classes for layout (e.g., 'fixed', 'mt-4').
 * @param {string} props.type - The button type (e.g., 'button', 'submit').
 */
export default function GlassButton({
  children,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`liquid-glass-button ${className}`} // Apply base class + extra layout classes
      onClick={onClick}
      {...props} // Pass down other props like 'disabled'
    >
      <span className="glass-text">
        {children}
      </span>
    </button>
  );
}