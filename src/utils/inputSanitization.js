export function numericKeyDown(e) {
    const allowed = [
        "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter", "Home", "End"
    ]
    if (allowed.includes(e.key)) return
    const isDigit = /^[0-9]$/.test(e.key)
    const isDot = e.key === "."
    if (!isDigit && !isDot) {
        e.preventDefault()
        return
    }
    if (isDot && e.target.value.includes(".")) {
        e.preventDefault()
    }
}

export function handlePasteNumeric(e) {
    e.preventDefault()
    const pasted = (e.clipboardData || window.clipboardData).getData("text")
    const sanitized = pasted.replace(/[^0-9.]/g, "")
    if (!sanitized) return
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    const value = e.target.value
    e.target.value = value.slice(0, start) + sanitized + value.slice(end)
    const evt = new Event("input", { bubbles: true })
    e.target.dispatchEvent(evt)
}

export function sanitizeNumberInput(e) {
    let v = e.target.value.replace(/[^0-9.]/g, "")
    const parts = v.split(".")
    if (parts.length > 2) v = parts.shift() + "." + parts.join("")
    if (v !== e.target.value) {
        e.target.value = v
    }
}

export const clampRating = (v) => {
    if (v === undefined || v === null || v === "") return "";
    const str = String(v).replace(/[^0-9.]/g, "");
    const num = parseInt(str.split(".")[0], 10);
    if (isNaN(num)) return "";
    if (num < 1) return "1";
    if (num > 5) return "5";
    return String(num);
}

export function handleTabbing(e) {
    if (e.target.nextElementSibling) {
        e.target.nextElementSibling.focus()
    }
    else {
        e.target.blur()
    }
}

export function handlePasteRate(e) {
    e.preventDefault()
    const pasted = (e.clipboardData || window.clipboardData).getData("text")
    let sanitized = pasted.replace(/[^0-9.]/g, "")
    if (!sanitized) return

    // If pasting into rating fields, clamp to integer 1-5
    if (e.target && ["quantity","efficiency","timeliness"].includes(e.target.name)) {
        const intVal = parseInt(sanitized.split(".")[0], 10)
        if (isNaN(intVal)) return
        const clamped = Math.min(5, Math.max(1, intVal))
        sanitized = String(clamped)
    }

    // insert sanitized text at cursor
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    const value = e.target.value
    e.target.value = value.slice(0, start) + sanitized + value.slice(end)
    // dispatch input event so React picks up change
    const evt = new Event("input", { bubbles: true })
    e.target.dispatchEvent(evt)
}