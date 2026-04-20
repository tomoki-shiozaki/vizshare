import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectBoxProps {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export const SelectBox: React.FC<SelectBoxProps> = ({
  id,
  label,
  options,
  value,
  onChange,
}) => (
  <div className="mb-4 space-y-1">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
