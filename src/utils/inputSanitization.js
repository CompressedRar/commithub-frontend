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