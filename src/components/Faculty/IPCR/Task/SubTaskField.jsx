export default function SubTaskField({
    field,
    value,
    description = null,
    isEditable,
    style = {},
    min = 0, max = 9999,
    rating = false,
    onClick = () => { },
    onKeyDown = () => { },
    onNumberInput = () => { },
    onPaste = () => { },
    onBlur = () => { },
    onFocus = () => { } }) {
    return (
        !rating ? <div style={style}>
            <input
                style={style}
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                name={field}
                defaultValue={value}
                className={`form-control form-control-sm no-spinner ${isEditable ? "bg-success bg-opacity-25" : ""}`}
                onClick={onClick}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onInput={onNumberInput}
                disabled={!isEditable}
                onBlur={onBlur}
                onFocus={onFocus}
                title={isEditable ? "Only editable during Monitoring phase" : ""}
                min={min}
                max={max}
            />
            {
                description && <span className="text-muted small d-block">{description}</span>
            }
        </div>
            :
            <input
                style={style}
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                name={field}
                defaultValue={value}
                className={`form-control form-control-sm no-spinner ${isEditable ? "bg-success bg-opacity-25" : ""}`}
                onClick={onClick}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onInput={onNumberInput}
                disabled={!isEditable}
                onBlur={onBlur}
                onFocus={onFocus}
                title={isEditable ? "Only editable during Monitoring phase" : ""}
                min={min}
                max={max}
            />
    )
}