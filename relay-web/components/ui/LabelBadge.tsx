"use client";

interface Props {
  name: string;
  color: string;
  onRemove?: () => void;
}

export default function LabelBadge({ name, color, onRemove }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5  font-medium"
      style={{
        backgroundColor: color + "20",
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity ml-0.5 cursor-pointer"
        >
          ✕
        </button>
      )}
    </span>
  );
}
