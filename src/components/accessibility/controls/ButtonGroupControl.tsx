// src/components/accessibility/controls/ButtonGroupControl.tsx

interface ButtonGroupOption {
  value: string;
  label: string;
}

interface ButtonGroupControlProps {
  label: string;
  description?: string;
  value: string;
  options: ButtonGroupOption[];
  onChange: (value: string) => void;
}

export default function ButtonGroupControl({
  label,
  description,
  value,
  options,
  onChange,
}: ButtonGroupControlProps) {
  return (
    <div className="mb-6">
      <label className="block font-semibold text-gray-900 mb-2">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              value === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}