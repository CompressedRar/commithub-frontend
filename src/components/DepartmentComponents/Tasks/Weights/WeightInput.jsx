// components/WeightInput.jsx
export const WeightInput = ({ id, value, onChange }) => {
  const onKeyDown = (e) => {
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
    if (allowed.includes(e.key)) return;
    if (!/^[0-9.]$/.test(e.key)) e.preventDefault();
    if (e.key === "." && String(value).includes(".")) e.preventDefault();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const sanitized = pasted.replace(/[^0-9.]/g, "");
    if (sanitized) onChange(id, sanitized);
  };

  return (
    <input
      type="number"
      className="form-control w-25 no-spinner"
      value={value ?? ""}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onChange={(e) => onChange(id, e.target.value)}
      step={0.1}
      min={0}
      max={100}
    />
  );
};