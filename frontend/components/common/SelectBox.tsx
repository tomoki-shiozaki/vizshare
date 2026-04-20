"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const SelectBox = ({
  id,
  label,
  options,
  value,
  onChange,
}: SelectBoxProps) => (
  <div className="mb-4 space-y-1">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>

    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>

      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className="truncate" title={opt.label}>
              {opt.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
