interface ApproximationToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export function ApproximationToggle({
  checked,
  onChange,
  className,
}: ApproximationToggleProps) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer select-none ${
        className ?? ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-2 border-input accent-primary"
      />
      <span className="text-sm font-medium text-muted-foreground">
        Aproximación
      </span>
    </label>
  );
}
