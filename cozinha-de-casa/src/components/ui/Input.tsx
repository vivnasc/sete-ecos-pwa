"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-charcoal mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2.5 rounded-xl border border-cream-dark bg-white text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors font-body text-sm ${error ? "border-rose" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
