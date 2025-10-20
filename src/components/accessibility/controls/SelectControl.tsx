// src/components/accessibility/controls/SelectControl.tsx

interface SelectOption {
  value: string;
  label: string;
}

interface SelectControlProps {
  label: string;
  description?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export default function SelectControl({
  label,
  description,
  value,
  options,
  onChange,
}: SelectControlProps) {
  return (
    <div className="mb-6">
      <label className="block font-semibold text-gray-900 mb-2">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}