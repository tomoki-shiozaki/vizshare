import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectBoxProps {
  id: string;
  label: string;
  options: Option[];
  value: string[]; // 複数選択対応
  onChange: (value: string[]) => void; // 配列で返す
}

export const SelectBox: React.FC<SelectBoxProps> = ({
  id,
  label,
  options,
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value,
    );
    onChange(selectedOptions);
  };

  return (
    <div className="mb-4 flex flex-col">
      <label htmlFor={id} className="mb-1 font-medium">
        {label}
      </label>
      <select
        id={id}
        multiple
        value={value}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
