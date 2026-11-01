import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', onClick, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDate = props.type === 'date' || props.type === 'datetime-local';

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (isDate) {
      try {
        // Programmatically trigger the picker for browsers that support it
        if (inputRef.current && 'showPicker' in inputRef.current) {
          (inputRef.current as any).showPicker();
        }
      } catch (err) {
        // Fallback for browsers where showPicker might fail or not be supported
      }
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          className={`w-full bg-white text-slate-900 rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${
            isDate 
              ? 'cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer' 
              : ''
          } ${error ? 'border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          onClick={handleClick}
          {...props}
        />
        {isDate && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <Calendar size={18} />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <select
                className={`w-full bg-white text-slate-900 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${error ? 'border-red-500 focus:ring-red-500/20' : ''} ${className}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
};