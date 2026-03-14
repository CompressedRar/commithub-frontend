export default function SubTaskField({field, value, onClick, isEditable, onKeyDown, onNumberInput, onPaste, description}) {
    return (
        <div>
            <input
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
                title={isEditable ? "Only editable during Monitoring phase" : ""}
            />
            <span className="text-muted small d-block">{description}</span>
        </div>
    )
}